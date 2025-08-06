namespace Fenrick.Miro.Server.Services;

using System;
using System.Text.Json;

using Data;

using Domain;

/// <summary>
///     Template store backed by Entity Framework Core.
/// </summary>
public class EfTemplateStore(MiroDbContext context) : ITemplateStore
{
    private readonly MiroDbContext db = context;

    /// <inheritdoc />
    public TemplateDefinition? GetTemplate(string userId, string name)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new ArgumentException($"User id must be provided",
                nameof(userId));
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException($"Template name must be provided",
                nameof(name));
        }

        TemplateEntity? entity = this.db.Templates.Find(userId, name);
        return entity is null
            ? null
            : JsonSerializer.Deserialize<TemplateDefinition>(
                entity.DefinitionJson);
    }

    /// <inheritdoc />
    public void SetTemplate(string userId, string name,
        TemplateDefinition definition)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new ArgumentException($"User id must be provided",
                nameof(userId));
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException($"Template name must be provided",
                nameof(name));
        }

        TemplateEntity? entity = this.db.Templates.Find(userId, name);
        var json = JsonSerializer.Serialize(definition);
        if (entity is null)
        {
            this.db.Templates.Add(new TemplateEntity { UserId = userId, Name = name, DefinitionJson = json });
        }
        else
        {
            entity.DefinitionJson = json;
        }

        this.db.SaveChanges();
    }
}
