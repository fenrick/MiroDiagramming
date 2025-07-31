using Fenrick.Miro.Server.Data;

using Microsoft.EntityFrameworkCore;

// ----------------  Host builder  ----------------
WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// Optional: tweak standard logging
builder.Logging.ClearProviders();                // remove default console if you want
builder.Logging.AddJsonConsole(o =>
{
    o.TimestampFormat = $"yyyy-MM-ddTHH:mm:ssZ";
    o.IncludeScopes = true;
});
// builder.Logging.AddOpenTelemetry();           // already added by AddServiceDefaults()


builder.AddServiceDefaults();

IServiceCollection services = builder.Services;

services.AddControllers();
services.AddOpenApi();

// -------------  DbContext registration -------------
var provider = builder.Configuration.GetValue($"DatabaseProvider", $"sqlite");

if (string.Equals(provider, $"postgres", StringComparison.Ordinal))
{
    builder.AddNpgsqlDbContext<MiroDbContext>($"postgres-db");
}
else
{
    builder.AddSqliteDbContext<MiroDbContext>($"sqlite-db");
}

// ----------------  Build & migrate  ----------------
WebApplication app = builder.Build();

var applyMigrations = app.Configuration.GetValue(key: $"ApplyMigrations", defaultValue: true);
if (applyMigrations)
{
#pragma warning disable CA2007     // scope allocation is app-level; context capture is irrelevant
    AsyncServiceScope scope = app.Services.CreateAsyncScope();
#pragma warning disable CA2007     // scope allocation is app-level; context capture is irrelevant
    await using (scope.ConfigureAwait(false))
    {
#pragma warning restore CA2007

        MiroDbContext db = scope.ServiceProvider.GetRequiredService<MiroDbContext>();
        await db.Database.MigrateAsync().ConfigureAwait(false);
    }
}

// ----------------  Pipeline  ----------------
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(o => o.SwaggerEndpoint($"/openapi/v1.json", $"Swagger"));
}
else
{
    app.UseHttpsRedirection();
}

app.MapControllers();
app.UseAuthorization();

await app.RunAsync().ConfigureAwait(false);

// Expose Program for WebApplicationFactory<T>
public partial class Program
{
    protected Program()
    {
    }
}
