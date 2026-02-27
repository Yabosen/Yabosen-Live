using Microsoft.Maui.Graphics;
namespace YabosenStatus.Shared.Models;

/// <summary>
/// Represents the possible status types for the user
/// </summary>
public enum StatusType
{
    Online,
    Offline,
    Dnd,      // Do Not Disturb
    Idle,
    Sleeping,
    Streaming
}

/// <summary>
/// Activity type for the user's current activity
/// </summary>
public enum ActivityType
{
    None,
    Playing,
    Watching,
    Listening
}

/// <summary>
/// Status data model matching the API response
/// </summary>
public class StatusData
{
    public StatusType Status { get; set; } = StatusType.Offline;
    public string? CustomMessage { get; set; }
    public ActivityType ActivityType { get; set; } = ActivityType.None;
    public string? ActivityName { get; set; }
    public string? EpisodeInfo { get; set; }
    public string? SeasonInfo { get; set; }
    public long UpdatedAt { get; set; }
    // Platform priority support
    public string? SourcePlatform { get; set; } 
}

/// <summary>
/// API response wrapper for status updates
/// </summary>
public class StatusResponse
{
    public bool Success { get; set; }
    public StatusType Status { get; set; }
    public string? CustomMessage { get; set; }
    public ActivityType ActivityType { get; set; }
    public string? ActivityName { get; set; }
    public string? EpisodeInfo { get; set; }
    public string? SeasonInfo { get; set; }
    public long UpdatedAt { get; set; }
    public string? Error { get; set; }
}

/// <summary>
/// Extension methods for StatusType
/// </summary>
public static class StatusTypeExtensions
{
    public static string ToDisplayName(this StatusType status) => status switch
    {
        StatusType.Online => "Online",
        StatusType.Offline => "Offline",
        StatusType.Dnd => "Do Not Disturb",
        StatusType.Idle => "Idle",
        StatusType.Sleeping => "Sleeping",
        StatusType.Streaming => "Streaming",
        _ => "Unknown"
    };

    public static string ToApiString(this StatusType status) => status switch
    {
        StatusType.Online => "online",
        StatusType.Offline => "offline",
        StatusType.Dnd => "dnd",
        StatusType.Idle => "idle",
        StatusType.Sleeping => "sleeping",
        StatusType.Streaming => "streaming",
        _ => "offline"
    };

    public static Color ToColor(this StatusType status) => status switch
    {
        StatusType.Online => Color.FromArgb("#22c55e"),    // Green
        StatusType.Offline => Color.FromArgb("#6b7280"),   // Gray
        StatusType.Dnd => Color.FromArgb("#ef4444"),       // Red
        StatusType.Idle => Color.FromArgb("#eab308"),      // Yellow
        StatusType.Sleeping => Color.FromArgb("#a855f7"),  // Purple
        StatusType.Streaming => Color.FromArgb("#ef4444"), // Red (pulse)
        _ => Color.FromArgb("#6b7280")
    };

    public static StatusType FromApiString(string? status) => status?.ToLowerInvariant() switch
    {
        "online" => StatusType.Online,
        "offline" => StatusType.Offline,
        "dnd" => StatusType.Dnd,
        "idle" => StatusType.Idle,
        "sleeping" => StatusType.Sleeping,
        "streaming" => StatusType.Streaming,
        _ => StatusType.Offline
    };
}

/// <summary>
/// Extension methods for ActivityType
/// </summary>
public static class ActivityTypeExtensions
{
    public static string ToApiString(this ActivityType activityType) => activityType switch
    {
        ActivityType.Playing => "playing",
        ActivityType.Watching => "watching",
        ActivityType.Listening => "listening",
        ActivityType.None => null!,
        _ => null!
    };

    public static ActivityType FromApiString(string? activityType) => activityType?.ToLowerInvariant() switch
    {
        "playing" => ActivityType.Playing,
        "watching" => ActivityType.Watching,
        "listening" => ActivityType.Listening,
        _ => ActivityType.None
    };
}
