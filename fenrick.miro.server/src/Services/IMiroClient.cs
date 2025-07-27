namespace Fenrick.Miro.Server.Services;

using Fenrick.Miro.Server.Domain;
using System.Threading;

/// <summary>
///     Minimal HTTP client interface used by controllers.
/// </summary>
public interface IMiroClient
{
    /// <summary>Forward a request to the Miro API.</summary>
    /// <param name="request">REST description.</param>
    /// <returns>API response.</returns>
    public Task<MiroResponse> SendAsync(
        MiroRequest request,
        CancellationToken ct = default);
}
