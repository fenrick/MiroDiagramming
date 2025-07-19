namespace Fenrick.Miro.Server.Api;
using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;
using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Provides cached board metadata used by the React app.
/// </summary>
[ApiController]
[Route("api/cache")]
public class CacheController(ICacheService cache) : ControllerBase
{
    private readonly ICacheService _cache = cache;

    [HttpGet("{boardId}")]
    public ActionResult<BoardMetadata?> Get(string boardId) => this.Ok(this._cache.Get(boardId));
}
