namespace PSCMS.DTOs.Report;

public class DashboardSummaryDto
{
    public int TotalFacilities { get; set; }
    public int TotalProducts { get; set; }
    public int PendingOrders { get; set; }
    public int ActiveShipments { get; set; }
    public int LowStockAlerts { get; set; }
    public int NearExpiryAlerts { get; set; }
    public List<FacilityStockSummaryDto> FacilitySummaries { get; set; } = new();
}

public class FacilityStockSummaryDto
{
    public Guid FacilityId { get; set; }
    public string FacilityName { get; set; } = string.Empty;
    public int TotalProducts { get; set; }
    public int LowStockCount { get; set; }
    public int OutOfStockCount { get; set; }
    public int NearExpiryCount { get; set; }
}

public class StockReportDto
{
    public Guid FacilityId { get; set; }
    public string FacilityName { get; set; } = string.Empty;
    public string FacilityRegion { get; set; } = string.Empty;
    public DateTime ReportDate { get; set; }
    public List<StockReportItemDto> Items { get; set; } = new();
}

public class StockReportItemDto
{
    public string ProductName { get; set; } = string.Empty;
    public string GenericName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public int ReorderLevel { get; set; }
    public int MinimumStockLevel { get; set; }
    public string StockStatus { get; set; } = string.Empty;
    public DateTime? ExpiryDate { get; set; }
}

public class OrderReportDto
{
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public int TotalOrders { get; set; }
    public int PendingOrders { get; set; }
    public int ApprovedOrders { get; set; }
    public int RejectedOrders { get; set; }
    public int FulfilledOrders { get; set; }
    public List<OrderSummaryDto> Orders { get; set; } = new();
}

public class OrderSummaryDto
{
    public string OrderNumber { get; set; } = string.Empty;
    public string FacilityName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public int TotalItems { get; set; }
}

public class FacilityDashboardDto
{
    public Guid FacilityId { get; set; }
    public string FacilityName { get; set; } = string.Empty;
    public int TotalProducts { get; set; }
    public int LowStockItems { get; set; }
    public int OutOfStockItems { get; set; }
    public int NearExpiryItems { get; set; }
    public int PendingOrders { get; set; }
    public int IncomingShipments { get; set; }
    public List<CategoryStockDto> CategoryBreakdown { get; set; } = new();
    public List<LowStockAlertItemDto> TopLowStockItems { get; set; } = new();
}

public class CategoryStockDto
{
    public string Category { get; set; } = string.Empty;
    public int ItemCount { get; set; }
    public int LowCount { get; set; }
}

public class LowStockAlertItemDto
{
    public string ProductName { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public int ReorderLevel { get; set; }
    public bool IsOutOfStock { get; set; }
}

public class DrugChartDataDto
{
    public List<CategoryChartItem> ProductsByCategory { get; set; } = new();
    public List<DosageFormChartItem> ProductsByDosageForm { get; set; } = new();
    public List<DrugAvailabilityItem> DrugAvailability { get; set; } = new();
    public int TotalDrugs { get; set; }
    public int ActiveDrugs { get; set; }
    public int InactiveDrugs { get; set; }
}

public class CategoryChartItem
{
    public string Category { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class DosageFormChartItem
{
    public string DosageForm { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class DrugAvailabilityItem
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int TotalStock { get; set; }
    public int FacilityCount { get; set; }
}
