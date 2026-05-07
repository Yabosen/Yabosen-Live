using DiscordRPC;
using DiscordRPC.Logging;
using YabosenStatus.Models;

namespace YabosenStatus.Services;

public class DiscordRpcService : IDisposable
{
    private const string CLIENT_ID = "1458777387859836958";
    private DiscordRpcClient? _client;
    private bool _isInitialized;
    private bool _disposed;

    public void Initialize()
    {
        if (_isInitialized) return;

        try
        {
            _client = new DiscordRpcClient(CLIENT_ID)
            {
                Logger = new ConsoleLogger { Level = LogLevel.Trace }
            };

            _client.OnReady += (sender, e) =>
            {
#pragma warning disable CS0618
                System.Diagnostics.Trace.WriteLine($"[DiscordRPC] Connected as {e.User.Username}");
#pragma warning restore CS0618
            };

            _client.OnError += (sender, e) =>
                System.Diagnostics.Trace.WriteLine($"[DiscordRPC] Error: {e.Message}");

            _client.Initialize();
            _isInitialized = true;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Trace.WriteLine($"[DiscordRPC] Failed to initialize: {ex.Message}");
        }
    }

    public void UpdatePresence(StatusData? status, string? nowPlayingTrack = null)
    {
        if (_client == null || !_isInitialized || status == null) return;

        try
        {
            string stateString = !string.IsNullOrEmpty(nowPlayingTrack)
                ? $"🎵 {nowPlayingTrack}"
                : GetStateString(status) ?? "Yabosen Status";

            var presence = new RichPresence
            {
                Details = GetDetailsString(status),
                State = stateString,
                Timestamps = Timestamps.Now
            };

            _client.SetPresence(presence);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Trace.WriteLine($"[DiscordRPC] Failed to update presence: {ex.Message}");
        }
    }

    public void ClearPresence() => _client?.ClearPresence();

    private static string GetDetailsString(StatusData status) => status.Status switch
    {
        StatusType.Online => "Online",
        StatusType.Offline => "Offline",
        StatusType.Dnd => "Do Not Disturb",
        StatusType.Idle => "Idle",
        StatusType.Sleeping => "Sleeping 💤",
        StatusType.Streaming => "🔴 Streaming",
        _ => "Unknown"
    };

    private static string? GetStateString(StatusData status)
    {
        if (!string.IsNullOrEmpty(status.CustomMessage)) return status.CustomMessage;

        return status.ActivityType switch
        {
            ActivityType.Playing when !string.IsNullOrEmpty(status.ActivityName)
                => $"Playing {status.ActivityName}",
            ActivityType.Watching when !string.IsNullOrEmpty(status.ActivityName)
                => GetWatchingString(status),
            ActivityType.Listening when !string.IsNullOrEmpty(status.ActivityName)
                => $"Listening to {status.ActivityName}",
            _ => null
        };
    }

    private static string GetWatchingString(StatusData status)
    {
        var parts = new List<string> { $"Watching {status.ActivityName}" };
        if (!string.IsNullOrEmpty(status.SeasonInfo)) parts.Add(status.SeasonInfo);
        if (!string.IsNullOrEmpty(status.EpisodeInfo)) parts.Add(status.EpisodeInfo);
        return string.Join(" • ", parts);
    }

    public void Dispose()
    {
        if (_disposed) return;
        _client?.ClearPresence();
        _client?.Dispose();
        _client = null;
        _disposed = true;
        GC.SuppressFinalize(this);
    }
}
