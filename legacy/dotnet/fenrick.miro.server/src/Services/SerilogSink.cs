namespace Fenrick.Miro.Server.Services;

#pragma warning disable MA0165

using Domain;

using Serilog.Events;

using ILogger = Serilog.ILogger;

/// <summary>
///     Writes client logs to the server log via Serilog.
/// </summary>
public class SerilogSink(ILogger logger) : ILogSink
{
    private readonly ILogger loggerInstance = logger;

    /// <inheritdoc />
    public void Store(IEnumerable<ClientLogEntry> entries)
    {
        foreach (ClientLogEntry e in entries)
        {
            LogEventLevel level = MapLevel(e.Level);

            this.loggerInstance.ForContext("Source", "Client")
                .ForContext("Level", e.Level)
                .ForContext("Context", e.Context, destructureObjects: true)
                .Write(level, "{Message}", e.Message);
        }
    }

    private static LogEventLevel MapLevel(string level) =>
            level.ToLowerInvariant() switch
        {
            "trace" => LogEventLevel.Verbose,
            "debug" => LogEventLevel.Debug,
            "info" => LogEventLevel.Information,
            "warn" => LogEventLevel.Warning,
            "error" => LogEventLevel.Error,
            "fatal" => LogEventLevel.Fatal,
            _ => LogEventLevel.Information,
        };
}

#pragma warning restore MA0165
