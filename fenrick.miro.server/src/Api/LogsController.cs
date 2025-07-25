namespace Fenrick.Miro.Server.Api;

using Domain;
using Microsoft.AspNetCore.Mvc;
using Services;

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
