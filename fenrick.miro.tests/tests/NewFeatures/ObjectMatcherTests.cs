#nullable enable

namespace Fenrick.Miro.Tests.NewFeatures;
using System.Collections.Generic;
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
}
