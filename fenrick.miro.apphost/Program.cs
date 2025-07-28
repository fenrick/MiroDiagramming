using Fenrick.Miro.AppHost;

using Microsoft.Extensions.Hosting;

using Projects;

IDistributedApplicationBuilder builder = DistributedApplication.CreateBuilder(args);

IResourceBuilder<IResourceWithConnectionString> db;
var dbContextName = $"MiroDBContext";
if (builder.Environment.IsProduction())
{
    IResourceBuilder<PostgresServerResource> postgres = builder.AddPostgres(dbContextName);
    postgres.WithPgWeb();
    postgres.AddDatabase($"diagramming");
    db = postgres;
}
else
{
    IResourceBuilder<SqliteResource> sqlite = builder.AddSqlite(dbContextName);
    sqlite.WithSqliteWeb();
    db = sqlite;
}

builder.AddProject<fenrick_miro_server>($"fenrick-miro-server")
    .WithReference(db)
    .WithSwaggerUi();

await builder.Build().RunAsync().ConfigureAwait(false);
