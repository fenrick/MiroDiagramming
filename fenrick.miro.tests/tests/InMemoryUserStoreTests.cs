namespace Fenrick.Miro.Tests;

using System;
using System.Threading.Tasks;

using Server.Domain;
using Server.Services;

using Xunit;

public class InMemoryUserStoreTests
{
    [Fact]
    public void MissingUserReturnsNull()
    {
        var store = new InMemoryUserStore();

        Assert.Null(store.Retrieve($"none"));
    }

    [Fact]
    public void StoreAndRetrieveUser()
    {
        var store = new InMemoryUserStore();
        var info = new UserInfo($"u1", $"Bob", $"t1");
        store.Store(info);

        Assert.Equal($"t1", store.Retrieve($"u1")?.Token);
    }

    [Fact]
    public void StoreUpdatesExistingUser()
    {
        var store = new InMemoryUserStore();
        var info = new UserInfo($"u1", $"Bob", $"t1");
        store.Store(info);

        store.Store(new UserInfo($"u1", $"Bob", $"t2"));

        Assert.Equal($"t2", store.Retrieve($"u1")?.Token);
    }

    [Fact]
    public void DeleteRemovesUser()
    {
        var store = new InMemoryUserStore();
        store.Store(new UserInfo($"u1", $"Bob", $"t1"));

        store.Delete($"u1");

        Assert.Null(store.Retrieve($"u1"));
    }

    [Fact]
    public void RetrieveThrowsForInvalidId()
    {
        var store = new InMemoryUserStore();

        Assert.Throws<ArgumentException>(() => store.Retrieve($""));
    }

    [Fact]
    public void DeleteThrowsForInvalidId()
    {
        var store = new InMemoryUserStore();

        Assert.Throws<ArgumentException>(() => store.Delete($" "));
    }

    [Fact]
    public async Task AsyncMethodsWorkAsync()
    {
        var store = new InMemoryUserStore();
        var info = new UserInfo($"u1", $"Bob", $"t1");
        await store.StoreAsync(info).ConfigureAwait(false);

        UserInfo? fetched = await store.RetrieveAsync($"u1").ConfigureAwait(false);
        Assert.Equal($"t1", fetched?.Token);

        await store.DeleteAsync($"u1").ConfigureAwait(false);

        Assert.Null(await store.RetrieveAsync($"u1").ConfigureAwait(false));
    }
}
