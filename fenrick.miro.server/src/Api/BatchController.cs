namespace Fenrick.Miro.Server.Api;

using Domain;
using Services;
using Microsoft.AspNetCore.Mvc;

/// <summary>
///     Aggregates REST calls so the client can send them in one request.
/// </summary>
[ApiController]
[Route("api/batch")]
public class BatchController(IMiroClient client) : ControllerBase
{
    private readonly IMiroClient miroClient = client;

    [HttpPost]
    public async Task<IActionResult> ForwardAsync(
        [FromBody] MiroRequest[] requests)
    {
        var responses = new List<MiroResponse>(requests.Length);
        foreach (var req in requests)
        {
            var res = await this.miroClient.SendAsync(req);
            responses.Add(res);
        }

        return this.Ok(responses);
    }
}

