namespace Fenrick.Miro.Server.Services;

using System.Collections.Generic;

using Fenrick.Miro.Server.Domain;

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
    /// <returns>The stored template or <see langword="null"/>.</returns>
    public TemplateDefinition? GetTemplate(string userId, string name) =>
        this.store.TryGetValue(userId, out Dictionary<string, TemplateDefinition>? map)
        && map.TryGetValue(name, out TemplateDefinition? tpl)
            ? tpl
            : null;

    /// <summary>
    ///     Store or replace a template for a specific user.
    /// </summary>
    /// <param name="userId">User identifier.</param>
    /// <param name="name">Template name.</param>
    /// <param name="definition">Template definition to store.</param>
    public void SetTemplate(
        string userId,
        string name,
        TemplateDefinition definition)
    {
        if (!this.store.TryGetValue(userId, out Dictionary<string, TemplateDefinition>? map))
        {
            map = [];
            this.store[userId] = map;
        }

        map[name] = definition;
    }
}
