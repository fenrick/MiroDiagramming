using System.Globalization;
using Fenrick.Miro.Server.Data;
using Fenrick.Miro.Server.Services;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog((_, cfg) =>
    cfg.WriteTo.Console(formatProvider: CultureInfo.InvariantCulture));

builder.AddServiceDefaults();

// Add services to the container.
builder.Services.AddControllers();
var pg = builder.Configuration.GetConnectionString("postgres");
var sqlite =
    builder.Configuration.GetConnectionString("sqlite") ?? "Data Source=app.db";
if (builder.Environment.IsProduction() && !string.IsNullOrEmpty(pg))
{
    builder.Services.AddDbContext<MiroDbContext>(opt => opt.UseNpgsql(pg));
}
else
{
    builder.Services.AddDbContext<MiroDbContext>(opt => opt.UseSqlite(sqlite));
}
builder.Services.AddScoped<IUserStore, EfUserStore>();
builder.Services.AddScoped<ITemplateStore, EfTemplateStore>();
builder.Services.AddSingleton<ILogSink, SerilogSink>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient<IMiroClient, MiroRestClient>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<IShapeCache, InMemoryShapeCache>();

var app = builder.Build();

var applyMigrations = builder.Configuration.GetValue("ApplyMigrations", true);
if (applyMigrations)
{
    // Apply migrations so the schema matches the EF Core model.
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<MiroDbContext>();
    db.Database.Migrate();
}

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
