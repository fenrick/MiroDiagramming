namespace Fenrick.Miro.Server.Services;

using System.Collections.Generic;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Fenrick.Miro.Server.Domain;

/// <summary>
///     Default implementation of <see cref="ITagService" /> using <see cref="IMiroClient" />.
/// </summary>
public class TagService(IMiroClient client) : ITagService
{
    private readonly IMiroClient client = client;

    /// <inheritdoc />
    public async Task<IReadOnlyList<TagInfo>> GetTagsAsync(string boardId, CancellationToken ct = default)
    {
        var res = await this.client.SendAsync(new MiroRequest("GET", $"/boards/{boardId}/tags", null), ct);
        return JsonSerializer.Deserialize<List<TagInfo>>(res.Body) ?? [];
    }
}
