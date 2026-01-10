using YabosenStatus.Shared.Models;
using YabosenStatus.Shared.Services;
using YabosenStatus.Android.Services;
using Plugin.LocalNotification;



namespace YabosenStatus.Android;

public partial class MainPage : ContentPage
{
    private readonly StatusService _statusService;
    private readonly AutoSleepService _autoSleepService;

    private StatusType _currentStatus = StatusType.Offline;
    private ActivityType _selectedActivityType = ActivityType.None;

    public MainPage(StatusService statusService, AutoSleepService autoSleepService)
    {
        InitializeComponent();
        _statusService = statusService;
        _autoSleepService = autoSleepService;

        // Initialize on page load
        Loaded += async (s, e) => await InitializeAsync();
    }

    private async Task InitializeAsync()
    {
        try
        {
            await _statusService.InitializeAsync();
             _autoSleepService.Initialize();
             
             if (await LocalNotificationCenter.Current.AreNotificationsEnabled() == false)
             {
                 await LocalNotificationCenter.Current.RequestNotificationPermission();
             }
             
            // Load UI State
            LoadAutoSleepSettings();
            
            UpdatePasswordDisplay();
            await RefreshCurrentStatus();
        }
        catch (Exception ex)
        {
            ShowStatusMessage($"Error: {ex.Message}", false);
        }
    }

    private void LoadAutoSleepSettings()
    {
        var (isEnabled, timeout) = _autoSleepService.GetSettings();
        AutoSleepSwitch.IsToggled = isEnabled;
        AutoSleepTimeoutEntry.Text = timeout.ToString();
    }

    private void OnAutoSleepToggled(object sender, ToggledEventArgs e)
    {
        SaveAutoSleepSettings();
    }

    private void OnAutoSleepTimeoutChanged(object sender, TextChangedEventArgs e)
    {
        // Debounce logic could be added here, but for simplicity we save on change
        // Validating input to ensure it's a number
        if (int.TryParse(e.NewTextValue, out _))
        {
            SaveAutoSleepSettings();
        }
    }

    private void SaveAutoSleepSettings()
    {
        if (int.TryParse(AutoSleepTimeoutEntry.Text, out int timeout))
        {
            _autoSleepService.UpdateSettings(AutoSleepSwitch.IsToggled, timeout);
        }
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
