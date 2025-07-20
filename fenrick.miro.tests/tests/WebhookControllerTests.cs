#nullable enable

namespace Fenrick.Miro.Tests;

using System;
using Microsoft.AspNetCore.Mvc;
using Server.Api;
using Server.Domain;
using Xunit;

public class WebhookControllerTests
{
    [Fact]
    public void HandleEnqueuesEvent()
    {
        WebhookEvent? received = null;
        var queue = new StubQueue(evt => received = evt);
        var controller = new WebhookController(queue);
        var evt = new WebhookEvent("created", "b1");

        var result = controller.Handle(evt);

        Assert.IsType<AcceptedResult>(result);
        Assert.Equal("b1", received?.BoardId);
    }

    private sealed class StubQueue(Action<WebhookEvent> enqueue) : IEventQueue
    {
        private readonly Action<WebhookEvent> _enqueue = enqueue;

        public void Enqueue(WebhookEvent evt) => this._enqueue(evt);
    }
}
