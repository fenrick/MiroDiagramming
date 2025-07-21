namespace Fenrick.Miro.Server.Services;

using Domain;

/// <summary>
///     Processes shape creation requests sequentially.
///     TODO: integrate modify and delete queues with board cache checks.
/// </summary>
public sealed class ShapeQueueProcessor(IMiroClient client) : IDisposable
{
    private readonly Queue<ShapeData> createQueue = new();
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
