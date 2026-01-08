using Plugin.LocalNotification;
using YabosenStatus.Android.Services;

namespace YabosenStatus.Android;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        try
        {
            var builder = MauiApp.CreateBuilder();
            builder
                .UseMauiApp<App>()
                .UseLocalNotification(); // Init plugin

            // Register services
            builder.Services.AddSingleton<StatusService>();
            builder.Services.AddSingleton<AutoSleepService>();
            builder.Services.AddTransient<MainPage>();

#if DEBUG
            builder.Logging.AddDebug();
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
