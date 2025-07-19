namespace Fenrick.Miro.Server.Services;
using Fenrick.Miro.Server.Domain;

/// <summary>
/// Stores log entries sent by the client.
/// </summary>
public interface ILogSink
{
    public void Store(IEnumerable<ClientLogEntry> entries);
}
