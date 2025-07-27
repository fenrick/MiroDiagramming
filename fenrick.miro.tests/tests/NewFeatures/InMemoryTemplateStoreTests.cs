#nullable enable

namespace Fenrick.Miro.Tests.NewFeatures;

using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;

using Xunit;

public class InMemoryTemplateStoreTests
{
    [Fact]
    public void StoresAndRetrievesTemplatePerUser()
    {
        var svc = new InMemoryTemplateStore();
        var tpl = new TemplateDefinition(
        [
            new TemplateElement($"r", 100, 60, $"{{label}}"),
        ]);

        svc.SetTemplate($"u1", $"A", tpl);
        TemplateDefinition? fetched = svc.GetTemplate($"u1", $"A");

        Assert.NotNull(fetched);
        Assert.Equal($"{{label}}", fetched!.Elements[0].Text);
        Assert.Null(svc.GetTemplate($"u2", $"A"));
    }

    // TODO create integration tests once template endpoints allow full CRUD
    // for creating, updating and deleting templates.
}
