namespace Fenrick.Miro.Server.Services;

using System.Collections.Generic;
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
    public Task<IReadOnlyList<TagInfo>> GetTagsAsync(string boardId,
        CancellationToken ct = default);
}
