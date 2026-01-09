using Microsoft.Extensions.Logging;
// using Plugin.LocalNotification; 
using YabosenStatus.Shared.Models;
using YabosenStatus.Shared.Services;

namespace YabosenStatus.Android.Services;

public class AutoSleepService
{
    private readonly StatusService _statusService;
    private readonly ILogger<AutoSleepService> _logger;
    private System.Timers.Timer? _checkTimer;
    private DateTime _lastActivity = DateTime.UtcNow;
    private bool _isEnabled;
    private int _timeoutMinutes = 30; // Default 30 min
    private const string SETTINGS_ENABLED_KEY = "auto_sleep_enabled";
    private const string SETTINGS_TIMEOUT_KEY = "auto_sleep_timeout";

    public AutoSleepService(StatusService statusService, ILogger<AutoSleepService> logger)
    {
        _statusService = statusService;
        _logger = logger;
        
        LoadSettings();
    }

    public void Initialize()
    {
        if (_isEnabled)
        {
            StartMonitoring();
        }
    }

    public void UpdateSettings(bool isEnabled, int timeoutMinutes)
    {
        bool wasEnabled = _isEnabled;
        _isEnabled = isEnabled;
        _timeoutMinutes = timeoutMinutes;

        // Persist settings
        Preferences.Set(SETTINGS_ENABLED_KEY, isEnabled);
        Preferences.Set(SETTINGS_TIMEOUT_KEY, timeoutMinutes);

        if (_isEnabled && !wasEnabled)
        {
            StartMonitoring();
        }
        else if (!_isEnabled && wasEnabled)
        {
            StopMonitoring();
        }
    }

    public (bool IsEnabled, int TimeoutMinutes) GetSettings()
    {
        return (_isEnabled, _timeoutMinutes);
    }

    private void LoadSettings()
    {
        _isEnabled = Preferences.Get(SETTINGS_ENABLED_KEY, false);
        _timeoutMinutes = Preferences.Get(SETTINGS_TIMEOUT_KEY, 30);
    }

    private void StartMonitoring()
    {
        StopMonitoring(); // Ensure no duplicates
        
        _lastActivity = DateTime.UtcNow;
        _checkTimer = new System.Timers.Timer(60000); // Check every minute
        _checkTimer.Elapsed += CheckTimer_Elapsed;
        _checkTimer.Start();
        
        _logger.LogInformation("Auto-Sleep monitoring started. Timeout: {Timeout} min", _timeoutMinutes);
    }

    private void StopMonitoring()
    {
        if (_checkTimer != null)
        {
            _checkTimer.Stop();
            _checkTimer.Dispose();
            _checkTimer = null;
        }
        _logger.LogInformation("Auto-Sleep monitoring stopped");
    }

    private async void CheckTimer_Elapsed(object? sender, System.Timers.ElapsedEventArgs e)
    {
        try
        {
            var timeSinceLastActivity = DateTime.UtcNow - _lastActivity;
            
            if (timeSinceLastActivity.TotalMinutes >= _timeoutMinutes)
            {
                await SetSleepStatus();
                _lastActivity = DateTime.UtcNow; 
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in AutoSleep timer");
        }
    }

    private async Task SetSleepStatus()
    {
        if (!_statusService.HasPassword) return;

        var result = await _statusService.UpdateStatusAsync(
            StatusType.Sleeping,
            customMessage: "Auto-sleep enabled"
        );

        if (result.Success)
        {
            // await ShowNotification("Auto-Sleep Active", "Your status has been updated to Sleeping automatically.");
            _logger.LogInformation("Auto-Sleep triggered successfully");
        }
        else
        {
            _logger.LogWarning("Auto-Sleep failed to update status: {Error}", result.Error);
        }
    }

    /*
    public async Task ShowNotification(string title, string message)
    {
        // Notification logic disabled due to build compatibility issues
    }
    */

    public void ResetTimer()
    {
        _lastActivity = DateTime.UtcNow;
    }
}
