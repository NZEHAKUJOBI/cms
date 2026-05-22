using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PSCMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class AllowMultipleSnapshotsPerWeek : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_WeeklyStockSnapshots_InventoryId_WeekStartDate",
                table: "WeeklyStockSnapshots");

            migrationBuilder.DropIndex(
                name: "IX_Inventories_FacilityId_ProductId",
                table: "Inventories");

            migrationBuilder.CreateIndex(
                name: "IX_WeeklyStockSnapshots_InventoryId_WeekStartDate",
                table: "WeeklyStockSnapshots",
                columns: new[] { "InventoryId", "WeekStartDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Inventories_FacilityId_ProductId_BatchNumber",
                table: "Inventories",
                columns: new[] { "FacilityId", "ProductId", "BatchNumber" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_WeeklyStockSnapshots_InventoryId_WeekStartDate",
                table: "WeeklyStockSnapshots");

            migrationBuilder.DropIndex(
                name: "IX_Inventories_FacilityId_ProductId_BatchNumber",
                table: "Inventories");

            migrationBuilder.CreateIndex(
                name: "IX_WeeklyStockSnapshots_InventoryId_WeekStartDate",
                table: "WeeklyStockSnapshots",
                columns: new[] { "InventoryId", "WeekStartDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Inventories_FacilityId_ProductId",
                table: "Inventories",
                columns: new[] { "FacilityId", "ProductId" },
                unique: true);
        }
    }
}
