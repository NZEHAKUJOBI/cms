namespace PSCMS.Models;

/// <summary>Immutable audit log of every stock change for an inventory record.</summary>
public class StockLedger
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid InventoryId { get; set; }
    public Inventory Inventory { get; set; } = null!;
    public Guid FacilityId { get; set; }
    public Guid ProductId { get; set; }
    public int PreviousStock { get; set; }
    public int NewStock { get; set; }
    /// <summary>Signed delta: positive = increase, negative = decrease.</summary>
    public int ChangeAmount { get; set; }
    /// <summary>"Initial", "Add", "Subtract", "Set"</summary>
    public string ChangeType { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public Guid? ChangedBy { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
}
