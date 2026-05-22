namespace PSCMS.Models;

/// <summary>Records the physical inspection when a shipment arrives at a facility.</summary>
public class GoodsReceiptNote
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string GrnNumber { get; set; } = string.Empty;
    public Guid ShipmentId { get; set; }
    public Shipment Shipment { get; set; } = null!;
    public Guid FacilityId { get; set; }
    public Facility Facility { get; set; } = null!;
    public GrnStatus Status { get; set; } = GrnStatus.Accepted;
    public string? OverallNotes { get; set; }
    public Guid InspectedBy { get; set; }
    public DateTime InspectedAt { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<GoodsReceiptNoteItem> Items { get; set; } = new List<GoodsReceiptNoteItem>();
}

public enum GrnStatus
{
    Accepted,
    PartiallyAccepted,
    Rejected
}
