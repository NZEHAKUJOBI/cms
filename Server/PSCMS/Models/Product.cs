namespace PSCMS.Models;

public class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string GenericName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string DosageForm { get; set; } = string.Empty;
    public string Strength { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public int MinimumStockLevel { get; set; }
    public string? Description { get; set; }
    /// <summary>True if product requires cold-chain storage (e.g. vaccines, insulin).</summary>
    public bool RequiresColdChain { get; set; } = false;
    /// <summary>Minimum storage temperature in °C (null = no restriction).</summary>
    public double? StorageTemperatureMin { get; set; }
    /// <summary>Maximum storage temperature in °C (null = no restriction).</summary>
    public double? StorageTemperatureMax { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<ShipmentItem> ShipmentItems { get; set; } = new List<ShipmentItem>();
}
