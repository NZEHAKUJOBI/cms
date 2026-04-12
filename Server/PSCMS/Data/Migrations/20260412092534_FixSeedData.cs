using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PSCMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 22, 37, 6, 0, DateTimeKind.Utc), "$2a$11$zGPb1ShNMqdTl4WV0cH4g.rHGqXaVSUkEm2Z6yNE8WUYQ9IVoeTbq", new DateTime(2026, 3, 18, 22, 37, 6, 0, DateTimeKind.Utc) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 22, 37, 6, 372, DateTimeKind.Utc).AddTicks(5763), "$2a$11$clk7Qc/Xo0i6cgtpk8SAIeMGHqJIaxx0JcP28lID60jb51cvfV46y", new DateTime(2026, 3, 18, 22, 37, 6, 372, DateTimeKind.Utc).AddTicks(5790) });
        }
    }
}
