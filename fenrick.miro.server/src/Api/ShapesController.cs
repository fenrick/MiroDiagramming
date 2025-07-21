namespace Fenrick.Miro.Server.Api;

using Domain;
using Services;
using Microsoft.AspNetCore.Mvc;

/// <summary>
///     Endpoint for creating shape widgets through the Miro API.
/// </summary>
[ApiController]
[Route("api/shapes")]
public class ShapesController(IMiroClient client) : ControllerBase
{
    private readonly IMiroClient miroClient = client;

    [HttpPost]
    public async Task<IActionResult> CreateAsync([FromBody] ShapeData[] shapes)
    {
        var responses = await this.miroClient.CreateAsync("/shapes", shapes);
        return this.Ok(responses);
    }
}
