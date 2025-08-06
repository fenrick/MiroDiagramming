namespace Fenrick.Miro.Server.Domain;

using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

/// <summary>
///     Log entry forwarded from the client application.
/// </summary>
/// <param name="Timestamp">UTC time of the log entry.</param>
/// <param name="Level">Log severity (info, warn, error).</param>
/// <param name="Message">Message text.</param>
/// <param name="Context">Optional structured context data.</param>
public record ClientLogEntry(
    [property: Required]
    [property: JsonRequired]
    DateTime? Timestamp,
    [property: Required]
    [property: JsonRequired]
    string Level,
    [property: Required]
    [property: JsonRequired]
    string Message,
    IDictionary<string, string>? Context);
