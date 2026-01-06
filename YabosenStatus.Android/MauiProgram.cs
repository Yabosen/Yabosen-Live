using Microsoft.Extensions.Logging;
using YabosenStatus.Shared.Services;

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
