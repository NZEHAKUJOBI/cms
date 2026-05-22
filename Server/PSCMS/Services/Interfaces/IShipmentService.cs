using PSCMS.Common;
using PSCMS.DTOs.GRN;
using PSCMS.DTOs.Shipment;

namespace PSCMS.Services.Interfaces;

public interface IShipmentService
{
    Task<PagedResult<ShipmentDto>> GetAllAsync(int page, int pageSize, Guid? facilityId, string? status);
    Task<ShipmentDto?> GetByIdAsync(Guid id);
    Task<ShipmentDto> CreateAsync(CreateShipmentDto dto, Guid preparedBy);
    Task<ShipmentDto?> UpdateStatusAsync(Guid id, UpdateShipmentStatusDto dto);
    Task<GrnDto> SubmitGrnAsync(Guid shipmentId, SubmitGrnDto dto, Guid inspectedBy);
}
