using Microsoft.Extensions.Configuration;

using Projects;                              // generated project helpers

IDistributedApplicationBuilder builder = DistributedApplication.CreateBuilder(args);

// 1. Declare a parameter (no default / description here)
builder.AddParameter($"DatabaseProvider");

// 2. Always register both database resources – give them unique names
IResourceBuilder<SqliteResource> sqliteDb = builder.AddSqlite($"sqlite-db")
                      .WithSqliteWeb();

IResourceBuilder<PostgresDatabaseResource> postgresDb = builder.AddPostgres($"postgres")
                        .WithPgWeb()
                        .AddDatabase($"postgres-db");

// 3. Decide which DB to use at run time
var chosen = builder.Configuration.GetValue(
$"$Parameters:DatabaseProvider", $"sqlite");

IResourceBuilder<IResourceWithConnectionString> db =
        chosen.Equals($"postgres", StringComparison.OrdinalIgnoreCase)
        ? postgresDb
        : sqliteDb;

// 4. API waits for the selected DB to be healthy
IResourceBuilder<ProjectResource> serverApi = builder.AddProject<fenrick_miro_server>($"server")
                       .WithReference(db)
                       .WaitFor(db)
                       .WithExternalHttpEndpoints();

// 5. Front-end waits for the API
builder.AddNpmApp($"client", $"../fenrick.miro.client")
       .WithReference(serverApi)
       .WaitFor(serverApi)
       .WithEnvironment($"BROWSER", $"none")
       .WithHttpsEndpoint(env: $"VITE_PORT")
       .WithExternalHttpEndpoints()
       .PublishAsDockerFile();

await builder.Build().RunAsync().ConfigureAwait(false);
