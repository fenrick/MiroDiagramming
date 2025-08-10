#nullable disable

namespace Fenrick.Miro.Server.Migrations;

using Microsoft.EntityFrameworkCore.Migrations;

/// <inheritdoc />
public partial class AddUserTokens : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.RenameColumn(
            name: $"Token",
            table: $"Users",
            newName: $"AccessToken");

        migrationBuilder.AddColumn<string>(
            name: $"RefreshToken",
            table: $"Users",
            type: $"TEXT",
            nullable: false,
            defaultValue: $"");

        migrationBuilder.AddColumn<DateTimeOffset>(
            name: $"ExpiresAt",
            table: $"Users",
            type: $"TEXT",
            nullable: false,
            defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: $"RefreshToken",
            table: $"Users");

        migrationBuilder.DropColumn(
            name: $"ExpiresAt",
            table: $"Users");

        migrationBuilder.RenameColumn(
            name: $"AccessToken",
            table: $"Users",
            newName: $"Token");
    }
}
