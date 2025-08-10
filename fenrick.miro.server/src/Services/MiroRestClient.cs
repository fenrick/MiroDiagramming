namespace Fenrick.Miro.Server.Services;

using System.Net;
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
    IHttpContextAccessor accessor,
    ITokenRefresher refresher) : IMiroClient
{
    private readonly IHttpContextAccessor accessor = accessor;

    private readonly HttpClient httpClient = httpClient;

    private readonly IUserStore store = store;

    private readonly ITokenRefresher refresher = refresher;

    /// <inheritdoc />
    public async Task<MiroResponse> SendAsync(MiroRequest request,
        CancellationToken ct = default)
    {
        HttpContext? ctx = this.accessor.HttpContext;
        var userId = ctx?.Request.Headers[$"X-User-Id"].FirstOrDefault();
        UserInfo? info = userId != null
            ? await this.store.RetrieveAsync(userId, ct).ConfigureAwait(false)
            : null;
        var token = info?.AccessToken;
        using HttpRequestMessage message = CreateRequestMessage(request, token);
        using HttpResponseMessage response =
            await this.httpClient.SendAsync(message, ct).ConfigureAwait(false);
        using HttpContent responseContent = response.Content;
        if (response.StatusCode is HttpStatusCode.Unauthorized && userId != null && info != null)
        {
            UserInfo? refreshed =
                await this.refresher.RefreshAsync(info, ct).ConfigureAwait(false);
            if (refreshed != null)
            {
                await this.store
                    .StoreAsync(refreshed, ct)
                    .ConfigureAwait(false);
                using HttpRequestMessage retryMessage =
                    CreateRequestMessage(request, refreshed.AccessToken);
                using HttpResponseMessage retryResponse = await this.httpClient
                    .SendAsync(retryMessage, ct)
                    .ConfigureAwait(false);
                using HttpContent retryContent = retryResponse.Content;
                var retryBody =
                    await retryContent.ReadAsStringAsync(ct).ConfigureAwait(false);
                return new MiroResponse((int)retryResponse.StatusCode, retryBody);
            }
        }

        var body = await responseContent.ReadAsStringAsync(ct).ConfigureAwait(false);
        return new MiroResponse((int)response.StatusCode, body);
    }

    private static HttpRequestMessage CreateRequestMessage(MiroRequest request, string? token)
    {
        var message = new HttpRequestMessage(
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

        return message;
    }
}
