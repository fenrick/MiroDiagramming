namespace Fenrick.Miro.Tests;
using System;
using System.Collections.Generic;
using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;
using Serilog;
using Serilog.Core;
using Serilog.Events;
using Xunit;

public class SerilogSinkTests
{
    [Fact]
    public void StoreWritesEntriesToLogger()
    {
        var events = new List<LogEvent>();
        var logger = new LoggerConfiguration()
            .WriteTo.Sink(new DelegatingSink(events.Add))
            .CreateLogger();
        var sink = new SerilogSink(logger);

        var entry = new ClientLogEntry(DateTime.UnixEpoch, "info", "hello", null);
        sink.Store([entry]);

        Assert.Single(events);
        var message = events[0].Properties["Message"].ToString().Trim('"');
        Assert.Equal("hello", message);
    }

    /// <summary>
    /// The sink should enrich log events with custom properties so the server
    /// can filter on the log level and source.
    /// </summary>
    [Fact]
    public void StoreAddsContextProperties()
    {
        var events = new List<LogEvent>();
        var logger = new LoggerConfiguration()
            .WriteTo.Sink(new DelegatingSink(events.Add))
            .CreateLogger();
        var sink = new SerilogSink(logger);

        var entry = new ClientLogEntry(DateTime.UnixEpoch, "warn", "hello", null);
        sink.Store([entry]);

        var log = events[0];
        Assert.Equal("Client", log.Properties["Source"].ToString().Trim('"'));
        Assert.Equal("warn", log.Properties["Level"].ToString().Trim('"'));
    }

    private sealed class DelegatingSink(Action<LogEvent> write) : ILogEventSink
    {
        private readonly Action<LogEvent> _write = write;

        public void Emit(LogEvent logEvent) => this._write(logEvent);
    }
}
