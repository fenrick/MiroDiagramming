using Miro.Server.Api;
using Miro.Server.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSingleton<ICacheService, InMemoryCacheService>();

var app = builder.Build();
app.MapControllers();
app.Run();
