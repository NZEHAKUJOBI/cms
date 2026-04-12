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
            ("3TC/FTC(300/300mg)+ATV/r(300/100mg)", "Lamivudine/Emtricitabine+Atazanavir/Ritonavir", "ARV - Adult 2nd Line", "Tablet", "300/300mg+300/100mg", "Tablets", 50),
            ("3TC/FTC(300/300mg)+EFV(600mg)", "Lamivudine/Emtricitabine+Efavirenz", "ARV - Adult 1st Line", "Tablet", "300/300mg+600mg", "Tablets", 100),
            ("3TC/FTC(300/300mg)+NVP(200mg)", "Lamivudine/Emtricitabine+Nevirapine", "ARV - Adult 1st Line", "Tablet", "300/300mg+200mg", "Tablets", 100),
            ("ABC(120mg)/3TC(60mg)/DTG(50mg)", "Abacavir/Lamivudine/Dolutegravir", "ARV - Paediatric 1st Line", "Tablet", "120/60/50mg", "Tablets", 80),
            ("ABC(120mg)/3TC(60mg)+DTG(10mg)", "Abacavir/Lamivudine+Dolutegravir", "ARV - Paediatric 1st Line", "Tablet", "120/60mg+10mg", "Tablets", 80),
            ("ABC(120mg)/3TC(60mg)+DTG(50mg)", "Abacavir/Lamivudine+Dolutegravir", "ARV - Paediatric 1st Line", "Tablet", "120/60mg+50mg", "Tablets", 80),
            ("ABC(120mg)+3TC(60mg)+DTG(50mg)", "Abacavir+Lamivudine+Dolutegravir", "ARV - Paediatric 1st Line", "Tablet", "120+60+50mg", "Tablets", 80),
            ("ABC(120mg)+3TC(60mg)+LPV/r(100mg/25mg)", "Abacavir+Lamivudine+Lopinavir/Ritonavir", "ARV - Paediatric 2nd Line", "Tablet", "120+60+100/25mg", "Tablets", 60),
            ("ABC(120mg)+3TC(60mg)+LPV/r(40mg/10mg)", "Abacavir+Lamivudine+Lopinavir/Ritonavir", "ARV - Paediatric 2nd Line", "Tablet", "120+60+40/10mg", "Tablets", 60),
            ("ABC(20mg/ml)+3TC(300mg)+DTG50(50mg)", "Abacavir+Lamivudine+Dolutegravir", "ARV - Paediatric 1st Line", "Oral Solution+Tablet", "20mg/ml+300+50mg", "Pack", 40),
            ("ABC(20mg/ml)+DDI(10mg/ml)+LPV/r(80/20mg/ml)", "Abacavir+Didanosine+Lopinavir/Ritonavir", "ARV - Paediatric 2nd Line", "Oral Solution", "20+10+80/20mg/ml", "Bottles", 30),
            ("ABC(20mg/ml)+FTC(200mg)+DTG(50mg)", "Abacavir+Emtricitabine+Dolutegravir", "ARV - Paediatric 1st Line", "Oral Solution+Tablet", "20mg/ml+200+50mg", "Pack", 40),
            ("ABC(300mg)+3TC(150mg)+EFV(600mg)", "Abacavir+Lamivudine+Efavirenz", "ARV - Adult 1st Line", "Tablet", "300+150+600mg", "Tablets", 100),
            ("ABC(300mg)+3TC(150mg)+LPV/r(200/50mg)", "Abacavir+Lamivudine+Lopinavir/Ritonavir", "ARV - Adult 2nd Line", "Tablet", "300+150+200/50mg", "Tablets", 60),
            ("ABC(300mg)+3TC(150mg)+NVP(200mg)", "Abacavir+Lamivudine+Nevirapine", "ARV - Adult 1st Line", "Tablet", "300+150+200mg", "Tablets", 100),
            ("ABC(600mg)/3TC(300mg)+DTG(50mg)", "Abacavir/Lamivudine+Dolutegravir", "ARV - Adult 1st Line", "Tablet", "600/300mg+50mg", "Tablets", 120),
            ("ABC(600mg)+3TC(300mg)+DTG(50mg)", "Abacavir+Lamivudine+Dolutegravir", "ARV - Adult 1st Line", "Tablet", "600+300+50mg", "Tablets", 120),
            ("ABC(60mg)/3TC(30mg)+DTG(50mg)", "Abacavir/Lamivudine+Dolutegravir", "ARV - Paediatric 1st Line", "Tablet", "60/30mg+50mg", "Tablets", 80),
            ("ABC(60mg)+3TC(30mg)+DTG(50mg)", "Abacavir+Lamivudine+Dolutegravir", "ARV - Paediatric 1st Line", "Tablet", "60+30+50mg", "Tablets", 80),
            ("ABC(60mg)+3TC(30mg)+EFV(200mg)", "Abacavir+Lamivudine+Efavirenz", "ARV - Paediatric 1st Line", "Tablet", "60+30+200mg", "Tablets", 80),
            ("ABC(60mg)+3TC(30mg)+LPV/r(40/10mg)", "Abacavir+Lamivudine+Lopinavir/Ritonavir", "ARV - Paediatric 2nd Line", "Tablet", "60+30+40/10mg", "Tablets", 60),
            ("ABC(60mg)+3TC(30mg)+LPV/r(80/20mg/ml)", "Abacavir+Lamivudine+Lopinavir/Ritonavir", "ARV - Paediatric 2nd Line", "Oral Solution", "60+30+80/20mg/ml", "Bottles", 30),
            ("ABC(60mg)+3TC(30mg)+NVP(50mg)", "Abacavir+Lamivudine+Nevirapine", "ARV - Paediatric 1st Line", "Tablet", "60+30+50mg", "Tablets", 80),
            ("AZT(10mg/ml)+3TC(10mg/ml)+EFV(200mg)", "Zidovudine+Lamivudine+Efavirenz", "ARV - Paediatric 1st Line", "Oral Solution+Capsule", "10+10mg/ml+200mg", "Pack", 40),
            ("AZT(10mg/ml)+3TC(10mg/ml)+NVP(10mg/ml)", "Zidovudine+Lamivudine+Nevirapine", "ARV - Paediatric 1st Line", "Oral Solution", "10+10+10mg/ml", "Bottles", 40),
            ("AZT(300mg)+3TC(150mg)+ABC(300mg)", "Zidovudine+Lamivudine+Abacavir", "ARV - Adult 1st Line", "Tablet", "300+150+300mg", "Tablets", 80),
            ("AZT(300mg)+3TC(150mg)+ATV/r(300mg/100mg)", "Zidovudine+Lamivudine+Atazanavir/Ritonavir", "ARV - Adult 2nd Line", "Tablet", "300+150+300/100mg", "Tablets", 50),
            ("AZT(300mg)+3TC(150mg)+EFV(600mg)", "Zidovudine+Lamivudine+Efavirenz", "ARV - Adult 1st Line", "Tablet", "300+150+600mg", "Tablets", 100),
            ("AZT(300mg)+3TC(150mg)+LPV/r(200/50mg)", "Zidovudine+Lamivudine+Lopinavir/Ritonavir", "ARV - Adult 2nd Line", "Tablet", "300+150+200/50mg", "Tablets", 60),
            ("AZT(300mg)+3TC(150mg)+NVP(200mg)", "Zidovudine+Lamivudine+Nevirapine", "ARV - Adult 1st Line", "Tablet", "300+150+200mg", "Tablets", 100),
            ("AZT(300mg)+3TC(150mg)+TDF(300mg)", "Zidovudine+Lamivudine+Tenofovir", "ARV - Adult 1st Line", "Tablet", "300+150+300mg", "Tablets", 80),
            ("AZT(300mg)+TDF(300mg)+3TC(150mg)+ATV/r(300mg/100mg)", "Zidovudine+Tenofovir+Lamivudine+Atazanavir/Ritonavir", "ARV - Adult 2nd Line", "Tablet", "300+300+150+300/100mg", "Tablets", 40),
            ("AZT(60mg)+3TC(30mg)+LPV/r(40/10mg)", "Zidovudine+Lamivudine+Lopinavir/Ritonavir", "ARV - Paediatric 2nd Line", "Tablet", "60+30+40/10mg", "Tablets", 60),
            ("AZT(60mg)+3TC(30mg)+LPV/r(80/20mg/ml)", "Zidovudine+Lamivudine+Lopinavir/Ritonavir", "ARV - Paediatric 2nd Line", "Oral Solution", "60+30+80/20mg/ml", "Bottles", 30),
            ("AZT/3TC(300/150mg)+EFV(200mg)", "Zidovudine/Lamivudine+Efavirenz", "ARV - Adult 1st Line", "Tablet", "300/150+200mg", "Tablets", 100),
            ("AZT/3TC(300/150mg)+EFV(600mg)", "Zidovudine/Lamivudine+Efavirenz", "ARV - Adult 1st Line", "Tablet", "300/150+600mg", "Tablets", 100),
            ("AZT/3TC(300/150mg)+NVP(200mg)", "Zidovudine/Lamivudine+Nevirapine", "ARV - Adult 1st Line", "Tablet", "300/150+200mg", "Tablets", 100),
            ("AZT/3TC/NVP(300/150/200mg)", "Zidovudine/Lamivudine/Nevirapine", "ARV - Adult 1st Line", "Tablet", "300/150/200mg", "Tablets", 100),
            ("Cotrimoxazole 240mg/5ml", "Sulfamethoxazole/Trimethoprim", "OI Prophylaxis", "Oral Suspension", "240mg/5ml", "Bottles", 50),
            ("Cotrimoxazole 480mg", "Sulfamethoxazole/Trimethoprim", "OI Prophylaxis", "Tablet", "480mg", "Tablets", 100),
            ("Cotrimoxazole 960mg", "Sulfamethoxazole/Trimethoprim", "OI Prophylaxis", "Tablet", "960mg", "Tablets", 100),
            ("d4T(30mg)+3TC(150mg)+EFV(600mg)", "Stavudine+Lamivudine+Efavirenz", "ARV - Adult 1st Line (Legacy)", "Tablet", "30+150+600mg", "Tablets", 40),
            ("d4T(30mg)+3TC(150mg)+NVP(200mg)", "Stavudine+Lamivudine+Nevirapine", "ARV - Adult 1st Line (Legacy)", "Tablet", "30+150+200mg", "Tablets", 40),
            ("d4T/3TC/NVP(6/30/50mg)", "Stavudine/Lamivudine/Nevirapine", "ARV - Paediatric 1st Line (Legacy)", "Tablet", "6/30/50mg", "Tablets", 40),
            ("Dolutegravir", "Dolutegravir", "ARV - Individual ARV", "Tablet", "50mg", "Tablets", 100),
            ("Dolutegravir(50mg)", "Dolutegravir", "ARV - Individual ARV", "Tablet", "50mg", "Tablets", 100),
            ("Folic Acid 5mg", "Folic Acid", "Supportive Care", "Tablet", "5mg", "Tablets", 200),
            ("Isoniazid-(INH) 100mg", "Isoniazid", "TB Preventive Therapy", "Tablet", "100mg", "Tablets", 150),
            ("Isoniazid-(INH) 300mg", "Isoniazid", "TB Preventive Therapy", "Tablet", "300mg", "Tablets", 150),
            ("Isoniazid 100mg", "Isoniazid", "TB Preventive Therapy", "Tablet", "100mg", "Tablets", 150),
            ("Isoniazid and Rifapentine-(3HP)", "Isoniazid/Rifapentine", "TB Preventive Therapy", "Tablet", "3HP combo", "Tablets", 80),
            ("Isoniazid(300mg)/Pyridoxine(25mg)/Cotrimoxazole(960mg)", "Isoniazid/Pyridoxine/Cotrimoxazole", "TB Preventive Therapy", "Tablet", "300/25/960mg", "Tablets", 100),
            ("Lamivudine", "Lamivudine", "ARV - Individual ARV", "Tablet", "150mg", "Tablets", 100),
            ("TDF(300mg)/3TC(300mg)/DTG(50mg)", "Tenofovir/Lamivudine/Dolutegravir", "ARV - Adult 1st Line", "Tablet", "300/300/50mg", "Tablets", 200),
            ("TDF(300mg)+3TC(150mg)+ATV/r(300/100mg)", "Tenofovir+Lamivudine+Atazanavir/Ritonavir", "ARV - Adult 2nd Line", "Tablet", "300+150+300/100mg", "Tablets", 60),
            ("TDF(300mg)+3TC(150mg)+LPV/r(200/50mg)", "Tenofovir+Lamivudine+Lopinavir/Ritonavir", "ARV - Adult 2nd Line", "Tablet", "300+150+200/50mg", "Tablets", 60),
            ("TDF(300mg)+3TC(300mg)+ATV/r(300/100mg)", "Tenofovir+Lamivudine+Atazanavir/Ritonavir", "ARV - Adult 2nd Line", "Tablet", "300+300+300/100mg", "Tablets", 60),
            ("TDF(300mg)+3TC(300mg)+EFV(600mg)", "Tenofovir+Lamivudine+Efavirenz", "ARV - Adult 1st Line", "Tablet", "300+300+600mg", "Tablets", 120),
            ("TDF(300mg)+3TC(300mg)+LPV/r(200/50mg)", "Tenofovir+Lamivudine+Lopinavir/Ritonavir", "ARV - Adult 2nd Line", "Tablet", "300+300+200/50mg", "Tablets", 60),
            ("TDF(300mg)+3TC(300mg)+NVP(200mg)", "Tenofovir+Lamivudine+Nevirapine", "ARV - Adult 1st Line", "Tablet", "300+300+200mg", "Tablets", 100),
            ("TDF(300mg)+3TC(30mg)+DTG(50mg)", "Tenofovir+Lamivudine+Dolutegravir", "ARV - Paediatric 1st Line", "Tablet", "300+30+50mg", "Tablets", 80),
            ("TDF(300mg)+FTC(200mg)+DTG(50mg)", "Tenofovir+Emtricitabine+Dolutegravir", "ARV - Adult 1st Line", "Tablet", "300+200+50mg", "Tablets", 150),
            ("TDF/FTC(300/200mg)+EFV(600mg)", "Tenofovir/Emtricitabine+Efavirenz", "ARV - Adult 1st Line", "Tablet", "300/200+600mg", "Tablets", 120),
            ("TDF/FTC(300/200mg)+NVP(200mg)", "Tenofovir/Emtricitabine+Nevirapine", "ARV - Adult 1st Line", "Tablet", "300/200+200mg", "Tablets", 100),
            ("Tenofovir", "Tenofovir Disoproxil", "ARV - Individual ARV", "Tablet", "300mg", "Tablets", 100),
        };

        var seedData = new List<Product>();
        for (var i = 0; i < products.Length; i++)
        {
            var p = products[i];
            // Deterministic GUID: "10000000-0000-0000-0000-{i:D12}"
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
