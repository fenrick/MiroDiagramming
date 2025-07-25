namespace Fenrick.Miro.Tests.NewFeatures;

#nullable enable
using Server.Domain;
using Server.Services;
using Xunit;

public class LayoutEngineTests
{
    [Fact]
    public void LayoutPositionsNodesVertically()
    {
        var engine = new LayoutEngine();
        var data = new GraphData(
            [new GraphNode("n1", "A", "t"), new GraphNode("n2", "B", "t")],
            []);

        var result = engine.Layout(data);

        Assert.Equal(0, result.Nodes["n1"].X);
        Assert.Equal(0, result.Nodes["n1"].Y);
        Assert.Equal(0, result.Nodes["n2"].X);
        Assert.Equal(120, result.Nodes["n2"].Y);
    }

    // TODO extend tests to cover ELK integration once the server supports
    // advanced layout algorithms.
}
