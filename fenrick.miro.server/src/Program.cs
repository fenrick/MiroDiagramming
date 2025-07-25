using System.Globalization;
using Fenrick.Miro.Server.Data;
using Fenrick.Miro.Server.Services;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog((HostBuilderContext _, LoggerConfiguration cfg) =>
    cfg.WriteTo.Console(formatProvider: CultureInfo.InvariantCulture));

builder.AddServiceDefaults();

// Add services to the container.
builder.Services.AddControllers();
var conn = builder.Configuration.GetConnectionString("postgres");
builder.Services.AddDbContext<MiroDbContext>(opt => opt.UseNpgsql(conn));
builder.Services.AddScoped<IUserStore, EfUserStore>();
builder.Services.AddSingleton<ILogSink, SerilogSink>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient<IMiroClient, MiroRestClient>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<ILogSink>((IServiceProvider _) =>
    new SerilogSink(Log.Logger));
builder.Services.AddSingleton<IShapeCache, InMemoryShapeCache>();

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
