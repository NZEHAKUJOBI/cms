using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PSCMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class SeedPharmaceuticalProducts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Remove old generic seed products (IDs 001–065)
            for (int i = 1; i <= 65; i++)
            {
                migrationBuilder.DeleteData(
                    table: "Products",
                    keyColumn: "Id",
                    keyValue: new Guid($"10000000-0000-0000-0000-{i:D12}"));
            }

            // Insert products from Zamfara State Commodity Logistics Management Sheet
            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Category", "CreatedAt", "Description", "DosageForm", "GenericName", "IsActive", "MinimumStockLevel", "Name", "Strength", "Unit", "UpdatedAt" },
                values: new object[,]
                {
                    // ── ARVs & OIs ──────────────────────────────────────────────────────────
                    { new Guid("10000000-0000-0000-0000-000000000001"), "ARVs & OIs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Tenofovir Disoproxil Fumarate/Lamivudine/Dolutegravir", true, 100, "Tab TDF/3TC/DTG (300/300/50MG) X 90", "300/300/50mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000002"), "ARVs & OIs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Tenofovir Disoproxil Fumarate/Lamivudine/Dolutegravir", true, 100, "Tab TDF/3TC/DTG (300/300/50MG) X 30", "300/300/50mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000003"), "ARVs & OIs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Tenofovir Disoproxil Fumarate/Lamivudine", true, 100, "Tab TDF/3TC (300/300MG) X 30", "300/300mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000004"), "ARVs & OIs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Abacavir/Lamivudine", true, 100, "Tab ABC/3TC (600/300MG) X 30", "600/300mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000005"), "ARVs & OIs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Abacavir/Lamivudine", true, 80, "Tab ABC/3TC (120/60MG) X 30", "120/60mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000006"), "ARVs & OIs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Lopinavir/Ritonavir", true, 60, "Tab LPV/r (200/50MG) X 120", "200/50mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000007"), "ARVs & OIs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Atazanavir/Ritonavir", true, 50, "Tab ATV/r (300/100MG) X 30", "300/100mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000008"), "ARVs & OIs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Dolutegravir", true, 100, "Tab DTG 50MG X 30", "50mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000009"), "ARVs & OIs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Dolutegravir", true, 80, "Tab DTG 10MG X 90", "10mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000010"), "ARVs & OIs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Suspension", "Zidovudine", true, 50, "Susp AZT (50MG/5mL) 240mL", "50mg/5mL", "Bottles", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000011"), "ARVs & OIs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Suspension", "Nevirapine", true, 50, "Susp NVP (50MG/5mL) 100mL", "50mg/5mL", "Bottles", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000012"), "ARVs & OIs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Isoniazid", true, 150, "Tab INH 300MG", "300mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000013"), "ARVs & OIs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Isoniazid", true, 150, "Tab INH 100MG X 100", "100mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000014"), "ARVs & OIs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Isoniazid/Rifapentine", true, 80, "Tab 3HP", "300/300mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000015"), "ARVs & OIs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Isoniazid/Pyridoxine/Cotrimoxazole", true, 100, "Tabs INH/Pyridoxine/Cotrimoxazole 300/25/960mg", "300/25/960mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000016"), "ARVs & OIs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Sulfamethoxazole/Trimethoprim", true, 100, "Tab Co-trimoxazole 960MG X 500", "960mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000017"), "ARVs & OIs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Sulfamethoxazole/Trimethoprim", true, 100, "Tab Co-trimoxazole 120MG X 1000", "120mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000018"), "ARVs & OIs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Vaginal Pessary", "Clotrimazole", true, 50, "Clotrimazole Vaginal Pessary 100MG x 6", "100mg", "Pessaries", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000019"), "ARVs & OIs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Metronidazole", true, 100, "Tab Metronidazole 200MG x 1000", "200mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000020"), "ARVs & OIs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Injection", "Benzathine Benzylpenicillin", true, 50, "Inj Benzathine benzyl penicilline 2.4MIU X 1", "2.4MIU", "Vials", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000021"), "ARVs & OIs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Erythromycin", true, 50, "Tabs Erythromycin 500mg x 10", "500mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000022"), "ARVs & OIs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Oral Drops", "Nystatin", true, 50, "Oral Nystatin drop", "100,000 IU/mL", "Bottles", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000023"), "ARVs & OIs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Fluconazole", true, 50, "Tab Fluconazole 50MG X 10", "50mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000024"), "ARVs & OIs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Injection", "Amphotericin B (Liposomal)", true, 20, "Liposomal Amphotericin B 50mg", "50mg", "Vials", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000025"), "ARVs & OIs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Flucytosine", true, 50, "Tabs Flucytosine 500mg X 100", "500mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000026"), "ARVs & OIs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Solution", "Podophyllotoxin", true, 20, "Podophyllotoxin Solution 0.5% w/v", "0.5% w/v", "Bottles", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    // ── Preventive Supplies ──────────────────────────────────────────────────
                    { new Guid("10000000-0000-0000-0000-000000000027"), "Preventive Supplies", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Device", "Male Condom", true, 1000, "Male Condoms pcs", "N/A", "Pieces", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000028"), "Preventive Supplies", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Device", "Female Condom", true, 500, "Female Condom pcs", "N/A", "Pieces", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000029"), "Preventive Supplies", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Gel", "Lubricant", true, 200, "Lubricant", "N/A", "Bottles", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    // ── RTKs ─────────────────────────────────────────────────────────────────
                    { new Guid("10000000-0000-0000-0000-000000000030"), "RTKs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Test Kit", "HIV Rapid Test - Determine", true, 100, "DETERMINE X 100", "N/A", "Tests", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000031"), "RTKs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Test Kit", "HIV Rapid Test - UniGold", true, 50, "UNIGOLD X 20", "N/A", "Tests", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000032"), "RTKs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Test Kit", "HIV Rapid Test - STAT-PAK", true, 50, "STAT-PAK X 20", "N/A", "Tests", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000033"), "RTKs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Test Kit", "Cryptococcal Antigen Test", true, 50, "Cryptococcal Antigen Lateral Flow Assay (CrAg-LFA) X 50", "N/A", "Tests", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000034"), "RTKs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Test Kit", "HIV Recency Test - Asante", true, 100, "Recency Test Kit (Asante) X 100", "N/A", "Tests", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000035"), "RTKs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Test Kit", "Urine TB LF-LAM", true, 25, "Urine TB LF-LAM X 25", "N/A", "Tests", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000036"), "RTKs", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Test Kit", "CD4 Test - Visitect", true, 25, "Visitect X 25", "N/A", "Tests", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove new products
            for (int i = 1; i <= 36; i++)
            {
                migrationBuilder.DeleteData(
                    table: "Products",
                    keyColumn: "Id",
                    keyValue: new Guid($"10000000-0000-0000-0000-{i:D12}"));
            }
        }
    }
}
