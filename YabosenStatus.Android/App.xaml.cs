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
            return new Window(new MainPage())
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
