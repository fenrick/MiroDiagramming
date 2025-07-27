using System;
using Fenrick.Miro.Server.Data;
using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;

public class EfTemplateStoreTests
{
    [Fact]
    public void MissingTemplateReturnsNull()
    {
        var options = new DbContextOptionsBuilder<MiroDbContext>()
            .UseInMemoryDatabase("tpl1")
            .Options;
        using var db = new MiroDbContext(options);
        var store = new EfTemplateStore(db);

        Assert.Null(store.GetTemplate("u1", "none"));
    }

    [Fact]
    public void StoreAndRetrieveTemplate()
    {
        var options = new DbContextOptionsBuilder<MiroDbContext>()
            .UseInMemoryDatabase("tpl2")
            .Options;
        using var db = new MiroDbContext(options);
        var store = new EfTemplateStore(db);
        var tpl = new TemplateDefinition(
            [new TemplateElement("r", 100, 60, "t")]);

        store.SetTemplate("u1", "A", tpl);

        var result = store.GetTemplate("u1", "A");
        Assert.NotNull(result);
        Assert.Equal("t", result!.Elements[0].Text);
    }

    [Fact]
    public void UpdatesExistingTemplate()
    {
        var options = new DbContextOptionsBuilder<MiroDbContext>()
            .UseInMemoryDatabase("tpl_update")
            .Options;
        using var db = new MiroDbContext(options);
        var store = new EfTemplateStore(db);
        var tpl = new TemplateDefinition([new TemplateElement("r", 10, 10, "t1")]);

        store.SetTemplate("u1", "A", tpl);
        store.SetTemplate("u1", "A", new TemplateDefinition([new TemplateElement("r", 10, 10, "t2")]));

        Assert.Equal("t2", store.GetTemplate("u1", "A")!.Elements[0].Text);
    }

    [Fact]
    public void GetTemplateThrowsForInvalidArgs()
    {
        var options = new DbContextOptionsBuilder<MiroDbContext>()
            .UseInMemoryDatabase("tpl_invalid")
            .Options;
        using var db = new MiroDbContext(options);
        var store = new EfTemplateStore(db);

        Assert.Throws<ArgumentException>(() => store.GetTemplate("", "n"));
        Assert.Throws<ArgumentException>(() => store.GetTemplate("u", " "));
    }
}
