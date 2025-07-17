using Microsoft.AspNetCore.Mvc;
using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;

namespace Fenrick.Miro.Server.Api;

/// <summary>
/// Captures log entries from the client and stores them via <see cref="ILogSink"/>.
/// </summary>
[ApiController]
[Route("api/logs")]
public class LogsController : ControllerBase
{
    private readonly ILogSink _sink;

    public LogsController(ILogSink sink) => _sink = sink;

    [HttpPost]
    public IActionResult Capture([FromBody] ClientLogEntry[] entries)
    {
        _sink.Store(entries);
        return Accepted();
    }
}
