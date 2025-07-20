namespace Fenrick.Miro.Server.Api;

using Domain;
using Microsoft.AspNetCore.Mvc;

/// <summary>
///     Receives webhook events and queues them for processing.
/// </summary>
[ApiController]
[Route("api/webhook")]
public class WebhookController(IEventQueue queue) : ControllerBase
{
    private readonly IEventQueue _queue = queue;

    [HttpPost]
    public IActionResult Handle([FromBody] WebhookEvent evt)
    {
        this._queue.Enqueue(evt);
        return this.Accepted();
    }
}

public interface IEventQueue
{
    public void Enqueue(WebhookEvent evt);
}
