using Microsoft.Extensions.Logging;
using YabosenStatus.Shared.Services;
using YabosenStatus.Shared.Models;


using YabosenStatus.Android.Services;
using Plugin.LocalNotification;

namespace YabosenStatus.Android;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        try
        {
            var builder = MauiApp.CreateBuilder();
            builder
                .UseMauiApp<App>();

            // Register services
            builder.Services.AddSingleton<StatusService>();
            builder.Services.AddSingleton<AutoSleepService>();
            builder.Services.AddSingleton<MobileHeartbeatService>();
            builder.Services.AddTransient<MainPage>();

            builder.UseLocalNotification();

#if DEBUG
            // builder.Logging.AddDebug();
#endif

            return builder.Build();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"MauiProgram error: {ex}");
            throw;
        }
    }
}
