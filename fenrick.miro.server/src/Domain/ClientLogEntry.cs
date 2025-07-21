namespace Fenrick.Miro.Server.Domain;

using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

/// <summary>
///     Log entry forwarded from the client application.
/// </summary>
public record ClientLogEntry
{
    public ClientLogEntry()
    {
    }

    public ClientLogEntry(DateTime timestamp, string level, string message, Dictionary<string, string>? context)
    {
        this.Timestamp = timestamp;
        this.Level = level;
        this.Message = message;
        this.Context = context;
    }

    [Required]
    [JsonRequired]
    public DateTime Timestamp { get; init; }

    [Required]
    public string Level { get; init; } = string.Empty;

    [Required]
    public string Message { get; init; } = string.Empty;

    public Dictionary<string, string>? Context { get; init; }
}
