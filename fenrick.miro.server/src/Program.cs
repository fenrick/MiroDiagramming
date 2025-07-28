namespace Fenrick.Miro.Server;

using System.Globalization;

using Data;

using Microsoft.EntityFrameworkCore;

using Serilog;

using Services;

public class Program
{
    /// <summary>
    ///     Exposes the entry point for integration tests.
    /// </summary>
    protected Program()
    {
    }

    public static Task Main(string[] args)
    {
        // Create host builder
        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
        builder.Host.UseSerilog(ConfigureLogger);

        builder.AddServiceDefaults();

        ConfigureServices(builder);

        WebApplication app = builder.Build();

        ConfigureWebApp(app);

        return app.RunAsync();
    }

    private static void ConfigureLogger(HostBuilderContext context,
        IServiceProvider services, LoggerConfiguration configuration) => configuration.WriteTo.Console(
        formatProvider: CultureInfo.InvariantCulture);

    private static void ConfigureWebApp(WebApplication app)
    {
        IConfiguration configuration = app.Configuration;

        var applyMigrations = configuration.GetValue($"ApplyMigrations", defaultValue: true);
        if (applyMigrations)
        {
            // Apply migrations so the schema matches the EF Core model.
            using IServiceScope scope = app.Services.CreateScope();
            MiroDbContext db = scope.ServiceProvider.GetRequiredService<MiroDbContext>();

            db.Database.Migrate();
        }

        app.MapDefaultControllerRoute();
        app.UseDefaultFiles();
        app.MapStaticAssets();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }
        else
        {
            app.UseHttpsRedirection();
        }

        app.UseAuthorization();
        app.MapControllers();
        app.MapFallbackToFile($"/index.html");
    }

    private static void ConfigureServices(WebApplicationBuilder builder)
    {
        IServiceCollection services = builder.Services;
        IWebHostEnvironment environment = builder.Environment;

        // add controllers
        services.AddControllers();

        // Configure EF Core DbContext
        if (environment.IsProduction())
        {
            builder.AddNpgsqlDbContext<MiroDbContext>(connectionName: $"MiroDBContext");
        }
        else
        {
            builder.AddSqliteDbContext<MiroDbContext>(name: $"MiroDBContext");
        }

        // Register application services
        services.AddScoped<IUserStore, EfUserStore>();
        services.AddScoped<ITemplateStore, EfTemplateStore>();
        services.AddSingleton<ILogSink, SerilogSink>();
        services.AddHttpContextAccessor();
        services.AddHttpClient<IMiroClient, MiroRestClient>();
        services.AddSingleton<ITokenRefresher, NullTokenRefresher>();
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();
        services.AddSingleton<IShapeCache, InMemoryShapeCache>();
        services.AddScoped<ITagService, TagService>();
    }
}
