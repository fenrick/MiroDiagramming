using Microsoft.AspNetCore.Mvc;
using Miro.Server.Domain;
using Miro.Server.Services;

namespace Miro.Server.Api;

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
