namespace PSCMS.Models;

/// <summary>One record per inventory item per ISO week (Mon–Sun). Updated to the latest value each week.</summary>
public class WeeklyStockSnapshot
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid InventoryId { get; set; }
    public Inventory Inventory { get; set; } = null!;
    public Guid FacilityId { get; set; }
    public Guid ProductId { get; set; }
    public int StockOnHand { get; set; }
    /// <summary>UTC date-only: Monday of the ISO week this snapshot belongs to.</summary>
    public DateTime WeekStartDate { get; set; }
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
}
