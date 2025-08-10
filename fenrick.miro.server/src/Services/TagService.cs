namespace Fenrick.Miro.Server.Services;

#pragma warning disable MA0165

using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

using Domain;

using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;

/// <summary>
///     Default implementation of <see cref="ITagService" /> using <see cref="IMiroClient" />.
/// </summary>
public class TagService(IMiroClient client, ILogger<TagService>? log = null) : ITagService
{
    private readonly IMiroClient client = client;
    private readonly ILogger<TagService> logger =
        log ?? NullLogger<TagService>.Instance;

    /// <inheritdoc />
    public async Task<IReadOnlyList<TagInfo>> GetTagsAsync(string boardId,
        CancellationToken ct = default)
    {
        ArgumentException.ThrowIfNullOrEmpty(boardId);

        MiroResponse res = await this.client
            .SendAsync(
                new MiroRequest($"GET", $"/boards/{boardId}/tags", Body: null),
                ct).ConfigureAwait(false);

        if (res.Status is < 200 or > 299)
        {
            Log.NonSuccessStatus(this.logger, res.Status, boardId, null);
            throw new HttpRequestException(
                string.Create(
                    CultureInfo.InvariantCulture,
                    $"Non-success status {res.Status} received for board {boardId} tags."),
                inner: null,
                (HttpStatusCode)res.Status);
        }

        try
        {
            return JsonSerializer.Deserialize<List<TagInfo>>(res.Body) ?? [];
        }
        catch (JsonException ex)
        {
            Log.DeserializationFailed(this.logger, boardId, ex);
            throw new InvalidOperationException($"Malformed tag JSON response.", ex);
        }
    }

    private static class Log
    {
        public static readonly Action<ILogger, int, string, Exception?> NonSuccessStatus =
            LoggerMessage.Define<int, string>(
                LogLevel.Warning,
                new EventId(1, nameof(GetTagsAsync)),
                "Non-success status {Status} received for board {BoardId} tags.");

        public static readonly Action<ILogger, string, Exception?> DeserializationFailed =
            LoggerMessage.Define<string>(
                LogLevel.Error,
                new EventId(2, nameof(GetTagsAsync)),
                "Failed to deserialize tags for board {BoardId}.");
    }
}

#pragma warning restore MA0165
