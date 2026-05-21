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

        // Inventory: unique per facility+product
        modelBuilder.Entity<Inventory>(e =>
        {
            e.HasIndex(i => new { i.FacilityId, i.ProductId }).IsUnique();
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

        // WeeklyStockSnapshot: unique per inventory + week
        modelBuilder.Entity<WeeklyStockSnapshot>(e =>
        {
            e.HasIndex(ws => new { ws.InventoryId, ws.WeekStartDate }).IsUnique();
            e.HasOne(ws => ws.Inventory).WithMany().HasForeignKey(ws => ws.InventoryId).OnDelete(DeleteBehavior.Cascade);
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

        // Seed ARV / pharmaceutical products
        SeedProducts(modelBuilder);
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
