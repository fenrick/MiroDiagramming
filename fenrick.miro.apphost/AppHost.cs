using Projects;
using Fenrick.Miro.AppHost;

var builder = DistributedApplication.CreateBuilder(args);

builder.AddProject<fenrick_miro_server>("fenrick-miro-server")
    .WithSwaggerUI();

await builder.Build().RunAsync();
