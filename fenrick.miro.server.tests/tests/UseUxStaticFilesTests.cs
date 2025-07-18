using Fenrick.Miro.Server;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using Xunit;

namespace Fenrick.Miro.Server.Tests;

public class UseUxStaticFilesTests
{
    [Fact]
    public void GetUxPath_CombinesRootAndRelativePath()
    {
        var env = new HostEnvironment { ContentRootPath = "/app" };

        var path = UxStaticFileExtensions.GetUxPath(env);

        Assert.EndsWith("fenrick.miro.ux/dist", path.Replace('\', ' / '));
    }

    private sealed class HostEnvironment : IHostEnvironment
    {
        public string EnvironmentName { get; set; } = "Development";
        public string ApplicationName { get; set; } = "Test";
        public string ContentRootPath { get; set; } = string.Empty;
        public IFileProvider ContentRootFileProvider { get; set; } = null!;
    }
}
