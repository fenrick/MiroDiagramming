
namespace Fenrick.Miro.Tests;

using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using Server.Api;
using Server.Domain;
using Server.Services;

using Xunit;

public class TagsControllerTests
{
    [Fact]
    public async Task GetAsyncReturnsTagsAsync()
    {
        var svc = new StubService();
        var controller = new TagsController(svc)
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() },
        };

        ActionResult<IReadOnlyList<TagInfo>> result =
            await controller.GetAsync($"b1");
        OkObjectResult ok = Assert.IsType<OkObjectResult>(result.Result);
        IReadOnlyList<TagInfo> tags =
            Assert.IsType<IReadOnlyList<TagInfo>>(ok.Value, false);
        Assert.Single(tags);
        Assert.Equal($"t1", tags[0].Id);
    }

    private sealed class StubService : ITagService
    {
        public Task<IReadOnlyList<TagInfo>> GetTagsAsync(string boardId,
            CancellationToken ct = default)
        {
            IReadOnlyList<TagInfo> tags =
                [new($"t1", $"Tag", Color: null)];
            return Task.FromResult(tags);
        }
    }
}
