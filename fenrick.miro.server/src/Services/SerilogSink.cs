using Fenrick.Miro.Api;
using Serilog;
using ILogger = Serilog.ILogger;

namespace Fenrick.Miro.Server.Services;

/// <summary>
/// Writes client logs to the server log via Serilog.
/// </summary>
public class SerilogSink : ILogSink
{
    private readonly ILogger _logger;

    public SerilogSink(ILogger logger) => _logger = logger;

    /// <inheritdoc />
    public void Store(IEnumerable<ClientLogEntry> entries)
    {
        foreach (var e in entries)
        {
            _logger
                .ForContext("Source", "Client")
                .ForContext("Level", e.Level)
                .ForContext("Context", e.Context, destructureObjects: true)
                .Information("{Message}", e.Message);
        }
    }
}
