#nullable enable

namespace Fenrick.Miro.Tests.NewFeatures;

using System.Collections.Generic;
using System.Linq;
using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;
using Xunit;

public class ObjectMatcherTests
{
    [Fact]
    public void FindsShapeByLabelIgnoringCase()
    {
        var shapes = new List<ShapeData>
                     {
                         new("r", 0, 0, 1, 1, null, "Alpha", null),
                         new("r", 0, 0, 1, 1, null, "Beta", null)
                     };

        var result = ObjectMatcher.FindShapeByLabel(shapes, "beta");

        Assert.NotNull(result);
        Assert.Equal("Beta", result!.Text);
    }

    [Fact]
    public void FindsShapesByStyleMatch()
    {
        var shapes = new List<ShapeData>
                     {
                         new(
                             "r",
                             0,
                             0,
                             1,
                             1,
                             null,
                             null,
                             new Dictionary<string, object> { ["color"] = "red" }),
                         new(
                             "r",
                             0,
                             0,
                             1,
                             1,
                             null,
                             null,
                             new Dictionary<string, object> { ["color"] = "blue" })
                     };

        var results =
            ObjectMatcher.FindShapesByStyle(shapes, "color", "blue").ToList();

        Assert.Single(results);
        Assert.Equal("blue", results[0].Style!["color"]);
    }

    [Fact]
    public void FindShapesByStyleHandlesMissing()
    {
        var shapes = new List<ShapeData>
                     {
                         new("r", 0, 0, 1, 1, null, null, null)
                     };

        var results =
            ObjectMatcher.FindShapesByStyle(shapes, "color", "red").ToList();

        Assert.Empty(results);
    }

    [Fact]
    public void FindShapesByStyleComparesStringsCaseInsensitive()
    {
        var shapes = new List<ShapeData>
                     {
                         new(
                             "r",
                             0,
                             0,
                             1,
                             1,
                             null,
                             null,
                             new Dictionary<string, object> { ["color"] = "Red" })
                     };

        var results =
            ObjectMatcher.FindShapesByStyle(shapes, "color", "red").ToList();

        Assert.Single(results);
    }
}
