using PSCMS.Common;
using PSCMS.DTOs.Transfer;

namespace PSCMS.Services.Interfaces;

public interface ITransferService
{
    Task<PagedResult<StockTransferDto>> GetAllAsync(int page, int pageSize, Guid? facilityId, string? status, string? stateFilter = null);
    Task<StockTransferDto?> GetByIdAsync(Guid id);
    Task<StockTransferDto> CreateAsync(CreateStockTransferDto dto, Guid requestedBy);
    Task<StockTransferDto?> UpdateStatusAsync(Guid id, UpdateTransferStatusDto dto, Guid updatedBy);
}
