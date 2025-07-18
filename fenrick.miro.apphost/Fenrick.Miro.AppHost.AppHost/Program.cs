using Server = Fenrick.Miro.Server.Program;

var app = Server.BuildApp(args);
await app.RunAsync();
