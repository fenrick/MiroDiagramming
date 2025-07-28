namespace Fenrick.Miro.Server.Data.Migrations;
#nullable disable
using Microsoft.EntityFrameworkCore.Migrations;

/// <inheritdoc />
public partial class InitialCreate : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            $"Templates",
            table => new
            {
                UserId =
                    table.Column<string>($"text", nullable: false),
                Name = table.Column<string>($"text", nullable: false),
                DefinitionJson =
                    table.Column<string>($"text", nullable: false),
            },
            constraints: table =>
                table.PrimaryKey($"PK_Templates",
                    x => new { x.UserId, x.Name }));

        migrationBuilder.CreateTable(
            $"Users",
            table => new
            {
                Id = table.Column<string>($"text", nullable: false),
                Name = table.Column<string>($"text", nullable: false),
                Token =
                    table.Column<string>($"text", nullable: false),
            },
            constraints: table => table.PrimaryKey($"PK_Users", x => x.Id));
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            $"Templates");

        migrationBuilder.DropTable(
            $"Users");
    }
}
