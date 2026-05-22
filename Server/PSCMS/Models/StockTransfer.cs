namespace PSCMS.Models;

/// <summary>Direct stock movement between two facilities.</summary>
public class StockTransfer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TransferNumber { get; set; } = string.Empty;
    public Guid SourceFacilityId { get; set; }
    public Facility SourceFacility { get; set; } = null!;
    public Guid DestinationFacilityId { get; set; }
    public Facility DestinationFacility { get; set; } = null!;
    public TransferStatus Status { get; set; } = TransferStatus.Pending;
    public string? Notes { get; set; }
    public Guid RequestedBy { get; set; }
    public Guid? ApprovedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<StockTransferItem> Items { get; set; } = new List<StockTransferItem>();
}

public enum TransferStatus
{
    Pending,
    Approved,
    InTransit,
    Completed,
    Cancelled
}
