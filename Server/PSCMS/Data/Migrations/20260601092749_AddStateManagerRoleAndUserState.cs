using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PSCMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddStateManagerRoleAndUserState : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "State",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                column: "State",
                value: null);

            // Rename legacy FacilityManager role values to Laboratory
            migrationBuilder.Sql("UPDATE \"Users\" SET \"Role\" = 'Laboratory' WHERE \"Role\" = 'FacilityManager'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "State",
                table: "Users");
        }
    }
}
