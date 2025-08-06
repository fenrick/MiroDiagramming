#nullable disable

namespace Fenrick.Miro.Server.Migrations;

using Microsoft.EntityFrameworkCore.Migrations;

/// <inheritdoc />
public partial class InitialCreate : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: $"Templates",
            columns: table => new
            {
                UserId = table.Column<string>(type: $"TEXT", nullable: false),
                Name = table.Column<string>(type: $"TEXT", nullable: false),
                DefinitionJson = table.Column<string>(type: $"TEXT", nullable: false),
            },
            constraints: table => table.PrimaryKey($"PK_Templates", x => new { x.UserId, x.Name }));

        migrationBuilder.CreateTable(
            name: $"Users",
            columns: table => new
            {
                Id = table.Column<string>(type: $"TEXT", nullable: false),
                Name = table.Column<string>(type: $"TEXT", nullable: false),
                Token = table.Column<string>(type: $"TEXT", nullable: false),
            },
            constraints: table => table.PrimaryKey($"PK_Users", x => x.Id));
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: $"Templates");

        migrationBuilder.DropTable(
            name: $"Users");
    }
}
