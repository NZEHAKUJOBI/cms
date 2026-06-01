using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PSCMS.Common;
using PSCMS.DTOs.Transfer;
using PSCMS.Services.Interfaces;
using System.Security.Claims;

namespace PSCMS.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransfersController : ControllerBase
{
    private readonly ITransferService _transferService;

    public TransfersController(ITransferService transferService) => _transferService = transferService;

    /// <summary>Get paginated stock transfers. Laboratory scoped to their facility. StateManager scoped to their state.</summary>
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
        var result = await _transferService.GetAllAsync(page, pageSize, facilityId, status, stateFilter);
        return Ok(ApiResponse<PagedResult<StockTransferDto>>.Ok(result));
    }

    /// <summary>Get a transfer by ID.</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var transfer = await _transferService.GetByIdAsync(id);
        if (transfer is null) return NotFound(ApiResponse<string>.Fail("Transfer not found."));
        return Ok(ApiResponse<StockTransferDto>.Ok(transfer));
    }

    /// <summary>Create a new stock transfer request.</summary>
    [HttpPost]
    [Authorize(Roles = "Admin,Laboratory")]
    public async Task<IActionResult> Create([FromBody] CreateStockTransferDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        try
        {
            var transfer = await _transferService.CreateAsync(dto, userId);
            return CreatedAtAction(nameof(GetById), new { id = transfer.Id }, ApiResponse<StockTransferDto>.Ok(transfer, "Transfer created."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<string>.Fail(ex.Message));
        }
    }

    /// <summary>Update transfer status (Approved/InTransit/Completed/Cancelled). Completing a transfer moves stock between facilities.</summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin,Laboratory")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateTransferStatusDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        try
        {
            var transfer = await _transferService.UpdateStatusAsync(id, dto, userId);
            if (transfer is null) return NotFound(ApiResponse<string>.Fail("Transfer not found."));
            return Ok(ApiResponse<StockTransferDto>.Ok(transfer, $"Transfer {dto.Status}."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<string>.Fail(ex.Message));
        }
    }
}
