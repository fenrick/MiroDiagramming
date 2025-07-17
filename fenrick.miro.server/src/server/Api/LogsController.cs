using Microsoft.AspNetCore.Mvc;
using Miro.Server.Domain;
using Miro.Server.Services;

namespace Miro.Server.Api;

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
