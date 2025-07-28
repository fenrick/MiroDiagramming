namespace Fenrick.Miro.Server.Services;

using System.Net.Http.Headers;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

using Domain;

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
public class MiroRestClient(
    HttpClient httpClient,
    IUserStore store,
    IHttpContextAccessor accessor) : IMiroClient
{
    private readonly IHttpContextAccessor accessor = accessor;

    private readonly HttpClient httpClient = httpClient;

    private readonly IUserStore store = store;

    /// <inheritdoc />
    public async Task<MiroResponse> SendAsync(MiroRequest request,
        CancellationToken ct = default)
    {
        HttpContext? ctx = this.accessor.HttpContext;
        var userId = ctx?.Request.Headers[$"X-User-Id"].FirstOrDefault();
        UserInfo? info = userId != null
            ? await this.store.RetrieveAsync(userId, ct).ConfigureAwait(false)
            : null;
        var token = info?.Token;
        using var message = new HttpRequestMessage(
            new HttpMethod(request.Method),
            new Uri(request.Path, UriKind.Relative))
        {
            Content = request.Body == null
                ? null
                : new StringContent(
                    request.Body,
                    Encoding.UTF8,
                    $"application/json"),
        };
        if (token != null)
        {
            message.Headers.Authorization =
                new AuthenticationHeaderValue($"Bearer", token);
        }

        HttpResponseMessage response = await this.httpClient
            .SendAsync(message, ct).ConfigureAwait(false);
        var body = await response.Content.ReadAsStringAsync(ct)
            .ConfigureAwait(false);
        return new MiroResponse((int)response.StatusCode, body);
    }
}
