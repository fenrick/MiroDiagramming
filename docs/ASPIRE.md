# .NET Aspire Quick Start

---

## 0 Purpose

Introduce the built-in AppHost, how to extend it with external services and how to run the Aspire dashboard.

## 1 AppHost overview

`fenrick.miro.apphost` starts the server via `DistributedApplication.CreateBuilder`. Add services like Redis or PostgreSQL using the host builder APIs.

```csharp
var builder = DistributedApplication.CreateBuilder(args);
var cache = builder.AddRedisContainer("redis");
var db = builder.AddNpgsqlContainer("postgres");

builder.AddProject<fenrick_miro_server>("fenrick-miro-server")
    .WithReference(cache)
    .WithReference(db)
    .WithSwaggerUI();

builder.Build().Run();
```

## 2 Dashboard

The Aspire dashboard listens on port `18888`. Set the `DOTNET_DASHBOARD_PORT` environment variable to change it. The example below runs the dashboard on port `3000`:

```bash
DOTNET_DASHBOARD_PORT=3000 dotnet run --project fenrick.miro.apphost
```

Point a browser to `http://localhost:3000` to inspect service logs and metrics.

## 3 Docker image

Build the application host with the Dockerfile located in the server project:

```bash
docker build -t miro-apphost -f fenrick.miro.server/Dockerfile .
```

Run the container, configuring connections to Redis and PostgreSQL as needed:

```bash
docker run --rm \
  -e REDIS_CONNECTION_STRING="localhost:6379" \
  -e POSTGRES_CONNECTION_STRING="Host=localhost;Username=miro" \
  -p 8080:8080 -p 18888:18888 miro-apphost
```

---

_End of file._
