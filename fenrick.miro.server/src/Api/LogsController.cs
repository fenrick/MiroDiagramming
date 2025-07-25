namespace Fenrick.Miro.Server.Api;

using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;
using Microsoft.AspNetCore.Mvc;

/// <summary>
///     Captures log entries from the client and stores them via
///     <see cref="ILogSink" />.
/// </summary>
[ApiController]
[Route("api/logs")]
public class LogsController(ILogSink sink) : ControllerBase
{
    private readonly ILogSink logSink = sink;

    [HttpPost]
    public IActionResult Capture([FromBody] ClientLogEntry[] entries)
    {
        this.logSink.Store(entries);
        return this.Accepted();
    }
}
