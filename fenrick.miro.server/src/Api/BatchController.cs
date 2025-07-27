namespace Fenrick.Miro.Server.Api;

using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;

using Microsoft.AspNetCore.Mvc;

/// <summary>
///     Aggregates REST calls so the client can send them in one request.
/// </summary>
[ApiController]
[Route($"api/batch")]
public class BatchController(IMiroClient client) : ControllerBase
{
    private readonly IMiroClient miroClient = client;

    [HttpPost]
    public async Task<IActionResult> ForwardAsync(
        [FromBody] MiroRequest[] requests)
    {
        var responses = new List<MiroResponse>(requests.Length);
        foreach (MiroRequest req in requests)
        {
            MiroResponse res = await this.miroClient.SendAsync(
                req,
                this.HttpContext.RequestAborted).ConfigureAwait(false);
            responses.Add(res);
        }

        return this.Ok(responses);
    }
}
