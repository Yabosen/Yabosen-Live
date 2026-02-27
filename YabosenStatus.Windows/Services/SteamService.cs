using Microsoft.Win32;
using System.Text.RegularExpressions;

namespace YabosenStatus.Windows.Services;

public class SteamService
{
    private const string REGISTRY_KEY_PATH = @"Software\Valve\Steam";
    private readonly Dictionary<int, string> _gameNameCache = new();
    
    /// <summary>
    /// Gets the currently running Steam App ID from the registry.
    /// Returns 0 if no game is running.
    /// </summary>
    public int GetRunningAppId()
    {
        try
        {
            using var key = Registry.CurrentUser.OpenSubKey(REGISTRY_KEY_PATH);
            if (key == null) 
            {
                System.Diagnostics.Trace.WriteLine($"[SteamService] Registry key {REGISTRY_KEY_PATH} not found");
                return 0;
            }
            
            var value = key.GetValue("RunningAppID");
            System.Diagnostics.Trace.WriteLine($"[SteamService] Raw RunningAppID value: {value}");
            
            return value is int appId ? appId : 0;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Trace.WriteLine($"[SteamService] Error reading RunningAppID: {ex.Message}");
            return 0;
        }
    }

    /// <summary>
    /// Gets the name of a game by its App ID.
    /// Caches the result to minimize file I/O.
    /// </summary>
    public string? GetGameName(int appId)
    {
        if (appId <= 0) return null;
        
        // Check cache first
        if (_gameNameCache.TryGetValue(appId, out var cachedName))
        {
            return cachedName;
        }
        
        try
        {
            var steamPath = GetSteamPath();
            if (string.IsNullOrEmpty(steamPath)) return null;

            // Get all library folders
            var libraryFolders = GetLibraryFolders(steamPath);
            libraryFolders.Add(steamPath); // Ensure main path is included

            foreach (var folder in libraryFolders)
            {
                var manifestPath = Path.Combine(folder, "steamapps", $"appmanifest_{appId}.acf");
                System.Diagnostics.Trace.WriteLine($"[SteamService] Checking manifest at: {manifestPath}");

                if (File.Exists(manifestPath))
                {
                    var content = File.ReadAllText(manifestPath);
                    var match = Regex.Match(content, "\"name\"\\s+\"([^\"]+)\"");
                    
                    if (match.Success)
                    {
                        var name = match.Groups[1].Value;
                        _gameNameCache[appId] = name;
                        System.Diagnostics.Trace.WriteLine($"[SteamService] Found game name: {name}");
                        return name;
                    }
                }
            }
            
            System.Diagnostics.Trace.WriteLine($"[SteamService] Name not found for AppID {appId} in any library");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Trace.WriteLine($"[SteamService] Error finding game name for {appId}: {ex.Message}");
        }
        
        return null; // Name not found
    }

    private List<string> GetLibraryFolders(string steamPath)
    {
        var folders = new List<string>();
        var vdfPath = Path.Combine(steamPath, "steamapps", "libraryfolders.vdf");

        if (!File.Exists(vdfPath)) return folders;

        try
        {
            var content = File.ReadAllText(vdfPath);
            // Regex to find "path" "C:\\Path\\To\\Lib"
            var matches = Regex.Matches(content, "\"path\"\\s+\"([^\"]+)\"");

            foreach (Match match in matches)
            {
                if (match.Groups.Count > 1)
                {
                    // VDF paths use double backslashes which needed to be unescaped
                    var path = match.Groups[1].Value.Replace("\\\\", "\\");
                    folders.Add(path);
                    System.Diagnostics.Trace.WriteLine($"[SteamService] Found library folder: {path}");
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
            // SteamPath uses forward slashes in registry, need to fix for Windows
            var path = key?.GetValue("SteamPath") as string;
            var fixedPath = path?.Replace('/', '\\');
            return fixedPath;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Trace.WriteLine($"[SteamService] Error getting Steam path: {ex.Message}");
            return null;
        }
    }
}
