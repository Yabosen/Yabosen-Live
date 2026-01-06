using Microsoft.UI.Xaml;

namespace YabosenStatus.Windows.WinUI;

public partial class App : MauiWinUIApplication
{
    public App()
    {
        this.InitializeComponent();
    }

    protected override MauiApp CreateMauiApp() => YabosenStatus.Windows.MauiProgram.CreateMauiApp();
}
