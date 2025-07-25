namespace Fenrick.Miro.Server.Services;

using System.Text.Json;
using Fenrick.Miro.Server.Domain;

/// <summary>
///     Helper methods for interacting with the Miro REST API via
///     <see cref="IMiroClient" />.
/// </summary>
public static class MiroClientExtensions
{
    /// <summary>
    ///     Create items on the Miro board in chunks of twenty.
    /// </summary>
    /// <typeparam name="T">Payload type for the items.</typeparam>
    /// <param name="client">The underlying HTTP client.</param>
    /// <param name="path">Endpoint path, e.g. "/cards".</param>
    /// <param name="items">Items to create.</param>
    /// <returns>Responses returned by the API.</returns>
    public static async Task<List<MiroResponse>> CreateAsync<T>(
        this IMiroClient client,
        string path,
        IEnumerable<T> items)
    {
        var responses = new List<MiroResponse>();
        foreach (var group in items.Chunk(20))
        {
            foreach (var item in group)
            {
                var body = JsonSerializer.Serialize(item);
                var response = await client.SendAsync(
                                   new MiroRequest("POST", path, body));
                responses.Add(response);
            }
        }

        return responses;
    }
}
