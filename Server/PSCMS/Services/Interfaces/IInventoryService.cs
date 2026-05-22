using PSCMS.Common;
using PSCMS.DTOs.Auth;
using PSCMS.DTOs.Inventory;

namespace PSCMS.Services.Interfaces;

public interface IInventoryService
{
    Task<PagedResult<InventoryDto>> GetAllAsync(int page, int pageSize, Guid? facilityId, bool? lowStockOnly);
    Task<InventoryDto?> GetByIdAsync(Guid id);
    Task<List<InventoryDto>> GetByFacilityAsync(Guid facilityId);
    Task<InventoryDto> CreateAsync(CreateInventoryDto dto, Guid? createdBy = null);
    Task<InventoryDto?> UpdateAsync(Guid id, UpdateInventoryDto dto);
    Task<InventoryDto?> AdjustStockAsync(Guid id, AdjustStockDto dto, Guid? changedBy = null);
    Task<InventoryDto?> SetStockAsync(Guid id, SetStockDto dto, Guid? changedBy = null);
    Task<List<InventoryDto>> GetLowStockAlertsAsync(Guid? facilityId);
    Task<List<InventoryDto>> GetNearExpiryAlertsAsync(int withinDays = 90, Guid? facilityId = null);
    Task<List<StockLedgerDto>> GetStockHistoryAsync(Guid inventoryId, int days = 90);
    Task<List<WeeklySnapshotDto>> GetWeeklySnapshotsAsync(Guid inventoryId, int weeks = 12);
    Task<BulkImportResultDto> BulkImportAsync(List<BulkImportRowDto> rows, Guid importedBy);
    Task<DemandForecastDto?> GetForecastAsync(Guid inventoryId, int weeks = 12);
    Task<RiskSummaryDto> GetRiskSummaryAsync(Guid? facilityId = null);
}
