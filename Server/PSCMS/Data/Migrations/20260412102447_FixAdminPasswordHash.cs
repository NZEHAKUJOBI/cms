using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PSCMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixAdminPasswordHash : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                column: "PasswordHash",
                value: "$2a$11$3key4UV6y0c.JjCXNE94Te3PF.NIAFSsi286X7wJX/jiaoFyoK3VG");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                column: "PasswordHash",
                value: "$2a$11$zGPb1ShNMqdTl4WV0cH4g.rHGqXaVSUkEm2Z6yNE8WUYQ9IVoeTbq");
        }
    }
}
