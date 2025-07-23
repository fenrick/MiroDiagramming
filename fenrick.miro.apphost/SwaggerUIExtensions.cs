namespace Fenrick.Miro.AppHost;

/// <summary>
///     Provides a placeholder implementation of the <c>WithSwaggerUI</c> extension
///     used in distributed applications.
/// </summary>
public static class SwaggerUIExtensions
{
    /// <summary>
    ///     Adds Swagger UI hosting for the specified project. In this simplified
    ///     sample the method
    ///     returns the original builder without additional configuration.
    /// </summary>
    /// <param name="builder">The project resource builder.</param>
    /// <returns>The original project builder.</returns>
    public static IResourceBuilder<ProjectResource> WithSwaggerUI(
        this IResourceBuilder<ProjectResource> builder) =>
        // In a full implementation this would host Swagger UI for the project's OpenAPI endpoint.
        builder;
}
