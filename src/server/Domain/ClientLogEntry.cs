namespace Miro.Server.Domain;

/// <summary>
/// Log entry forwarded from the client application.
/// </summary>
/// <param name="Timestamp">UTC time of the log entry.</param>
/// <param name="Level">Log severity (info, warn, error).</param>
/// <param name="Message">Message text.</param>
/// <param name="Context">Optional structured context data.</param>
public record ClientLogEntry(DateTime Timestamp, string Level, string Message, Dictionary<string, string>? Context);
