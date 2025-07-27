namespace Fenrick.Miro.Server.Api;

using System.Text.Json;
using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;
using Microsoft.AspNetCore.Mvc;

/// <summary>
///     Endpoint for creating shape widgets through the Miro API.
/// </summary>
[ApiController]
[Route("api/boards/{boardId}/shapes")]
public class ShapesController(IMiroClient client, IShapeCache cache)
    : ControllerBase
{
    private readonly IMiroClient miroClient = client;

    private readonly IShapeCache shapeCache = cache;

    [HttpPost]
    public async Task<IActionResult> CreateAsync(
        string boardId,
        [FromBody] ShapeData[] shapes)
    {
        var responses = await this.miroClient.CreateAsync(
                            $"/boards/{boardId}/shapes",
                            shapes);
        for (var i = 0; i < responses.Count && i < shapes.Length; i++)
        {
            this.shapeCache.Store(
                new ShapeCacheEntry(boardId, responses[i].Body, shapes[i]));
        }

        return this.Ok(responses);
    }

    [HttpDelete("{itemId}")]
    public async Task<IActionResult> DeleteAsync(string boardId, string itemId)
    {
        var response = await this.miroClient.SendAsync(
                           new MiroRequest(
                               "DELETE",
                               $"/boards/{boardId}/shapes/{itemId}",
                               null));
        this.shapeCache.Remove(boardId, itemId);
        return this.Ok(response);
    }

    [HttpPut("{itemId}")]
    public async Task<IActionResult> UpdateAsync(
        string boardId,
        string itemId,
        [FromBody] ShapeData shape)
    {
        var body = JsonSerializer.Serialize(shape);
        var response = await this.miroClient.SendAsync(
                           new MiroRequest(
                               "PUT",
                               $"/boards/{boardId}/shapes/{itemId}",
                               body));
        this.shapeCache.Store(new ShapeCacheEntry(boardId, itemId, shape));
        return this.Ok(response);
    }

    [HttpGet("{itemId}")]
    public async Task<IActionResult> GetAsync(string boardId, string itemId)
    {
        var cached = this.shapeCache.Retrieve(boardId, itemId);
        if (cached != null)
        {
            var json = JsonSerializer.Serialize(cached.Data);
            return this.Content(json, "application/json");
        }

        var response = await this.miroClient.SendAsync(
                           new MiroRequest(
                               "GET",
                               $"/boards/{boardId}/shapes/{itemId}",
                               null));
        var data = JsonSerializer.Deserialize<ShapeData>(response.Body);
        if (data != null)
        {
            this.shapeCache.Store(new ShapeCacheEntry(boardId, itemId, data));
        }

        return this.Content(response.Body, "application/json");
    }
}
