#nullable enable

namespace Fenrick.Miro.Tests.NewFeatures;

using System;
using System.IO;
using System.Threading.Tasks;
using ClosedXML.Excel;
using Fenrick.Miro.Server.Services;
using Xunit;

public class ExcelLoaderTests
{
    [Fact]
    public async Task LoadSheetReturnsRowsAsync()
    {
        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("Sheet1");
        ws.Cell(1, 1).Value = "Name";
        ws.Cell(1, 2).Value = "Age";
        ws.Cell(2, 1).Value = "Alice";
        ws.Cell(2, 2).Value = 30;
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        ms.Position = 0;

        var loader = new ExcelLoader();
        await loader.LoadAsync(ms);
        var rows = loader.LoadSheet("Sheet1");

        Assert.Single(rows);
        Assert.Equal("Alice", rows[0]["Name"]);
        Assert.Equal("30", rows[0]["Age"]);
    }

    [Fact]
    public async Task ListNamedTablesReturnsNamesAsync()
    {
        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("Sheet1");
        ws.Cell(1, 1).Value = "A";
        ws.Cell(2, 1).Value = 1;
        wb.NamedRanges.Add("Table1", ws.Range("A1:A2"));
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        ms.Position = 0;

        var loader = new ExcelLoader();
        await loader.LoadAsync(ms);

        Assert.Contains("Table1", loader.ListNamedTables());
    }

    [Fact]
    public async Task LoadNamedTableReturnsRowsAsync()
    {
        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("Sheet1");
        ws.Cell(1, 1).Value = "Name";
        ws.Cell(1, 2).Value = "Value";
        ws.Cell(2, 1).Value = "A";
        ws.Cell(2, 2).Value = 1;
        wb.NamedRanges.Add("Table1", ws.Range("A1:B2"));
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        ms.Position = 0;

        var loader = new ExcelLoader();
        await loader.LoadAsync(ms);
        var rows = loader.LoadNamedTable("Table1");

        Assert.Single(rows);
        Assert.Equal("A", rows[0]["Name"]);
    }

    [Fact]
    public void MethodsThrowWhenWorkbookNotLoaded()
    {
        var loader = new ExcelLoader();

        Assert.Empty(loader.ListNamedTables());
        Assert.Throws<InvalidOperationException>(() => loader.LoadNamedTable("T1"));
    }

    [Fact]
    public async Task LoadNamedTableThrowsWhenUnknownAsync()
    {
        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("Sheet1");
        ws.Cell(1, 1).Value = "A";
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        ms.Position = 0;

        var loader = new ExcelLoader();
        await loader.LoadAsync(ms);

        Assert.Throws<ArgumentException>(() => loader.LoadNamedTable("Missing"));
    }

    [Fact]
    public async Task LoadNamedTableThrowsForMissingSheetAsync()
    {
        using var wb = new XLWorkbook();
        wb.Worksheets.Add("Temp");
        wb.DefinedNames.Add("Bad", "Missing!A1:B1");
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        ms.Position = 0;

        var loader = new ExcelLoader();
        await loader.LoadAsync(ms);

        Assert.Throws<ArgumentException>(() => loader.LoadNamedTable("Bad"));
    }
}
