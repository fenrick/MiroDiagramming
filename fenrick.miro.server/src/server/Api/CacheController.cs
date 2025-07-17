using Microsoft.AspNetCore.Mvc;
using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;

namespace Fenrick.Miro.Server.Api;

/// <summary>
/// Provides cached board metadata used by the React app.
/// </summary>
[ApiController]
[Route("api/cache")]
public class CacheController : ControllerBase
{
    private readonly ICacheService _cache;

    public CacheController(ICacheService cache) => _cache = cache;

    [HttpGet("{boardId}")]
    public ActionResult<BoardMetadata?> Get(string boardId) => Ok(_cache.Get(boardId));
}
