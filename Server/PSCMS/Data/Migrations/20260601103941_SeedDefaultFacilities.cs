using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PSCMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class SeedDefaultFacilities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Facilities",
                columns: new[] { "Id", "Code", "ContactPerson", "CreatedAt", "District", "Email", "IsActive", "Name", "Phone", "Region", "State", "Type", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("20000000-0000-0000-0000-000000000001"), "KEB-001", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Birnin Kebbi", null, true, "Federal Medical Centre", "", "North West", "Kebbi", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000002"), "KEB-002", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Koko/Besse", null, true, "G.Hosp.", "", "North West", "Kebbi", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000003"), "KEB-003", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Argungu", null, true, "G.Hosp. Arg.", "", "North West", "Kebbi", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000004"), "KEB-004", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Ngaski", null, true, "G.Hosp. Wara", "", "North West", "Kebbi", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000005"), "KEB-005", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Yauri", null, true, "General Hospital Yauri", "", "North West", "Kebbi", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000006"), "KEB-006", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Jega", null, true, "Jega", "", "North West", "Kebbi", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000007"), "KEB-007", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Dandi", null, true, "Kamba General Hospital", "", "North West", "Kebbi", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000008"), "KEB-008", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Bagudo", null, true, "Kaoje GH", "", "North West", "Kebbi", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000009"), "KEB-009", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Birnin Kebbi", null, true, "Sir Yahaya Mem. Hospital", "", "North West", "Kebbi", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000010"), "KEB-010", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Danko/Wasagu", null, true, "Wasagu General Hospital", "", "North West", "Kebbi", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000011"), "KEB-011", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Zuru", null, true, "Zuru Martha Bamaiyi General Hospital", "", "North West", "Kebbi", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000012"), "SOK-001", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Tambuwal", null, true, "General Hospital Dogon Daji", "", "North West", "Sokoto", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000013"), "SOK-002", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Tambuwal", null, true, "General Hospital Tambuwal", "", "North West", "Sokoto", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000014"), "SOK-003", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Sokoto North", null, true, "Holy Family Clinic", "", "North West", "Sokoto", "Clinic", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000015"), "SOK-004", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Illela", null, true, "Ilela General Hospital", "", "North West", "Sokoto", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000016"), "SOK-005", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Isa", null, true, "Isa General Hospital", "", "North West", "Sokoto", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000017"), "SOK-006", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Sokoto South", null, true, "Maryam Abacha Women & Children Hospital", "", "North West", "Sokoto", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000018"), "SOK-007", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Rabah", null, true, "Rabah General Hospital", "", "North West", "Sokoto", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000019"), "SOK-008", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Tambuwal", null, true, "Sanyinna Comprehensive Health Centre", "", "North West", "Sokoto", "HealthCenter", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000020"), "SOK-009", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Sokoto North", null, true, "Kofar Rini Comprehensive Health Centre", "", "North West", "Sokoto", "HealthCenter", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000021"), "SOK-010", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Sokoto South", null, true, "Sokoto Specialist Hospital - Sokoto", "", "North West", "Sokoto", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000022"), "SOK-011", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Wamako", null, true, "Usmanu Danfodiyyo University Teaching Hospital (UDUTH) - Sokoto", "", "North West", "Sokoto", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000023"), "SOK-012", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Sokoto North", null, true, "Women and Children Welfare Clinic", "", "North West", "Sokoto", "Clinic", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000024"), "SOK-013", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Wurno", null, true, "Wurno General Hospital", "", "North West", "Sokoto", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000025"), "ZAM-001", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Anka", null, true, "Anka General Hospital", "", "North West", "Zamfara", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000026"), "ZAM-002", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Bungudu", null, true, "Bungudu General Hospital", "", "North West", "Zamfara", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000027"), "ZAM-003", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Gummi", null, true, "Gummi General Hospital", "", "North West", "Zamfara", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000028"), "ZAM-004", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Gusau", null, true, "Gusau FMC", "", "North West", "Zamfara", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000029"), "ZAM-005", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Gusau", null, true, "Gusau Gen Hosp", "", "North West", "Zamfara", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000030"), "ZAM-006", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Kaura Namoda", null, true, "Kaura Namoda General Hospital", "", "North West", "Zamfara", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000031"), "ZAM-007", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Gusau", null, true, "King Fahad WCWC", "", "North West", "Zamfara", "Clinic", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000032"), "ZAM-008", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Gusau", null, true, "Magami PHC", "", "North West", "Zamfara", "HealthCenter", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000033"), "ZAM-009", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Maru", null, true, "Maru General Hospital", "", "North West", "Zamfara", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000034"), "ZAM-010", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Shinkafi", null, true, "Shinkafi Gen Hosp", "", "North West", "Zamfara", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000035"), "ZAM-011", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Talata Mafara", null, true, "Talata Mafara General Hospital", "", "North West", "Zamfara", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000036"), "ZAM-012", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Tsafe", null, true, "Tsafe General Hosp", "", "North West", "Zamfara", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20000000-0000-0000-0000-000000000037"), "ZAM-013", "", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Gusau", null, true, "Yerima Bakura Specialist Hospital", "", "North West", "Zamfara", "Hospital", new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000003"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000004"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000005"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000006"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000007"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000008"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000009"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000010"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000011"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000012"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000013"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000014"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000015"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000016"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000017"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000018"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000019"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000020"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000021"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000022"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000023"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000024"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000025"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000026"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000027"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000028"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000029"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000030"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000031"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000032"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000033"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000034"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000035"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000036"));

            migrationBuilder.DeleteData(
                table: "Facilities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000037"));
        }
    }
}
