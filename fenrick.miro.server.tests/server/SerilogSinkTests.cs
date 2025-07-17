using System;
using System.Collections.Generic;
using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;
using Serilog;
using Serilog.Core;
using Serilog.Events;
using Xunit;

namespace Fenrick.Miro.Server.Tests;

public class SerilogSinkTests
{
    [Fact]
    public void Store_WritesEntriesToLogger()
    {
        var events = new List<LogEvent>();
        var logger = new LoggerConfiguration()
            .WriteTo.Sink(new DelegatingSink(e => events.Add(e)))
            .CreateLogger();
        var sink = new SerilogSink(logger);

        var entry = new ClientLogEntry(DateTime.UnixEpoch, "info", "hello", null);
        sink.Store(new[] { entry });

        Assert.Single(events);
        var message = events[0].Properties["Message"].ToString().Trim('"');
        Assert.Equal("hello", message);
    }

    private sealed class DelegatingSink : ILogEventSink
    {
        private readonly Action<LogEvent> _write;
        public DelegatingSink(Action<LogEvent> write) => _write = write;
        public void Emit(LogEvent logEvent) => _write(logEvent);
    }
}
