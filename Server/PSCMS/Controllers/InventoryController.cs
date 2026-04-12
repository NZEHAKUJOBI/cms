using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PSCMS.Common;
using PSCMS.DTOs.Inventory;
using PSCMS.Services.Interfaces;
using System.Security.Claims;

namespace PSCMS.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public InventoryController(IInventoryService inventoryService) => _inventoryService = inventoryService;

    /// <summary>Get paginated inventory records. FacilityManager auto-scoped to their facility.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? facilityId = null,
        [FromQuery] bool? lowStockOnly = null)
    {
        if (User.IsInRole("FacilityManager"))
        {
            if (Guid.TryParse(User.FindFirstValue("facilityId"), out var fmId))
                facilityId = fmId;
        }
        var result = await _inventoryService.GetAllAsync(page, pageSize, facilityId, lowStockOnly);
        return Ok(ApiResponse<PagedResult<InventoryDto>>.Ok(result));
    }

    /// <summary>Get a single inventory record.</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var inv = await _inventoryService.GetByIdAsync(id);
        if (inv is null) return NotFound(ApiResponse<string>.Fail("Inventory record not found."));
        return Ok(ApiResponse<InventoryDto>.Ok(inv));
    }

    /// <summary>Get all inventory records for a specific facility.</summary>
    [HttpGet("facility/{facilityId:guid}")]
    public async Task<IActionResult> GetByFacility(Guid facilityId)
    {
        var items = await _inventoryService.GetByFacilityAsync(facilityId);
        return Ok(ApiResponse<List<InventoryDto>>.Ok(items));
    }

    /// <summary>Create an inventory record. Admin picks any facility; FacilityManager auto-assigned to theirs.</summary>
    [HttpPost]
    [Authorize(Roles = "Admin,FacilityManager")]
    public async Task<IActionResult> Create([FromBody] CreateInventoryDto dto)
    {
        if (!User.IsInRole("Admin"))
        {
            var facilityIdStr = User.FindFirstValue("facilityId");
            if (!Guid.TryParse(facilityIdStr, out var fmFacilityId))
                return BadRequest(ApiResponse<string>.Fail("No facility assigned to your account."));
            dto.FacilityId = fmFacilityId;
        }
        try
        {
            var inv = await _inventoryService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = inv.Id }, ApiResponse<InventoryDto>.Ok(inv, "Inventory created."));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<string>.Fail(ex.Message));
        }
    }

    /// <summary>Update an inventory record.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,FacilityManager,Pharmacist")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateInventoryDto dto)
    {
        var inv = await _inventoryService.UpdateAsync(id, dto);
        if (inv is null) return NotFound(ApiResponse<string>.Fail("Inventory record not found."));
        return Ok(ApiResponse<InventoryDto>.Ok(inv, "Inventory updated."));
    }

    /// <summary>Adjust stock quantity (add or subtract).</summary>
    [HttpPost("{id:guid}/adjust")]
    [Authorize(Roles = "Admin,FacilityManager,Pharmacist")]
    public async Task<IActionResult> AdjustStock(Guid id, [FromBody] AdjustStockDto dto)
    {
        try
        {
            var inv = await _inventoryService.AdjustStockAsync(id, dto);
            if (inv is null) return NotFound(ApiResponse<string>.Fail("Inventory record not found."));
            return Ok(ApiResponse<InventoryDto>.Ok(inv, "Stock adjusted."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<string>.Fail(ex.Message));
        }
    }

    /// <summary>Get all low-stock alerts. FacilityManager auto-scoped.</summary>
    [HttpGet("alerts/low-stock")]
    public async Task<IActionResult> LowStockAlerts([FromQuery] Guid? facilityId = null)
    {
        if (User.IsInRole("FacilityManager"))
        {
            if (Guid.TryParse(User.FindFirstValue("facilityId"), out var fmId))
                facilityId = fmId;
        }
        var items = await _inventoryService.GetLowStockAlertsAsync(facilityId);
        return Ok(ApiResponse<List<InventoryDto>>.Ok(items));
    }

    /// <summary>Get products nearing expiry. FacilityManager auto-scoped.</summary>
    [HttpGet("alerts/near-expiry")]
    public async Task<IActionResult> NearExpiryAlerts([FromQuery] int withinDays = 90)
    {
        Guid? facilityId = null;
        if (User.IsInRole("FacilityManager"))
        {
            if (Guid.TryParse(User.FindFirstValue("facilityId"), out var fmId))
                facilityId = fmId;
        }
        var items = await _inventoryService.GetNearExpiryAlertsAsync(withinDays, facilityId);
        return Ok(ApiResponse<List<InventoryDto>>.Ok(items));
    }
}
