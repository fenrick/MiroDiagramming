namespace Fenrick.Miro.Tests;
#nullable enable
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Threading.Tasks;
using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;
using Xunit;

public class ShapeQueueProcessorTests
{
    [Fact]
    public async Task ConcurrentProcessCallsAreSerialised()
    {
        var client = new StubClient();
        var proc = new ShapeQueueProcessor(client);
        proc.EnqueueCreate(
        [
            new ShapeData("r", 0, 0, 1, 1, null, null, null)
        ]);
        var t1 = proc.ProcessAsync();
        var t2 = proc.ProcessAsync();

        await Task.WhenAll(t1, t2);

        Assert.Equal(1, client.Count);
    }

    [Fact]
    public async Task ProcessAsyncPostsSequentialBatches()
    {
        var client = new StubClient();
        var proc = new ShapeQueueProcessor(client) { BatchSize = 20 };
        var shapes = new List<ShapeData>();
        for (var i = 0; i < 25; i++)
        {
            shapes.Add(new ShapeData("r", 0, 0, 1, 1, null, null, null));
        }

        proc.EnqueueCreate(shapes);

        var responses = await proc.ProcessAsync();

        Assert.Equal(25, client.Count);
        Assert.Equal(25, responses.Count);
    }

    [Fact]
    public async Task DisposePreventsProcessing()
    {
        var client = new StubClient();
        var proc = new ShapeQueueProcessor(client);
        proc.EnqueueCreate([ new ShapeData("r", 0, 0, 1, 1, null, null, null) ]);

        proc.Dispose();

        await Assert.ThrowsAsync<ObjectDisposedException>(() => proc.ProcessAsync());
    }

    // TODO expand tests to cover modify and delete queues once implemented in
    // ShapeQueueProcessor.
    // TODO add tests for queue persistence once the processor writes to a durable store.
    private sealed class StubClient : IMiroClient
    {
        public int Count { get; private set; }

        public Task<MiroResponse> SendAsync(MiroRequest request)
        {
            this.Count++;
            return Task.FromResult(
                new MiroResponse(
                    201,
                    this.Count.ToString(CultureInfo.InvariantCulture)));
        }
    }
}
