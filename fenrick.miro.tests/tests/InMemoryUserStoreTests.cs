namespace Fenrick.Miro.Tests;

using System;
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

    [Fact]
    public void StoreUpdatesExistingUser()
    {
        var store = new InMemoryUserStore();
        var info = new UserInfo("u1", "Bob", "t1");
        store.Store(info);

        store.Store(new UserInfo("u1", "Bob", "t2"));

        Assert.Equal("t2", store.Retrieve("u1")?.Token);
    }

    [Fact]
    public void DeleteRemovesUser()
    {
        var store = new InMemoryUserStore();
        store.Store(new UserInfo("u1", "Bob", "t1"));

        store.Delete("u1");

        Assert.Null(store.Retrieve("u1"));
    }

    [Fact]
    public void RetrieveThrowsForInvalidId()
    {
        var store = new InMemoryUserStore();

        Assert.Throws<ArgumentException>(() => store.Retrieve(""));
    }

    [Fact]
    public void DeleteThrowsForInvalidId()
    {
        var store = new InMemoryUserStore();

        Assert.Throws<ArgumentException>(() => store.Delete(" "));
    }
}
