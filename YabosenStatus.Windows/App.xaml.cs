namespace YabosenStatus.Windows;

public partial class App : Application
{
    private readonly MainPage _mainPage;

    public App(MainPage mainPage)
    {
        // Debug logging
        try { System.IO.File.WriteAllText("app_start.log", "App constructor started " + DateTime.Now); } catch {}

        _mainPage = mainPage;
        try
        {
            InitializeComponent();
            try { System.IO.File.AppendAllText("app_start.log", "\nInitializeComponent passed"); } catch {}
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"App initialization error: {ex}");
            try { System.IO.File.WriteAllText("app_error.txt", $"App init error: {ex}"); } catch {}
            throw;
        }
    }

    protected override Window CreateWindow(IActivationState? activationState)
    {
        try
        {
            return new Window(_mainPage)
            {
                Title = "Yabosen Status",
                MinimumWidth = 400,
                MinimumHeight = 600,
                Width = 420,
                Height = 700
            };
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Window creation error: {ex}");
            System.IO.File.WriteAllText("error.txt", $"Window error: {ex}");
            throw;
        }
    }
}
