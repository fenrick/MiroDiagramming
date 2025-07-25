using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;
using Fenrick.Miro.Server.Data;
using Microsoft.EntityFrameworkCore;
using Xunit;

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
}
