using PSCMS.DTOs.Report;

namespace PSCMS.Services.Interfaces;

public interface IReportService
{
    Task<DashboardSummaryDto> GetDashboardSummaryAsync();
    Task<FacilityDashboardDto> GetFacilityDashboardAsync(Guid facilityId);
    Task<StockReportDto> GetStockReportAsync(Guid facilityId);
    Task<OrderReportDto> GetOrderReportAsync(DateTime from, DateTime to, Guid? facilityId);
}
