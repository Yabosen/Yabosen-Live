using System.Net.Http.Json;
using YabosenStatus.Models;
using YabosenStatus.Services;
using Application = Microsoft.Maui.Controls.Application;
#if WINDOWS
using Microsoft.UI;
using Microsoft.UI.Windowing;
#endif

namespace YabosenStatus;

public partial class MainPage : ContentPage
{
    private readonly StatusService _statusService;
    private readonly HeartbeatService _heartbeatService;
    private readonly DiscordRpcService _discordRpcService;
    private readonly ProcessMonitorService _processMonitorService;

    private StatusType _currentStatus = StatusType.Offline;
    private ActivityType _selectedActivityType = ActivityType.None;
    private string? _lastFmTrack;
    private bool _isExiting;

    public System.Windows.Input.ICommand ShowCommand { get; }

    public MainPage()
    {
        InitializeComponent();

        ShowCommand = new Command(ShowWindow);
        TrayIcon.BindingContext = this;

        _statusService = new StatusService();
        _heartbeatService = new HeartbeatService();
        _discordRpcService = new DiscordRpcService();
        _processMonitorService = new ProcessMonitorService();

        Loaded += async (s, e) =>
        {
#if WINDOWS
            if (Window?.Handler?.PlatformView is Microsoft.UI.Xaml.Window win)
            {
                var hWnd = WinRT.Interop.WindowNative.GetWindowHandle(win);
                var windowId = Microsoft.UI.Win32Interop.GetWindowIdFromWindow(hWnd);
                var appWindow = AppWindow.GetFromWindowId(windowId);
                appWindow.Closing += OnAppWindowClosing;

                if (Preferences.Get("start_minimized", false))
                {
                    Dispatcher.DispatchDelayed(TimeSpan.FromMilliseconds(100), HideWindow);
                }
            }
#endif
            await InitializeAsync();
        };

        Unloaded += (s, e) =>
        {
            // Only fully tear down on explicit exit. Window minimize-to-tray
            // raises Unloaded too on some MAUI versions and we want heartbeats
            // to keep firing while the window is hidden.
            if (!_isExiting) return;
            _heartbeatService.Dispose();
            _processMonitorService.Dispose();
            _discordRpcService.Dispose();
        };
    }

    private async Task InitializeAsync()
    {
        try
        {
            _discordRpcService.Initialize();

            _processMonitorService.ActivityChanged += OnActivityChanged;
            _processMonitorService.StartMonitoring();

            await _statusService.InitializeAsync();
            UpdatePasswordDisplay();
            LoadLastFmSettings();
            await RefreshCurrentStatus();

            await _heartbeatService.StartAsync();

            // Auto-set Online on startup. This also unsticks the "stuck offline"
            // case from prior versions where Quit explicitly POSTed offline.
            // ProcessMonitor will upgrade to Streaming/Playing within a few
            // seconds if OBS or a Steam game is already running.
            if (_statusService.HasPassword)
            {
                try { await _statusService.UpdateStatusAsync(StatusType.Online); } catch { }
                await RefreshCurrentStatus();
            }
        }
        catch (Exception ex)
        {
            ShowStatusMessage($"Error: {ex.Message}", false);
        }
    }

    private async Task RefreshCurrentStatus()
    {
        try
        {
            var status = await _statusService.GetStatusAsync();
            if (status == null) return;

            _currentStatus = status.Status;

            if (status.Status == StatusType.Streaming)
            {
                CurrentStatusLabel.Text = "Streaming";
                CurrentStatusDot.BackgroundColor = status.Status.ToColor();
            }
            else if (status.ActivityType == ActivityType.Playing && !string.IsNullOrEmpty(status.ActivityName))
            {
                CurrentStatusLabel.Text = $"Playing {status.ActivityName}";
                CurrentStatusDot.BackgroundColor = Color.FromArgb("#6b21a8");
            }
            else if (status.ActivityType == ActivityType.Watching && !string.IsNullOrEmpty(status.ActivityName))
            {
                CurrentStatusLabel.Text = $"Watching {status.ActivityName}";
                CurrentStatusDot.BackgroundColor = Color.FromArgb("#6b21a8");
            }
            else if (status.ActivityType == ActivityType.Listening && !string.IsNullOrEmpty(status.ActivityName))
            {
                CurrentStatusLabel.Text = $"Listening to {status.ActivityName}";
                CurrentStatusDot.BackgroundColor = Color.FromArgb("#ef4444");
            }
            else
            {
                CurrentStatusLabel.Text = status.Status.ToDisplayName();
                CurrentStatusDot.BackgroundColor = status.Status.ToColor();
            }

            CurrentMessageLabel.Text = status.CustomMessage ?? string.Empty;
            CurrentMessageLabel.IsVisible = !string.IsNullOrEmpty(status.CustomMessage);

            var updatedTime = DateTimeOffset.FromUnixTimeMilliseconds(status.UpdatedAt).LocalDateTime;
            LastUpdatedLabel.Text = $"Last updated: {updatedTime:g}";

            _discordRpcService.UpdatePresence(status);
        }
        catch (Exception ex)
        {
            CurrentStatusLabel.Text = "Error loading";
            ShowStatusMessage($"Failed to load status: {ex.Message}", false);
        }
    }

    private async void OnStatusClicked(object? sender, EventArgs e)
    {
        if (sender is not Button button) return;
        if (!_statusService.HasPassword)
        {
            ShowStatusMessage("Please configure your password first", false);
            return;
        }

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
            string? customMessage = string.IsNullOrWhiteSpace(CustomMessageEntry.Text) ? null : CustomMessageEntry.Text.Trim();

            ActivityType activityType = _selectedActivityType;
            string? activityName = null, episodeInfo = null, seasonInfo = null;

            if (activityType == ActivityType.Playing)
            {
                activityName = string.IsNullOrWhiteSpace(GameNameEntry.Text) ? null : GameNameEntry.Text.Trim();
            }
            else if (activityType == ActivityType.Watching)
            {
                activityName = string.IsNullOrWhiteSpace(AnimeNameEntry.Text) ? null : AnimeNameEntry.Text.Trim();
                episodeInfo = string.IsNullOrWhiteSpace(EpisodeInfoEntry.Text) ? null : EpisodeInfoEntry.Text.Trim();
                seasonInfo = string.IsNullOrWhiteSpace(SeasonInfoEntry.Text) ? null : SeasonInfoEntry.Text.Trim();
            }
            else if (activityType == ActivityType.Listening)
            {
                activityName = _lastFmTrack;
            }

            var (success, error) = await _statusService.UpdateStatusAsync(
                status, customMessage, activityType, activityName, episodeInfo, seasonInfo);

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

            await _heartbeatService.ReloadPasswordAsync();
            await _heartbeatService.StartAsync();

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

    private void UpdatePasswordDisplay() => PasswordPreviewLabel.Text = _statusService.GetPasswordPreview();

    private void ShowStatusMessage(string message, bool isSuccess)
    {
        StatusMessageLabel.Text = message;
        StatusMessageLabel.TextColor = isSuccess ? Color.FromArgb("#22c55e") : Color.FromArgb("#ef4444");
        Dispatcher.StartTimer(TimeSpan.FromSeconds(3), () =>
        {
            StatusMessageLabel.Text = string.Empty;
            return false;
        });
    }

    private void OnActivityTypeClicked(object? sender, EventArgs e)
    {
        if (sender is not Button button) return;

        if (button == BtnPlayingActivity)
        {
            _selectedActivityType = ActivityType.Playing;
            PlayingActivitySection.IsVisible = true;
            WatchingActivitySection.IsVisible = false;
            BtnPlayingActivity.BackgroundColor = Color.FromArgb("#6b21a8");
            BtnWatchingActivity.BackgroundColor = Color.FromArgb("#374151");
        }
        else if (button == BtnWatchingActivity)
        {
            _selectedActivityType = ActivityType.Watching;
            PlayingActivitySection.IsVisible = false;
            WatchingActivitySection.IsVisible = true;
            BtnPlayingActivity.BackgroundColor = Color.FromArgb("#374151");
            BtnWatchingActivity.BackgroundColor = Color.FromArgb("#6b21a8");
        }
    }

    private void OnClearActivityClicked(object? sender, EventArgs e)
    {
        _selectedActivityType = ActivityType.None;
        PlayingActivitySection.IsVisible = false;
        WatchingActivitySection.IsVisible = false;
        BtnPlayingActivity.BackgroundColor = Color.FromArgb("#374151");
        BtnWatchingActivity.BackgroundColor = Color.FromArgb("#374151");
        GameNameEntry.Text = string.Empty;
        AnimeNameEntry.Text = string.Empty;
        EpisodeInfoEntry.Text = string.Empty;
        SeasonInfoEntry.Text = string.Empty;
    }

    private void OnActivityChanged(object? sender, ActivityStatus activity)
    {
        MainThread.BeginInvokeOnMainThread(async () =>
        {
            if (activity.IsObsRunning)
            {
                string? gameName = activity.SteamAppId > 0
                    ? (activity.SteamGameName ?? $"Steam Game ({activity.SteamAppId})")
                    : null;

                bool needsUpdate = _currentStatus != StatusType.Streaming
                    || (gameName != null && GameNameEntry.Text != gameName);

                if (needsUpdate)
                {
                    if (!string.IsNullOrEmpty(gameName))
                    {
                        ShowStatusMessage($"Streaming {gameName}...", true);
                        _selectedActivityType = ActivityType.Playing;
                        GameNameEntry.Text = gameName;
                        UpdateActivityUI();
                    }
                    else
                    {
                        ShowStatusMessage("OBS Detected! Switching to Streaming...", true);
                        _selectedActivityType = ActivityType.None;
                        GameNameEntry.Text = string.Empty;
                    }
                    await UpdateStatus(StatusType.Streaming);
                }
            }
            else if (activity.SteamAppId > 0)
            {
                string displayName = activity.SteamGameName ?? $"Steam Game ({activity.SteamAppId})";
                bool isDifferentGame = _selectedActivityType != ActivityType.Playing || GameNameEntry.Text != displayName;
                if (isDifferentGame)
                {
                    ShowStatusMessage($"Steam Game Detected: {displayName}", true);
                    _selectedActivityType = ActivityType.Playing;
                    GameNameEntry.Text = displayName;
                    UpdateActivityUI();
                    await UpdateStatus(StatusType.Online);
                }
            }
            else if (!string.IsNullOrEmpty(activity.LastFmTrack))
            {
                NowPlayingDisplay.IsVisible = true;
                NotPlayingLabel.IsVisible = false;
                NowPlayingTrackLabel.Text = activity.LastFmTrack;

                bool isDifferentTrack = _selectedActivityType != ActivityType.Listening || _lastFmTrack != activity.LastFmTrack;
                if (isDifferentTrack)
                {
                    _lastFmTrack = activity.LastFmTrack;
                    _selectedActivityType = ActivityType.Listening;
                    ShowStatusMessage($"Scrobbling: {activity.LastFmTrack}", true);
                    GameNameEntry.Text = activity.LastFmTrack;
                    PlayingActivitySection.IsVisible = false;
                    WatchingActivitySection.IsVisible = false;
                    await UpdateStatus(StatusType.Online);
                    _discordRpcService.UpdatePresence(await _statusService.GetStatusAsync(), _lastFmTrack);
                }
            }
            else
            {
                NowPlayingDisplay.IsVisible = false;
                NotPlayingLabel.IsVisible = true;

                if (_currentStatus == StatusType.Streaming
                    || (_currentStatus == StatusType.Online &&
                        (_selectedActivityType == ActivityType.Playing || _selectedActivityType == ActivityType.Listening)))
                {
                    ShowStatusMessage("Activity Ended", true);
                    _selectedActivityType = ActivityType.None;
                    _lastFmTrack = null;
                    await UpdateStatus(StatusType.Online);
                    _discordRpcService.UpdatePresence(await _statusService.GetStatusAsync(), null);
                }
            }
        });
    }

    private void OnSaveLastFmSettings(object? sender, EventArgs e)
    {
        Preferences.Set("lastfm_username", LastFmUserEntry.Text?.Trim() ?? "");
        Preferences.Set("lastfm_apikey", LastFmKeyEntry.Text?.Trim() ?? "");
        ShowStatusMessage("Last.fm settings saved!", true);
    }

    private void LoadLastFmSettings()
    {
        LastFmUserEntry.Text = Preferences.Get("lastfm_username", string.Empty);
        LastFmKeyEntry.Text = Preferences.Get("lastfm_apikey", string.Empty);
        StartMinimizedCheckBox.IsChecked = Preferences.Get("start_minimized", false);
    }

    private void OnStartMinimizedChanged(object? sender, CheckedChangedEventArgs e) =>
        Preferences.Set("start_minimized", e.Value);

    private void OnStartMinimizedLabelTapped(object? sender, EventArgs e) =>
        StartMinimizedCheckBox.IsChecked = !StartMinimizedCheckBox.IsChecked;

#if WINDOWS
    private void OnAppWindowClosing(AppWindow sender, AppWindowClosingEventArgs args)
    {
        if (_isExiting) return;
        args.Cancel = true;
        Dispatcher.Dispatch(HideWindow);
    }
#endif

    private void HideWindow()
    {
#if WINDOWS
        if (Window?.Handler?.PlatformView is Microsoft.UI.Xaml.Window win)
        {
            var hWnd = WinRT.Interop.WindowNative.GetWindowHandle(win);
            var windowId = Microsoft.UI.Win32Interop.GetWindowIdFromWindow(hWnd);
            AppWindow.GetFromWindowId(windowId).Hide();
        }
#endif
    }

    private void ShowWindow()
    {
#if WINDOWS
        if (Window?.Handler?.PlatformView is Microsoft.UI.Xaml.Window win)
        {
            var hWnd = WinRT.Interop.WindowNative.GetWindowHandle(win);
            var windowId = Microsoft.UI.Win32Interop.GetWindowIdFromWindow(hWnd);
            AppWindow.GetFromWindowId(windowId).Show();
            win.Activate();
        }
#endif
    }

    private void OnShowClicked(object? sender, EventArgs e) => ShowWindow();

    private void OnExitClicked(object? sender, EventArgs e)
    {
        // Don't pre-emptively POST offline. The API short-circuits when the
        // stored status is "offline" and ignores the heartbeat-based idle
        // override — which is intentional for when the user *manually* clicks
        // Offline, but wrong here. Just stop heartbeats; PC heartbeat goes
        // stale, mobile is still alive → API returns idle.
        _isExiting = true;
        _heartbeatService.Stop();
        Application.Current?.Quit();
    }

    private async void OnLastFmLinkTapped(object? sender, EventArgs e)
    {
        try { await Launcher.OpenAsync("https://www.last.fm/api/account/create"); } catch { }
    }

    private void UpdateActivityUI()
    {
        PlayingActivitySection.IsVisible = _selectedActivityType == ActivityType.Playing;
        WatchingActivitySection.IsVisible = _selectedActivityType == ActivityType.Watching;
        BtnPlayingActivity.BackgroundColor = _selectedActivityType == ActivityType.Playing ? Color.FromArgb("#6b21a8") : Color.FromArgb("#374151");
        BtnWatchingActivity.BackgroundColor = _selectedActivityType == ActivityType.Watching ? Color.FromArgb("#6b21a8") : Color.FromArgb("#374151");
    }

    private void SetLoading(bool isLoading)
    {
        LoadingIndicator.IsRunning = isLoading;
        LoadingIndicator.IsVisible = isLoading;
        BtnOnline.IsEnabled = !isLoading;
        BtnOffline.IsEnabled = !isLoading;
        BtnDnd.IsEnabled = !isLoading;
        BtnIdle.IsEnabled = !isLoading;
        BtnSleeping.IsEnabled = !isLoading;
        BtnStreaming.IsEnabled = !isLoading;
    }

    private async void OnAvatarUploadTapped(object? sender, EventArgs e)
    {
        try
        {
            var result = await FilePicker.Default.PickAsync(new PickOptions
            {
                PickerTitle = "Select Avatar Image",
                FileTypes = FilePickerFileType.Images
            });
            if (result == null) return;

            AvatarUploadStatusLabel.Text = "Uploading...";
            AvatarUploadStatusLabel.TextColor = Color.FromArgb("#9ca3af");

            using var stream = await result.OpenReadAsync();
            var success = await UploadAvatarAsync(stream, result.FileName);

            AvatarUploadStatusLabel.Text = success ? "✅ Avatar uploaded successfully!" : "❌ Upload failed";
            AvatarUploadStatusLabel.TextColor = success ? Color.FromArgb("#22c55e") : Color.FromArgb("#ef4444");
        }
        catch (Exception ex)
        {
            AvatarUploadStatusLabel.Text = $"❌ Error: {ex.Message}";
            AvatarUploadStatusLabel.TextColor = Color.FromArgb("#ef4444");
        }
    }

    private async Task<bool> UploadAvatarAsync(Stream imageStream, string fileName)
    {
        try
        {
            using var memoryStream = new MemoryStream();
            await imageStream.CopyToAsync(memoryStream);
            var imageBytes = memoryStream.ToArray();

            string mimeType = "image/png";
            var ext = Path.GetExtension(fileName).ToLowerInvariant();
            if (ext == ".jpg" || ext == ".jpeg") mimeType = "image/jpeg";
            else if (ext == ".gif") mimeType = "image/gif";
            else if (ext == ".webp") mimeType = "image/webp";

            if (imageBytes.Length > 500 * 1024)
            {
                AvatarUploadStatusLabel.Text = $"❌ Image too large ({imageBytes.Length / 1024}KB). Max 500KB.";
                AvatarUploadStatusLabel.TextColor = Color.FromArgb("#ef4444");
                return false;
            }

            var base64 = Convert.ToBase64String(imageBytes);
            var dataUrl = $"data:{mimeType};base64,{base64}";

            string? password = null;
            try { password = await SecureStorage.GetAsync("yabosen_password"); } catch { }
            if (string.IsNullOrEmpty(password))
                password = Preferences.Get("yabosen_password", string.Empty);

            if (string.IsNullOrEmpty(password))
            {
                AvatarUploadStatusLabel.Text = "❌ Please set your password first";
                AvatarUploadStatusLabel.TextColor = Color.FromArgb("#ef4444");
                return false;
            }

            using var httpClient = new HttpClient();
            var request = new HttpRequestMessage(HttpMethod.Post, "https://yabosen.live/api/avatar");
            request.Headers.Add("Authorization", $"Bearer {password}");
            request.Content = JsonContent.Create(new { avatar = dataUrl });

            var response = await httpClient.SendAsync(request);
            if (response.IsSuccessStatusCode) return true;

            var errorJson = await response.Content.ReadAsStringAsync();
            System.Diagnostics.Debug.WriteLine($"Avatar upload failed: {errorJson}");
            return false;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Avatar upload error: {ex.Message}");
            return false;
        }
    }
}
