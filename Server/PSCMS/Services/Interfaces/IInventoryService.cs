using PSCMS.Common;
using PSCMS.DTOs.Inventory;

namespace PSCMS.Services.Interfaces;

public interface IInventoryService
{
    Task<PagedResult<InventoryDto>> GetAllAsync(int page, int pageSize, Guid? facilityId, bool? lowStockOnly);
    Task<InventoryDto?> GetByIdAsync(Guid id);
    Task<List<InventoryDto>> GetByFacilityAsync(Guid facilityId);
    Task<InventoryDto> CreateAsync(CreateInventoryDto dto);
    Task<InventoryDto?> UpdateAsync(Guid id, UpdateInventoryDto dto);
    Task<InventoryDto?> AdjustStockAsync(Guid id, AdjustStockDto dto);
    Task<List<InventoryDto>> GetLowStockAlertsAsync(Guid? facilityId);
    Task<List<InventoryDto>> GetNearExpiryAlertsAsync(int withinDays = 90);
}
