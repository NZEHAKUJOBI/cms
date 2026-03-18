namespace PSCMS.Models;

public class Shipment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ShipmentNumber { get; set; } = string.Empty;
    public Guid? OrderId { get; set; }
    public Order? Order { get; set; }
    public Guid FacilityId { get; set; }
    public Facility Facility { get; set; } = null!;
    public ShipmentStatus Status { get; set; } = ShipmentStatus.Prepared;
    public DateTime ShipmentDate { get; set; } = DateTime.UtcNow;
    public DateTime? ExpectedDeliveryDate { get; set; }
    public DateTime? ActualDeliveryDate { get; set; }
    public Guid PreparedBy { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ShipmentItem> ShipmentItems { get; set; } = new List<ShipmentItem>();
}

public enum ShipmentStatus
{
    Prepared,
    InTransit,
    Delivered,
    Received,
    Returned
}
