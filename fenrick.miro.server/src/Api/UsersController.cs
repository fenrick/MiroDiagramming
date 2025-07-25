namespace Fenrick.Miro.Server.Api;

using Domain;
using Microsoft.AspNetCore.Mvc;
using Services;

/// <summary>
///     Receives user authentication details from the client.
/// </summary>
[ApiController]
[Route("api/users")]
public class UsersController(IUserStore store) : ControllerBase
{
    private readonly IUserStore userStore = store;

    /// <summary>
    ///     Store the provided user information for later requests.
    /// </summary>
    /// <param name="info">User details to keep for subsequent API calls.</param>
    [HttpPost]
    public IActionResult Register([FromBody] UserInfo info)
    {
        this.userStore.Store(info);

        // Tokens persist via the configured IUserStore.
        return this.Accepted();
    }
}
