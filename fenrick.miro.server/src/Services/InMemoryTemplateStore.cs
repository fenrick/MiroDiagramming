namespace Fenrick.Miro.Server.Services;

using Domain;

/// <summary>
///     Manage user specific template collections in memory.
/// </summary>
/// <remarks>
///     TODO: persist templates in a database using an ORM and expose full CRUD
///     API endpoints so the client can create, read, update and delete
///     templates via REST. Model templates in the shared DTO layer for
///     portability.
/// </remarks>
public class InMemoryTemplateStore : ITemplateStore
{
    private readonly Dictionary<string, Dictionary<string, TemplateDefinition>>
        store = [];

    /// <summary>
    ///     Retrieve a template for a user.
    /// </summary>
    /// <param name="userId">User identifier.</param>
    /// <param name="name">Template name.</param>
    /// <returns>The stored template or <c>null</c>.</returns>
    public TemplateDefinition? GetTemplate(string userId, string name) =>
        this.store.TryGetValue(userId, out var map)
        && map.TryGetValue(name, out var tpl)
            ? tpl
            : null;

    /// <summary>
    ///     Store or replace a template for a specific user.
    /// </summary>
    /// <param name="userId">User identifier.</param>
    /// <param name="name">Template name.</param>
    /// <param name="template">Template definition to store.</param>
    public void SetTemplate(
        string userId,
        string name,
        TemplateDefinition template)
    {
        if (!this.store.TryGetValue(userId, out var map))
        {
            map = [];
            this.store[userId] = map;
        }

        map[name] = template;
    }
}
