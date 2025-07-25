using System.Globalization;
using Serilog;

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog((_, cfg) => cfg.WriteTo.Console(formatProvider: CultureInfo.InvariantCulture));

builder.AddServiceDefaults();

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddSingleton<Fenrick.Miro.Server.Services.IUserStore, Fenrick.Miro.Server.Services.InMemoryUserStore>();
builder.Services.AddSingleton<Fenrick.Miro.Server.Services.ILogSink, Fenrick.Miro.Server.Services.SerilogSink>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient<Fenrick.Miro.Server.Services.IMiroClient, Fenrick.Miro.Server.Services.MiroRestClient>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<Fenrick.Miro.Server.Services.ILogSink>(_ => new Fenrick.Miro.Server.Services.SerilogSink(Log.Logger));
builder.Services.AddSingleton<Fenrick.Miro.Server.Services.IShapeCache, Fenrick.Miro.Server.Services.InMemoryShapeCache>();

var app = builder.Build();

app.MapDefaultEndpoints();

app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

await app.RunAsync();

/// <summary>
///     Exposes the entry point for integration tests.
/// </summary>
public partial class Program
{
    protected Program()
    {
    }
}
