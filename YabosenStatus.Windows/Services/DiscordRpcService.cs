using DiscordRPC;
using DiscordRPC.Logging;
using YabosenStatus.Shared.Models;

namespace YabosenStatus.Windows.Services;

/// <summary>
/// Service for managing Discord Rich Presence integration
/// </summary>
public class DiscordRpcService : IDisposable
{
    private const string CLIENT_ID = "1458777387859836958";
    private DiscordRpcClient? _client;
    private bool _isInitialized;
    private bool _disposed;

    /// <summary>
    /// Initialize and connect to Discord
    /// </summary>
    public void Initialize()
    {
        if (_isInitialized) return;

        try
        {
            System.Diagnostics.Trace.WriteLine("[DiscordRPC] Initializing with Client ID: " + CLIENT_ID);
            
            _client = new DiscordRpcClient(CLIENT_ID)
            {
                Logger = new ConsoleLogger { Level = LogLevel.Trace }
            };

            _client.OnReady += (sender, e) =>
            {
#pragma warning disable CS0618 // Discord no longer uses discriminators
                System.Diagnostics.Trace.WriteLine($"[DiscordRPC] Connected as {e.User.Username}");
#pragma warning restore CS0618
            };

            _client.OnError += (sender, e) =>
            {
                System.Diagnostics.Trace.WriteLine($"[DiscordRPC] Error: {e.Message}");
            };
            
            _client.OnConnectionFailed += (sender, e) =>
            {
                System.Diagnostics.Trace.WriteLine($"[DiscordRPC] Connection failed to pipe: {e.FailedPipe}");
            };
            
            _client.OnConnectionEstablished += (sender, e) =>
            {
                System.Diagnostics.Trace.WriteLine($"[DiscordRPC] Connection established on pipe: {e.ConnectedPipe}");
            };

            bool connected = _client.Initialize();
            System.Diagnostics.Trace.WriteLine($"[DiscordRPC] Initialize returned: {connected}");
            
            _isInitialized = true;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Trace.WriteLine($"[DiscordRPC] Failed to initialize: {ex.Message}");
        }
    }

    /// <summary>
    /// Update the Discord Rich Presence based on current status
    /// </summary>
    public void UpdatePresence(StatusData? status)
    {
        if (_client == null || !_isInitialized || status == null) return;

        try
        {
            System.Diagnostics.Trace.WriteLine($"[DiscordRPC] Updating presence: {status.Status}");
            
            // Create presence - assets are optional, only use if uploaded to Discord Developer Portal
            var presence = new RichPresence
            {
                Details = GetDetailsString(status),
                State = GetStateString(status) ?? "Yabosen Status",
                Timestamps = Timestamps.Now
            };
            
            // Only add assets if they exist in Discord Developer Portal
            // Comment out assets section to test without them first
            /*
            presence.Assets = new Assets
            {
                LargeImageKey = GetLargeImageKey(status.Status),
                LargeImageText = status.Status.ToDisplayName(),
                SmallImageKey = GetActivityImageKey(status.ActivityType),
                SmallImageText = GetActivityText(status)
            };
            */

            _client.SetPresence(presence);
            
            System.Diagnostics.Trace.WriteLine($"[DiscordRPC] Presence set - Details: {presence.Details}, State: {presence.State}");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Trace.WriteLine($"[DiscordRPC] Failed to update presence: {ex.Message}");
        }
    }

    /// <summary>
    /// Clear the Discord presence
    /// </summary>
    public void ClearPresence()
    {
        _client?.ClearPresence();
    }

    private static string GetDetailsString(StatusData status)
    {
        return status.Status switch
        {
            StatusType.Online => "Online",
            StatusType.Offline => "Offline",
            StatusType.Dnd => "Do Not Disturb",
            StatusType.Idle => "Idle",
            StatusType.Sleeping => "Sleeping 💤",
            StatusType.Streaming => "🔴 Streaming",
            _ => "Unknown"
        };
    }

    private static string? GetStateString(StatusData status)
    {
        // If there's a custom message, show it
        if (!string.IsNullOrEmpty(status.CustomMessage))
        {
            return status.CustomMessage;
        }

        // Otherwise show activity info
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
        
        if (!string.IsNullOrEmpty(status.SeasonInfo))
            parts.Add(status.SeasonInfo);
        
        if (!string.IsNullOrEmpty(status.EpisodeInfo))
            parts.Add(status.EpisodeInfo);

        return string.Join(" • ", parts);
    }

    private static string GetLargeImageKey(StatusType status)
    {
        // These keys should match the asset names uploaded to Discord Developer Portal
        return status switch
        {
            StatusType.Online => "online",
            StatusType.Offline => "offline",
            StatusType.Dnd => "dnd",
            StatusType.Idle => "idle",
            StatusType.Sleeping => "sleeping",
            StatusType.Streaming => "streaming",
            _ => "offline"
        };
    }

    private static string? GetActivityImageKey(ActivityType type)
    {
        return type switch
        {
            ActivityType.Playing => "playing", // Ensure you have this asset
            ActivityType.Watching => "watching", // Ensure you have this asset
            ActivityType.Listening => "listening", // Might default to app icon if missing
            _ => null
        };
    }

    private static string? GetActivityText(StatusData status)
    {
        return status.ActivityType switch
        {
            ActivityType.Playing => "Playing a game",
            ActivityType.Watching => "Watching anime",
            ActivityType.Listening => "Listening to music",
            _ => null
        };
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (_disposed) return;

        if (disposing)
        {
            _client?.ClearPresence();
            _client?.Dispose();
            _client = null;
        }

        _disposed = true;
    }
}
