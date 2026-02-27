using System.Diagnostics;

namespace YabosenStatus.Windows.Services;

public class ProcessMonitorService : IDisposable
{
    private readonly PeriodicTimer _timer;
    private readonly CancellationTokenSource _cts;
    private readonly SteamService _steamService;
    private readonly LastFmService _lastFmService;
    
    // Cache previous state to avoid spamming events
    private ActivityStatus _lastStatus = new();
    
    public event EventHandler<ActivityStatus>? ActivityChanged;

    public ProcessMonitorService()
    {
        _timer = new PeriodicTimer(TimeSpan.FromSeconds(5));
        _cts = new CancellationTokenSource();
        _steamService = new SteamService();
        _lastFmService = new LastFmService();
    }

    public void StartMonitoring()
    {
        // Run the monitoring loop in a background task
        Task.Run(async () =>
        {
            try
            {
                while (await _timer.WaitForNextTickAsync(_cts.Token))
                {
                    await CheckActivity();
                }
            }
            catch (OperationCanceledException)
            {
                // Timer canceled
            }
        });
        
        // Initial check immediately
        Task.Run(CheckActivity);
    }

    private async Task CheckActivity()
    {
        var currentStatus = new ActivityStatus();

        // 1. Check OBS (Highest Priority)
        if (Process.GetProcessesByName("obs64").Length > 0 || 
            Process.GetProcessesByName("obs32").Length > 0)
        {
            currentStatus.IsObsRunning = true;
        }

        // 2. Check Steam (Secondary Priority)
        // Always check this so we can display "Playing Game" even if Streaming logic overrides it later in UI
        int steamAppId = _steamService.GetRunningAppId();
        if (steamAppId > 0)
        {
            currentStatus.SteamAppId = steamAppId;
            currentStatus.SteamGameName = _steamService.GetGameName(steamAppId);
        }

        // 3. Check Last.fm (Third Priority)
        // Only check if we have configured credentials
        string username = Preferences.Get("lastfm_username", string.Empty);
        string apiKey = Preferences.Get("lastfm_apikey", string.Empty);
        
        if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(apiKey))
        {
            try
            {
                var track = await _lastFmService.GetNowPlayingAsync(username, apiKey);
                currentStatus.LastFmTrack = track;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Trace.WriteLine($"[ProcessMonitor] Last.fm check failed: {ex.Message}");
            }
        }

        // Only raise event if something changed
        if (!currentStatus.Equals(_lastStatus))
        {
            _lastStatus = currentStatus;
            ActivityChanged?.Invoke(this, currentStatus);
            
            System.Diagnostics.Trace.WriteLine(
                $"[ProcessMonitor] Activity Changed: OBS={currentStatus.IsObsRunning}, " +
                $"SteamAppId={currentStatus.SteamAppId}, Game={currentStatus.SteamGameName}, " +
                $"LastFm={currentStatus.LastFmTrack}");
        }
    }

    public void Dispose()
    {
        _cts.Cancel();
        _cts.Dispose();
        _timer.Dispose();
        GC.SuppressFinalize(this);
    }
}

public class ActivityStatus : IEquatable<ActivityStatus>
{
    public bool IsObsRunning { get; set; }
    public int SteamAppId { get; set; }
    public string? SteamGameName { get; set; }
    public string? LastFmTrack { get; set; }

    public bool Equals(ActivityStatus? other)
    {
        if (other is null) return false;
        return IsObsRunning == other.IsObsRunning && 
               SteamAppId == other.SteamAppId && 
               SteamGameName == other.SteamGameName &&
               LastFmTrack == other.LastFmTrack;
    }

    public override bool Equals(object? obj) => Equals(obj as ActivityStatus);
    public override int GetHashCode() => HashCode.Combine(IsObsRunning, SteamAppId, SteamGameName, LastFmTrack);
}
