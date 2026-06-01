import api from '@/lib/api';
import type { ApiResponse, DashboardSummaryDto, DrugChartDataDto, FacilityDashboardDto, OrderReportDto, StockReportDto } from '@/types';

export const reportsApi = {
  getDashboard: () =>
    api.get<ApiResponse<DashboardSummaryDto>>('/reports/dashboard').then((r) => r.data.data),

  getFacilityDashboard: () =>
    api.get<ApiResponse<FacilityDashboardDto>>('/reports/facility-dashboard').then((r) => r.data.data),

  getStockReport: (facilityId: string) =>
    api.get<ApiResponse<StockReportDto>>(`/reports/stock/${facilityId}`).then((r) => r.data.data),

  getOrderReport: (from: string, to: string, facilityId?: string) =>
    api
      .get<ApiResponse<OrderReportDto>>('/reports/orders', { params: { from, to, facilityId } })
      .then((r) => r.data.data),

  getDrugChartData: () =>
    api.get<ApiResponse<DrugChartDataDto>>('/reports/drug-charts').then((r) => r.data.data),

  getStateDashboard: () =>
    api.get<ApiResponse<DashboardSummaryDto>>('/reports/state-dashboard').then((r) => r.data.data),
};
