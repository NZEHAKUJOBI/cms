using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PSCMS.Common;
using PSCMS.DTOs.GRN;
using PSCMS.DTOs.Shipment;
using PSCMS.Services.Interfaces;
using System.Security.Claims;

namespace PSCMS.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ShipmentsController : ControllerBase
{
    private readonly IShipmentService _shipmentService;

    public ShipmentsController(IShipmentService shipmentService) => _shipmentService = shipmentService;

    /// <summary>Get paginated shipments. Laboratory auto-scoped to their facility. StateManager scoped to their state.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? facilityId = null,
        [FromQuery] string? status = null)
    {
        string? stateFilter = null;
        if (User.IsInRole("Laboratory"))
        {
            if (Guid.TryParse(User.FindFirstValue("facilityId"), out var fmId))
                facilityId = fmId;
        }
        else if (User.IsInRole("StateManager"))
        {
            var smState = User.FindFirstValue("state");
            if (!string.IsNullOrWhiteSpace(smState)) stateFilter = smState;
        }
        var result = await _shipmentService.GetAllAsync(page, pageSize, facilityId, status, stateFilter);
        return Ok(ApiResponse<PagedResult<ShipmentDto>>.Ok(result));
    }

    /// <summary>Get a shipment by ID.</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var shipment = await _shipmentService.GetByIdAsync(id);
        if (shipment is null) return NotFound(ApiResponse<string>.Fail("Shipment not found."));
        return Ok(ApiResponse<ShipmentDto>.Ok(shipment));
    }

    /// <summary>Create a new shipment dispatch (Admin or Pharmacist).</summary>
    [HttpPost]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<IActionResult> Create([FromBody] CreateShipmentDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        try
        {
            var shipment = await _shipmentService.CreateAsync(dto, userId);
            return CreatedAtAction(nameof(GetById), new { id = shipment.Id }, ApiResponse<ShipmentDto>.Ok(shipment, "Shipment created."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<string>.Fail(ex.Message));
        }
    }

    /// <summary>Update shipment status.</summary>
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateShipmentStatusDto dto)
    {
        try
        {
            var shipment = await _shipmentService.UpdateStatusAsync(id, dto);
            if (shipment is null) return NotFound(ApiResponse<string>.Fail("Shipment not found."));
            return Ok(ApiResponse<ShipmentDto>.Ok(shipment, "Shipment status updated."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<string>.Fail(ex.Message));
        }
    }

    /// <summary>Submit a Goods Receipt Note (GRN) for inspection. Automatically marks shipment as Received and updates inventory.</summary>
    [HttpPost("{id:guid}/grn")]
    [Authorize(Roles = "Admin,FacilityManager,Pharmacist")]
    public async Task<IActionResult> SubmitGrn(Guid id, [FromBody] SubmitGrnDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        try
        {
            var grn = await _shipmentService.SubmitGrnAsync(id, dto, userId);
            return Ok(ApiResponse<GrnDto>.Ok(grn, "GRN submitted successfully. Inventory updated."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<string>.Fail(ex.Message));
        }
    }
}
