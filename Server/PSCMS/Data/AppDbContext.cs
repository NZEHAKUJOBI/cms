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

        // Seed admin user
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
            Username = "admin",
            Email = "admin@pscms.org",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@1234"),
            Role = UserRole.Admin,
            FacilityId = null,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
    }
}
