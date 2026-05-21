using System.ComponentModel.DataAnnotations;

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
    [Required]
    public Guid FacilityId { get; set; }

    [Required]
    public Guid ProductId { get; set; }

    [Range(0, 10_000_000)]
    public int CurrentStock { get; set; }

    [Range(0, 10_000_000)]
    public int ReorderLevel { get; set; }

    [MaxLength(100)]
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
    [Range(1, 10_000_000)]
    public int Quantity { get; set; }

    [Required, RegularExpression("^(Add|Subtract)$", ErrorMessage = "AdjustmentType must be 'Add' or 'Subtract'.")]
    public string AdjustmentType { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string Reason { get; set; } = string.Empty;
}

public class SetStockDto
{
    [Range(0, 10_000_000)]
    public int StockOnHand { get; set; }

    [MaxLength(500)]
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

/// <summary>One row from a CSV bulk-import file.</summary>
public class BulkImportRowDto
{
    public string FacilityCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public int ReorderLevel { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
}
