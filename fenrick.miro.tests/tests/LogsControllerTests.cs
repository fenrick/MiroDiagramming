namespace Fenrick.Miro.Tests;
using System;
using System.Collections.Generic;
using Fenrick.Miro.Server.Api;
using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Xunit;

public class LogsControllerTests
{
    [Fact]
    public void CaptureForwardsEntriesToSink()
    {
        var received = new List<ClientLogEntry>();
        var sink = new StubSink(received.AddRange);
        var controller = new LogsController(sink);
        var payload = new[] { new ClientLogEntry(DateTime.UtcNow, "info", "msg", null) };

        var result = controller.Capture(payload);

        Assert.IsType<AcceptedResult>(result);
        Assert.Single(received);
    }

    private sealed class StubSink(Action<IEnumerable<ClientLogEntry>> cb) : ILogSink
    {
        private readonly Action<IEnumerable<ClientLogEntry>> _cb = cb;

        public void Store(IEnumerable<ClientLogEntry> entries) => this._cb(entries);
    }
}
