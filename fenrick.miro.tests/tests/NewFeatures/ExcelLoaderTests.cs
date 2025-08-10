
namespace Fenrick.Miro.Tests.NewFeatures;

using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

using ClosedXML.Excel;

using Microsoft.Extensions.Logging;

using Server.Services;

using Xunit;

public class ExcelLoaderTests
{
    [Fact]
    public async Task LoadSheetReturnsRowsAsync()
    {
        using var wb = new XLWorkbook();
        IXLWorksheet ws = wb.Worksheets.Add($"Sheet1");
        ws.Cell(1, 1).Value = $"Name";
        ws.Cell(1, 2).Value = $"Age";
        ws.Cell(2, 1).Value = $"Alice";
        ws.Cell(2, 2).Value = 30;
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        ms.Position = 0;

        var loader = new ExcelLoader();
        await loader.LoadAsync(ms).ConfigureAwait(false);
        IReadOnlyList<Dictionary<string, string>> rows =
            loader.LoadSheet($"Sheet1");

        Assert.Single(rows);
        Assert.Equal($"Alice", rows[0][$"Name"]);
        Assert.Equal($"30", rows[0][$"Age"]);
    }

    [Fact]
    public async Task ListNamedTablesReturnsNamesAsync()
    {
        using var wb = new XLWorkbook();
        IXLWorksheet ws = wb.Worksheets.Add($"Sheet1");
        ws.Cell(1, 1).Value = $"A";
        ws.Cell(2, 1).Value = 1;
        wb.DefinedNames.Add($"Table1", ws.Range($"A1:A2"));
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        ms.Position = 0;

        var loader = new ExcelLoader();
        await loader.LoadAsync(ms).ConfigureAwait(false);

        Assert.Contains($"Table1", loader.ListNamedTables());
    }

    [Fact]
    public async Task LoadNamedTableReturnsRowsAsync()
    {
        using var wb = new XLWorkbook();
        IXLWorksheet ws = wb.Worksheets.Add($"Sheet1");
        ws.Cell(1, 1).Value = $"Name";
        ws.Cell(1, 2).Value = $"Value";
        ws.Cell(2, 1).Value = $"A";
        ws.Cell(2, 2).Value = 1;
        wb.DefinedNames.Add($"Table1", ws.Range($"A1:B2"));
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        ms.Position = 0;

        var loader = new ExcelLoader();
        await loader.LoadAsync(ms).ConfigureAwait(false);
        IReadOnlyList<Dictionary<string, string>> rows =
            loader.LoadNamedTable($"Table1");

        Assert.Single(rows);
        Assert.Equal($"A", rows[0][$"Name"]);
    }

    [Fact]
    public void MethodsThrowWhenWorkbookNotLoaded()
    {
        var loader = new ExcelLoader();

        Assert.Empty(loader.ListNamedTables());
        Assert.Throws<InvalidOperationException>(() =>
            loader.LoadNamedTable($"T1"));
    }

    [Fact]
    public async Task LoadNamedTableThrowsWhenUnknownAsync()
    {
        using var wb = new XLWorkbook();
        IXLWorksheet ws = wb.Worksheets.Add($"Sheet1");
        ws.Cell(1, 1).Value = $"A";
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        ms.Position = 0;

        var loader = new ExcelLoader();
        await loader.LoadAsync(ms).ConfigureAwait(false);

        Assert.Throws<ArgumentException>(() =>
            loader.LoadNamedTable($"Missing"));
    }

    [Fact]
    public async Task LoadNamedTableThrowsForMissingSheetAsync()
    {
        using var wb = new XLWorkbook();
        wb.Worksheets.Add($"Temp");
        wb.DefinedNames.Add($"Bad", $"Missing!A1:B1");
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        ms.Position = 0;

        var loader = new ExcelLoader();
        await loader.LoadAsync(ms).ConfigureAwait(false);

        Assert.Throws<ArgumentException>(() => loader.LoadNamedTable($"Bad"));
    }

    [Fact]
    public async Task LoadAsyncLogsLifecycleAsync()
    {
        using var wb = new XLWorkbook();
        wb.Worksheets.Add($"Sheet1");
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        ms.Position = 0;

        var logger = new CaptureLogger<ExcelLoader>();
        var loader = new ExcelLoader(logger);
        await loader.LoadAsync(ms).ConfigureAwait(false);

        Assert.Contains(logger.Entries,
            l => l.Level == LogLevel.Debug &&
                 l.Message.Contains($"Loading workbook",
                     StringComparison.Ordinal));
        Assert.Contains(logger.Entries,
            l => l.Message.Contains($"Workbook loaded",
                StringComparison.Ordinal));
    }

    [Fact]
    public void LoadSheetLogsErrors()
    {
        var logger = new CaptureLogger<ExcelLoader>();
        var loader = new ExcelLoader(logger);

        Assert.Throws<InvalidOperationException>(() => loader.LoadSheet($"A"));
        Assert.Contains(logger.Entries, l => l.Level == LogLevel.Error);
    }

    [Fact]
    public async Task StreamSheetAsyncReturnsRowsAsync()
    {
        using var wb = new XLWorkbook();
        IXLWorksheet ws = wb.Worksheets.Add($"Sheet1");
        ws.Cell(1, 1).Value = $"Name";
        ws.Cell(2, 1).Value = $"Alice";
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        ms.Position = 0;

        var loader = new ExcelLoader();
        await loader.LoadAsync(ms).ConfigureAwait(false);
        var results = new List<Dictionary<string, string>>();
        await foreach (Dictionary<string, string> r in loader.StreamSheetAsync($"Sheet1").ConfigureAwait(false))
        {
            results.Add(r);
        }

        Assert.Single(results);
        Assert.Equal($"Alice", results[0][$"Name"]);
    }

    [Fact]
    public async Task StreamNamedTableAsyncReturnsRowsAsync()
    {
        using var wb = new XLWorkbook();
        IXLWorksheet ws = wb.Worksheets.Add($"Sheet1");
        ws.Cell(1, 1).Value = $"Value";
        ws.Cell(2, 1).Value = 1;
        wb.DefinedNames.Add($"Table1", ws.Range($"A1:A2"));
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        ms.Position = 0;

        var loader = new ExcelLoader();
        await loader.LoadAsync(ms).ConfigureAwait(false);
        var results = new List<Dictionary<string, string>>();
        await foreach (Dictionary<string, string> r in loader.StreamNamedTableAsync($"Table1").ConfigureAwait(false))
        {
            results.Add(r);
        }

        Assert.Single(results);
        Assert.Equal($"1", results[0][$"Value"]);
    }

    [Fact]
    public async Task StreamingMethodsThrowWhenWorkbookMissingAsync()
    {
        var loader = new ExcelLoader();
        await Assert.ThrowsAsync<InvalidOperationException>(async () =>
        {
            await foreach (Dictionary<string, string> _ in loader.StreamSheetAsync($"A").ConfigureAwait(false))
            {
                Assert.Fail($"Should not iterate");
            }
        }).ConfigureAwait(false);

        await Assert.ThrowsAsync<InvalidOperationException>(async () =>
        {
            await foreach (Dictionary<string, string> _ in loader.StreamNamedTableAsync($"A").ConfigureAwait(false))
            {
                Assert.Fail($"Should not iterate");
            }
        }).ConfigureAwait(false);
    }
}
