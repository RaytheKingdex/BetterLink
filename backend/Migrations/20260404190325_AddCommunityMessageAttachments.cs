using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BetterLink.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCommunityMessageAttachments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AttachmentMimeType",
                table: "messages",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "AttachmentName",
                table: "messages",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "AttachmentType",
                table: "messages",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "AttachmentUrl",
                table: "messages",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AttachmentMimeType",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "AttachmentName",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "AttachmentType",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "AttachmentUrl",
                table: "messages");
        }
    }
}
