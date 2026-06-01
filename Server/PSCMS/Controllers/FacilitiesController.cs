using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PSCMS.Common;
using PSCMS.DTOs.Facility;
using PSCMS.Services.Interfaces;
using System.Security.Claims;

namespace PSCMS.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FacilitiesController : ControllerBase
{
    private readonly IFacilityService _facilityService;

    public FacilitiesController(IFacilityService facilityService) => _facilityService = facilityService;

    /// <summary>Get paginated list of health facilities. StateManager auto-scoped to their state.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null)
    {
        string? stateFilter = null;
        if (User.IsInRole("StateManager"))
        {
            var smState = User.FindFirstValue("state");
            if (!string.IsNullOrWhiteSpace(smState)) stateFilter = smState;
        }
        var result = await _facilityService.GetAllAsync(page, pageSize, search, stateFilter);
        return Ok(ApiResponse<PagedResult<FacilityDto>>.Ok(result));
    }

    /// <summary>Get a facility by ID.</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var facility = await _facilityService.GetByIdAsync(id);
        if (facility is null) return NotFound(ApiResponse<string>.Fail("Facility not found."));
        return Ok(ApiResponse<FacilityDto>.Ok(facility));
    }

    /// <summary>Register a new health facility. Admin or StateManager (auto-scoped to their state).</summary>
    [HttpPost]
    [Authorize(Roles = "Admin,StateManager")]
    public async Task<IActionResult> Create([FromBody] CreateFacilityDto dto)
    {
        if (User.IsInRole("StateManager"))
        {
            var smState = User.FindFirstValue("state");
            if (!string.IsNullOrWhiteSpace(smState)) dto.State = smState;
        }
        try
        {
            var facility = await _facilityService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = facility.Id }, ApiResponse<FacilityDto>.Ok(facility, "Facility created."));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<string>.Fail(ex.Message));
        }
    }

    /// <summary>Update a facility's details.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFacilityDto dto)
    {
        var facility = await _facilityService.UpdateAsync(id, dto);
        if (facility is null) return NotFound(ApiResponse<string>.Fail("Facility not found."));
        return Ok(ApiResponse<FacilityDto>.Ok(facility, "Facility updated."));
    }

    /// <summary>Deactivate a facility.</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _facilityService.DeleteAsync(id);
        if (!success) return NotFound(ApiResponse<string>.Fail("Facility not found."));
        return Ok(ApiResponse<string>.Ok("Deleted.", "Facility deactivated."));
    }
}
