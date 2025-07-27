using System;
using System.Threading.Tasks;
using Fenrick.Miro.Server.Data;
using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;

public class EfUserStoreTests
{
    [Fact]
    public void MissingUserReturnsNull()
    {
        var options = new DbContextOptionsBuilder<MiroDbContext>()
            .UseInMemoryDatabase("test1")
            .Options;
        using var context = new MiroDbContext(options);
        var store = new EfUserStore(context);

        Assert.Null(store.Retrieve("none"));
    }

    [Fact]
    public void StoreAndRetrieveUser()
    {
        var options = new DbContextOptionsBuilder<MiroDbContext>()
            .UseInMemoryDatabase("test2")
            .Options;
        using var context = new MiroDbContext(options);
        var store = new EfUserStore(context);
        var info = new UserInfo("u1", "Bob", "t1");

        store.Store(info);

        Assert.Equal("t1", store.Retrieve("u1")?.Token);
    }

    [Fact]
    public void StoreUpdatesExistingUser()
    {
        var options = new DbContextOptionsBuilder<MiroDbContext>()
            .UseInMemoryDatabase("test_update")
            .Options;
        using var context = new MiroDbContext(options);
        var store = new EfUserStore(context);
        var info = new UserInfo("u1", "Bob", "t1");
        store.Store(info);

        store.Store(new UserInfo("u1", "Bob", "t2"));

        Assert.Equal("t2", store.Retrieve("u1")?.Token);
    }

    [Fact]
    public void DeleteRemovesUser()
    {
        var options = new DbContextOptionsBuilder<MiroDbContext>()
            .UseInMemoryDatabase("test_delete")
            .Options;
        using var context = new MiroDbContext(options);
        var store = new EfUserStore(context);
        store.Store(new UserInfo("u1", "Bob", "t1"));

        store.Delete("u1");

        Assert.Null(store.Retrieve("u1"));
    }

    [Fact]
    public void RetrieveThrowsForInvalidId()
    {
        var options = new DbContextOptionsBuilder<MiroDbContext>()
            .UseInMemoryDatabase("test_invalid")
            .Options;
        using var context = new MiroDbContext(options);
        var store = new EfUserStore(context);

        Assert.Throws<ArgumentException>(() => store.Retrieve(""));
    }

    [Fact]
    public void DeleteThrowsForInvalidId()
    {
        var options = new DbContextOptionsBuilder<MiroDbContext>()
            .UseInMemoryDatabase("test_invalid_del")
            .Options;
        using var context = new MiroDbContext(options);
        var store = new EfUserStore(context);

        Assert.Throws<ArgumentException>(() => store.Delete(" "));
    }

    [Fact]
    public async Task AsyncMethodsWork()
    {
        var options = new DbContextOptionsBuilder<MiroDbContext>()
            .UseInMemoryDatabase("test_async")
            .Options;
        await using var context = new MiroDbContext(options);
        var store = new EfUserStore(context);
        var info = new UserInfo("u1", "Bob", "t1");

        await store.StoreAsync(info);
        var fetched = await store.RetrieveAsync("u1");
        Assert.Equal("t1", fetched?.Token);

        await store.DeleteAsync("u1");
        Assert.Null(await store.RetrieveAsync("u1"));
    }
}
