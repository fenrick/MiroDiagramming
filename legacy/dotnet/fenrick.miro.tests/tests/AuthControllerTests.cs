namespace Fenrick.Miro.Tests;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Mvc;

using Server.Api;
using Server.Domain;
using Server.Services;

using Xunit;

public class AuthControllerTests
{
    [Fact]
    public void GetStatusReturnsOkWhenUserPresent()
    {
        var store = new StubStore();
        store.Store(new UserInfo($"u1", $"n", $"a", $"r", DateTimeOffset.UtcNow));
        var controller = new AuthController(store);

        IActionResult result = controller.GetStatus($"u1");

        Assert.IsType<OkResult>(result);
    }

    [Fact]
    public void GetStatusReturnsNotFoundForMissingUser()
    {
        var controller = new AuthController(new StubStore());
        IActionResult result = controller.GetStatus($"u2");
        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public void GetStatusReturnsBadRequestWithoutHeader()
    {
        var controller = new AuthController(new StubStore());
        IActionResult result = controller.GetStatus(userId: null);
        Assert.IsType<BadRequestResult>(result);
    }

    private sealed class StubStore : IUserStore
    {
        private readonly Dictionary<string, UserInfo> users = [];

        public UserInfo? Retrieve(string userId) =>
            this.users.TryGetValue(userId, out UserInfo? u) ? u : null;

        public Task<UserInfo?> RetrieveAsync(string userId, CancellationToken ct = default) =>
            Task.FromResult(this.Retrieve(userId));

        public void Delete(string userId) => this.users.Remove(userId);

        public Task DeleteAsync(string userId, CancellationToken ct = default)
        {
            this.Delete(userId);
            return Task.CompletedTask;
        }

        public void Store(UserInfo info) => this.users[info.Id] = info;

        public Task StoreAsync(UserInfo info, CancellationToken ct = default)
        {
            this.Store(info);
            return Task.CompletedTask;
        }
    }
}
