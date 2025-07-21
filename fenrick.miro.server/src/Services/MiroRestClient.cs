namespace Fenrick.Miro.Server.Services;

using System.Net.Http.Headers;
using System.Text;
using Domain;

/// <summary>
///     HTTP client adapter that forwards requests to the Miro REST API.
///     The access token is looked up via <see cref="IUserStore" />
///     using the <c>X-User-Id</c> request header.
///     TODO: refresh expired tokens and surface failures to callers.
/// </summary>
public class MiroRestClient(
    HttpClient httpClient,
    IUserStore store,
    IHttpContextAccessor accessor) : IMiroClient
{
    private readonly IHttpContextAccessor accessor = accessor;
    private readonly HttpClient httpClient = httpClient;
    private readonly IUserStore store = store;

    /// <inheritdoc />
    public async Task<MiroResponse> SendAsync(MiroRequest request)
    {
        var ctx = this.accessor.HttpContext;
        var userId = ctx?.Request.Headers["X-User-Id"].FirstOrDefault();
        var token = userId != null ? this.store.Retrieve(userId)?.Token : null;
        var message =
            new HttpRequestMessage(new HttpMethod(request.Method), request.Path)
            {
                Content = request.Body == null
                    ? null
                    : new StringContent(request.Body, Encoding.UTF8,
                        "application/json")
            };
        if (token != null)
        {
            message.Headers.Authorization =
                new AuthenticationHeaderValue("Bearer", token);
        }

        var response = await this.httpClient.SendAsync(message);
        var body = await response.Content.ReadAsStringAsync();
        return new MiroResponse((int)response.StatusCode, body);
    }
}
