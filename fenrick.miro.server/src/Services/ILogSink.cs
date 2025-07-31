namespace Fenrick.Miro.Server.Services;

using Domain;

/// <summary>
///     Stores log entries sent by the client.
/// </summary>
public interface ILogSink
{
    public void Store(IEnumerable<ClientLogEntry> entries);
}
