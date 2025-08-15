namespace Fenrick.Miro.Server.Services;

using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Configuration;

using Domain;

/// <summary>
///     Refreshes access tokens for users via the Miro OAuth API.
/// </summary>
public class MiroTokenRefresher(
    IConfiguration cfg,
    IHttpClientFactory http,
    IUserStore users) : ITokenRefresher
{
    private readonly IConfiguration cfg = cfg;
    private readonly IHttpClientFactory http = http;
    private readonly IUserStore users = users;

    /// <inheritdoc />
    public async Task<string?> RefreshAsync(string userId, CancellationToken ct = default)
    {
        UserInfo? info = await this.users.RetrieveAsync(userId, ct).ConfigureAwait(false);
        if (info is null || string.IsNullOrWhiteSpace(info.RefreshToken))
        {
            return null;
        }

        using HttpClient client = this.http.CreateClient();
        using var form = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["grant_type"] = "refresh_token",
            ["refresh_token"] = info.RefreshToken!,
            ["client_id"] = this.cfg["Miro:ClientId"]!,
            ["client_secret"] = this.cfg["Miro:ClientSecret"]!,
        });
        using HttpResponseMessage res = await client
            .PostAsync($"{this.cfg["Miro:AuthBase"]}/v1/oauth/token", form, ct)
            .ConfigureAwait(false);
        if (!res.IsSuccessStatusCode)
        {
            return null;
        }

        string json = await res.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        TokenResponse payload = JsonSerializer.Deserialize<TokenResponse>(json)!;
        var updated = info with
        {
            AccessToken = payload.access_token,
            RefreshToken = payload.refresh_token,
            ExpiresAt = DateTimeOffset.UtcNow.AddSeconds(payload.expires_in),
        };
        await this.users.StoreAsync(updated, ct).ConfigureAwait(false);
        return updated.AccessToken;
    }

    private record TokenResponse(string token_type, string access_token, string refresh_token, int expires_in);
}
