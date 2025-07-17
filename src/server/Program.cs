using Miro.Server.Api;
using Miro.Server.Services;
using Serilog;
using System.Diagnostics.CodeAnalysis;

var builder = WebApplication.CreateBuilder(args);

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
app.MapControllers();
await app.RunAsync();

[ExcludeFromCodeCoverage]
public static partial class Program { }
