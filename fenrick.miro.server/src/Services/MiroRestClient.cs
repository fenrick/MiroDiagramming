namespace Fenrick.Miro.Server.Services;

using System.Net.Http.Headers;
using System.Text;
using Domain;
using Microsoft.AspNetCore.Http;

/// <summary>
///     HTTP client adapter that forwards requests to the Miro REST API.
///     The access token is looked up via <see cref="IUserStore" />
///     using the <c>X-User-Id</c> request header.
///     TODO: refresh expired tokens via dedicated endpoint, model the full OAuth
///     code exchange using AspNet.Security.OAuth.Miro and update the
///     user store securely, surfacing failures to callers.
///     TODO: evaluate existing .NET REST API clients for Miro to simplify
///     request generation and response parsing.
/// </summary>
public class MiroRestClient : IMiroClient
{
    private readonly HttpClient httpClient;
    private readonly IUserStore store;
    private readonly IHttpContextAccessor accessor;

    public MiroRestClient(HttpClient httpClient, IUserStore store, IHttpContextAccessor accessor)
    {
        this.httpClient = httpClient;
        this.store = store;
        this.accessor = accessor;
    }

    /// <inheritdoc />
    public async Task<MiroResponse> SendAsync(MiroRequest request)
    {
        var ctx = this.accessor.HttpContext;
        var userId = ctx?.Request.Headers["X-User-Id"].FirstOrDefault();
        var token = userId != null ? this.store.Retrieve(userId)?.Token : null;
        var message = new HttpRequestMessage(new HttpMethod(request.Method), request.Path)
        {
            Content = request.Body == null ? null : new StringContent(request.Body, Encoding.UTF8, "application/json")
        };
        if (token != null)
        {
            message.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }
        var response = await this.httpClient.SendAsync(message);
        var body = await response.Content.ReadAsStringAsync();
        return new MiroResponse((int)response.StatusCode, body);
    }
}
