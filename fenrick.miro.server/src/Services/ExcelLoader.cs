namespace Fenrick.Miro.Server.Services;

using System.Globalization;
using ClosedXML.Excel;
using Fenrick.Miro.Server.Resources;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;

/// <summary>
///     Lightweight Excel workbook loader built around ClosedXML.
/// </summary>

// TODO: add streaming for large files
// Added StreamSheetAsync and StreamNamedTableAsync for row-by-row processing
public class ExcelLoader(ILogger<ExcelLoader>? log = null) : IDisposable
{
    private readonly ILogger<ExcelLoader> logger = log ?? NullLogger<ExcelLoader>.Instance;

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
    public IReadOnlyList<string> ListSheets()
    {
        this.logger.LogTrace(LogMessages.ListingSheets);
        return this.workbook?.Worksheets.Select(ws => ws.Name).ToList() ?? [];
    }

    public IReadOnlyList<string> ListNamedTables()
    {
        this.logger.LogTrace(LogMessages.ListingTables);
        return this.workbook?.DefinedNames.Select(n => n.Name).ToList() ?? [];
    }

    /// <summary>
    ///     Load a workbook from a stream.
    /// </summary>
    /// <param name="stream">Stream containing the workbook data.</param>
    /// <remarks>Currently loads the entire workbook into memory.</remarks>
    public async Task LoadAsync(Stream stream)
    {
        this.logger.LogDebug(LogMessages.LoadingWorkbook);
        try
        {
            this.workbook = new XLWorkbook(stream);
            this.logger.LogDebug(LogMessages.WorkbookLoaded, this.workbook.Worksheets.Count);
            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            this.logger.LogError(ex, LogMessages.WorkbookNotLoaded);
            throw;
        }
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
        this.logger.LogDebug(LogMessages.LoadingSheet, name);
        if (this.workbook is null)
        {
            var ex = new InvalidOperationException(LogMessages.WorkbookNotLoaded);
            this.logger.LogError(ex, LogMessages.WorkbookNotLoaded);
            throw ex;
        }

        var ws = this.workbook.Worksheet(name);
        if (ws is null)
        {
            var ex = new ArgumentException(string.Format(CultureInfo.InvariantCulture, LogMessages.UnknownSheet, name));
            this.logger.LogError(ex, LogMessages.UnknownSheet, name);
            throw ex;
        }

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

        this.logger.LogDebug("Loaded {Count} rows", rows.Count);
        return rows;
    }

    /// <summary>
    ///     Stream rows from a worksheet by name.
    /// </summary>
    /// <param name="name">Worksheet name.</param>
    /// <returns>An asynchronous sequence of row objects keyed by column header.</returns>
    /// <exception cref="InvalidOperationException">Thrown when no workbook is loaded.</exception>
    /// <exception cref="ArgumentException">Thrown when the sheet does not exist.</exception>
    public async IAsyncEnumerable<Dictionary<string, string>> StreamSheetAsync(string name)
    {
        this.logger.LogDebug(LogMessages.StreamingSheet, name);
        if (this.workbook is null)
        {
            var ex = new InvalidOperationException(LogMessages.WorkbookNotLoaded);
            this.logger.LogError(ex, LogMessages.WorkbookNotLoaded);
            throw ex;
        }

        var ws = this.workbook.Worksheet(name);
        if (ws is null)
        {
            var ex = new ArgumentException(string.Format(CultureInfo.InvariantCulture, LogMessages.UnknownSheet, name));
            this.logger.LogError(ex, LogMessages.UnknownSheet, name);
            throw ex;
        }

        var headers = ws.Row(1).Cells().Select(c => c.GetString()).ToList();
        foreach (var row in ws.RowsUsed().Skip(1))
        {
            var obj = new Dictionary<string, string>();
            for (var i = 0; i < headers.Count; i++)
            {
                obj[headers[i]] = row.Cell(i + 1).GetString();
            }

            yield return obj;
            await Task.Yield();
        }
    }

    /// <summary>
    ///     Stream rows from a named table.
    /// </summary>
    /// <param name="name">Named table identifier.</param>
    /// <returns>An asynchronous sequence of row objects keyed by column header.</returns>
    /// <exception cref="InvalidOperationException">Thrown when no workbook is loaded.</exception>
    /// <exception cref="ArgumentException">Thrown when the table or sheet is missing.</exception>
    public async IAsyncEnumerable<Dictionary<string, string>> StreamNamedTableAsync(string name)
    {
        this.logger.LogDebug(LogMessages.StreamingTable, name);
        if (this.workbook is null)
        {
            var ex = new InvalidOperationException(LogMessages.WorkbookNotLoaded);
            this.logger.LogError(ex, LogMessages.WorkbookNotLoaded);
            throw ex;
        }

        if (!this.workbook.DefinedNames.TryGetValue(name, out var def) || def.Ranges.Count == 0)
        {
            var ex = new ArgumentException(string.Format(CultureInfo.InvariantCulture, LogMessages.UnknownTable, name));
            this.logger.LogError(ex, LogMessages.UnknownTable, name);
            throw ex;
        }

        var range = def.Ranges.First();
        if (range.Worksheet is null)
        {
            var ex = new ArgumentException(string.Format(CultureInfo.InvariantCulture, LogMessages.MissingSheetForTable, name));
            this.logger.LogError(ex, LogMessages.MissingSheetForTable, name);
            throw ex;
        }

        var headers = range.FirstRow().Cells().Select(c => c.GetString()).ToList();
        foreach (var row in range.Rows().Skip(1))
        {
            var obj = new Dictionary<string, string>();
            for (var i = 0; i < headers.Count; i++)
            {
                obj[headers[i]] = row.Cell(i + 1).GetString();
            }

            yield return obj;
            await Task.Yield();
        }
    }

    public IReadOnlyList<Dictionary<string, string>> LoadNamedTable(string name)
    {
        this.logger.LogDebug(LogMessages.LoadingTable, name);
        if (this.workbook is null)
        {
            var ex = new InvalidOperationException(LogMessages.WorkbookNotLoaded);
            this.logger.LogError(ex, LogMessages.WorkbookNotLoaded);
            throw ex;
        }

        if (!this.workbook.DefinedNames.TryGetValue(name, out var def)
            || def.Ranges.Count == 0)
        {
            var ex = new ArgumentException(string.Format(CultureInfo.InvariantCulture, LogMessages.UnknownTable, name));
            this.logger.LogError(ex, LogMessages.UnknownTable, name);
            throw ex;
        }

        var range = def.Ranges.First();
        if (range.Worksheet is null)
        {
            var ex = new ArgumentException(string.Format(CultureInfo.InvariantCulture, LogMessages.MissingSheetForTable, name));
            this.logger.LogError(ex, LogMessages.MissingSheetForTable, name);
            throw ex;
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

        this.logger.LogDebug("Loaded {Count} rows", rows.Count);
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
                this.logger.LogTrace(LogMessages.DisposingWorkbook);
                this.workbook?.Dispose();
            }

            this.disposed = true;
        }
    }
}
