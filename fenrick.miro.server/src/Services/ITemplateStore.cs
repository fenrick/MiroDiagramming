namespace Fenrick.Miro.Server.Services;

using Domain;

/// <summary>
///     Provides user-scoped template storage.
/// </summary>
public interface ITemplateStore
{
    /// <summary>Retrieve a template by user and name.</summary>
    public TemplateDefinition? GetTemplate(string userId, string name);

    /// <summary>Store or replace a user template.</summary>
    public void SetTemplate(string userId, string name,
        TemplateDefinition template);
}
