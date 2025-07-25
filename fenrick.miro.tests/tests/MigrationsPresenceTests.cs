using System.Linq;
using System.Reflection;
using Fenrick.Miro.Server.Data;
using Microsoft.EntityFrameworkCore.Migrations;
using Xunit;

public class MigrationsPresenceTests
{
    [Fact]
    public void ContainsInitialMigration()
    {
        var migrationTypes = typeof(MiroDbContext).Assembly
            .GetTypes()
            .Where(t => t.IsSubclassOf(typeof(Migration)))
            .ToList();

        Assert.NotEmpty(migrationTypes);
    }
}
