using Android.App;
using Android.Runtime;

namespace YabosenStatus.Android;

[Application(Theme = "@style/Maui.MainTheme", Icon = "@mipmap/appicon", RoundIcon = "@mipmap/appicon_round", Debuggable = true)]
public class MainApplication : MauiApplication
{
    public MainApplication(IntPtr handle, JniHandleOwnership ownership)
        : base(handle, ownership)
    {
    }

    protected override MauiApp CreateMauiApp() => MauiProgram.CreateMauiApp();
}
