namespace Fenrick.Miro.Server.Data;

using Domain;

/// <summary>
///     Database record storing a template per user.
/// </summary>
public class TemplateEntity
{
    /// <summary>User identifier owning the template.</summary>
    public required string UserId { get; set; }

    /// <summary>Unique name of the template.</summary>
    public required string Name { get; set; }

    /// <summary>JSON encoded <see cref="TemplateDefinition"/>.</summary>
    public required string DefinitionJson { get; set; }
}
