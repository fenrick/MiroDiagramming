using Microsoft.AspNetCore.Mvc;
using Fenrick.Miro.Api;
using Fenrick.Miro.Server.Services;

namespace Fenrick.Miro.Server.Api;

/// <summary>
/// Receives webhook events and queues them for processing.
/// </summary>
[ApiController]
[Route("api/webhook")]
public class WebhookController : ControllerBase
{
    private readonly IEventQueue _queue;

    public WebhookController(IEventQueue queue) => _queue = queue;

    [HttpPost]
    public IActionResult Handle([FromBody] WebhookEvent evt)
    {
        _queue.Enqueue(evt);
        return Accepted();
    }
}

public interface IEventQueue
{
    void Enqueue(WebhookEvent evt);
}
