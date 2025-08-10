namespace Fenrick.Miro.Server.Api;

using Domain;

using Microsoft.AspNetCore.Mvc;

using Services;

/// <summary>
///     Endpoint for creating card widgets through the Miro API.
/// </summary>
[ApiController]
[Route($"api/cards")]
public class CardsController(IMiroClient client) : ControllerBase
{
    private readonly IMiroClient miroClient = client;

    [HttpPost]
    public async Task<IActionResult> CreateAsync([FromBody] CardData[] cards)
    {
        IList<MiroResponse> responses = await this.miroClient.CreateAsync(
            $"/cards",
            cards,
            this.HttpContext.RequestAborted).ConfigureAwait(false);
        return this.Ok(responses);
    }
}
