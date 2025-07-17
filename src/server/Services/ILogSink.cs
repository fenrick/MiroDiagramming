using Miro.Server.Domain;

namespace Miro.Server.Services;

/// <summary>
/// Stores log entries sent by the client.
/// </summary>
public interface ILogSink
{
    void Store(IEnumerable<ClientLogEntry> entries);
}
