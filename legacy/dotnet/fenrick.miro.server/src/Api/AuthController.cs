namespace Fenrick.Miro.Server.Api;

using System;
using Microsoft.AspNetCore.Mvc;

using Services;

/// <summary>
///     Exposes authentication status for the calling user.
/// </summary>
[Obsolete("Replaced by FastAPI auth router.")]
[ApiController]
[Route($"api/auth")]
public class AuthController(IUserStore store) : ControllerBase
{
    private readonly IUserStore userStore = store;

    /// <summary>
    ///     Returns 200 when tokens exist for the provided <c>X-User-Id</c> header;
    ///     otherwise 404.
    /// </summary>
    /// <param name="userId">Identifier of the calling user.</param>
    [HttpGet($"status")]
    public IActionResult GetStatus([FromHeader(Name = $"X-User-Id")] string? userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return this.BadRequest();
        }

        return this.userStore.Retrieve(userId) is null ? this.NotFound() : this.Ok();
    }
}
