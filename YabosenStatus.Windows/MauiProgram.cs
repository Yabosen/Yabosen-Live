using Microsoft.Extensions.Logging;
using YabosenStatus.Shared.Services;

namespace YabosenStatus.Windows;

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
            builder.Services.AddTransient<MainPage>();

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
