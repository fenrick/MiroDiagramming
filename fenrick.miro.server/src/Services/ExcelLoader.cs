namespace Fenrick.Miro.Server.Services;

using System.Globalization;
using System.Text;

using ClosedXML.Excel;

using Fenrick.Miro.Server.Resources;

using Microsoft.Extensions.Logging.Abstractions;

/// <summary>
///     Lightweight Excel workbook loader built around ClosedXML.
/// </summary>

public class ExcelLoader(ILogger<ExcelLoader>? log = null) : IDisposable
{
    private readonly ILogger<ExcelLoader> logger = log ?? NullLogger<ExcelLoader>.Instance;

    private bool disposed;

    private XLWorkbook? workbook;

    private static readonly CompositeFormat UnknownSheetFormat =
        CompositeFormat.Parse($"Unknown sheet: {0}");
    private static readonly CompositeFormat UnknownTableFormat =
        CompositeFormat.Parse($"Unknown table: {0}");
    private static readonly CompositeFormat MissingSheetForTableFormat =
        CompositeFormat.Parse($"Missing sheet for table: {0}");

    private static class Log
    {
        public static readonly Action<ILogger, Exception?> LoadingWorkbook =
            LoggerMessage.Define(LogLevel.Debug, new EventId(1, nameof(LoadAsync)), LogMessages.LoadingWorkbook);
        public static readonly Action<ILogger, int, Exception?> WorkbookLoaded =
            LoggerMessage.Define<int>(LogLevel.Debug, new EventId(2, nameof(LoadAsync)), LogMessages.WorkbookLoaded);
        public static readonly Action<ILogger, Exception?> ListingSheets =
            LoggerMessage.Define(LogLevel.Trace, new EventId(3, nameof(ListSheets)), LogMessages.ListingSheets);
        public static readonly Action<ILogger, Exception?> ListingTables =
            LoggerMessage.Define(LogLevel.Trace, new EventId(4, nameof(ListNamedTables)), LogMessages.ListingTables);
        public static readonly Action<ILogger, string, Exception?> LoadingSheet =
            LoggerMessage.Define<string>(LogLevel.Debug, new EventId(5, nameof(LoadSheet)), LogMessages.LoadingSheet);
        public static readonly Action<ILogger, int, Exception?> LoadedRows =
            LoggerMessage.Define<int>(LogLevel.Debug, new EventId(6, nameof(LoadSheet)), $"Loaded {RowCount} rows");
        public static readonly Action<ILogger, string, Exception?> StreamingSheet =
            LoggerMessage.Define<string>(LogLevel.Debug, new EventId(7, nameof(StreamSheetAsync)), LogMessages.StreamingSheet);
        public static readonly Action<ILogger, string, Exception?> StreamingTable =
            LoggerMessage.Define<string>(LogLevel.Debug, new EventId(8, nameof(StreamNamedTableAsync)), LogMessages.StreamingTable);
        public static readonly Action<ILogger, string, Exception?> LoadingTable =
            LoggerMessage.Define<string>(LogLevel.Debug, new EventId(9, nameof(LoadNamedTable)), LogMessages.LoadingTable);
        public static readonly Action<ILogger, Exception?> WorkbookNotLoaded =
            LoggerMessage.Define(LogLevel.Error, new EventId(10, nameof(ExcelLoader)), LogMessages.WorkbookNotLoaded);
        public static readonly Action<ILogger, string, Exception?> UnknownSheet =
            LoggerMessage.Define<string>(LogLevel.Error, new EventId(11, nameof(ExcelLoader)), LogMessages.UnknownSheet);
        public static readonly Action<ILogger, string, Exception?> UnknownTable =
            LoggerMessage.Define<string>(LogLevel.Error, new EventId(12, nameof(ExcelLoader)), LogMessages.UnknownTable);
        public static readonly Action<ILogger, string, Exception?> MissingSheetForTable =
            LoggerMessage.Define<string>(LogLevel.Error, new EventId(13, nameof(ExcelLoader)), LogMessages.MissingSheetForTable);
        public static readonly Action<ILogger, Exception?> DisposingWorkbook =
            LoggerMessage.Define(LogLevel.Trace, new EventId(14, nameof(Dispose)), LogMessages.DisposingWorkbook);
    }

    /// <inheritdoc />
    public void Dispose()
    {
        this.Dispose(disposing: true);
        GC.SuppressFinalize(this);
    }

    /// <summary>
    ///     List worksheet names from the loaded workbook.
    /// </summary>
    public IReadOnlyList<string> ListSheets()
    {
        Log.ListingSheets(this.logger, null);
        return this.workbook?.Worksheets.Select(ws => ws.Name).ToList() ?? [];
    }

    public IReadOnlyList<string> ListNamedTables()
    {
        Log.ListingTables(this.logger, null);
        return this.workbook?.DefinedNames.Select(n => n.Name).ToList() ?? [];
    }

    /// <summary>
    ///     Load a workbook from a stream.
    /// </summary>
    /// <param name="stream">Stream containing the workbook data.</param>
    /// <remarks>Currently loads the entire workbook into memory.</remarks>
    public async Task LoadAsync(Stream stream)
    {
        Log.LoadingWorkbook(this.logger, null);
        try
        {
            this.workbook = new XLWorkbook(stream);
            Log.WorkbookLoaded(this.logger, this.workbook.Worksheets.Count, null);
            await Task.CompletedTask.ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            Log.WorkbookNotLoaded(this.logger, ex);
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
        Log.LoadingSheet(this.logger, name, null);
        if (this.workbook is null)
        {
            var ex = new InvalidOperationException(LogMessages.WorkbookNotLoaded);
            Log.WorkbookNotLoaded(this.logger, ex);
            throw ex;
        }

        IXLWorksheet? ws = this.workbook.Worksheet(name);
        if (ws is null)
        {
            var ex = new ArgumentException(string.Format(CultureInfo.InvariantCulture, UnknownSheetFormat, name));
            Log.UnknownSheet(this.logger, name, ex);
            throw ex;
        }

        var headers = ws.Row(1).Cells().Select(c => c.GetString())
            .ToList();
        var rows = new List<Dictionary<string, string>>();
        foreach (IXLRow? row in ws.RowsUsed().Skip(1))
        {
            var obj = new Dictionary<string, string>(StringComparer.Ordinal);
            for (var i = 0; i < headers.Count; i++)
            {
                obj[headers[i]] = row.Cell(i + 1).GetString();
            }

            rows.Add(obj);
        }

        Log.LoadedRows(this.logger, rows.Count, null);
        return rows;
    }

    /// <summary>
    ///     Stream rows from a worksheet by name.
    /// </summary>
    /// <param name="name">Worksheet name.</param>
    /// <returns>An asynchronous sequence of row objects keyed by column header.</returns>
    /// <exception cref="InvalidOperationException">Thrown when no workbook is loaded.</exception>
    /// <exception cref="ArgumentException">Thrown when the sheet does not exist.</exception>
    public IAsyncEnumerable<Dictionary<string, string>> StreamSheetAsync(string name)
    {
        Log.StreamingSheet(this.logger, name, null);
        if (this.workbook is null)
        {
            var ex = new InvalidOperationException(LogMessages.WorkbookNotLoaded);
            Log.WorkbookNotLoaded(this.logger, ex);
            throw ex;
        }

        IXLWorksheet? ws = this.workbook.Worksheet(name);
        if (ws is null)
        {
            var ex = new ArgumentException(string.Format(CultureInfo.InvariantCulture, UnknownSheetFormat, name));
            Log.UnknownSheet(this.logger, name, ex);
            throw ex;
        }

        return StreamSheetAsync(name);
        async IAsyncEnumerable<Dictionary<string, string>> StreamSheetAsync(string name)
        {
            var headers = ws.Row(1).Cells().Select(c => c.GetString()).ToList();
            foreach (IXLRow? row in ws.RowsUsed().Skip(1))
            {
                var obj = new Dictionary<string, string>(StringComparer.Ordinal);
                for (var i = 0; i < headers.Count; i++)
                {
                    obj[headers[i]] = row.Cell(i + 1).GetString();
                }

                yield return obj;
                await Task.Yield();
            }
        }
    }

    /// <summary>
    ///     Stream rows from a named table.
    /// </summary>
    /// <param name="name">Named table identifier.</param>
    /// <returns>An asynchronous sequence of row objects keyed by column header.</returns>
    /// <exception cref="InvalidOperationException">Thrown when no workbook is loaded.</exception>
    /// <exception cref="ArgumentException">Thrown when the table or sheet is missing.</exception>
    public IAsyncEnumerable<Dictionary<string, string>> StreamNamedTableAsync(string name)
    {
        Log.StreamingTable(this.logger, name, null);
        if (this.workbook is null)
        {
            var ex = new InvalidOperationException(LogMessages.WorkbookNotLoaded);
            Log.WorkbookNotLoaded(this.logger, ex);
            throw ex;
        }

        if (!this.workbook.DefinedNames.TryGetValue(name, out IXLDefinedName? def) || def.Ranges.Count == 0)
        {
            var ex = new ArgumentException(string.Format(CultureInfo.InvariantCulture, UnknownTableFormat, name));
            Log.UnknownTable(this.logger, name, ex);
            throw ex;
        }

        IXLRange range = def.Ranges.First();
        if (range.Worksheet is null)
        {
            var ex = new ArgumentException(string.Format(CultureInfo.InvariantCulture, MissingSheetForTableFormat, name));
            Log.MissingSheetForTable(this.logger, name, ex);
            throw ex;
        }

        return StreamNamedTableAsync(name);
        async IAsyncEnumerable<Dictionary<string, string>> StreamNamedTableAsync(string name)
        {
            var headers = range.FirstRow().Cells().Select(c => c.GetString()).ToList();
            foreach (IXLRangeRow? row in range.Rows().Skip(1))
            {
                var obj = new Dictionary<string, string>(StringComparer.Ordinal);
                for (var i = 0; i < headers.Count; i++)
                {
                    obj[headers[i]] = row.Cell(i + 1).GetString();
                }

                yield return obj;
                await Task.Yield();
            }
        }
    }

    public IReadOnlyList<Dictionary<string, string>> LoadNamedTable(string name)
    {
        Log.LoadingTable(this.logger, name, null);
        if (this.workbook is null)
        {
            var ex = new InvalidOperationException(LogMessages.WorkbookNotLoaded);
            Log.WorkbookNotLoaded(this.logger, ex);
            throw ex;
        }

        if (!this.workbook.DefinedNames.TryGetValue(name, out IXLDefinedName? def)
            || def.Ranges.Count == 0)
        {
            var ex = new ArgumentException(string.Format(CultureInfo.InvariantCulture, UnknownTableFormat, name));
            Log.UnknownTable(this.logger, name, ex);
            throw ex;
        }

        IXLRange range = def.Ranges.First();
        if (range.Worksheet is null)
        {
            var ex = new ArgumentException(string.Format(CultureInfo.InvariantCulture, MissingSheetForTableFormat, name));
            Log.MissingSheetForTable(this.logger, name, ex);
            throw ex;
        }

        var headers = range.FirstRow().Cells().Select(c => c.GetString()).ToList();
        var rows = new List<Dictionary<string, string>>();
        foreach (IXLRangeRow? row in range.Rows().Skip(1))
        {
            var obj = new Dictionary<string, string>(StringComparer.Ordinal);
            for (var i = 0; i < headers.Count; i++)
            {
                obj[headers[i]] = row.Cell(i + 1).GetString();
            }

            rows.Add(obj);
        }

        Log.LoadedRows(this.logger, rows.Count, null);
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
                Log.DisposingWorkbook(this.logger, null);
                this.workbook?.Dispose();
            }

            this.disposed = true;
        }
    }
}
