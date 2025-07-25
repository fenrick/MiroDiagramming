namespace Fenrick.Miro.Server.Services;

using Domain;

/// <summary>
///     Processes shape creation requests sequentially.
///     TODO: manage modify/delete queues, persist them between restarts and
///     prioritise updates via cache checks.
///     TODO: integrate with ORM-backed store so queue state survives process
///     restarts and can be inspected for debugging.
/// </summary>
public sealed class ShapeQueueProcessor(IMiroClient client) : IDisposable
{
    private readonly Queue<ShapeData> createQueue = new();
    // TODO persist queue entries to survive restarts using a database or message
    //      broker and expose an ORM-based inspection API
    private readonly SemaphoreSlim gate = new(1, 1);
    private readonly IMiroClient miroClient = client;

    /// <summary>
    ///     Maximum number of shapes to send per API request.
    /// </summary>
    public int BatchSize { get; set; } = 20;

    public void Dispose() => throw new NotImplementedException();

    /// <summary>
    ///     Enqueue shapes to be created.
    /// </summary>
    public void EnqueueCreate(IEnumerable<ShapeData> shapes)
    {
        foreach (var shape in shapes)
        {
            this.createQueue.Enqueue(shape);
        }
    }

    /// <summary>
    ///     Process queued shapes one request at a time.
    /// </summary>
    public async Task<List<MiroResponse>> ProcessAsync(
        CancellationToken ct = default)
    {
        var results = new List<MiroResponse>();
        await this.gate.WaitAsync(ct);
        try
        {
            while (this.createQueue.Count > 0)
            {
                var batch = this.DequeueBatch(this.BatchSize).ToArray();
                // TODO validate shapes against board cache and prioritise modify operations
                var res = await this.miroClient.CreateAsync("/shapes", batch);
                results.AddRange(res);
            }
        }
        finally
        {
            this.gate.Release();
        }

        return results;
    }

    private IEnumerable<ShapeData> DequeueBatch(int size)
    {
        while (size-- > 0 && this.createQueue.Count > 0)
        {
            yield return this.createQueue.Dequeue();
        }
    }
}
