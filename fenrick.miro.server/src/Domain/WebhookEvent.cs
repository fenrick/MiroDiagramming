namespace Fenrick.Miro.Server.Domain;

/// <summary>
/// Simplified representation of a webhook event sent by Miro.
/// </summary>
public record WebhookEvent(string Event, string BoardId);
