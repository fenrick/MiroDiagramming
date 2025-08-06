namespace Fenrick.Miro.Server.Services;

using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

using Domain;

/// <summary>
///     Provides access to board tags via the Miro API.
/// </summary>
public interface ITagService
{
    /// <summary>Retrieve all tags for the specified board.</summary>
    /// <param name="boardId">Target board identifier.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>List of tags.</returns>
    /// <exception cref="ArgumentNullException">Thrown when <paramref name="boardId" /> is null or empty.</exception>
    /// <exception cref="HttpRequestException">
    ///     Thrown when the Miro API responds with a non-success status code.
    /// </exception>
    /// <exception cref="InvalidOperationException">Thrown when the Miro API returns malformed JSON.</exception>
    public Task<IReadOnlyList<TagInfo>> GetTagsAsync(string boardId,
        CancellationToken ct = default);
}
