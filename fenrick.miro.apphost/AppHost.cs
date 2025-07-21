using Projects;

var builder = DistributedApplication.CreateBuilder(args);

builder.AddProject<fenrick_miro_server>("fenrick-miro-server")
    .WithSwaggerUI();

builder.Build().Run();
