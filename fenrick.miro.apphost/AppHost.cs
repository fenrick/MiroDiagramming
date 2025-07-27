using Fenrick.Miro.AppHost;

var builder = DistributedApplication.CreateBuilder(args);

var db = builder.AddNpgsqlContainer("postgres");

builder.AddProject<fenrick_miro_server>("fenrick-miro-server")
    .WithReference(db)
    .WithSwaggerUI();

await builder.Build().RunAsync();
