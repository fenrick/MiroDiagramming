using Fenrick.Miro.Server.Api;
using Fenrick.Miro.Server.Services;
using Serilog;
using System.Diagnostics.CodeAnalysis;

var app = Program.BuildApp(args);
await app.RunAsync();

[ExcludeFromCodeCoverage]
public static partial class Program
{
    /// <summary>
    /// Configure and build the web application.
    /// </summary>
    /// <param name="args">Command line arguments.</param>
    /// <returns>The configured <see cref="WebApplication"/>.</returns>
    public static WebApplication BuildApp(string[]? args = null)
    {
        var builder = WebApplication.CreateBuilder(args ?? []);

        builder.Host.UseSerilog((_, cfg) =>
        {
            cfg.MinimumLevel.Information()
                .Enrich.FromLogContext()
                .WriteTo.Console();
        });

        builder.Services.AddControllers();
        builder.Services.AddSingleton<ICacheService, InMemoryCacheService>();
        builder.Services.AddSingleton<ILogSink, SerilogSink>();

        var app = builder.Build();
        app.UseUxStaticFiles(builder.Environment);
        app.MapControllers();

        return app;
    }
}
