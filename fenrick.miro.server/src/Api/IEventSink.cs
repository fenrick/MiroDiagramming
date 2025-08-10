namespace Fenrick.Miro.Server.Api;

using Domain;

public interface IEventSink
{
    public void Enqueue(WebhookEvent evt);
}
