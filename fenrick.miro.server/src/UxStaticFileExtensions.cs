using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using System.IO;

namespace Fenrick.Miro.Server;

/// <summary>
/// Provides helpers for serving the built React application.
/// </summary>
public static class UxStaticFileExtensions
{
    private const string UxRelativePath = "../fenrick.miro.ux/dist";

    /// <summary>
    /// Configure the application to serve static files from the UX build output.
    /// </summary>
    /// <param name="app">The web application.</param>
    /// <param name="env">The host environment.</param>
    public static void UseUxStaticFiles(this WebApplication app, IHostEnvironment env)
    {
        var path = GetUxPath(env);
        if (!Directory.Exists(path))
        {
            return;
        }

        var provider = new PhysicalFileProvider(path);
        app.UseDefaultFiles(new DefaultFilesOptions { FileProvider = provider });
        app.UseStaticFiles(new StaticFileOptions { FileProvider = provider, ServeUnknownFileTypes = true });
    }

    /// <summary>
    /// Get the absolute path to the UX build output directory.
    /// </summary>
    /// <param name="env">The host environment.</param>
    /// <returns>Absolute path to the dist folder.</returns>
    public static string GetUxPath(IHostEnvironment env) =>
        Path.GetFullPath(Path.Combine(env.ContentRootPath, UxRelativePath));
}
