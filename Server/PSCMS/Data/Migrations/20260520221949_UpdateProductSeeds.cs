using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PSCMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateProductSeeds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000037"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000038"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000039"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000040"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000041"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000042"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000043"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000044"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000045"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000046"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000047"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000048"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000049"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000050"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000051"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000052"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000053"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000054"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000055"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000056"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000057"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000058"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000059"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000060"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000061"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000062"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000063"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000064"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000065"));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000001"),
                columns: new[] { "Category", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARVs & OIs", "Tenofovir Disoproxil Fumarate/Lamivudine/Dolutegravir", 100, "Tab TDF/3TC/DTG (300/300/50MG) X 90", "300/300/50mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000002"),
                columns: new[] { "Category", "GenericName", "Name", "Strength" },
                values: new object[] { "ARVs & OIs", "Tenofovir Disoproxil Fumarate/Lamivudine/Dolutegravir", "Tab TDF/3TC/DTG (300/300/50MG) X 30", "300/300/50mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000003"),
                columns: new[] { "Category", "GenericName", "Name", "Strength" },
                values: new object[] { "ARVs & OIs", "Tenofovir Disoproxil Fumarate/Lamivudine", "Tab TDF/3TC (300/300MG) X 30", "300/300mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000004"),
                columns: new[] { "Category", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARVs & OIs", "Abacavir/Lamivudine", 100, "Tab ABC/3TC (600/300MG) X 30", "600/300mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000005"),
                columns: new[] { "Category", "GenericName", "Name", "Strength" },
                values: new object[] { "ARVs & OIs", "Abacavir/Lamivudine", "Tab ABC/3TC (120/60MG) X 30", "120/60mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000006"),
                columns: new[] { "Category", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARVs & OIs", "Lopinavir/Ritonavir", 60, "Tab LPV/r (200/50MG) X 120", "200/50mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000007"),
                columns: new[] { "Category", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARVs & OIs", "Atazanavir/Ritonavir", 50, "Tab ATV/r (300/100MG) X 30", "300/100mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000008"),
                columns: new[] { "Category", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARVs & OIs", "Dolutegravir", 100, "Tab DTG 50MG X 30", "50mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000009"),
                columns: new[] { "Category", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARVs & OIs", "Dolutegravir", 80, "Tab DTG 10MG X 90", "10mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000010"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "ARVs & OIs", "Suspension", "Zidovudine", 50, "Susp AZT (50MG/5mL) 240mL", "50mg/5mL", "Bottles" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000011"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARVs & OIs", "Suspension", "Nevirapine", 50, "Susp NVP (50MG/5mL) 100mL", "50mg/5mL" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000012"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "ARVs & OIs", "Tablet", "Isoniazid", 150, "Tab INH 300MG", "300mg", "Tablets" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000013"),
                columns: new[] { "Category", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARVs & OIs", "Isoniazid", 150, "Tab INH 100MG X 100", "100mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000014"),
                columns: new[] { "Category", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARVs & OIs", "Isoniazid/Rifapentine", 80, "Tab 3HP", "300/300mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000015"),
                columns: new[] { "Category", "GenericName", "Name", "Strength" },
                values: new object[] { "ARVs & OIs", "Isoniazid/Pyridoxine/Cotrimoxazole", "Tabs INH/Pyridoxine/Cotrimoxazole 300/25/960mg", "300/25/960mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000016"),
                columns: new[] { "Category", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARVs & OIs", "Sulfamethoxazole/Trimethoprim", 100, "Tab Co-trimoxazole 960MG X 500", "960mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000017"),
                columns: new[] { "Category", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARVs & OIs", "Sulfamethoxazole/Trimethoprim", 100, "Tab Co-trimoxazole 120MG X 1000", "120mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000018"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "ARVs & OIs", "Vaginal Pessary", "Clotrimazole", 50, "Clotrimazole Vaginal Pessary 100MG x 6", "100mg", "Pessaries" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000019"),
                columns: new[] { "Category", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARVs & OIs", "Metronidazole", 100, "Tab Metronidazole 200MG x 1000", "200mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000020"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "ARVs & OIs", "Injection", "Benzathine Benzylpenicillin", 50, "Inj Benzathine benzyl penicilline 2.4MIU X 1", "2.4MIU", "Vials" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000021"),
                columns: new[] { "Category", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARVs & OIs", "Erythromycin", 50, "Tabs Erythromycin 500mg x 10", "500mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000022"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARVs & OIs", "Oral Drops", "Nystatin", 50, "Oral Nystatin drop", "100,000 IU/mL" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000023"),
                columns: new[] { "Category", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARVs & OIs", "Fluconazole", 50, "Tab Fluconazole 50MG X 10", "50mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000024"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "ARVs & OIs", "Injection", "Amphotericin B (Liposomal)", 20, "Liposomal Amphotericin B 50mg", "50mg", "Vials" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000025"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "ARVs & OIs", "Tablet", "Flucytosine", 50, "Tabs Flucytosine 500mg X 100", "500mg", "Tablets" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000026"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "ARVs & OIs", "Solution", "Podophyllotoxin", 20, "Podophyllotoxin Solution 0.5% w/v", "0.5% w/v", "Bottles" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000027"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "Preventive Supplies", "Device", "Male Condom", 1000, "Male Condoms pcs", "N/A", "Pieces" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000028"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "Preventive Supplies", "Device", "Female Condom", 500, "Female Condom pcs", "N/A", "Pieces" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000029"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "Preventive Supplies", "Gel", "Lubricant", 200, "Lubricant", "N/A", "Bottles" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000030"),
                columns: new[] { "Category", "DosageForm", "GenericName", "Name", "Strength", "Unit" },
                values: new object[] { "RTKs", "Test Kit", "HIV Rapid Test - Determine", "DETERMINE X 100", "N/A", "Tests" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000031"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "RTKs", "Test Kit", "HIV Rapid Test - UniGold", 50, "UNIGOLD X 20", "N/A", "Tests" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000032"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "RTKs", "Test Kit", "HIV Rapid Test - STAT-PAK", 50, "STAT-PAK X 20", "N/A", "Tests" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000033"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "RTKs", "Test Kit", "Cryptococcal Antigen Test", 50, "Cryptococcal Antigen Lateral Flow Assay (CrAg-LFA) X 50", "N/A", "Tests" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000034"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "RTKs", "Test Kit", "HIV Recency Test - Asante", 100, "Recency Test Kit (Asante) X 100", "N/A", "Tests" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000035"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "RTKs", "Test Kit", "Urine TB LF-LAM", 25, "Urine TB LF-LAM X 25", "N/A", "Tests" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000036"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "RTKs", "Test Kit", "CD4 Test - Visitect", 25, "Visitect X 25", "N/A", "Tests" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000001"),
                columns: new[] { "Category", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARV - Adult 2nd Line", "Lamivudine/Emtricitabine+Atazanavir/Ritonavir", 50, "3TC/FTC(300/300mg)+ATV/r(300/100mg)", "300/300mg+300/100mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000002"),
                columns: new[] { "Category", "GenericName", "Name", "Strength" },
                values: new object[] { "ARV - Adult 1st Line", "Lamivudine/Emtricitabine+Efavirenz", "3TC/FTC(300/300mg)+EFV(600mg)", "300/300mg+600mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000003"),
                columns: new[] { "Category", "GenericName", "Name", "Strength" },
                values: new object[] { "ARV - Adult 1st Line", "Lamivudine/Emtricitabine+Nevirapine", "3TC/FTC(300/300mg)+NVP(200mg)", "300/300mg+200mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000004"),
                columns: new[] { "Category", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARV - Paediatric 1st Line", "Abacavir/Lamivudine/Dolutegravir", 80, "ABC(120mg)/3TC(60mg)/DTG(50mg)", "120/60/50mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000005"),
                columns: new[] { "Category", "GenericName", "Name", "Strength" },
                values: new object[] { "ARV - Paediatric 1st Line", "Abacavir/Lamivudine+Dolutegravir", "ABC(120mg)/3TC(60mg)+DTG(10mg)", "120/60mg+10mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000006"),
                columns: new[] { "Category", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARV - Paediatric 1st Line", "Abacavir/Lamivudine+Dolutegravir", 80, "ABC(120mg)/3TC(60mg)+DTG(50mg)", "120/60mg+50mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000007"),
                columns: new[] { "Category", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARV - Paediatric 1st Line", "Abacavir+Lamivudine+Dolutegravir", 80, "ABC(120mg)+3TC(60mg)+DTG(50mg)", "120+60+50mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000008"),
                columns: new[] { "Category", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARV - Paediatric 2nd Line", "Abacavir+Lamivudine+Lopinavir/Ritonavir", 60, "ABC(120mg)+3TC(60mg)+LPV/r(100mg/25mg)", "120+60+100/25mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000009"),
                columns: new[] { "Category", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARV - Paediatric 2nd Line", "Abacavir+Lamivudine+Lopinavir/Ritonavir", 60, "ABC(120mg)+3TC(60mg)+LPV/r(40mg/10mg)", "120+60+40/10mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000010"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "ARV - Paediatric 1st Line", "Oral Solution+Tablet", "Abacavir+Lamivudine+Dolutegravir", 40, "ABC(20mg/ml)+3TC(300mg)+DTG50(50mg)", "20mg/ml+300+50mg", "Pack" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000011"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARV - Paediatric 2nd Line", "Oral Solution", "Abacavir+Didanosine+Lopinavir/Ritonavir", 30, "ABC(20mg/ml)+DDI(10mg/ml)+LPV/r(80/20mg/ml)", "20+10+80/20mg/ml" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000012"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "ARV - Paediatric 1st Line", "Oral Solution+Tablet", "Abacavir+Emtricitabine+Dolutegravir", 40, "ABC(20mg/ml)+FTC(200mg)+DTG(50mg)", "20mg/ml+200+50mg", "Pack" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000013"),
                columns: new[] { "Category", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARV - Adult 1st Line", "Abacavir+Lamivudine+Efavirenz", 100, "ABC(300mg)+3TC(150mg)+EFV(600mg)", "300+150+600mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000014"),
                columns: new[] { "Category", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARV - Adult 2nd Line", "Abacavir+Lamivudine+Lopinavir/Ritonavir", 60, "ABC(300mg)+3TC(150mg)+LPV/r(200/50mg)", "300+150+200/50mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000015"),
                columns: new[] { "Category", "GenericName", "Name", "Strength" },
                values: new object[] { "ARV - Adult 1st Line", "Abacavir+Lamivudine+Nevirapine", "ABC(300mg)+3TC(150mg)+NVP(200mg)", "300+150+200mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000016"),
                columns: new[] { "Category", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARV - Adult 1st Line", "Abacavir/Lamivudine+Dolutegravir", 120, "ABC(600mg)/3TC(300mg)+DTG(50mg)", "600/300mg+50mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000017"),
                columns: new[] { "Category", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARV - Adult 1st Line", "Abacavir+Lamivudine+Dolutegravir", 120, "ABC(600mg)+3TC(300mg)+DTG(50mg)", "600+300+50mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000018"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "ARV - Paediatric 1st Line", "Tablet", "Abacavir/Lamivudine+Dolutegravir", 80, "ABC(60mg)/3TC(30mg)+DTG(50mg)", "60/30mg+50mg", "Tablets" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000019"),
                columns: new[] { "Category", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARV - Paediatric 1st Line", "Abacavir+Lamivudine+Dolutegravir", 80, "ABC(60mg)+3TC(30mg)+DTG(50mg)", "60+30+50mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000020"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "ARV - Paediatric 1st Line", "Tablet", "Abacavir+Lamivudine+Efavirenz", 80, "ABC(60mg)+3TC(30mg)+EFV(200mg)", "60+30+200mg", "Tablets" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000021"),
                columns: new[] { "Category", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARV - Paediatric 2nd Line", "Abacavir+Lamivudine+Lopinavir/Ritonavir", 60, "ABC(60mg)+3TC(30mg)+LPV/r(40/10mg)", "60+30+40/10mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000022"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARV - Paediatric 2nd Line", "Oral Solution", "Abacavir+Lamivudine+Lopinavir/Ritonavir", 30, "ABC(60mg)+3TC(30mg)+LPV/r(80/20mg/ml)", "60+30+80/20mg/ml" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000023"),
                columns: new[] { "Category", "GenericName", "MinimumStockLevel", "Name", "Strength" },
                values: new object[] { "ARV - Paediatric 1st Line", "Abacavir+Lamivudine+Nevirapine", 80, "ABC(60mg)+3TC(30mg)+NVP(50mg)", "60+30+50mg" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000024"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "ARV - Paediatric 1st Line", "Oral Solution+Capsule", "Zidovudine+Lamivudine+Efavirenz", 40, "AZT(10mg/ml)+3TC(10mg/ml)+EFV(200mg)", "10+10mg/ml+200mg", "Pack" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000025"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "ARV - Paediatric 1st Line", "Oral Solution", "Zidovudine+Lamivudine+Nevirapine", 40, "AZT(10mg/ml)+3TC(10mg/ml)+NVP(10mg/ml)", "10+10+10mg/ml", "Bottles" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000026"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "ARV - Adult 1st Line", "Tablet", "Zidovudine+Lamivudine+Abacavir", 80, "AZT(300mg)+3TC(150mg)+ABC(300mg)", "300+150+300mg", "Tablets" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000027"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "ARV - Adult 2nd Line", "Tablet", "Zidovudine+Lamivudine+Atazanavir/Ritonavir", 50, "AZT(300mg)+3TC(150mg)+ATV/r(300mg/100mg)", "300+150+300/100mg", "Tablets" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000028"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "ARV - Adult 1st Line", "Tablet", "Zidovudine+Lamivudine+Efavirenz", 100, "AZT(300mg)+3TC(150mg)+EFV(600mg)", "300+150+600mg", "Tablets" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000029"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "ARV - Adult 2nd Line", "Tablet", "Zidovudine+Lamivudine+Lopinavir/Ritonavir", 60, "AZT(300mg)+3TC(150mg)+LPV/r(200/50mg)", "300+150+200/50mg", "Tablets" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000030"),
                columns: new[] { "Category", "DosageForm", "GenericName", "Name", "Strength", "Unit" },
                values: new object[] { "ARV - Adult 1st Line", "Tablet", "Zidovudine+Lamivudine+Nevirapine", "AZT(300mg)+3TC(150mg)+NVP(200mg)", "300+150+200mg", "Tablets" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000031"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "ARV - Adult 1st Line", "Tablet", "Zidovudine+Lamivudine+Tenofovir", 80, "AZT(300mg)+3TC(150mg)+TDF(300mg)", "300+150+300mg", "Tablets" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000032"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "ARV - Adult 2nd Line", "Tablet", "Zidovudine+Tenofovir+Lamivudine+Atazanavir/Ritonavir", 40, "AZT(300mg)+TDF(300mg)+3TC(150mg)+ATV/r(300mg/100mg)", "300+300+150+300/100mg", "Tablets" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000033"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "ARV - Paediatric 2nd Line", "Tablet", "Zidovudine+Lamivudine+Lopinavir/Ritonavir", 60, "AZT(60mg)+3TC(30mg)+LPV/r(40/10mg)", "60+30+40/10mg", "Tablets" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000034"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "ARV - Paediatric 2nd Line", "Oral Solution", "Zidovudine+Lamivudine+Lopinavir/Ritonavir", 30, "AZT(60mg)+3TC(30mg)+LPV/r(80/20mg/ml)", "60+30+80/20mg/ml", "Bottles" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000035"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "ARV - Adult 1st Line", "Tablet", "Zidovudine/Lamivudine+Efavirenz", 100, "AZT/3TC(300/150mg)+EFV(200mg)", "300/150+200mg", "Tablets" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000036"),
                columns: new[] { "Category", "DosageForm", "GenericName", "MinimumStockLevel", "Name", "Strength", "Unit" },
                values: new object[] { "ARV - Adult 1st Line", "Tablet", "Zidovudine/Lamivudine+Efavirenz", 100, "AZT/3TC(300/150mg)+EFV(600mg)", "300/150+600mg", "Tablets" });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Category", "CreatedAt", "Description", "DosageForm", "GenericName", "IsActive", "MinimumStockLevel", "Name", "Strength", "Unit", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-0000-0000-000000000037"), "ARV - Adult 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Zidovudine/Lamivudine+Nevirapine", true, 100, "AZT/3TC(300/150mg)+NVP(200mg)", "300/150+200mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000038"), "ARV - Adult 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Zidovudine/Lamivudine/Nevirapine", true, 100, "AZT/3TC/NVP(300/150/200mg)", "300/150/200mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000039"), "OI Prophylaxis", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Oral Suspension", "Sulfamethoxazole/Trimethoprim", true, 50, "Cotrimoxazole 240mg/5ml", "240mg/5ml", "Bottles", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000040"), "OI Prophylaxis", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Sulfamethoxazole/Trimethoprim", true, 100, "Cotrimoxazole 480mg", "480mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000041"), "OI Prophylaxis", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Sulfamethoxazole/Trimethoprim", true, 100, "Cotrimoxazole 960mg", "960mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000042"), "ARV - Adult 1st Line (Legacy)", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Stavudine+Lamivudine+Efavirenz", true, 40, "d4T(30mg)+3TC(150mg)+EFV(600mg)", "30+150+600mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000043"), "ARV - Adult 1st Line (Legacy)", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Stavudine+Lamivudine+Nevirapine", true, 40, "d4T(30mg)+3TC(150mg)+NVP(200mg)", "30+150+200mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000044"), "ARV - Paediatric 1st Line (Legacy)", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Stavudine/Lamivudine/Nevirapine", true, 40, "d4T/3TC/NVP(6/30/50mg)", "6/30/50mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000045"), "ARV - Individual ARV", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Dolutegravir", true, 100, "Dolutegravir", "50mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000046"), "ARV - Individual ARV", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Dolutegravir", true, 100, "Dolutegravir(50mg)", "50mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000047"), "Supportive Care", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Folic Acid", true, 200, "Folic Acid 5mg", "5mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000048"), "TB Preventive Therapy", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Isoniazid", true, 150, "Isoniazid-(INH) 100mg", "100mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000049"), "TB Preventive Therapy", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Isoniazid", true, 150, "Isoniazid-(INH) 300mg", "300mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000050"), "TB Preventive Therapy", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Isoniazid", true, 150, "Isoniazid 100mg", "100mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000051"), "TB Preventive Therapy", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Isoniazid/Rifapentine", true, 80, "Isoniazid and Rifapentine-(3HP)", "3HP combo", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000052"), "TB Preventive Therapy", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Isoniazid/Pyridoxine/Cotrimoxazole", true, 100, "Isoniazid(300mg)/Pyridoxine(25mg)/Cotrimoxazole(960mg)", "300/25/960mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000053"), "ARV - Individual ARV", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Lamivudine", true, 100, "Lamivudine", "150mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000054"), "ARV - Adult 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Tenofovir/Lamivudine/Dolutegravir", true, 200, "TDF(300mg)/3TC(300mg)/DTG(50mg)", "300/300/50mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000055"), "ARV - Adult 2nd Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Tenofovir+Lamivudine+Atazanavir/Ritonavir", true, 60, "TDF(300mg)+3TC(150mg)+ATV/r(300/100mg)", "300+150+300/100mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000056"), "ARV - Adult 2nd Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Tenofovir+Lamivudine+Lopinavir/Ritonavir", true, 60, "TDF(300mg)+3TC(150mg)+LPV/r(200/50mg)", "300+150+200/50mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000057"), "ARV - Adult 2nd Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Tenofovir+Lamivudine+Atazanavir/Ritonavir", true, 60, "TDF(300mg)+3TC(300mg)+ATV/r(300/100mg)", "300+300+300/100mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000058"), "ARV - Adult 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Tenofovir+Lamivudine+Efavirenz", true, 120, "TDF(300mg)+3TC(300mg)+EFV(600mg)", "300+300+600mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000059"), "ARV - Adult 2nd Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Tenofovir+Lamivudine+Lopinavir/Ritonavir", true, 60, "TDF(300mg)+3TC(300mg)+LPV/r(200/50mg)", "300+300+200/50mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000060"), "ARV - Adult 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Tenofovir+Lamivudine+Nevirapine", true, 100, "TDF(300mg)+3TC(300mg)+NVP(200mg)", "300+300+200mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000061"), "ARV - Paediatric 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Tenofovir+Lamivudine+Dolutegravir", true, 80, "TDF(300mg)+3TC(30mg)+DTG(50mg)", "300+30+50mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000062"), "ARV - Adult 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Tenofovir+Emtricitabine+Dolutegravir", true, 150, "TDF(300mg)+FTC(200mg)+DTG(50mg)", "300+200+50mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000063"), "ARV - Adult 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Tenofovir/Emtricitabine+Efavirenz", true, 120, "TDF/FTC(300/200mg)+EFV(600mg)", "300/200+600mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000064"), "ARV - Adult 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Tenofovir/Emtricitabine+Nevirapine", true, 100, "TDF/FTC(300/200mg)+NVP(200mg)", "300/200+200mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000065"), "ARV - Individual ARV", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Tenofovir Disoproxil", true, 100, "Tenofovir", "300mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) }
                });
        }
    }
}
