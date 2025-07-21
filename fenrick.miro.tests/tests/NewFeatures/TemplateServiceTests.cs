using Fenrick.Miro.Server.Services;
using Fenrick.Miro.Server.Domain;
using Xunit;

public class TemplateServiceTests
{
    [Fact]
    public void StoresAndRetrievesTemplatePerUser()
    {
        var svc = new TemplateService();
        var tpl = new TemplateDefinition(new[]{new TemplateElement("r",100,60,"{{label}}")});

        svc.SetTemplate("u1","A",tpl);
        var fetched = svc.GetTemplate("u1","A");

        Assert.NotNull(fetched);
        Assert.Equal("{{label}}", fetched!.Elements[0].Text);
        Assert.Null(svc.GetTemplate("u2","A"));
    }
}
