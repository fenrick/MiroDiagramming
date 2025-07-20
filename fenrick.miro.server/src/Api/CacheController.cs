namespace Fenrick.Miro.Server.Api;

using Domain;
using Microsoft.AspNetCore.Mvc;
using Services;

/// <summary>
///     Provides cached board metadata used by the React app.
/// </summary>
[ApiController]
[Route("api/cache")]
public class CacheController(ICacheService cache) : ControllerBase
{
    private readonly ICacheService _cache = cache;

    [HttpGet("{boardId}")]
    public ActionResult<BoardMetadata?> Get(string boardId) =>
        this.Ok(this._cache.Get(boardId));
}
