using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PSCMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class SeedProducts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Category", "CreatedAt", "Description", "DosageForm", "GenericName", "IsActive", "MinimumStockLevel", "Name", "Strength", "Unit", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-0000-0000-000000000001"), "ARV - Adult 2nd Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Lamivudine/Emtricitabine+Atazanavir/Ritonavir", true, 50, "3TC/FTC(300/300mg)+ATV/r(300/100mg)", "300/300mg+300/100mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000002"), "ARV - Adult 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Lamivudine/Emtricitabine+Efavirenz", true, 100, "3TC/FTC(300/300mg)+EFV(600mg)", "300/300mg+600mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000003"), "ARV - Adult 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Lamivudine/Emtricitabine+Nevirapine", true, 100, "3TC/FTC(300/300mg)+NVP(200mg)", "300/300mg+200mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000004"), "ARV - Paediatric 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Abacavir/Lamivudine/Dolutegravir", true, 80, "ABC(120mg)/3TC(60mg)/DTG(50mg)", "120/60/50mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000005"), "ARV - Paediatric 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Abacavir/Lamivudine+Dolutegravir", true, 80, "ABC(120mg)/3TC(60mg)+DTG(10mg)", "120/60mg+10mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000006"), "ARV - Paediatric 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Abacavir/Lamivudine+Dolutegravir", true, 80, "ABC(120mg)/3TC(60mg)+DTG(50mg)", "120/60mg+50mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000007"), "ARV - Paediatric 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Abacavir+Lamivudine+Dolutegravir", true, 80, "ABC(120mg)+3TC(60mg)+DTG(50mg)", "120+60+50mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000008"), "ARV - Paediatric 2nd Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Abacavir+Lamivudine+Lopinavir/Ritonavir", true, 60, "ABC(120mg)+3TC(60mg)+LPV/r(100mg/25mg)", "120+60+100/25mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000009"), "ARV - Paediatric 2nd Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Abacavir+Lamivudine+Lopinavir/Ritonavir", true, 60, "ABC(120mg)+3TC(60mg)+LPV/r(40mg/10mg)", "120+60+40/10mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000010"), "ARV - Paediatric 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Oral Solution+Tablet", "Abacavir+Lamivudine+Dolutegravir", true, 40, "ABC(20mg/ml)+3TC(300mg)+DTG50(50mg)", "20mg/ml+300+50mg", "Pack", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000011"), "ARV - Paediatric 2nd Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Oral Solution", "Abacavir+Didanosine+Lopinavir/Ritonavir", true, 30, "ABC(20mg/ml)+DDI(10mg/ml)+LPV/r(80/20mg/ml)", "20+10+80/20mg/ml", "Bottles", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000012"), "ARV - Paediatric 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Oral Solution+Tablet", "Abacavir+Emtricitabine+Dolutegravir", true, 40, "ABC(20mg/ml)+FTC(200mg)+DTG(50mg)", "20mg/ml+200+50mg", "Pack", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000013"), "ARV - Adult 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Abacavir+Lamivudine+Efavirenz", true, 100, "ABC(300mg)+3TC(150mg)+EFV(600mg)", "300+150+600mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000014"), "ARV - Adult 2nd Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Abacavir+Lamivudine+Lopinavir/Ritonavir", true, 60, "ABC(300mg)+3TC(150mg)+LPV/r(200/50mg)", "300+150+200/50mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000015"), "ARV - Adult 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Abacavir+Lamivudine+Nevirapine", true, 100, "ABC(300mg)+3TC(150mg)+NVP(200mg)", "300+150+200mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000016"), "ARV - Adult 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Abacavir/Lamivudine+Dolutegravir", true, 120, "ABC(600mg)/3TC(300mg)+DTG(50mg)", "600/300mg+50mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000017"), "ARV - Adult 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Abacavir+Lamivudine+Dolutegravir", true, 120, "ABC(600mg)+3TC(300mg)+DTG(50mg)", "600+300+50mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000018"), "ARV - Paediatric 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Abacavir/Lamivudine+Dolutegravir", true, 80, "ABC(60mg)/3TC(30mg)+DTG(50mg)", "60/30mg+50mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000019"), "ARV - Paediatric 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Abacavir+Lamivudine+Dolutegravir", true, 80, "ABC(60mg)+3TC(30mg)+DTG(50mg)", "60+30+50mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000020"), "ARV - Paediatric 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Abacavir+Lamivudine+Efavirenz", true, 80, "ABC(60mg)+3TC(30mg)+EFV(200mg)", "60+30+200mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000021"), "ARV - Paediatric 2nd Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Abacavir+Lamivudine+Lopinavir/Ritonavir", true, 60, "ABC(60mg)+3TC(30mg)+LPV/r(40/10mg)", "60+30+40/10mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000022"), "ARV - Paediatric 2nd Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Oral Solution", "Abacavir+Lamivudine+Lopinavir/Ritonavir", true, 30, "ABC(60mg)+3TC(30mg)+LPV/r(80/20mg/ml)", "60+30+80/20mg/ml", "Bottles", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000023"), "ARV - Paediatric 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Abacavir+Lamivudine+Nevirapine", true, 80, "ABC(60mg)+3TC(30mg)+NVP(50mg)", "60+30+50mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000024"), "ARV - Paediatric 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Oral Solution+Capsule", "Zidovudine+Lamivudine+Efavirenz", true, 40, "AZT(10mg/ml)+3TC(10mg/ml)+EFV(200mg)", "10+10mg/ml+200mg", "Pack", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000025"), "ARV - Paediatric 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Oral Solution", "Zidovudine+Lamivudine+Nevirapine", true, 40, "AZT(10mg/ml)+3TC(10mg/ml)+NVP(10mg/ml)", "10+10+10mg/ml", "Bottles", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000026"), "ARV - Adult 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Zidovudine+Lamivudine+Abacavir", true, 80, "AZT(300mg)+3TC(150mg)+ABC(300mg)", "300+150+300mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000027"), "ARV - Adult 2nd Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Zidovudine+Lamivudine+Atazanavir/Ritonavir", true, 50, "AZT(300mg)+3TC(150mg)+ATV/r(300mg/100mg)", "300+150+300/100mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000028"), "ARV - Adult 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Zidovudine+Lamivudine+Efavirenz", true, 100, "AZT(300mg)+3TC(150mg)+EFV(600mg)", "300+150+600mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000029"), "ARV - Adult 2nd Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Zidovudine+Lamivudine+Lopinavir/Ritonavir", true, 60, "AZT(300mg)+3TC(150mg)+LPV/r(200/50mg)", "300+150+200/50mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000030"), "ARV - Adult 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Zidovudine+Lamivudine+Nevirapine", true, 100, "AZT(300mg)+3TC(150mg)+NVP(200mg)", "300+150+200mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000031"), "ARV - Adult 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Zidovudine+Lamivudine+Tenofovir", true, 80, "AZT(300mg)+3TC(150mg)+TDF(300mg)", "300+150+300mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000032"), "ARV - Adult 2nd Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Zidovudine+Tenofovir+Lamivudine+Atazanavir/Ritonavir", true, 40, "AZT(300mg)+TDF(300mg)+3TC(150mg)+ATV/r(300mg/100mg)", "300+300+150+300/100mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000033"), "ARV - Paediatric 2nd Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Zidovudine+Lamivudine+Lopinavir/Ritonavir", true, 60, "AZT(60mg)+3TC(30mg)+LPV/r(40/10mg)", "60+30+40/10mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000034"), "ARV - Paediatric 2nd Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Oral Solution", "Zidovudine+Lamivudine+Lopinavir/Ritonavir", true, 30, "AZT(60mg)+3TC(30mg)+LPV/r(80/20mg/ml)", "60+30+80/20mg/ml", "Bottles", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000035"), "ARV - Adult 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Zidovudine/Lamivudine+Efavirenz", true, 100, "AZT/3TC(300/150mg)+EFV(200mg)", "300/150+200mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000036"), "ARV - Adult 1st Line", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Tablet", "Zidovudine/Lamivudine+Efavirenz", true, 100, "AZT/3TC(300/150mg)+EFV(600mg)", "300/150+600mg", "Tablets", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000003"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000004"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000005"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000006"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000007"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000008"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000009"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000010"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000011"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000012"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000013"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000014"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000015"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000016"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000017"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000018"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000019"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000020"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000021"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000022"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000023"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000024"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000025"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000026"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000027"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000028"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000029"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000030"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000031"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000032"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000033"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000034"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000035"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000036"));

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
        }
    }
}
