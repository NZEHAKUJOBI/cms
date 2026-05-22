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

public class BulkImportRowDto
{
    public string FacilityCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public int ReorderLevel { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
}

public class DemandForecastDto
{
    public Guid InventoryId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string FacilityName { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public int ReorderLevel { get; set; }
    /// <summary>Average weekly units consumed based on historical snapshots.</summary>
    public double AvgWeeklyConsumption { get; set; }
    /// <summary>Estimated weeks before stock runs out. null if consumption is zero.</summary>
    public double? WeeksUntilStockout { get; set; }
    /// <summary>Forecasted stock level 4 weeks from now.</summary>
    public int ForecastedStockIn4Weeks { get; set; }
    /// <summary>Recommended quantity to order to cover 8 weeks of demand.</summary>
    public int SuggestedReorderQuantity { get; set; }
    /// <summary>Critical | Warning | OK</summary>
    public string RiskLevel { get; set; } = "OK";
    public List<WeeklySnapshotDto> Snapshots { get; set; } = new();
    /// <summary>SSA | Average — which model produced the forecast.</summary>
    public string ModelUsed { get; set; } = "Average";
    /// <summary>Predicted weekly consumption for each of the next N weeks (SSA output).</summary>
    public List<double> ForecastedWeeklyDemand { get; set; } = new();
    /// <summary>Lower bound of 95% confidence interval per forecasted week.</summary>
    public List<double> ConfidenceLower { get; set; } = new();
    /// <summary>Upper bound of 95% confidence interval per forecasted week.</summary>
    public List<double> ConfidenceUpper { get; set; } = new();
}

public class RiskItemDto
{
    public Guid InventoryId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string FacilityName { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public int ReorderLevel { get; set; }
    public double AvgWeeklyConsumption { get; set; }
    public double? WeeksUntilStockout { get; set; }
    public string RiskLevel { get; set; } = "OK";
}

public class FacilityRiskDto
{
    public string FacilityName { get; set; } = string.Empty;
    public int CriticalCount { get; set; }
    public int WarningCount { get; set; }
    public int OkCount { get; set; }
    public int TotalItems { get; set; }
}

public class RiskSummaryDto
{
    public int CriticalCount { get; set; }
    public int WarningCount { get; set; }
    public int OkCount { get; set; }
    public int TotalItems { get; set; }
    public List<RiskItemDto> TopRiskItems { get; set; } = new();
    public List<FacilityRiskDto> FacilityBreakdown { get; set; } = new();
}
