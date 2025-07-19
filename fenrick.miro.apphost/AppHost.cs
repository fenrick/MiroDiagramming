var builder = DistributedApplication.CreateBuilder(args);

builder.AddProject<Projects.fenrick_miro_server>("fenrick-miro-server");

builder.Build().Run();
