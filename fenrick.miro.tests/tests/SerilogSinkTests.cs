namespace Fenrick.Miro.Tests;

using System;
using System.Collections.Generic;

using Serilog;
using Serilog.Core;
using Serilog.Events;

using Server.Domain;
using Server.Services;

using Xunit;

public class SerilogSinkTests
{
    /// <summary>
    ///     The sink should enrich log events with custom properties so the server
    ///     can filter on the log level and source.
    /// </summary>
    [Fact]
    public void StoreAddsContextProperties()
    {
        var events = new List<LogEvent>();
        Logger logger = new LoggerConfiguration()
            .MinimumLevel.Verbose()
            .WriteTo.Sink(new DelegatingSink(events.Add)).CreateLogger();
        var sink = new SerilogSink(logger);

        var entry = new ClientLogEntry(
            DateTime.UnixEpoch,
            "warn",
            "hello",
            Context: null);
        sink.Store([entry]);

        LogEvent log = events[0];
        Assert.Equal("Client", log.Properties["Source"].ToString().Trim('"'));
        Assert.Equal("warn", log.Properties["Level"].ToString().Trim('"'));
    }

    [Fact]
    public void StoreWritesEntriesToLogger()
    {
        var events = new List<LogEvent>();
        Logger logger = new LoggerConfiguration().WriteTo
            .Sink(new DelegatingSink(events.Add)).CreateLogger();
        var sink = new SerilogSink(logger);

        var entry = new ClientLogEntry(
            DateTime.UnixEpoch,
            "info",
            "hello",
            Context: null);
        sink.Store([entry]);

        Assert.Single(events);
        var message = events[0].Properties["Message"].ToString().Trim('"');
        Assert.Equal("hello", message);
    }

    [Theory]
    [InlineData("info", LogEventLevel.Information)]
    [InlineData("warn", LogEventLevel.Warning)]
    [InlineData("error", LogEventLevel.Error)]
    [InlineData("fatal", LogEventLevel.Fatal)]
    public void StoreUsesCorrectLogLevel(string level, LogEventLevel expected)
    {
        var events = new List<LogEvent>();
        Logger logger = new LoggerConfiguration()
            .MinimumLevel.Verbose()
            .WriteTo.Sink(new DelegatingSink(events.Add)).CreateLogger();
        var sink = new SerilogSink(logger);

        var entry = new ClientLogEntry(
            DateTime.UnixEpoch,
            level,
            "hello",
            Context: null);
        sink.Store([entry]);

        LogEvent log = Assert.Single(events);
        Assert.Equal(expected, log.Level);
    }

    private sealed class DelegatingSink(Action<LogEvent> write) : ILogEventSink
    {
        private readonly Action<LogEvent> writeAction = write;

        public void Emit(LogEvent logEvent) => this.writeAction(logEvent);
    }
}
