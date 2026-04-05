using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BetterLink.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddUserDisplayId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DisplayId",
                table: "AspNetUsers",
                type: "varchar(255)",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_DisplayId",
                table: "AspNetUsers",
                column: "DisplayId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_DisplayId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "DisplayId",
                table: "AspNetUsers");
        }
    }
}
