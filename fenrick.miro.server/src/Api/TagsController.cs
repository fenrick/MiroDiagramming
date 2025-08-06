namespace Fenrick.Miro.Server.Api;

using System.Collections.Generic;
using System.Threading.Tasks;

using Domain;

using Microsoft.AspNetCore.Mvc;

using Services;

/// <summary>
///     Endpoint exposing board tags via the server.
/// </summary>
[ApiController]
[Route($"api/boards/{{boardId}}/tags")]
public class TagsController(ITagService service) : ControllerBase
{
    private readonly ITagService tagService = service;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TagInfo>>> GetAsync(
        string boardId)
    {
        IReadOnlyList<TagInfo> tags = await this.tagService
            .GetTagsAsync(boardId, this.HttpContext.RequestAborted)
            .ConfigureAwait(false);
        return this.Ok(tags);
    }
}
