namespace PSCMS.DTOs.Inventory;

public class InventoryDto
{
    public Guid Id { get; set; }
    public Guid FacilityId { get; set; }
    public string FacilityName { get; set; } = string.Empty;
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductUnit { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public int ReorderLevel { get; set; }
    public int MinimumStockLevel { get; set; }
    public bool IsLowStock { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public bool IsNearExpiry { get; set; }
    public DateTime LastUpdated { get; set; }
}

public class CreateInventoryDto
{
    public Guid FacilityId { get; set; }
    public Guid ProductId { get; set; }
    public int CurrentStock { get; set; }
    public int ReorderLevel { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
}

public class UpdateInventoryDto
{
    public int? CurrentStock { get; set; }
    public int? ReorderLevel { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
}

public class AdjustStockDto
{
    public int Quantity { get; set; }
    public string AdjustmentType { get; set; } = string.Empty; // "Add" or "Subtract"
    public string Reason { get; set; } = string.Empty;
}

public class SetStockDto
{
    public int StockOnHand { get; set; }
    public string? Reason { get; set; }
}

public class StockLedgerDto
{
    public Guid Id { get; set; }
    public int PreviousStock { get; set; }
    public int NewStock { get; set; }
    public int ChangeAmount { get; set; }
    public string ChangeType { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public DateTime ChangedAt { get; set; }
}

public class WeeklySnapshotDto
{
    public Guid Id { get; set; }
    public int StockOnHand { get; set; }
    public DateTime WeekStartDate { get; set; }
    public DateTime RecordedAt { get; set; }
}
