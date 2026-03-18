using PSCMS.Common;
using PSCMS.DTOs.Facility;

namespace PSCMS.Services.Interfaces;

public interface IFacilityService
{
    Task<PagedResult<FacilityDto>> GetAllAsync(int page, int pageSize, string? search);
    Task<FacilityDto?> GetByIdAsync(Guid id);
    Task<FacilityDto> CreateAsync(CreateFacilityDto dto);
    Task<FacilityDto?> UpdateAsync(Guid id, UpdateFacilityDto dto);
    Task<bool> DeleteAsync(Guid id);
}
