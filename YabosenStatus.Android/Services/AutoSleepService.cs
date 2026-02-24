using Microsoft.Extensions.Logging;
using Plugin.LocalNotification;
using YabosenStatus.Shared.Models;
using YabosenStatus.Shared.Services;

namespace YabosenStatus.Android.Services;

/// <summary>
/// Schedules a "Still awake?" notification at 2 AM every night.
/// If the user doesn't tap it within 10 minutes, status is set to Sleeping.
/// </summary>
public class AutoSleepService
{
    private readonly StatusService _statusService;
    private readonly ILogger<AutoSleepService> _logger;
    private System.Timers.Timer? _dailyCheckTimer;
    private System.Timers.Timer? _responseTimer;
    private bool _isEnabled;
    private bool _waitingForResponse;
    
    private const string SETTINGS_ENABLED_KEY = "auto_sleep_enabled";
    private const int NOTIFICATION_ID = 200;
    private const int SLEEP_HOUR = 2; // 2 AM
    private const int RESPONSE_TIMEOUT_MINUTES = 10;

    public AutoSleepService(StatusService statusService, ILogger<AutoSleepService> logger)
    {
        _statusService = statusService;
        _logger = logger;
        
        LoadSettings();
    }

    public void Initialize()
    {
        // Listen for notification taps
        LocalNotificationCenter.Current.NotificationActionTapped += OnNotificationTapped;
        
        if (_isEnabled)
        {
            StartScheduler();
        }
    }

    public void UpdateSettings(bool isEnabled)
    {
        bool wasEnabled = _isEnabled;
        _isEnabled = isEnabled;

        Preferences.Set(SETTINGS_ENABLED_KEY, isEnabled);

        if (_isEnabled && !wasEnabled)
        {
            StartScheduler();
        }
        else if (!_isEnabled && wasEnabled)
        {
            StopScheduler();
        }
    }

    public bool IsEnabled => _isEnabled;

    private void LoadSettings()
    {
        _isEnabled = Preferences.Get(SETTINGS_ENABLED_KEY, false);
    }

    /// <summary>
    /// Checks every minute if it's 2 AM. When it is, fires the notification.
    /// </summary>
    private void StartScheduler()
    {
        StopScheduler();

        // Check every 60 seconds if we've hit 2 AM
        _dailyCheckTimer = new System.Timers.Timer(60_000);
        _dailyCheckTimer.Elapsed += DailyCheck_Elapsed;
        _dailyCheckTimer.Start();

        _logger.LogInformation("Auto-Sleep scheduler started. Notification at {Hour}:00", SLEEP_HOUR);
    }

    private void StopScheduler()
    {
        _dailyCheckTimer?.Stop();
        _dailyCheckTimer?.Dispose();
        _dailyCheckTimer = null;

        CancelResponseTimer();
        _logger.LogInformation("Auto-Sleep scheduler stopped");
    }

    private bool _notificationSentToday;
    private int _lastCheckedDay = -1;

    private void DailyCheck_Elapsed(object? sender, System.Timers.ElapsedEventArgs e)
    {
        var now = DateTime.Now;

        // Reset the daily flag when the day changes
        if (now.Day != _lastCheckedDay)
        {
            _notificationSentToday = false;
            _lastCheckedDay = now.Day;
        }

        // Fire at 2 AM (check the hour, and only once per day)
        if (now.Hour == SLEEP_HOUR && !_notificationSentToday && !_waitingForResponse)
        {
            _notificationSentToday = true;
            MainThread.BeginInvokeOnMainThread(async () => await SendSleepCheckNotification());
        }
    }

    private async Task SendSleepCheckNotification()
    {
        try
        {
            var request = new NotificationRequest
            {
                NotificationId = NOTIFICATION_ID,
                Title = "🌙 Still awake?",
                Description = "Tap here if you're still up! Otherwise, your status will change to Sleeping in 10 minutes.",
                CategoryType = NotificationCategoryType.Status,
                Android = new Plugin.LocalNotification.AndroidOption.AndroidOptions
                {
                    Priority = Plugin.LocalNotification.AndroidOption.AndroidPriority.High,
                    AutoCancel = true,
                }
            };

            await LocalNotificationCenter.Current.Show(request);
            _waitingForResponse = true;

            // Start 10-minute countdown
            StartResponseTimer();

            _logger.LogInformation("Sleep check notification sent. Waiting {Minutes} min for response.", RESPONSE_TIMEOUT_MINUTES);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send sleep check notification");
        }
    }

    private void StartResponseTimer()
    {
        CancelResponseTimer();

        _responseTimer = new System.Timers.Timer(RESPONSE_TIMEOUT_MINUTES * 60 * 1000);
        _responseTimer.AutoReset = false; // One-shot
        _responseTimer.Elapsed += async (s, e) =>
        {
            // No response — user is asleep
            if (_waitingForResponse)
            {
                _waitingForResponse = false;
                await SetSleepStatus();
            }
        };
        _responseTimer.Start();
    }

    private void CancelResponseTimer()
    {
        _waitingForResponse = false;
        _responseTimer?.Stop();
        _responseTimer?.Dispose();
        _responseTimer = null;
    }

    private void OnNotificationTapped(Plugin.LocalNotification.EventArgs.NotificationActionEventArgs e)
    {
        if (e.Request.NotificationId == NOTIFICATION_ID)
        {
            // User tapped — they're still awake!
            _logger.LogInformation("User responded to sleep check — still awake!");
            CancelResponseTimer();

            MainThread.BeginInvokeOnMainThread(async () =>
            {
                await ShowNotification("Still Awake!", "Your status will stay as-is. Goodnight when you're ready! 💜");
            });
        }
    }

    private async Task SetSleepStatus()
    {
        if (!_statusService.HasPassword) return;

        var result = await _statusService.UpdateStatusAsync(
            StatusType.Sleeping,
            customMessage: "Zzz..."
        );

        if (result.Success)
        {
            await ShowNotification("Auto-Sleep Active 🌙", "Your status has been set to Sleeping.");
            _logger.LogInformation("Auto-Sleep triggered — status set to Sleeping");
        }
        else
        {
            _logger.LogWarning("Auto-Sleep failed: {Error}", result.Error);
        }
    }

    private async Task ShowNotification(string title, string message)
    {
        var request = new NotificationRequest
        {
            NotificationId = NOTIFICATION_ID + 1, // Different ID so it doesn't replace the check notification
            Title = title,
            Description = message,
        };
        await LocalNotificationCenter.Current.Show(request);
    }
}
