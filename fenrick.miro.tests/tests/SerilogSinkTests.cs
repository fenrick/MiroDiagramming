using System;
using System.Collections.Generic;
using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;
using Serilog;
using Serilog.Core;
using Serilog.Events;
using Xunit;

namespace Fenrick.Miro.Tests;

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

    /// <summary>
    /// The sink should enrich log events with custom properties so the server
    /// can filter on the log level and source.
    /// </summary>
    [Fact]
    public void Store_AddsContextProperties()
    {
        var events = new List<LogEvent>();
        var logger = new LoggerConfiguration()
            .WriteTo.Sink(new DelegatingSink(e => events.Add(e)))
            .CreateLogger();
        var sink = new SerilogSink(logger);

        var entry = new ClientLogEntry(DateTime.UnixEpoch, "warn", "hello", null);
        sink.Store(new[] { entry });

        var log = events[0];
        Assert.Equal("Client", log.Properties["Source"].ToString().Trim('"'));
        Assert.Equal("warn", log.Properties["Level"].ToString().Trim('"'));
    }

    private sealed class DelegatingSink : ILogEventSink
    {
        private readonly Action<LogEvent> _write;
        public DelegatingSink(Action<LogEvent> write) => _write = write;
        public void Emit(LogEvent logEvent) => _write(logEvent);
    }
}
