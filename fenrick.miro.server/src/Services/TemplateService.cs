namespace Fenrick.Miro.Server.Services;

using Domain;

/// <summary>
///     Manage user specific template collections in memory.
/// </summary>
// TODO: persist templates and expose an editing API
public class TemplateService
{
    private readonly Dictionary<string, Dictionary<string, TemplateDefinition>>
        store = [];

    /// <summary>
    ///     Store or replace a template for a specific user.
    /// </summary>
    /// <param name="userId">User identifier.</param>
    /// <param name="name">Template name.</param>
    /// <param name="template">Template definition to store.</param>
    public void SetTemplate(string userId, string name,
        TemplateDefinition template)
    {
        if (!this.store.TryGetValue(userId, out var map))
        {
            map = [];
            this.store[userId] = map;
        }

        map[name] = template;
    }

    /// <summary>
    ///     Retrieve a template for a user.
    /// </summary>
    /// <param name="userId">User identifier.</param>
    /// <param name="name">Template name.</param>
    /// <returns>The stored template or <c>null</c>.</returns>
    public TemplateDefinition? GetTemplate(string userId, string name) =>
        this.store.TryGetValue(userId, out var map) &&
        map.TryGetValue(name, out var tpl)
            ? tpl
            : null;
}
