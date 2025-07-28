namespace Fenrick.Miro.Tests;

using System;
using System.Threading.Tasks;

using Server.Data;
using Server.Domain;
using Server.Services;

public class EfUserStoreTests
{
    [Fact]
    public void MissingUserReturnsNull()
    {
        DbContextOptions<MiroDbContext> options =
            new DbContextOptionsBuilder<MiroDbContext>()
                .UseInMemoryDatabase($"test1")
                .Options;
        using var context = new MiroDbContext(options);
        var store = new EfUserStore(context);

        Assert.Null(store.Retrieve($"none"));
    }

    [Fact]
    public void StoreAndRetrieveUser()
    {
        DbContextOptions<MiroDbContext> options =
            new DbContextOptionsBuilder<MiroDbContext>()
                .UseInMemoryDatabase($"test2")
                .Options;
        using var context = new MiroDbContext(options);
        var store = new EfUserStore(context);
        var info = new UserInfo($"u1", $"Bob", $"t1");

        store.Store(info);

        Assert.Equal($"t1", store.Retrieve($"u1")?.Token);
    }

    [Fact]
    public void StoreUpdatesExistingUser()
    {
        DbContextOptions<MiroDbContext> options =
            new DbContextOptionsBuilder<MiroDbContext>()
                .UseInMemoryDatabase($"test_update")
                .Options;
        using var context = new MiroDbContext(options);
        var store = new EfUserStore(context);
        var info = new UserInfo($"u1", $"Bob", $"t1");
        store.Store(info);

        store.Store(new UserInfo($"u1", $"Bob", $"t2"));

        Assert.Equal($"t2", store.Retrieve($"u1")?.Token);
    }

    [Fact]
    public void DeleteRemovesUser()
    {
        DbContextOptions<MiroDbContext> options =
            new DbContextOptionsBuilder<MiroDbContext>()
                .UseInMemoryDatabase($"test_delete")
                .Options;
        using var context = new MiroDbContext(options);
        var store = new EfUserStore(context);
        store.Store(new UserInfo($"u1", $"Bob", $"t1"));

        store.Delete($"u1");

        Assert.Null(store.Retrieve($"u1"));
    }

    [Fact]
    public void RetrieveThrowsForInvalidId()
    {
        DbContextOptions<MiroDbContext> options =
            new DbContextOptionsBuilder<MiroDbContext>()
                .UseInMemoryDatabase($"test_invalid")
                .Options;
        using var context = new MiroDbContext(options);
        var store = new EfUserStore(context);

        Assert.Throws<ArgumentException>(() => store.Retrieve($""));
    }

    [Fact]
    public void DeleteThrowsForInvalidId()
    {
        DbContextOptions<MiroDbContext> options =
            new DbContextOptionsBuilder<MiroDbContext>()
                .UseInMemoryDatabase($"test_invalid_del")
                .Options;
        using var context = new MiroDbContext(options);
        var store = new EfUserStore(context);

        Assert.Throws<ArgumentException>(() => store.Delete($" "));
    }

    [Fact]
    public async Task AsyncMethodsWorkAsync()
    {
        DbContextOptions<MiroDbContext> options =
            new DbContextOptionsBuilder<MiroDbContext>()
                .UseInMemoryDatabase($"test_async")
                .Options;
        var context = new MiroDbContext(options);
        var store = new EfUserStore(context);
        var info = new UserInfo($"u1", $"Bob", $"t1");

        await store.StoreAsync(info).ConfigureAwait(false);
        UserInfo fetched = await store.RetrieveAsync($"u1").ConfigureAwait(false);
        Assert.Equal($"t1", fetched?.Token);

        await store.DeleteAsync($"u1").ConfigureAwait(false);
        Assert.Null(await store.RetrieveAsync($"u1").ConfigureAwait(false));

        await context.DisposeAsync().ConfigureAwait(false);
    }
}
