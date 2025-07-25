namespace Fenrick.Miro.Tests;

using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;
using Xunit;

public class InMemoryUserStoreTests
{
    [Fact]
    public void MissingUserReturnsNull()
    {
        var store = new InMemoryUserStore();

        Assert.Null(store.Retrieve("none"));
    }

    [Fact]
    public void StoreAndRetrieveUser()
    {
        var store = new InMemoryUserStore();
        var info = new UserInfo("u1", "Bob", "t1");
        store.Store(info);

        Assert.Equal("t1", store.Retrieve("u1")?.Token);
    }
}
