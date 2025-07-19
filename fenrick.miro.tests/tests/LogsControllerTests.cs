using System;
using System.Collections.Generic;
using Fenrick.Miro.Server.Api;
using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace Fenrick.Miro.Tests;

public class LogsControllerTests
{
    [Fact]
    public void Capture_ForwardsEntriesToSink()
    {
        var received = new List<ClientLogEntry>();
        var sink = new StubSink(entries => received.AddRange(entries));
        var controller = new LogsController(sink);
        var payload = new[] { new ClientLogEntry(DateTime.UtcNow, "info", "msg", null) };

        var result = controller.Capture(payload);

        Assert.IsType<AcceptedResult>(result);
        Assert.Single(received);
    }

    private sealed class StubSink : ILogSink
    {
        private readonly Action<IEnumerable<ClientLogEntry>> _cb;
        public StubSink(Action<IEnumerable<ClientLogEntry>> cb) => _cb = cb;
        public void Store(IEnumerable<ClientLogEntry> entries) => _cb(entries);
    }
}
