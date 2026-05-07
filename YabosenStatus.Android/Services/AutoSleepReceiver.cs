using Android.App;
using Android.Content;

namespace YabosenStatus.Android.Services;

/// <summary>
/// Handles taps on the "Still awake?" notification action buttons.
/// Writes the user's response into Preferences; the foreground service
/// reads it on its next heartbeat tick and acts accordingly.
/// </summary>
[BroadcastReceiver(Enabled = true, Exported = false)]
[IntentFilter(new[] { ACTION_AWAKE, ACTION_SLEEP_NOW })]
public class AutoSleepReceiver : BroadcastReceiver
{
    public const string ACTION_AWAKE = "com.yabosen.status.android.AUTOSLEEP_AWAKE";
    public const string ACTION_SLEEP_NOW = "com.yabosen.status.android.AUTOSLEEP_SLEEP_NOW";

    public const string PREF_RESPONSE = "autosleep_response";
    public const string RESPONSE_AWAKE = "awake";
    public const string RESPONSE_SLEEP_NOW = "sleep_now";

    public override void OnReceive(Context? context, Intent? intent)
    {
        if (context == null || intent == null) return;

        try
        {
            switch (intent.Action)
            {
                case ACTION_AWAKE:
                    Preferences.Set(PREF_RESPONSE, RESPONSE_AWAKE);
                    break;
                case ACTION_SLEEP_NOW:
                    Preferences.Set(PREF_RESPONSE, RESPONSE_SLEEP_NOW);
                    break;
            }

            var nm = (NotificationManager?)context.GetSystemService(Context.NotificationService);
            nm?.Cancel(StatusForegroundService.AUTOSLEEP_NOTIFICATION_ID);

            System.Diagnostics.Debug.WriteLine($"[AutoSleepReceiver] Response recorded: {intent.Action}");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[AutoSleepReceiver] Error: {ex.Message}");
        }
    }
}
