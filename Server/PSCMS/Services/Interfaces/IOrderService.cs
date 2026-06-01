using PSCMS.Common;
using PSCMS.DTOs.Order;

namespace PSCMS.Services.Interfaces;

public interface IOrderService
{
    Task<PagedResult<OrderDto>> GetAllAsync(int page, int pageSize, Guid? facilityId, string? status, string? stateFilter = null);
    Task<OrderDto?> GetByIdAsync(Guid id);
    Task<OrderDto> CreateAsync(CreateOrderDto dto, Guid requestedBy);
    Task<OrderDto?> ApproveAsync(Guid id, ApproveOrderDto dto, Guid approvedBy);
    Task<OrderDto?> RejectAsync(Guid id, RejectOrderDto dto, Guid rejectedBy);
    Task<bool> CancelAsync(Guid id, Guid requestedBy);
}
