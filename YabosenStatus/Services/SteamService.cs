using Microsoft.Win32;
using System.Text.RegularExpressions;

namespace YabosenStatus.Services;

public class SteamService
{
    private const string REGISTRY_KEY_PATH = @"Software\Valve\Steam";
    private readonly Dictionary<int, string> _gameNameCache = new();

    public int GetRunningAppId()
    {
        try
        {
            using var key = Registry.CurrentUser.OpenSubKey(REGISTRY_KEY_PATH);
            if (key == null) return 0;

            var value = key.GetValue("RunningAppID");
            return value is int appId ? appId : 0;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Trace.WriteLine($"[SteamService] Error reading RunningAppID: {ex.Message}");
            return 0;
        }
    }

    public string? GetGameName(int appId)
    {
        if (appId <= 0) return null;
        if (_gameNameCache.TryGetValue(appId, out var cachedName)) return cachedName;

        try
        {
            var steamPath = GetSteamPath();
            if (string.IsNullOrEmpty(steamPath)) return null;

            var libraryFolders = GetLibraryFolders(steamPath);
            libraryFolders.Add(steamPath);

            foreach (var folder in libraryFolders)
            {
                var manifestPath = Path.Combine(folder, "steamapps", $"appmanifest_{appId}.acf");
                if (!File.Exists(manifestPath)) continue;

                var content = File.ReadAllText(manifestPath);
                var match = Regex.Match(content, "\"name\"\\s+\"([^\"]+)\"");
                if (match.Success)
                {
                    var name = match.Groups[1].Value;
                    _gameNameCache[appId] = name;
                    return name;
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Trace.WriteLine($"[SteamService] Error finding game name for {appId}: {ex.Message}");
        }

        return null;
    }

    private List<string> GetLibraryFolders(string steamPath)
    {
        var folders = new List<string>();
        var vdfPath = Path.Combine(steamPath, "steamapps", "libraryfolders.vdf");
        if (!File.Exists(vdfPath)) return folders;

        try
        {
            var content = File.ReadAllText(vdfPath);
            var matches = Regex.Matches(content, "\"path\"\\s+\"([^\"]+)\"");
            foreach (Match match in matches)
            {
                if (match.Groups.Count > 1)
                {
                    var path = match.Groups[1].Value.Replace("\\\\", "\\");
                    folders.Add(path);
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Trace.WriteLine($"[SteamService] Error parsing libraryfolders.vdf: {ex.Message}");
        }

        return folders;
    }

    private string? GetSteamPath()
    {
        try
        {
            using var key = Registry.CurrentUser.OpenSubKey(REGISTRY_KEY_PATH);
            var path = key?.GetValue("SteamPath") as string;
            return path?.Replace('/', '\\');
        }
        catch (Exception ex)
        {
            System.Diagnostics.Trace.WriteLine($"[SteamService] Error getting Steam path: {ex.Message}");
            return null;
        }
    }
}
