using Microsoft.AspNetCore.Mvc;
using Fenrick.Miro.Api;

namespace Fenrick.Miro.Server.Api;

/// <summary>
/// Aggregates REST calls so the client can send them in one request.
/// </summary>
[ApiController]
[Route("api/batch")]
public class BatchController : ControllerBase
{
    private readonly IMiroClient _client;

    public BatchController(IMiroClient client) => _client = client;

    [HttpPost]
    public async Task<IActionResult> ForwardAsync([FromBody] MiroRequest[] requests)
    {
        var responses = new List<MiroResponse>(requests.Length);
        foreach (var req in requests)
        {
            var res = await _client.SendAsync(req);
            responses.Add(res);
        }
        return Ok(responses);
    }
}

public interface IMiroClient
{
    Task<MiroResponse> SendAsync(MiroRequest request);
}
