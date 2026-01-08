using Microsoft.Maui.ApplicationModel;
using System.Diagnostics;
using System.Net.Http.Json;
using YabosenStatus.Shared.Models;
using YabosenStatus.Shared.Services;
using YabosenStatus.Windows.Services;
using Application = Microsoft.Maui.Controls.Application;

namespace YabosenStatus.Windows;

public partial class MainPage : ContentPage
{
    private readonly StatusService _statusService;
    private readonly DiscordRpcService _discordRpcService;
    private readonly ProcessMonitorService _processMonitorService;
    private StatusType _currentStatus = StatusType.Offline;
    private ActivityType _selectedActivityType = ActivityType.None;
    
    private bool _isExiting = false;

    public MainPage(StatusService statusService)
    {
        InitializeComponent();
        
        _statusService = statusService;
        _processMonitorService = new ProcessMonitorService();
        _discordRpcService = new DiscordRpcService();

        Loaded += async (s, e) => {
             // Startup logic if needed
             await InitializeAsync();
        };

        // Cleanup on unload
        Unloaded += (s, e) => 
        {
            _processMonitorService.Dispose();
            _discordRpcService.Dispose();
            // _trayService?.Dispose();
        };
    }



    private async Task InitializeAsync()
    {
        try
        {
            try { System.IO.File.AppendAllText("app_start.log", "\nInitializeAsync started"); } catch {}

            // Initialize Discord RPC
            try 
            {
                _discordRpcService.Initialize();
                try { System.IO.File.AppendAllText("app_start.log", "\nDiscord init done"); } catch {}
            }
            catch (Exception ex) 
            {
                ShowStatusMessage($"Discord RPC Error: {ex.Message}", false);
                try { System.IO.File.AppendAllText("app_start.log", $"\nDiscord init failed: {ex}"); } catch {}
            }

            // Initialize Activity Monitor
            try
            {
                _processMonitorService.ActivityChanged += OnActivityChanged;
                _processMonitorService.StartMonitoring();
                try { System.IO.File.AppendAllText("app_start.log", "\nMonitor init done"); } catch {}
            }
            catch (Exception ex)
            {
                ShowStatusMessage($"Monitor Error: {ex.Message}", false);
                try { System.IO.File.AppendAllText("app_start.log", $"\nMonitor init failed: {ex}"); } catch {}
            }
            
            await _statusService.InitializeAsync();
            UpdatePasswordDisplay();
            LoadLastFmSettings();
            await RefreshCurrentStatus();
            
            try { System.IO.File.AppendAllText("app_start.log", "\nInit sequence completed"); } catch {}
        }
        catch (Exception ex)
        {
            ShowStatusMessage($"Error: {ex.Message}", false);
            try { System.IO.File.AppendAllText("app_start.log", $"\nInit fatal error: {ex}"); } catch {}
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
                
                // Custom display logic: Show Activity if present
                if (status.Status == StatusType.Streaming)
                {
                    CurrentStatusLabel.Text = "Streaming";
                    CurrentStatusDot.BackgroundColor = status.Status.ToColor();
                }
                else if (status.ActivityType == ActivityType.Playing && !string.IsNullOrEmpty(status.ActivityName))
                {
                    CurrentStatusLabel.Text = $"Playing {status.ActivityName}";
                    CurrentStatusDot.BackgroundColor = Color.FromArgb("#6b21a8"); // Purple
                }
                else if (status.ActivityType == ActivityType.Watching && !string.IsNullOrEmpty(status.ActivityName))
                {
                    CurrentStatusLabel.Text = $"Watching {status.ActivityName}";
                    CurrentStatusDot.BackgroundColor = Color.FromArgb("#6b21a8"); // Purple
                }
                else if (status.ActivityType == ActivityType.Listening && !string.IsNullOrEmpty(status.ActivityName))
                {
                    CurrentStatusLabel.Text = $"Listening to {status.ActivityName}";
                    CurrentStatusDot.BackgroundColor = Color.FromArgb("#ef4444"); // Red/Orange for Last.fm
                }
                else
                {
                    CurrentStatusLabel.Text = status.Status.ToDisplayName();
                    CurrentStatusDot.BackgroundColor = status.Status.ToColor();
                }
                
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
                
                // Update Discord Rich Presence
                _discordRpcService.UpdatePresence(status);
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
            else if (activityType == ActivityType.Listening)
            {
                // For listening, we use the _lastFmTrack field directly, which is set by OnActivityChanged
                activityName = _lastFmTrack;
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

    private void OnActivityChanged(object? sender, ActivityStatus activity)
    {
        // Must run on UI thread
        MainThread.BeginInvokeOnMainThread(async () =>
        {
            // Priority 1: OBS is running
            if (activity.IsObsRunning)
            {
                if (_currentStatus != StatusType.Streaming)
                {
                    ShowStatusMessage("OBS Detected! Switching to Streaming...", true);
                    await UpdateStatus(StatusType.Streaming);
                }
            }
            // Priority 2: Steam Game is running
            else if (activity.SteamAppId > 0)
            {
                // Fallback name if manifest parsing failed
                string displayName = !string.IsNullOrEmpty(activity.SteamGameName) 
                    ? activity.SteamGameName 
                    : $"Steam Game ({activity.SteamAppId})";

                // Only switch if not already playing THIS game
                bool isDifferentGame = _selectedActivityType != ActivityType.Playing || 
                                       GameNameEntry.Text != displayName;
                
                if (isDifferentGame)
                {
                    ShowStatusMessage($"Steam Game Detected: {displayName}", true);
                    
                    // Set inputs programmatically
                    _selectedActivityType = ActivityType.Playing;
                    GameNameEntry.Text = displayName;
                    
                    UpdateActivityUI();

                    // Send update
                    await UpdateStatus(StatusType.Online); 
                }
            }
            // Priority 3: Last.fm Listening
            else if (!string.IsNullOrEmpty(activity.LastFmTrack))
            {
                // Only switch if not already listening to THIS track
                // We use 'Listening' ActivityType
                 bool isDifferentTrack = _selectedActivityType != ActivityType.Listening || 
                                        _lastFmTrack != activity.LastFmTrack;
                
                if (isDifferentTrack)
                {
                    _lastFmTrack = activity.LastFmTrack; // Need field
                    _selectedActivityType = ActivityType.Listening; // Allow this
                    
                    ShowStatusMessage($"Scrobbling: {activity.LastFmTrack}", true);
                    
                    // We need to pass this to UpdateStatus. 
                    // UpdateStatus reads from UI entries. 
                    // Let's modify UpdateStatus to take optional overrides?
                    // OR just reuse GameNameEntry.Text = track name;
                    
                    GameNameEntry.Text = activity.LastFmTrack;
                    // Hide UI sections as Listening has no inputs
                    PlayingActivitySection.IsVisible = false;
                    WatchingActivitySection.IsVisible = false;
                    
                    await UpdateStatus(StatusType.Online);
                }
            }
            // Priority 4: Nothing special running
            else
            {
                // If we were automatically set to Streaming or Playing or Listening, revert
                if (_currentStatus == StatusType.Streaming || 
                   (_currentStatus == StatusType.Online && (_selectedActivityType == ActivityType.Playing || _selectedActivityType == ActivityType.Listening)))
                {
                    ShowStatusMessage("Activity Ended", true);
                    
                    // Reset to basic Online
                    _selectedActivityType = ActivityType.None;
                    _lastFmTrack = null;
                    await UpdateStatus(StatusType.Online);
                }
            }
        });
    }

    private string? _lastFmTrack;

    private async void OnSaveLastFmSettings(object? sender, EventArgs e)
    {
        string username = LastFmUserEntry.Text?.Trim() ?? "";
        string apiKey = LastFmKeyEntry.Text?.Trim() ?? "";
        
        Preferences.Set("lastfm_username", username);
        Preferences.Set("lastfm_apikey", apiKey);
        
        ShowStatusMessage("Last.fm settings saved!", true);
        
        // Trigger manual check immediately? 
        // ProcessMonitor loop will pick it up in 5s.
    }

    private void LoadLastFmSettings()
    {
        LastFmUserEntry.Text = Preferences.Get("lastfm_username", string.Empty);
        LastFmKeyEntry.Text = Preferences.Get("lastfm_apikey", string.Empty);
    }
    
    private async void OnLastFmLinkTapped(object? sender, EventArgs e)
    {
        try
        {
            await Launcher.OpenAsync("https://www.last.fm/api/account/create");
        }
        catch {}
    }

    private void UpdateActivityUI()
    {
        // Helper to refresh visibility
        PlayingActivitySection.IsVisible = _selectedActivityType == ActivityType.Playing;
        WatchingActivitySection.IsVisible = _selectedActivityType == ActivityType.Watching;
        
        BtnPlayingActivity.BackgroundColor = _selectedActivityType == ActivityType.Playing ? Color.FromArgb("#6b21a8") : Color.FromArgb("#374151");
        BtnWatchingActivity.BackgroundColor = _selectedActivityType == ActivityType.Watching ? Color.FromArgb("#6b21a8") : Color.FromArgb("#374151");
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
