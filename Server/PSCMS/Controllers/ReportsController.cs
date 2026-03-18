using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PSCMS.Common;
using PSCMS.DTOs.Report;
using PSCMS.Services.Interfaces;

namespace PSCMS.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService) => _reportService = reportService;

    /// <summary>Get the dashboard summary (totals, alerts across all facilities).</summary>
    [HttpGet("dashboard")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Dashboard()
    {
        var summary = await _reportService.GetDashboardSummaryAsync();
        return Ok(ApiResponse<DashboardSummaryDto>.Ok(summary));
    }

    /// <summary>Get a full stock report for a specific facility.</summary>
    [HttpGet("stock/{facilityId:guid}")]
    public async Task<IActionResult> StockReport(Guid facilityId)
    {
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

    /// <summary>Get an order activity report for a date range.</summary>
    [HttpGet("orders")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> OrderReport(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        [FromQuery] Guid? facilityId = null)
    {
        var report = await _reportService.GetOrderReportAsync(from, to, facilityId);
        return Ok(ApiResponse<OrderReportDto>.Ok(report));
    }
}
