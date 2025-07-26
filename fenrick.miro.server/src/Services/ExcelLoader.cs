namespace Fenrick.Miro.Server.Services;

using ClosedXML.Excel;

/// <summary>
///     Lightweight Excel workbook loader built around ClosedXML.
/// </summary>

// TODO: add streaming for large files
public class ExcelLoader : IDisposable
{
    private bool disposed;

    private XLWorkbook? workbook;

    /// <inheritdoc />
    public void Dispose()
    {
        this.Dispose(true);
        GC.SuppressFinalize(this);
    }

    /// <summary>
    ///     List worksheet names from the loaded workbook.
    /// </summary>
    public IReadOnlyList<string> ListSheets() =>
        this.workbook?.Worksheets.Select(ws => ws.Name).ToList()
        ?? [];

    public IReadOnlyList<string> ListNamedTables() =>
        this.workbook?.DefinedNames.Select(n => n.Name).ToList() ?? [];

    /// <summary>
    ///     Load a workbook from a stream.
    /// </summary>
    /// <param name="stream">Stream containing the workbook data.</param>
    /// <remarks>Currently loads the entire workbook into memory.</remarks>
    public async Task LoadAsync(Stream stream)
    {
        this.workbook = new XLWorkbook(stream);
        await Task.CompletedTask;
    }


    /// <summary>
    ///     Load rows from a worksheet by name.
    /// </summary>
    /// <param name="name">Worksheet name.</param>
    /// <returns>Row objects keyed by column header.</returns>
    /// <exception cref="InvalidOperationException">
    ///     Thrown if <see cref="LoadAsync" />
    ///     was not called.
    /// </exception>
    /// <exception cref="ArgumentException">Thrown when the sheet does not exist.</exception>
    public IReadOnlyList<Dictionary<string, string>> LoadSheet(string name)
    {
        if (this.workbook is null)
        {
            throw new InvalidOperationException("Workbook not loaded");
        }

        var ws = this.workbook.Worksheet(name)
                 ?? throw new ArgumentException($"Unknown sheet: {name}");

        var headers = ws.Row(1).Cells().Select(c => c.GetString())
            .ToList();
        var rows = new List<Dictionary<string, string>>();
        foreach (var row in ws.RowsUsed().Skip(1))
        {
            var obj = new Dictionary<string, string>();
            for (var i = 0; i < headers.Count; i++)
            {
                obj[headers[i]] = row.Cell(i + 1).GetString();
            }

            rows.Add(obj);
        }

        return rows;
    }

    public IReadOnlyList<Dictionary<string, string>> LoadNamedTable(string name)
    {
        if (this.workbook is null)
        {
            throw new InvalidOperationException("Workbook not loaded");
        }

        if (!this.workbook.DefinedNames.TryGetValue(name, out var def)
            || def.Ranges.Count == 0)
        {
            throw new ArgumentException($"Unknown table: {name}");
        }

        var range = def.Ranges.First();
        if (range.Worksheet is null)
        {
            throw new ArgumentException($"Missing sheet for table: {name}");
        }

        var headers = range.FirstRow().Cells().Select(c => c.GetString()).ToList();
        var rows = new List<Dictionary<string, string>>();
        foreach (var row in range.Rows().Skip(1))
        {
            var obj = new Dictionary<string, string>();
            for (var i = 0; i < headers.Count; i++)
            {
                obj[headers[i]] = row.Cell(i + 1).GetString();
            }

            rows.Add(obj);
        }

        return rows;
    }

    /// <summary>
    ///     Release workbook resources.
    /// </summary>
    /// <param name="disposing">Indicates whether called from <see cref="Dispose" />.</param>
    protected virtual void Dispose(bool disposing)
    {
        if (!this.disposed)
        {
            if (disposing)
            {
                this.workbook?.Dispose();
            }

            this.disposed = true;
        }
    }
}
