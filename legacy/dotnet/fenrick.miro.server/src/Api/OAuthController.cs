namespace Fenrick.Miro.Server.Api;

using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

using Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Services;

/// <summary>
///     Handles OAuth login and callback endpoints for Miro authorization.
/// </summary>
[ApiController]
[Route("oauth")]
public class OAuthController(
    IConfiguration cfg,
    IUserStore users,
    IHttpClientFactory http) : ControllerBase
{
    private readonly IConfiguration cfg = cfg;
    private readonly IUserStore users = users;
    private readonly IHttpClientFactory http = http;

    /// <summary>
    ///     Redirects the user to the Miro authorization endpoint.
    /// </summary>
    /// <param name="userId">Identifier of the user initiating login.</param>
    /// <param name="returnUrl">Optional URL to redirect to after login.</param>
    [HttpGet("login")]
    public IActionResult Login([FromQuery] string userId, [FromQuery] string? returnUrl = null)
    {
        var state = Convert.ToBase64String(Guid.NewGuid().ToByteArray()) + ":" + userId;
        var url = $"{this.cfg["Miro:AuthBase"]}/oauth/authorize" +
                  "?response_type=code" +
                  $"&client_id={Uri.EscapeDataString(this.cfg["Miro:ClientId"]!)}" +
                  $"&redirect_uri={Uri.EscapeDataString(this.cfg["Miro:RedirectUri"]!)}" +
                  $"&state={Uri.EscapeDataString(state)}" +
                  "&scope=boards:read boards:write";
        return this.Redirect(url);
    }

    /// <summary>
    ///     Handles the callback from Miro after user authorization.
    /// </summary>
    /// <param name="code">Authorization code returned from Miro.</param>
    /// <param name="state">State parameter used to mitigate CSRF.</param>
    /// <param name="ct">Cancellation token.</param>
    [HttpGet("callback")]
    public async Task<IActionResult> Callback([FromQuery] string code, [FromQuery] string state, CancellationToken ct)
    {
        var (_, userId) = state.Split(':') is var parts && parts.Length == 2
            ? (parts[0], parts[1])
            : throw new InvalidOperationException("Invalid state");

        using HttpClient client = this.http.CreateClient();
        using var form = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["grant_type"] = "authorization_code",
            ["code"] = code,
            ["redirect_uri"] = this.cfg["Miro:RedirectUri"]!,
            ["client_id"] = this.cfg["Miro:ClientId"]!,
            ["client_secret"] = this.cfg["Miro:ClientSecret"]!,
        });
        using HttpResponseMessage tokenRes = await client
            .PostAsync($"{this.cfg["Miro:AuthBase"]}/v1/oauth/token", form, ct)
            .ConfigureAwait(false);
        tokenRes.EnsureSuccessStatusCode();
        string json = await tokenRes.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        TokenResponse payload = JsonSerializer.Deserialize<TokenResponse>(json)!;

        await this.users.StoreAsync(
            new UserInfo(
                userId,
                "<name>",
                payload.access_token,
                payload.refresh_token,
                DateTimeOffset.UtcNow.AddSeconds(payload.expires_in)),
            ct).ConfigureAwait(false);

        return this.Redirect("/app.html");
    }

    private record TokenResponse(string token_type, string access_token, string refresh_token, int expires_in);
}
