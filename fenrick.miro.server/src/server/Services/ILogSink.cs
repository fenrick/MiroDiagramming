using Fenrick.Miro.Server.Domain;

namespace Fenrick.Miro.Server.Services;

/// <summary>
/// Stores log entries sent by the client.
/// </summary>
public interface ILogSink
{
    void Store(IEnumerable<ClientLogEntry> entries);
}
