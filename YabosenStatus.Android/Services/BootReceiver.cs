using Android.App;
using Android.Content;
using Android.OS;

namespace YabosenStatus.Android.Services;

/// <summary>
/// Restarts the foreground heartbeat service after device reboot.
/// Without this, the service stays dead until the user manually opens the app.
/// </summary>
[BroadcastReceiver(
    Enabled = true,
    Exported = true,
    DirectBootAware = false)]
[IntentFilter(new[]
{
    Intent.ActionBootCompleted,
    "android.intent.action.QUICKBOOT_POWERON", // HTC / older devices
    "android.intent.action.MY_PACKAGE_REPLACED" // restart on app update too
})]
public class BootReceiver : BroadcastReceiver
{
    public override void OnReceive(Context? context, Intent? intent)
    {
        if (context == null) return;

        try
        {
            var serviceIntent = new Intent(context, typeof(StatusForegroundService));

            if (Build.VERSION.SdkInt >= BuildVersionCodes.O)
            {
                context.StartForegroundService(serviceIntent);
            }
            else
            {
                context.StartService(serviceIntent);
            }

            System.Diagnostics.Debug.WriteLine($"[BootReceiver] Restarted foreground service after {intent?.Action}");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[BootReceiver] Failed to start service: {ex.Message}");
        }
    }
}
