using System;
using Fenrick.Miro.Server.Api;
using Fenrick.Miro.Api;
using Microsoft.AspNetCore.Mvc;
using Xunit;

#nullable enable

namespace Fenrick.Miro.Server.Tests;

public class WebhookControllerTests
{
    [Fact]
    public void Handle_EnqueuesEvent()
    {
        WebhookEvent? received = null;
        var queue = new StubQueue(evt => received = evt);
        var controller = new WebhookController(queue);
        var evt = new WebhookEvent("created", "b1");

        var result = controller.Handle(evt);

        Assert.IsType<AcceptedResult>(result);
        Assert.Equal("b1", received?.BoardId);
    }

    private sealed class StubQueue : IEventQueue
    {
        private readonly Action<WebhookEvent> _enqueue;
        public StubQueue(Action<WebhookEvent> enqueue) => _enqueue = enqueue;
        public void Enqueue(WebhookEvent evt) => _enqueue(evt);
    }
}
