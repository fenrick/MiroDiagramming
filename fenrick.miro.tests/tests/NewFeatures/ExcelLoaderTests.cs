using System.IO;
using System.Threading.Tasks;
using ClosedXML.Excel;
using Fenrick.Miro.Server.Services;
using Xunit;
#nullable enable

namespace Fenrick.Miro.Tests.NewFeatures;

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
}
