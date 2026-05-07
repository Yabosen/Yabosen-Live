using YabosenStatus.Models;
using YabosenStatus.Services;
using YabosenStatus.Android.Services;


namespace YabosenStatus.Android;

public partial class MainPage : ContentPage
{
    private const string PREF_AUTOSLEEP_ENABLED = "auto_sleep_enabled";

    private readonly StatusService _statusService;

    private StatusType _currentStatus = StatusType.Offline;
    private ActivityType _selectedActivityType = ActivityType.None;

    public MainPage(StatusService statusService, MobileHeartbeatService heartbeatService)
    {
        InitializeComponent();
        _statusService = statusService;
        // heartbeatService and auto-sleep are handled by the foreground service.
        // We only inject MobileHeartbeatService for DI back-compat; nothing else uses it.

        Loaded += async (s, e) => await InitializeAsync();
    }

    private async Task InitializeAsync()
    {
        try
        {
            await _statusService.InitializeAsync();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"StatusService init failed: {ex.Message}");
        }

        try
        {
            // Android 13+ requires runtime permission for the foreground-service
            // notification to be visible. Without it the service still runs but
            // the persistent notification is silently suppressed.
            await EnsureNotificationPermissionAsync();

            // Start foreground service — this is what keeps the app alive
            // and sends heartbeats in the background
            StartForegroundService();

            // Most OEMs (Samsung/Xiaomi/Oppo) kill foreground services unless
            // the app is whitelisted from battery optimization. Prompt once
            // per launch if we're not whitelisted yet — user can deny and
            // we'll re-ask next time the app opens.
            await PromptDisableBatteryOptimizationAsync();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Foreground service start failed: {ex.Message}");
        }

        try
        {
            LoadAutoSleepSettings();
            UpdatePasswordDisplay();
            await RefreshCurrentStatus();
        }
        catch (Exception ex)
        {
            ShowStatusMessage($"Error: {ex.Message}", false);
        }
    }

    private void StartForegroundService()
    {
#if ANDROID
        var intent = new global::Android.Content.Intent(
            global::Android.App.Application.Context,
            typeof(YabosenStatus.Android.Services.StatusForegroundService));

        if (global::Android.OS.Build.VERSION.SdkInt >= global::Android.OS.BuildVersionCodes.O)
        {
            global::Android.App.Application.Context.StartForegroundService(intent);
        }
        else
        {
            global::Android.App.Application.Context.StartService(intent);
        }
#endif
    }

    private async Task PromptDisableBatteryOptimizationAsync()
    {
#if ANDROID
        try
        {
            var ctx = global::Android.App.Application.Context;
            var pm = (global::Android.OS.PowerManager?)ctx.GetSystemService(
                global::Android.Content.Context.PowerService);
            if (pm == null) return;

            var packageName = ctx.PackageName ?? "com.yabosen.status.android";
            if (pm.IsIgnoringBatteryOptimizations(packageName)) return;

            // Soft confirmation first so the system dialog doesn't appear out of nowhere
            var confirm = await DisplayAlert(
                "Keep heartbeats alive",
                "Yabosen Status needs to be exempt from battery optimization, " +
                "otherwise Android may kill the background service and your status " +
                "won't switch to Idle when your PC stops.\n\nOpen the system prompt now?",
                "Yes, allow",
                "Not now");

            if (!confirm) return;

            var intent = new global::Android.Content.Intent(
                global::Android.Provider.Settings.ActionRequestIgnoreBatteryOptimizations);
            intent.SetData(global::Android.Net.Uri.Parse($"package:{packageName}"));
            intent.AddFlags(global::Android.Content.ActivityFlags.NewTask);
            ctx.StartActivity(intent);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Battery-opt prompt failed: {ex.Message}");
        }
#endif
        await Task.CompletedTask;
    }

    private async Task EnsureNotificationPermissionAsync()
    {
#if ANDROID
        // POST_NOTIFICATIONS only exists from Android 13 (API 33) onward.
        if (global::Android.OS.Build.VERSION.SdkInt < (global::Android.OS.BuildVersionCodes)33)
            return;

        try
        {
            var status = await Permissions.CheckStatusAsync<Permissions.PostNotifications>();
            if (status != PermissionStatus.Granted)
            {
                status = await Permissions.RequestAsync<Permissions.PostNotifications>();
                System.Diagnostics.Debug.WriteLine($"POST_NOTIFICATIONS request result: {status}");
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Notification permission check failed: {ex.Message}");
        }
#endif
        await Task.CompletedTask;
    }

    private void LoadAutoSleepSettings()
    {
        AutoSleepSwitch.IsToggled = Preferences.Get(PREF_AUTOSLEEP_ENABLED, false);
    }

    private void OnAutoSleepToggled(object sender, ToggledEventArgs e)
    {
        // Foreground service polls this Preferences key on every heartbeat tick.
        Preferences.Set(PREF_AUTOSLEEP_ENABLED, e.Value);
    }

    private async Task RefreshCurrentStatus()
    {
        try
        {
            var status = await _statusService.GetStatusAsync();
            if (status != null)
            {
                _currentStatus = status.Status;
                CurrentStatusLabel.Text = status.Status.ToDisplayName();
                CurrentStatusDot.BackgroundColor = status.Status.ToColor();
                
                if (!string.IsNullOrEmpty(status.CustomMessage))
                {
                    CurrentMessageLabel.Text = status.CustomMessage;
                    CurrentMessageLabel.IsVisible = true;
                }
                else
                {
                    CurrentMessageLabel.IsVisible = false;
                }

                var updatedTime = DateTimeOffset.FromUnixTimeMilliseconds(status.UpdatedAt).LocalDateTime;
                LastUpdatedLabel.Text = $"Last updated: {updatedTime:g}";
            }
        }
        catch (Exception ex)
        {
            CurrentStatusLabel.Text = "Error loading";
            ShowStatusMessage($"Failed to load status: {ex.Message}", false);
        }
    }

    private async void OnStatusClicked(object? sender, EventArgs e)
    {
        if (sender is not Button button)
            return;

        if (!_statusService.HasPassword)
        {
            ShowStatusMessage("Please configure your password first", false);
            return;
        }

        // Determine which status was clicked
        StatusType newStatus = button.Text switch
        {
            var t when t.Contains("Online") => StatusType.Online,
            var t when t.Contains("Offline") => StatusType.Offline,
            var t when t.Contains("DND") => StatusType.Dnd,
            var t when t.Contains("Idle") => StatusType.Idle,
            var t when t.Contains("Sleeping") => StatusType.Sleeping,
            var t when t.Contains("Streaming") => StatusType.Streaming,
            _ => StatusType.Offline
        };

        await UpdateStatus(newStatus);
    }

    private async Task UpdateStatus(StatusType status)
    {
        SetLoading(true);

        try
        {
            string? customMessage = string.IsNullOrWhiteSpace(CustomMessageEntry.Text)
                ? null
                : CustomMessageEntry.Text.Trim();

            // Collect activity data based on selected type
            ActivityType activityType = _selectedActivityType;
            string? activityName = null;
            string? episodeInfo = null;
            string? seasonInfo = null;

            if (activityType == ActivityType.Playing)
            {
                activityName = string.IsNullOrWhiteSpace(GameNameEntry.Text)
                    ? null
                    : GameNameEntry.Text.Trim();
            }
            else if (activityType == ActivityType.Watching)
            {
                activityName = string.IsNullOrWhiteSpace(AnimeNameEntry.Text)
                    ? null
                    : AnimeNameEntry.Text.Trim();
                episodeInfo = string.IsNullOrWhiteSpace(EpisodeInfoEntry.Text)
                    ? null
                    : EpisodeInfoEntry.Text.Trim();
                seasonInfo = string.IsNullOrWhiteSpace(SeasonInfoEntry.Text)
                    ? null
                    : SeasonInfoEntry.Text.Trim();
            }

            var (success, error) = await _statusService.UpdateStatusAsync(
                status,
                customMessage,
                activityType,
                activityName,
                episodeInfo,
                seasonInfo);

            if (success)
            {
                _currentStatus = status;
                ShowStatusMessage($"Status updated to {status.ToDisplayName()}!", true);
                await RefreshCurrentStatus();

                // Haptic feedback on Android
                try
                {
                    HapticFeedback.Perform(HapticFeedbackType.Click);
                }
                catch { }
            }
            else
            {
                ShowStatusMessage($"Failed: {error}", false);
            }
        }
        catch (Exception ex)
        {
            ShowStatusMessage($"Error: {ex.Message}", false);
        }
        finally
        {
            SetLoading(false);
        }
    }

    private async void OnSavePassword(object? sender, EventArgs e)
    {
        var password = PasswordEntry.Text?.Trim();
        
        if (string.IsNullOrEmpty(password))
        {
            ShowStatusMessage("Please enter a password", false);
            return;
        }

        try
        {
            await _statusService.SetPasswordAsync(password);
            PasswordEntry.Text = string.Empty;
            UpdatePasswordDisplay();
            ShowStatusMessage("Password saved!", true);
        }
        catch (Exception ex)
        {
            ShowStatusMessage($"Failed to save: {ex.Message}", false);
        }
    }

    private void OnClearPassword(object? sender, EventArgs e)
    {
        _statusService.ClearPassword();
        UpdatePasswordDisplay();
        ShowStatusMessage("Password cleared", true);
    }

    private void UpdatePasswordDisplay()
    {
        PasswordPreviewLabel.Text = _statusService.GetPasswordPreview();
    }

    private void ShowStatusMessage(string message, bool isSuccess)
    {
        StatusMessageLabel.Text = message;
        StatusMessageLabel.TextColor = isSuccess 
            ? Color.FromArgb("#22c55e") 
            : Color.FromArgb("#ef4444");

        // Auto-hide after 3 seconds
        Dispatcher.StartTimer(TimeSpan.FromSeconds(3), () =>
        {
            StatusMessageLabel.Text = string.Empty;
            return false;
        });
    }

    private void OnActivityTypeClicked(object? sender, EventArgs e)
    {
        if (sender is not Button button)
            return;

        // Determine which activity type was clicked
        if (button == BtnPlayingActivity)
        {
            _selectedActivityType = ActivityType.Playing;
            PlayingActivitySection.IsVisible = true;
            WatchingActivitySection.IsVisible = false;

            // Update button styles
            BtnPlayingActivity.BackgroundColor = Color.FromArgb("#6b21a8");
            BtnWatchingActivity.BackgroundColor = Color.FromArgb("#374151");
        }
        else if (button == BtnWatchingActivity)
        {
            _selectedActivityType = ActivityType.Watching;
            PlayingActivitySection.IsVisible = false;
            WatchingActivitySection.IsVisible = true;

            // Update button styles
            BtnPlayingActivity.BackgroundColor = Color.FromArgb("#374151");
            BtnWatchingActivity.BackgroundColor = Color.FromArgb("#6b21a8");
        }
    }

    private void OnClearActivityClicked(object? sender, EventArgs e)
    {
        _selectedActivityType = ActivityType.None;
        PlayingActivitySection.IsVisible = false;
        WatchingActivitySection.IsVisible = false;

        // Reset button styles
        BtnPlayingActivity.BackgroundColor = Color.FromArgb("#374151");
        BtnWatchingActivity.BackgroundColor = Color.FromArgb("#374151");

        // Clear all activity inputs
        GameNameEntry.Text = string.Empty;
        AnimeNameEntry.Text = string.Empty;
        EpisodeInfoEntry.Text = string.Empty;
        SeasonInfoEntry.Text = string.Empty;
    }

    private void SetLoading(bool isLoading)
    {
        LoadingIndicator.IsRunning = isLoading;
        LoadingIndicator.IsVisible = isLoading;

        // Disable buttons while loading
        BtnOnline.IsEnabled = !isLoading;
        BtnOffline.IsEnabled = !isLoading;
        BtnDnd.IsEnabled = !isLoading;
        BtnIdle.IsEnabled = !isLoading;
        BtnSleeping.IsEnabled = !isLoading;
        BtnStreaming.IsEnabled = !isLoading;
    }
}
