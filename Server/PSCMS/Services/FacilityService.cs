using Microsoft.EntityFrameworkCore;
using PSCMS.Common;
using PSCMS.Data;
using PSCMS.DTOs.Facility;
using PSCMS.Models;
using PSCMS.Services.Interfaces;

namespace PSCMS.Services;

public class FacilityService : IFacilityService
{
    private readonly AppDbContext _db;

    public FacilityService(AppDbContext db) => _db = db;

    public async Task<PagedResult<FacilityDto>> GetAllAsync(int page, int pageSize, string? search, string? stateFilter = null)
    {
        var query = _db.Facilities.AsQueryable();

        if (!string.IsNullOrWhiteSpace(stateFilter))
            query = query.Where(f => f.State == stateFilter);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(f => f.Name.Contains(search) || f.Code.Contains(search) || f.District.Contains(search) || f.State.Contains(search));

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(f => f.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(f => ToDto(f))
            .ToListAsync();

        return new PagedResult<FacilityDto> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
    }

    public async Task<FacilityDto?> GetByIdAsync(Guid id)
    {
        var f = await _db.Facilities.FindAsync(id);
        return f is null ? null : ToDto(f);
    }

    public async Task<FacilityDto> CreateAsync(CreateFacilityDto dto)
    {
        if (!Enum.TryParse<FacilityType>(dto.Type, out var facilityType))
            throw new InvalidOperationException($"Invalid facility type: {dto.Type}.");

        if (await _db.Facilities.AnyAsync(f => f.Code == dto.Code))
            throw new InvalidOperationException("Facility code already exists.");

        var facility = new Facility
        {
            Name = dto.Name,
            Code = dto.Code,
            Type = facilityType,
            State = dto.State,
            District = dto.District,
            Region = dto.Region,
            ContactPerson = dto.ContactPerson,
            Phone = dto.Phone,
            Email = dto.Email
        };
        _db.Facilities.Add(facility);
        await _db.SaveChangesAsync();
        return ToDto(facility);
    }

    public async Task<FacilityDto?> UpdateAsync(Guid id, UpdateFacilityDto dto)
    {
        var facility = await _db.Facilities.FindAsync(id);
        if (facility is null) return null;

        if (dto.Name is not null) facility.Name = dto.Name;
        if (dto.State is not null) facility.State = dto.State;
        if (dto.District is not null) facility.District = dto.District;
        if (dto.Region is not null) facility.Region = dto.Region;
        if (dto.ContactPerson is not null) facility.ContactPerson = dto.ContactPerson;
        if (dto.Phone is not null) facility.Phone = dto.Phone;
        if (dto.Email is not null) facility.Email = dto.Email;
        if (dto.IsActive.HasValue) facility.IsActive = dto.IsActive.Value;
        if (dto.Type is not null && Enum.TryParse<FacilityType>(dto.Type, out var ft))
            facility.Type = ft;

        facility.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return ToDto(facility);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var facility = await _db.Facilities.FindAsync(id);
        if (facility is null) return false;
        facility.IsActive = false;
        facility.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }

    private static FacilityDto ToDto(Facility f) => new()
    {
        Id = f.Id,
        Name = f.Name,
        Code = f.Code,
        Type = f.Type.ToString(),
        State = f.State,
        District = f.District,
        Region = f.Region,
        ContactPerson = f.ContactPerson,
        Phone = f.Phone,
        Email = f.Email,
        IsActive = f.IsActive,
        CreatedAt = f.CreatedAt
    };
}
