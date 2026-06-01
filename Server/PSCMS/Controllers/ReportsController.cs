using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PSCMS.Common;
using PSCMS.DTOs.Report;
using PSCMS.Services.Interfaces;
using System.Security.Claims;

namespace PSCMS.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService) => _reportService = reportService;

    /// <summary>Admin-wide dashboard summary.</summary>
    [HttpGet("dashboard")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Dashboard()
    {
        var summary = await _reportService.GetDashboardSummaryAsync();
        return Ok(ApiResponse<DashboardSummaryDto>.Ok(summary));
    }

    /// <summary>Facility-scoped dashboard for Laboratory.</summary>
    [HttpGet("facility-dashboard")]
    [Authorize(Roles = "Laboratory")]
    public async Task<IActionResult> FacilityDashboard()
    {
        var facilityIdStr = User.FindFirstValue("facilityId");
        if (!Guid.TryParse(facilityIdStr, out var facilityId))
            return BadRequest(ApiResponse<string>.Fail("No facility assigned to this account."));

        try
        {
            var summary = await _reportService.GetFacilityDashboardAsync(facilityId);
            return Ok(ApiResponse<FacilityDashboardDto>.Ok(summary));
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ApiResponse<string>.Fail(ex.Message));
        }
    }

    /// <summary>Get a full stock report for a specific facility.</summary>
    [HttpGet("stock/{facilityId:guid}")]
    public async Task<IActionResult> StockReport(Guid facilityId)
    {
        // Laboratory can only view their own facility report
        if (User.IsInRole("Laboratory"))
        {
            var claimFacilityId = User.FindFirstValue("facilityId");
            if (!Guid.TryParse(claimFacilityId, out var fmFacilityId) || fmFacilityId != facilityId)
                return Forbid();
        }

        try
        {
            var report = await _reportService.GetStockReportAsync(facilityId);
            return Ok(ApiResponse<StockReportDto>.Ok(report));
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ApiResponse<string>.Fail(ex.Message));
        }
    }

    /// <summary>Order activity report (Admin, Laboratory, StateManager — scoped).</summary>
    [HttpGet("orders")]
    [Authorize(Roles = "Admin,Laboratory,StateManager")]
    public async Task<IActionResult> OrderReport(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        [FromQuery] Guid? facilityId = null)
    {
        // Laboratory always scoped to their facility
        if (User.IsInRole("Laboratory"))
        {
            if (Guid.TryParse(User.FindFirstValue("facilityId"), out var fmFacilityId))
                facilityId = fmFacilityId;
        }

        var report = await _reportService.GetOrderReportAsync(from, to, facilityId);
        return Ok(ApiResponse<OrderReportDto>.Ok(report));
    }

    /// <summary>State-scoped dashboard summary for StateManager.</summary>
    [HttpGet("state-dashboard")]
    [Authorize(Roles = "StateManager")]
    public async Task<IActionResult> StateDashboard()
    {
        var state = User.FindFirstValue("state");
        if (string.IsNullOrWhiteSpace(state))
            return BadRequest(ApiResponse<string>.Fail("No state assigned to this account."));

        var summary = await _reportService.GetStateDashboardAsync(state);
        return Ok(ApiResponse<DashboardSummaryDto>.Ok(summary));
    }

    /// <summary>Drug chart data — products by category, dosage form, and stock availability.</summary>
    [HttpGet("drug-charts")]
    public async Task<IActionResult> DrugCharts()
    {
        var data = await _reportService.GetDrugChartDataAsync();
        return Ok(ApiResponse<DrugChartDataDto>.Ok(data));
    }
}
