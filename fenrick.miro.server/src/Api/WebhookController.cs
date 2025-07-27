namespace Fenrick.Miro.Server.Api;

using Fenrick.Miro.Server.Domain;

using Microsoft.AspNetCore.Mvc;

/// <summary>
///     Receives webhook events and queues them for processing.
/// </summary>
[ApiController]
[Route($"api/webhook")]
public class WebhookController(IEventSink sink) : ControllerBase
{
    private readonly IEventSink eventSink = sink;

    [HttpPost]
    public IActionResult Handle([FromBody] WebhookEvent evt)
    {
        this.eventSink.Enqueue(evt);
        return this.Accepted();
    }
}

public interface IEventSink
{
    public void Enqueue(WebhookEvent evt);
}
