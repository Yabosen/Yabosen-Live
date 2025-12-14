using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using YabosenStatus.Models;

namespace YabosenStatus.Services;

/// <summary>
/// Service for communicating with the Yabosen status API
/// </summary>
public class StatusService
{
    private readonly HttpClient _httpClient;
    private string? _password;
    private const string API_URL = "https://yabosen.live/api/status";
    private const string PASSWORD_STORAGE_KEY = "yabosen_password";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    public StatusService()
    {
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
    }

    /// <summary>
    /// Initialize the service by loading the stored password
    /// </summary>
    public async Task InitializeAsync()
    {
        try
        {
            _password = await SecureStorage.GetAsync(PASSWORD_STORAGE_KEY);
        }
        catch (Exception)
        {
            // SecureStorage might not be available on all platforms
            _password = Preferences.Get(PASSWORD_STORAGE_KEY, string.Empty);
        }
    }

    /// <summary>
    /// Check if password is configured
    /// </summary>
    public bool HasPassword => !string.IsNullOrEmpty(_password);

    /// <summary>
    /// Save the password securely
    /// </summary>
    public async Task SetPasswordAsync(string password)
    {
        _password = password;
        try
        {
            await SecureStorage.SetAsync(PASSWORD_STORAGE_KEY, password);
        }
        catch (Exception)
        {
            // Fallback to Preferences if SecureStorage unavailable
            Preferences.Set(PASSWORD_STORAGE_KEY, password);
        }
    }

    /// <summary>
    /// Get the current password (masked for display)
    /// </summary>
    public string GetPasswordPreview()
    {
        if (string.IsNullOrEmpty(_password))
            return "Not set";
        return new string('•', _password.Length);
    }

    /// <summary>
    /// Fetch the current status from the API
    /// </summary>
    public async Task<StatusData?> GetStatusAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync(API_URL);
            
            if (!response.IsSuccessStatusCode)
                return null;

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<JsonElement>(json);
            
            return new StatusData
            {
                Status = StatusTypeExtensions.FromApiString(
                    data.TryGetProperty("status", out var s) ? s.GetString() : null),
                CustomMessage = data.TryGetProperty("customMessage", out var cm)
                    ? cm.GetString() : null,
                ActivityType = ActivityTypeExtensions.FromApiString(
                    data.TryGetProperty("activityType", out var at) ? at.GetString() : null),
                ActivityName = data.TryGetProperty("activityName", out var an)
                    ? an.GetString() : null,
                EpisodeInfo = data.TryGetProperty("episodeInfo", out var ei)
                    ? ei.GetString() : null,
                SeasonInfo = data.TryGetProperty("seasonInfo", out var si)
                    ? si.GetString() : null,
                UpdatedAt = data.TryGetProperty("updatedAt", out var ua)
                    ? ua.GetInt64() : DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Failed to get status: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Update the status via the API
    /// </summary>
    public async Task<(bool Success, string? Error)> UpdateStatusAsync(
        StatusType status,
        string? customMessage = null,
        ActivityType activityType = ActivityType.None,
        string? activityName = null,
        string? episodeInfo = null,
        string? seasonInfo = null)
    {
        if (string.IsNullOrEmpty(_password))
            return (false, "Password not configured");

        try
        {
            var request = new HttpRequestMessage(HttpMethod.Post, API_URL);
            request.Headers.Add("Authorization", $"Bearer {_password}");

            var payload = new
            {
                status = status.ToApiString(),
                customMessage = customMessage,
                activityType = activityType != ActivityType.None ? activityType.ToApiString() : null,
                activityName = activityName,
                episodeInfo = episodeInfo,
                seasonInfo = seasonInfo
            };

            request.Content = JsonContent.Create(payload, options: JsonOptions);

            var response = await _httpClient.SendAsync(request);
            var json = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                var error = JsonSerializer.Deserialize<JsonElement>(json);
                var errorMsg = error.TryGetProperty("error", out var e)
                    ? e.GetString() : "Unknown error";
                return (false, errorMsg);
            }

            return (true, null);
        }
        catch (Exception ex)
        {
            return (false, ex.Message);
        }
    }

    /// <summary>
    /// Clear the stored password
    /// </summary>
    public void ClearPassword()
    {
        _password = null;
        SecureStorage.Remove(PASSWORD_STORAGE_KEY);
        Preferences.Remove(PASSWORD_STORAGE_KEY);
    }
}
