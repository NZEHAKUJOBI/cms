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

    /// <summary>Facility-scoped dashboard for FacilityManager.</summary>
    [HttpGet("facility-dashboard")]
    [Authorize(Roles = "FacilityManager")]
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
        // FacilityManager can only view their own facility report
        if (User.IsInRole("FacilityManager"))
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

    /// <summary>Order activity report (Admin and FacilityManager, scoped).</summary>
    [HttpGet("orders")]
    [Authorize(Roles = "Admin,FacilityManager")]
    public async Task<IActionResult> OrderReport(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        [FromQuery] Guid? facilityId = null)
    {
        // FacilityManager always scoped to their facility
        if (User.IsInRole("FacilityManager"))
        {
            if (Guid.TryParse(User.FindFirstValue("facilityId"), out var fmFacilityId))
                facilityId = fmFacilityId;
        }

        var report = await _reportService.GetOrderReportAsync(from, to, facilityId);
        return Ok(ApiResponse<OrderReportDto>.Ok(report));
    }
}
