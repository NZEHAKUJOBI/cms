using Microsoft.EntityFrameworkCore;
using PSCMS.Models;

namespace PSCMS.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Facility> Facilities => Set<Facility>();
    public DbSet<Inventory> Inventories => Set<Inventory>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Shipment> Shipments => Set<Shipment>();
    public DbSet<ShipmentItem> ShipmentItems => Set<ShipmentItem>();
    public DbSet<StockLedger> StockLedger => Set<StockLedger>();
    public DbSet<WeeklyStockSnapshot> WeeklyStockSnapshots => Set<WeeklyStockSnapshot>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
    public DbSet<GoodsReceiptNote> GoodsReceiptNotes => Set<GoodsReceiptNote>();
    public DbSet<GoodsReceiptNoteItem> GoodsReceiptNoteItems => Set<GoodsReceiptNoteItem>();
    public DbSet<StockTransfer> StockTransfers => Set<StockTransfer>();
    public DbSet<StockTransferItem> StockTransferItems => Set<StockTransferItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.HasIndex(u => u.Username).IsUnique();
            e.Property(u => u.Role).HasConversion<string>().HasColumnType("text");
        });

        // Product
        modelBuilder.Entity<Product>(e =>
        {
            e.HasIndex(p => p.Name);
        });

        // Facility
        modelBuilder.Entity<Facility>(e =>
        {
            e.HasIndex(f => f.Code).IsUnique();
            e.Property(f => f.Type).HasConversion<string>().HasColumnType("text");
        });

        // Inventory: unique per facility + product + batch number (allows same drug with different batches)
        modelBuilder.Entity<Inventory>(e =>
        {
            e.HasIndex(i => new { i.FacilityId, i.ProductId, i.BatchNumber }).IsUnique();
            e.HasOne(i => i.Facility).WithMany(f => f.Inventories).HasForeignKey(i => i.FacilityId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(i => i.Product).WithMany(p => p.Inventories).HasForeignKey(i => i.ProductId).OnDelete(DeleteBehavior.Restrict);
        });

        // Order
        modelBuilder.Entity<Order>(e =>
        {
            e.HasIndex(o => o.OrderNumber).IsUnique();
            e.Property(o => o.Status).HasConversion<string>().HasColumnType("text");
            e.HasOne(o => o.Facility).WithMany(f => f.Orders).HasForeignKey(o => o.FacilityId).OnDelete(DeleteBehavior.Restrict);
        });

        // OrderItem
        modelBuilder.Entity<OrderItem>(e =>
        {
            e.HasOne(oi => oi.Order).WithMany(o => o.OrderItems).HasForeignKey(oi => oi.OrderId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(oi => oi.Product).WithMany(p => p.OrderItems).HasForeignKey(oi => oi.ProductId).OnDelete(DeleteBehavior.Restrict);
        });

        // Shipment
        modelBuilder.Entity<Shipment>(e =>
        {
            e.HasIndex(s => s.ShipmentNumber).IsUnique();
            e.Property(s => s.Status).HasConversion<string>().HasColumnType("text");
            e.HasOne(s => s.Facility).WithMany(f => f.Shipments).HasForeignKey(s => s.FacilityId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(s => s.Order).WithMany(o => o.Shipments).HasForeignKey(s => s.OrderId).OnDelete(DeleteBehavior.SetNull);
        });

        // ShipmentItem
        modelBuilder.Entity<ShipmentItem>(e =>
        {
            e.HasOne(si => si.Shipment).WithMany(s => s.ShipmentItems).HasForeignKey(si => si.ShipmentId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(si => si.Product).WithMany(p => p.ShipmentItems).HasForeignKey(si => si.ProductId).OnDelete(DeleteBehavior.Restrict);
        });

        // StockLedger
        modelBuilder.Entity<StockLedger>(e =>
        {
            e.HasIndex(sl => new { sl.InventoryId, sl.ChangedAt });
            e.HasOne(sl => sl.Inventory).WithMany().HasForeignKey(sl => sl.InventoryId).OnDelete(DeleteBehavior.Cascade);
        });

        // WeeklyStockSnapshot: append-only time-series — multiple rows per week allowed
        modelBuilder.Entity<WeeklyStockSnapshot>(e =>
        {
            e.HasIndex(ws => new { ws.InventoryId, ws.WeekStartDate }); // non-unique: supports append mode
            e.HasOne(ws => ws.Inventory).WithMany().HasForeignKey(ws => ws.InventoryId).OnDelete(DeleteBehavior.Cascade);
        });

        // GoodsReceiptNote
        modelBuilder.Entity<GoodsReceiptNote>(e =>
        {
            e.HasIndex(g => g.GrnNumber).IsUnique();
            e.HasIndex(g => g.ShipmentId).IsUnique(); // one GRN per shipment
            e.Property(g => g.Status).HasConversion<string>().HasColumnType("text");
            e.HasOne(g => g.Shipment).WithMany().HasForeignKey(g => g.ShipmentId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(g => g.Facility).WithMany().HasForeignKey(g => g.FacilityId).OnDelete(DeleteBehavior.Restrict);
        });

        // GoodsReceiptNoteItem
        modelBuilder.Entity<GoodsReceiptNoteItem>(e =>
        {
            e.HasOne(gi => gi.GoodsReceiptNote).WithMany(g => g.Items).HasForeignKey(gi => gi.GrnId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(gi => gi.Product).WithMany().HasForeignKey(gi => gi.ProductId).OnDelete(DeleteBehavior.Restrict);
        });

        // StockTransfer
        modelBuilder.Entity<StockTransfer>(e =>
        {
            e.HasIndex(t => t.TransferNumber).IsUnique();
            e.Property(t => t.Status).HasConversion<string>().HasColumnType("text");
            e.HasOne(t => t.SourceFacility).WithMany().HasForeignKey(t => t.SourceFacilityId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(t => t.DestinationFacility).WithMany().HasForeignKey(t => t.DestinationFacilityId).OnDelete(DeleteBehavior.Restrict);
        });

        // StockTransferItem
        modelBuilder.Entity<StockTransferItem>(e =>
        {
            e.HasOne(ti => ti.StockTransfer).WithMany(t => t.Items).HasForeignKey(ti => ti.StockTransferId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(ti => ti.Product).WithMany().HasForeignKey(ti => ti.ProductId).OnDelete(DeleteBehavior.Restrict);
        });

        // Seed admin user
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
            Username = "admin",
            Email = "admin@pscms.org",
            PasswordHash = "$2a$11$3key4UV6y0c.JjCXNE94Te3PF.NIAFSsi286X7wJX/jiaoFyoK3VG",
            Role = UserRole.Admin,
            FacilityId = null,
            IsActive = true,
            CreatedAt = new DateTime(2026, 3, 18, 22, 37, 6, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 3, 18, 22, 37, 6, DateTimeKind.Utc)
        });

        // Seed default facilities for the North West states used in the app.
        SeedFacilities(modelBuilder);

        // Seed ARV / pharmaceutical products
        SeedProducts(modelBuilder);
    }

    private static void SeedFacilities(ModelBuilder modelBuilder)
    {
        var ts = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc);
        var facilities = new (string Id, string Name, string Code, FacilityType Type, string State, string District)[]
        {
            ("20000000-0000-0000-0000-000000000001", "Federal Medical Centre", "KEB-001", FacilityType.Hospital, "Kebbi", "Birnin Kebbi"),
            ("20000000-0000-0000-0000-000000000002", "G.Hosp.", "KEB-002", FacilityType.Hospital, "Kebbi", "Koko/Besse"),
            ("20000000-0000-0000-0000-000000000003", "G.Hosp. Arg.", "KEB-003", FacilityType.Hospital, "Kebbi", "Argungu"),
            ("20000000-0000-0000-0000-000000000004", "G.Hosp. Wara", "KEB-004", FacilityType.Hospital, "Kebbi", "Ngaski"),
            ("20000000-0000-0000-0000-000000000005", "General Hospital Yauri", "KEB-005", FacilityType.Hospital, "Kebbi", "Yauri"),
            ("20000000-0000-0000-0000-000000000006", "Jega", "KEB-006", FacilityType.Hospital, "Kebbi", "Jega"),
            ("20000000-0000-0000-0000-000000000007", "Kamba General Hospital", "KEB-007", FacilityType.Hospital, "Kebbi", "Dandi"),
            ("20000000-0000-0000-0000-000000000008", "Kaoje GH", "KEB-008", FacilityType.Hospital, "Kebbi", "Bagudo"),
            ("20000000-0000-0000-0000-000000000009", "Sir Yahaya Mem. Hospital", "KEB-009", FacilityType.Hospital, "Kebbi", "Birnin Kebbi"),
            ("20000000-0000-0000-0000-000000000010", "Wasagu General Hospital", "KEB-010", FacilityType.Hospital, "Kebbi", "Danko/Wasagu"),
            ("20000000-0000-0000-0000-000000000011", "Zuru Martha Bamaiyi General Hospital", "KEB-011", FacilityType.Hospital, "Kebbi", "Zuru"),

            ("20000000-0000-0000-0000-000000000012", "General Hospital Dogon Daji", "SOK-001", FacilityType.Hospital, "Sokoto", "Tambuwal"),
            ("20000000-0000-0000-0000-000000000013", "General Hospital Tambuwal", "SOK-002", FacilityType.Hospital, "Sokoto", "Tambuwal"),
            ("20000000-0000-0000-0000-000000000014", "Holy Family Clinic", "SOK-003", FacilityType.Clinic, "Sokoto", "Sokoto North"),
            ("20000000-0000-0000-0000-000000000015", "Ilela General Hospital", "SOK-004", FacilityType.Hospital, "Sokoto", "Illela"),
            ("20000000-0000-0000-0000-000000000016", "Isa General Hospital", "SOK-005", FacilityType.Hospital, "Sokoto", "Isa"),
            ("20000000-0000-0000-0000-000000000017", "Maryam Abacha Women & Children Hospital", "SOK-006", FacilityType.Hospital, "Sokoto", "Sokoto South"),
            ("20000000-0000-0000-0000-000000000018", "Rabah General Hospital", "SOK-007", FacilityType.Hospital, "Sokoto", "Rabah"),
            ("20000000-0000-0000-0000-000000000019", "Sanyinna Comprehensive Health Centre", "SOK-008", FacilityType.HealthCenter, "Sokoto", "Tambuwal"),
            ("20000000-0000-0000-0000-000000000020", "Kofar Rini Comprehensive Health Centre", "SOK-009", FacilityType.HealthCenter, "Sokoto", "Sokoto North"),
            ("20000000-0000-0000-0000-000000000021", "Sokoto Specialist Hospital - Sokoto", "SOK-010", FacilityType.Hospital, "Sokoto", "Sokoto South"),
            ("20000000-0000-0000-0000-000000000022", "Usmanu Danfodiyyo University Teaching Hospital (UDUTH) - Sokoto", "SOK-011", FacilityType.Hospital, "Sokoto", "Wamako"),
            ("20000000-0000-0000-0000-000000000023", "Women and Children Welfare Clinic", "SOK-012", FacilityType.Clinic, "Sokoto", "Sokoto North"),
            ("20000000-0000-0000-0000-000000000024", "Wurno General Hospital", "SOK-013", FacilityType.Hospital, "Sokoto", "Wurno"),

            ("20000000-0000-0000-0000-000000000025", "Anka General Hospital", "ZAM-001", FacilityType.Hospital, "Zamfara", "Anka"),
            ("20000000-0000-0000-0000-000000000026", "Bungudu General Hospital", "ZAM-002", FacilityType.Hospital, "Zamfara", "Bungudu"),
            ("20000000-0000-0000-0000-000000000027", "Gummi General Hospital", "ZAM-003", FacilityType.Hospital, "Zamfara", "Gummi"),
            ("20000000-0000-0000-0000-000000000028", "Gusau FMC", "ZAM-004", FacilityType.Hospital, "Zamfara", "Gusau"),
            ("20000000-0000-0000-0000-000000000029", "Gusau Gen Hosp", "ZAM-005", FacilityType.Hospital, "Zamfara", "Gusau"),
            ("20000000-0000-0000-0000-000000000030", "Kaura Namoda General Hospital", "ZAM-006", FacilityType.Hospital, "Zamfara", "Kaura Namoda"),
            ("20000000-0000-0000-0000-000000000031", "King Fahad WCWC", "ZAM-007", FacilityType.Clinic, "Zamfara", "Gusau"),
            ("20000000-0000-0000-0000-000000000032", "Magami PHC", "ZAM-008", FacilityType.HealthCenter, "Zamfara", "Gusau"),
            ("20000000-0000-0000-0000-000000000033", "Maru General Hospital", "ZAM-009", FacilityType.Hospital, "Zamfara", "Maru"),
            ("20000000-0000-0000-0000-000000000034", "Shinkafi Gen Hosp", "ZAM-010", FacilityType.Hospital, "Zamfara", "Shinkafi"),
            ("20000000-0000-0000-0000-000000000035", "Talata Mafara General Hospital", "ZAM-011", FacilityType.Hospital, "Zamfara", "Talata Mafara"),
            ("20000000-0000-0000-0000-000000000036", "Tsafe General Hosp", "ZAM-012", FacilityType.Hospital, "Zamfara", "Tsafe"),
            ("20000000-0000-0000-0000-000000000037", "Yerima Bakura Specialist Hospital", "ZAM-013", FacilityType.Hospital, "Zamfara", "Gusau"),
        };

        var seedData = new List<Facility>();
        for (var i = 0; i < facilities.Length; i++)
        {
            var facility = facilities[i];
            seedData.Add(new Facility
            {
                Id = Guid.Parse(facility.Id),
                Name = facility.Name,
                Code = facility.Code,
                Type = facility.Type,
                State = facility.State,
                District = facility.District,
                Region = "North West",
                ContactPerson = "",
                Phone = "",
                Email = null,
                IsActive = true,
                CreatedAt = ts,
                UpdatedAt = ts,
            });
        }

        modelBuilder.Entity<Facility>().HasData(seedData);
    }

    private static void SeedProducts(ModelBuilder modelBuilder)
    {
        var ts = new DateTime(2026, 4, 12, 0, 0, 0, DateTimeKind.Utc);

        var products = new (string Name, string Generic, string Category, string Form, string Strength, string Unit, int MinStock)[]
        {
            // ── ARVs & OIs ──────────────────────────────────────────────────────
            ("Tab TDF/3TC/DTG (300/300/50MG) X 90",                    "Tenofovir Disoproxil Fumarate/Lamivudine/Dolutegravir", "ARVs & OIs",           "Tablet",          "300/300/50mg",   "Tablets",   100),
            ("Tab TDF/3TC/DTG (300/300/50MG) X 30",                    "Tenofovir Disoproxil Fumarate/Lamivudine/Dolutegravir", "ARVs & OIs",           "Tablet",          "300/300/50mg",   "Tablets",   100),
            ("Tab TDF/3TC (300/300MG) X 30",                           "Tenofovir Disoproxil Fumarate/Lamivudine",             "ARVs & OIs",           "Tablet",          "300/300mg",      "Tablets",   100),
            ("Tab ABC/3TC (600/300MG) X 30",                           "Abacavir/Lamivudine",                                  "ARVs & OIs",           "Tablet",          "600/300mg",      "Tablets",   100),
            ("Tab ABC/3TC (120/60MG) X 30",                            "Abacavir/Lamivudine",                                  "ARVs & OIs",           "Tablet",          "120/60mg",       "Tablets",    80),
            ("Tab LPV/r (200/50MG) X 120",                             "Lopinavir/Ritonavir",                                  "ARVs & OIs",           "Tablet",          "200/50mg",       "Tablets",    60),
            ("Tab ATV/r (300/100MG) X 30",                             "Atazanavir/Ritonavir",                                 "ARVs & OIs",           "Tablet",          "300/100mg",      "Tablets",    50),
            ("Tab DTG 50MG X 30",                                      "Dolutegravir",                                         "ARVs & OIs",           "Tablet",          "50mg",           "Tablets",   100),
            ("Tab DTG 10MG X 90",                                      "Dolutegravir",                                         "ARVs & OIs",           "Tablet",          "10mg",           "Tablets",    80),
            ("Susp AZT (50MG/5mL) 240mL",                             "Zidovudine",                                           "ARVs & OIs",           "Suspension",      "50mg/5mL",       "Bottles",    50),
            ("Susp NVP (50MG/5mL) 100mL",                             "Nevirapine",                                           "ARVs & OIs",           "Suspension",      "50mg/5mL",       "Bottles",    50),
            ("Tab INH 300MG",                                          "Isoniazid",                                            "ARVs & OIs",           "Tablet",          "300mg",          "Tablets",   150),
            ("Tab INH 100MG X 100",                                    "Isoniazid",                                            "ARVs & OIs",           "Tablet",          "100mg",          "Tablets",   150),
            ("Tab 3HP",                                                "Isoniazid/Rifapentine",                                "ARVs & OIs",           "Tablet",          "300/300mg",      "Tablets",    80),
            ("Tabs INH/Pyridoxine/Cotrimoxazole 300/25/960mg",         "Isoniazid/Pyridoxine/Cotrimoxazole",                   "ARVs & OIs",           "Tablet",          "300/25/960mg",   "Tablets",   100),
            ("Tab Co-trimoxazole 960MG X 500",                         "Sulfamethoxazole/Trimethoprim",                        "ARVs & OIs",           "Tablet",          "960mg",          "Tablets",   100),
            ("Tab Co-trimoxazole 120MG X 1000",                        "Sulfamethoxazole/Trimethoprim",                        "ARVs & OIs",           "Tablet",          "120mg",          "Tablets",   100),
            ("Clotrimazole Vaginal Pessary 100MG x 6",                 "Clotrimazole",                                         "ARVs & OIs",           "Vaginal Pessary", "100mg",          "Pessaries",  50),
            ("Tab Metronidazole 200MG x 1000",                         "Metronidazole",                                        "ARVs & OIs",           "Tablet",          "200mg",          "Tablets",   100),
            ("Inj Benzathine benzyl penicilline 2.4MIU X 1",           "Benzathine Benzylpenicillin",                          "ARVs & OIs",           "Injection",       "2.4MIU",         "Vials",      50),
            ("Tabs Erythromycin 500mg x 10",                           "Erythromycin",                                         "ARVs & OIs",           "Tablet",          "500mg",          "Tablets",    50),
            ("Oral Nystatin drop",                                     "Nystatin",                                             "ARVs & OIs",           "Oral Drops",      "100,000 IU/mL",  "Bottles",    50),
            ("Tab Fluconazole 50MG X 10",                              "Fluconazole",                                          "ARVs & OIs",           "Tablet",          "50mg",           "Tablets",    50),
            ("Liposomal Amphotericin B 50mg",                          "Amphotericin B (Liposomal)",                           "ARVs & OIs",           "Injection",       "50mg",           "Vials",      20),
            ("Tabs Flucytosine 500mg X 100",                           "Flucytosine",                                          "ARVs & OIs",           "Tablet",          "500mg",          "Tablets",    50),
            ("Podophyllotoxin Solution 0.5% w/v",                      "Podophyllotoxin",                                      "ARVs & OIs",           "Solution",        "0.5% w/v",       "Bottles",    20),
            // ── Preventive Supplies ──────────────────────────────────────────────
            ("Male Condoms pcs",                                       "Male Condom",                                          "Preventive Supplies",  "Device",          "N/A",            "Pieces",   1000),
            ("Female Condom pcs",                                      "Female Condom",                                        "Preventive Supplies",  "Device",          "N/A",            "Pieces",    500),
            ("Lubricant",                                              "Lubricant",                                            "Preventive Supplies",  "Gel",             "N/A",            "Bottles",   200),
            // ── RTKs ─────────────────────────────────────────────────────────────
            ("DETERMINE X 100",                                        "HIV Rapid Test - Determine",                           "RTKs",                 "Test Kit",        "N/A",            "Tests",     100),
            ("UNIGOLD X 20",                                           "HIV Rapid Test - UniGold",                             "RTKs",                 "Test Kit",        "N/A",            "Tests",      50),
            ("STAT-PAK X 20",                                          "HIV Rapid Test - STAT-PAK",                            "RTKs",                 "Test Kit",        "N/A",            "Tests",      50),
            ("Cryptococcal Antigen Lateral Flow Assay (CrAg-LFA) X 50","Cryptococcal Antigen Test",                            "RTKs",                 "Test Kit",        "N/A",            "Tests",      50),
            ("Recency Test Kit (Asante) X 100",                        "HIV Recency Test - Asante",                            "RTKs",                 "Test Kit",        "N/A",            "Tests",     100),
            ("Urine TB LF-LAM X 25",                                   "Urine TB LF-LAM",                                      "RTKs",                 "Test Kit",        "N/A",            "Tests",      25),
            ("Visitect X 25",                                          "CD4 Test - Visitect",                                  "RTKs",                 "Test Kit",        "N/A",            "Tests",      25),
        };

        var seedData = new List<Product>();
        for (var i = 0; i < products.Length; i++)
        {
            var p = products[i];
            var id = Guid.Parse($"10000000-0000-0000-0000-{(i + 1):D12}");
            seedData.Add(new Product
            {
                Id = id,
                Name = p.Name,
                GenericName = p.Generic,
                Category = p.Category,
                DosageForm = p.Form,
                Strength = p.Strength,
                Unit = p.Unit,
                MinimumStockLevel = p.MinStock,
                IsActive = true,
                CreatedAt = ts,
                UpdatedAt = ts,
            });
        }

        modelBuilder.Entity<Product>().HasData(seedData);
    }
}
