namespace Fenrick.Miro.Server.Services;
using Fenrick.Miro.Server.Domain;
using ILogger = Serilog.ILogger;

/// <summary>
/// Writes client logs to the server log via Serilog.
/// </summary>
public class SerilogSink(ILogger logger) : ILogSink
{
    private readonly ILogger _logger = logger;

    /// <inheritdoc />
    public void Store(IEnumerable<ClientLogEntry> entries)
    {
        foreach (var e in entries)
        {
            this._logger
                .ForContext("Source", "Client")
                .ForContext("Level", e.Level)
                .ForContext("Context", e.Context, destructureObjects: true)
                .Information("{Message}", e.Message);
        }
    }
}
