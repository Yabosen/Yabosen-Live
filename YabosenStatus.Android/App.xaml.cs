namespace YabosenStatus.Android;

public partial class App : Application
{
    public App()
    {
        try
        {
            InitializeComponent();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"App initialization error: {ex}");
            throw;
        }
    }

    protected override Window CreateWindow(IActivationState? activationState)
    {
        try
        {
            // Resolve MainPage from DI
            var mainPage = Handler?.MauiContext?.Services.GetService<MainPage>()
                ?? throw new InvalidOperationException("Could not resolve MainPage from DI");

            return new Window(mainPage)
            {
                Title = "Yabosen Status"
            };
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Window creation error: {ex}");
            throw;
        }
    }
}
