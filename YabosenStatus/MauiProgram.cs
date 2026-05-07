using Microsoft.Extensions.Logging;
using YabosenStatus.Services;
#if WINDOWS
using H.NotifyIcon;
#endif

namespace YabosenStatus;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        try
        {
            var builder = MauiApp.CreateBuilder();
            builder
                .UseMauiApp<App>();

#if WINDOWS
            // Tray icon support — required for the <tb:TaskbarIcon> in MainPage.xaml
            builder.UseNotifyIcon();
#endif

            // Register services
            builder.Services.AddSingleton<StatusService>();

#if DEBUG
            builder.Logging.AddDebug();
#endif

            var app = builder.Build();

            // Add unhandled exception handler
            AppDomain.CurrentDomain.UnhandledException += (s, e) =>
            {
                var ex = e.ExceptionObject as Exception;
                System.IO.File.WriteAllText(Path.Combine(AppContext.BaseDirectory, "crash.txt"),
                    $"Unhandled exception: {ex?.ToString() ?? "Unknown error"}");
            };

            return app;
        }
        catch (Exception ex)
        {
            System.IO.File.WriteAllText("startup_error.txt", $"MauiProgram error: {ex}");
            throw;
        }
    }
}
