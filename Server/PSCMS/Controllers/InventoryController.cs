using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PSCMS.Common;
using PSCMS.DTOs.Auth;
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

    /// <summary>Get paginated inventory records. Laboratory auto-scoped to their facility. StateManager auto-scoped to their state.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? facilityId = null,
        [FromQuery] bool? lowStockOnly = null)
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
        var result = await _inventoryService.GetAllAsync(page, pageSize, facilityId, lowStockOnly, stateFilter);
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

    /// <summary>Create an inventory record. Admin picks any facility; Laboratory auto-assigned to theirs.</summary>
    [HttpPost]
    [Authorize(Roles = "Admin,Laboratory")]
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
            var uid = Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var u) ? u : (Guid?)null;
            var inv = await _inventoryService.CreateAsync(dto, uid);
            return CreatedAtAction(nameof(GetById), new { id = inv.Id }, ApiResponse<InventoryDto>.Ok(inv, "Inventory created."));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<string>.Fail(ex.Message));
        }
    }

    /// <summary>Update an inventory record.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Laboratory,Pharmacist")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateInventoryDto dto)
    {
        var inv = await _inventoryService.UpdateAsync(id, dto);
        if (inv is null) return NotFound(ApiResponse<string>.Fail("Inventory record not found."));
        return Ok(ApiResponse<InventoryDto>.Ok(inv, "Inventory updated."));
    }

    /// <summary>Adjust stock quantity (add or subtract).</summary>
    [HttpPost("{id:guid}/adjust")]
    [Authorize(Roles = "Admin,Laboratory,Pharmacist")]
    public async Task<IActionResult> AdjustStock(Guid id, [FromBody] AdjustStockDto dto)
    {
        try
        {
            var uid = Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var u) ? u : (Guid?)null;
            var inv = await _inventoryService.AdjustStockAsync(id, dto, uid);
            if (inv is null) return NotFound(ApiResponse<string>.Fail("Inventory record not found."));
            return Ok(ApiResponse<InventoryDto>.Ok(inv, "Stock adjusted."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<string>.Fail(ex.Message));
        }
    }

    /// <summary>Set absolute stock level (physical count). Laboratory restricted to their facility.</summary>
    [HttpPost("{id:guid}/set-stock")]
    [Authorize(Roles = "Admin,Laboratory")]
    public async Task<IActionResult> SetStock(Guid id, [FromBody] SetStockDto dto)
    {
        var uid = Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var u) ? u : (Guid?)null;
        var inv = await _inventoryService.SetStockAsync(id, dto, uid);
        if (inv is null) return NotFound(ApiResponse<string>.Fail("Inventory record not found."));
        return Ok(ApiResponse<InventoryDto>.Ok(inv, "Stock updated."));
    }

    /// <summary>Get change log for an inventory record.</summary>
    [HttpGet("{id:guid}/history")]
    public async Task<IActionResult> GetHistory(Guid id, [FromQuery] int days = 90)
    {
        var entries = await _inventoryService.GetStockHistoryAsync(id, days);
        return Ok(ApiResponse<List<StockLedgerDto>>.Ok(entries));
    }

    /// <summary>Get week-on-week stock snapshots for an inventory record.</summary>
    [HttpGet("{id:guid}/weekly-snapshots")]
    public async Task<IActionResult> GetWeeklySnapshots(Guid id, [FromQuery] int weeks = 12)
    {
        var snapshots = await _inventoryService.GetWeeklySnapshotsAsync(id, weeks);
        return Ok(ApiResponse<List<WeeklySnapshotDto>>.Ok(snapshots));
    }

    /// <summary>Get demand forecast for an inventory record based on historical weekly snapshots.</summary>
    [HttpGet("{id:guid}/forecast")]
    public async Task<IActionResult> GetForecast(Guid id, [FromQuery] int weeks = 12)
    {
        var forecast = await _inventoryService.GetForecastAsync(id, weeks);
        if (forecast is null) return NotFound(ApiResponse<string>.Fail("Inventory record not found."));
        return Ok(ApiResponse<DemandForecastDto>.Ok(forecast));
    }

    /// <summary>Get a demand risk summary across all (or facility-scoped) inventory items.</summary>
    [HttpGet("risk-summary")]
    public async Task<IActionResult> GetRiskSummary([FromQuery] Guid? facilityId = null)
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
        var summary = await _inventoryService.GetRiskSummaryAsync(facilityId, stateFilter);
        return Ok(ApiResponse<RiskSummaryDto>.Ok(summary));
    }

    /// <summary>Get all low-stock alerts. Laboratory auto-scoped. StateManager state-scoped.</summary>
    [HttpGet("alerts/low-stock")]
    public async Task<IActionResult> LowStockAlerts([FromQuery] Guid? facilityId = null)
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
        var items = await _inventoryService.GetLowStockAlertsAsync(facilityId, stateFilter);
        return Ok(ApiResponse<List<InventoryDto>>.Ok(items));
    }

    /// <summary>Get products nearing expiry. Laboratory auto-scoped. StateManager state-scoped.</summary>
    [HttpGet("alerts/near-expiry")]
    public async Task<IActionResult> NearExpiryAlerts([FromQuery] int withinDays = 90)
    {
        Guid? facilityId = null;
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
        var items = await _inventoryService.GetNearExpiryAlertsAsync(withinDays, facilityId, stateFilter);
        return Ok(ApiResponse<List<InventoryDto>>.Ok(items));
    }

    /// <summary>
    /// Bulk-import inventory records from a JSON array parsed from a CSV on the client.
    /// Accepts a JSON body: array of rows with FacilityCode, ProductName, CurrentStock, ReorderLevel, etc.
    /// </summary>
    [HttpPost("bulk-import")]
    [Authorize(Roles = "Admin,Laboratory")]
    public async Task<IActionResult> BulkImport([FromBody] List<BulkImportRowDto> rows)
    {
        if (rows is null || rows.Count == 0)
            return BadRequest(ApiResponse<string>.Fail("No rows provided."));

        var uid = Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var u) ? u : Guid.Empty;
        var result = await _inventoryService.BulkImportAsync(rows, uid);
        return Ok(ApiResponse<BulkImportResultDto>.Ok(result,
            $"Import complete: {result.Created} created, {result.Updated} updated, {result.Skipped} skipped."));
    }
}
