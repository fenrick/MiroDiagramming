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
        var sink = new StubSink(evt => received = evt);
        var controller = new WebhookController(sink);
        var evt = new WebhookEvent("created", "b1");

        var result = controller.Handle(evt);

        Assert.IsType<AcceptedResult>(result);
        Assert.Equal("b1", received?.BoardId);
    }

    private sealed class StubSink(Action<WebhookEvent> enqueue) : IEventSink
    {
        private readonly Action<WebhookEvent> enqueueAction = enqueue;

        public void Enqueue(WebhookEvent evt) => this.enqueueAction(evt);
    }
}
