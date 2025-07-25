#nullable enable

namespace Fenrick.Miro.Tests;

using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Server.Api;
using Server.Domain;
using Server.Services;
using Xunit;

public class UsersControllerTests
{
    [Fact]
    public void RegisterStoresUser()
    {
        var received = new List<UserInfo>();
        var store = new StubStore(received.Add);
        var controller = new UsersController(store);
        var info = new UserInfo("u1", "Bob", "t1");

        var result = controller.Register(info);

        Assert.IsType<AcceptedResult>(result);
        Assert.Single(received);
        Assert.Equal("u1", received[0].Id);
    }

    private sealed class StubStore(Action<UserInfo> cb) : IUserStore
    {
        private readonly Action<UserInfo> callback = cb;

        public UserInfo? Retrieve(string userId) => null;

        public void Store(UserInfo info) => this.callback(info);

        public void Delete(string userId)
        {
        }
    }
}
