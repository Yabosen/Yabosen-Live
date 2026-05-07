using System.Net.Http.Json;
using System.Text.Json;

namespace YabosenStatus.Services;

public class LastFmService
{
    private readonly HttpClient _httpClient;
    private const string API_BASE_URL = "http://ws.audioscrobbler.com/2.0/";

    public LastFmService()
    {
        _httpClient = new HttpClient();
    }

    public async Task<string?> GetNowPlayingAsync(string username, string apiKey)
    {
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(apiKey))
            return null;

        try
        {
            var url = $"{API_BASE_URL}?method=user.getrecenttracks&user={username}&api_key={apiKey}&format=json&limit=1";
            var response = await _httpClient.GetFromJsonAsync<JsonElement>(url);

            if (response.TryGetProperty("recenttracks", out var recentTracks) &&
                recentTracks.TryGetProperty("track", out var tracks) &&
                tracks.ValueKind == JsonValueKind.Array &&
                tracks.GetArrayLength() > 0)
            {
                var firstTrack = tracks[0];

                bool isNowPlaying = false;
                if (firstTrack.TryGetProperty("@attr", out var attr) &&
                    attr.TryGetProperty("nowplaying", out var nowPlayingVal))
                {
                    isNowPlaying = nowPlayingVal.GetString() == "true";
                }

                if (!isNowPlaying) return null;

                string artistName = "Unknown";
                string trackName = "Unknown";

                if (firstTrack.TryGetProperty("artist", out var artistProp))
                {
                    if (artistProp.ValueKind == JsonValueKind.Object &&
                        artistProp.TryGetProperty("#text", out var artistText))
                    {
                        artistName = artistText.GetString() ?? "Unknown";
                    }
                    else if (artistProp.ValueKind == JsonValueKind.String)
                    {
                        artistName = artistProp.GetString() ?? "Unknown";
                    }
                }

                if (firstTrack.TryGetProperty("name", out var nameProp))
                {
                    trackName = nameProp.GetString() ?? "Unknown";
                }

                return $"{artistName} - {trackName}";
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Trace.WriteLine($"[LastFmService] Error: {ex.Message}");
        }

        return null;
    }
}
