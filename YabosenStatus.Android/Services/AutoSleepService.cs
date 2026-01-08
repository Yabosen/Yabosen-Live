using Plugin.LocalNotification;
using Plugin.LocalNotification.EventArgs;
using YabosenStatus.Shared.Models;
using YabosenStatus.Shared.Services;

namespace YabosenStatus.Android.Services;

public class AutoSleepService
{
    private readonly StatusService _statusService;
    private const int CHECK_NOTIFICATION_ID = 100;
    private const int FORCE_SLEEP_NOTIFICATION_ID = 101;
    private const string ACTION_AWAKE = "ACTION_AWAKE";
    
    private bool _isEnabled;
    private TimeSpan _checkTime;

    public AutoSleepService(StatusService statusService)
    {
        _statusService = statusService;
        
        LocalNotificationCenter.Current.NotificationActionTapped += OnNotificationActionTapped;
        LocalNotificationCenter.Current.NotificationReceived += OnNotificationReceived;
    }

    public void Initialize()
    {
        // Load settings from preferences
        _isEnabled = Preferences.Get("autosleep_enabled", false);
        long ticks = Preferences.Get("autosleep_time", new TimeSpan(2, 0, 0).Ticks); // Default 2 AM
        _checkTime = TimeSpan.FromTicks(ticks);

        if (_isEnabled)
        {
            ScheduleCheck();
        }
    }

    public void UpdateSettings(bool enabled, TimeSpan time)
    {
        _isEnabled = enabled;
        _checkTime = time;

        Preferences.Set("autosleep_enabled", _isEnabled);
        Preferences.Set("autosleep_time", _checkTime.Ticks);

        LocalNotificationCenter.Current.CancelAll();

        if (_isEnabled)
        {
            ScheduleCheck();
        }
    }

    private void ScheduleCheck()
    {
        // Calculate next occurrence
        var now = DateTime.Now;
        var scheduleDate = now.Date.Add(_checkTime);
        if (scheduleDate <= now)
        {
            scheduleDate = scheduleDate.AddDays(1);
        }

        var request = new NotificationRequest
        {
            NotificationId = CHECK_NOTIFICATION_ID,
            Title = "Yabosen Status",
            Description = "Are you sleeping? 💤",
            Schedule = new NotificationRequestSchedule
            {
                NotifyTime = scheduleDate,
                RepeatType = NotificationRepeat.Daily
            },
            Android = new Plugin.LocalNotification.AndroidOption.AndroidOptions
            {
                IconSmallName = { ResourceName = "appicon" },
                Priority = Plugin.LocalNotification.AndroidOption.AndroidPriority.High,
                ChannelId = "sleep_check",
            }
        };

        // Add "I'm Awake" action
        var awakeAction = new NotificationAction(Convert.ToInt32(CHECK_NOTIFICATION_ID))
        {
            Title = "I'm Awake! ☀️",
            ActionId = ACTION_AWAKE
        };
        request.Android.ActionButtons.Add(awakeAction);

        LocalNotificationCenter.Current.Show(request);
        System.Diagnostics.Debug.WriteLine($"[AutoSleep] Scheduled check for {scheduleDate}");
    }

    private async void OnNotificationReceived(NotificationEventArgs e)
    {
        if (e.Request.NotificationId == CHECK_NOTIFICATION_ID)
        {
            // Initial check
            try 
            {
                var status = await _statusService.GetStatusAsync();
                // Check if doing something important
                if (status != null && (status.Status == StatusType.Streaming || status.ActivityType == ActivityType.Playing)) 
                {
                    LocalNotificationCenter.Current.Cancel(CHECK_NOTIFICATION_ID);
                    return;
                }
            }
            catch {}

            ScheduleForceSleep();
        }
        else if (e.Request.NotificationId == FORCE_SLEEP_NOTIFICATION_ID)
        {
            // Timeout reached
            HandleForceSleepTrigger();
        }
    }

    private void ScheduleForceSleep()
    {
        // We schedule a second notification that acts as the "Time's up" trigger
        // In a real background service, we'd use a timer. Here we use the notification system.
        
        var request = new NotificationRequest
        {
            NotificationId = FORCE_SLEEP_NOTIFICATION_ID,
            Title = "Yabosen Status",
            Description = "Status set to Sleeping due to inactivity. 🌙",
            Schedule = new NotificationRequestSchedule
            {
                NotifyTime = DateTime.Now.AddMinutes(5),
                RepeatType = NotificationRepeat.No
            }
        };
        
        LocalNotificationCenter.Current.Show(request);
    }
    
    private void OnNotificationActionTapped(NotificationActionEventArgs e)
    {
        if (e.ActionId == ACTION_AWAKE)
        {
            // User said they are awake. Cancel the force sleep.
            LocalNotificationCenter.Current.Cancel(FORCE_SLEEP_NOTIFICATION_ID);
            System.Diagnostics.Debug.WriteLine("[AutoSleep] User is awake. Canceled sleep.");
        }
        else if (e.Request.NotificationId == FORCE_SLEEP_NOTIFICATION_ID)
        {
            // The 5 minutes passed and the notification fired.
            // Or/Also we trigger the status update.
            // Note: Tapped means user clicked it. We want it to happen automagically.
            // Using `OnNotificationReceived` for ID 101 to trigger the API call.
        }
    }
    
    // We bind this to NotificationReceived for the FORCE_SLEEP ID
    private async void HandleForceSleepTrigger()
    {
         try
         {
             // Verify we aren't streaming/playing
             var status = await _statusService.GetStatusAsync();
              if (status != null && (status.Status == StatusType.Streaming || status.ActivityType == ActivityType.Playing)) 
             {
                 return;
             }
             
             await _statusService.UpdateStatusAsync(StatusType.Sleeping, null, ActivityType.None, null, null, null);
             System.Diagnostics.Debug.WriteLine("[AutoSleep] Status auto-updated to Sleeping.");
         }
         catch (Exception ex)
         {
             System.Diagnostics.Debug.WriteLine($"[AutoSleep] Failed to auto-update: {ex}");
         }
    }
}
