namespace YabosenStatus;

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
            System.IO.File.WriteAllText("error.txt", $"App init error: {ex}");
            throw;
        }
    }

    protected override Window CreateWindow(IActivationState? activationState)
    {
        try
        {
            return new Window(new MainPage())
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
