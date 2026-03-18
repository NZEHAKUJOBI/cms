namespace PSCMS.Models;

public class Facility
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public FacilityType Type { get; set; }
    public string District { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Shipment> Shipments { get; set; } = new List<Shipment>();
}

public enum FacilityType
{
    Hospital,
    HealthCenter,
    Clinic,
    Dispensary,
    Pharmacy
}
