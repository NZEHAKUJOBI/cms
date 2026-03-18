using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PSCMS.Common;
using PSCMS.DTOs.Inventory;
using PSCMS.Services.Interfaces;

namespace PSCMS.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public InventoryController(IInventoryService inventoryService) => _inventoryService = inventoryService;

    /// <summary>Get paginated inventory records, optionally filtered by facility or low-stock.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? facilityId = null,
        [FromQuery] bool? lowStockOnly = null)
    {
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

    /// <summary>Create an inventory record for a facility-product pair.</summary>
    [HttpPost]
    [Authorize(Roles = "Admin,FacilityManager")]
    public async Task<IActionResult> Create([FromBody] CreateInventoryDto dto)
    {
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

    /// <summary>Get all low-stock alerts.</summary>
    [HttpGet("alerts/low-stock")]
    public async Task<IActionResult> LowStockAlerts([FromQuery] Guid? facilityId = null)
    {
        var items = await _inventoryService.GetLowStockAlertsAsync(facilityId);
        return Ok(ApiResponse<List<InventoryDto>>.Ok(items));
    }

    /// <summary>Get products nearing expiry.</summary>
    [HttpGet("alerts/near-expiry")]
    public async Task<IActionResult> NearExpiryAlerts([FromQuery] int withinDays = 90)
    {
        var items = await _inventoryService.GetNearExpiryAlertsAsync(withinDays);
        return Ok(ApiResponse<List<InventoryDto>>.Ok(items));
    }
}
