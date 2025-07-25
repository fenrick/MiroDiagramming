namespace Fenrick.Miro.Server.Api;

using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;
using Microsoft.AspNetCore.Mvc;

/// <summary>
///     Endpoint for creating card widgets through the Miro API.
/// </summary>
[ApiController]
[Route("api/cards")]
public class CardsController(IMiroClient client) : ControllerBase
{
    private readonly IMiroClient miroClient = client;

    [HttpPost]
    public async Task<IActionResult> CreateAsync([FromBody] CardData[] cards)
    {
        var responses = await this.miroClient.CreateAsync("/cards", cards);
        return this.Ok(responses);
    }
}
