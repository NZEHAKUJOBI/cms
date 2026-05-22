import api from '@/lib/api';
import type {
  AdjustStockDto,
  ApiResponse,
  BulkImportResultDto,
  BulkImportRowDto,
  CreateInventoryDto,
  DemandForecastDto,
  InventoryDto,
  PagedResult,
  RiskSummaryDto,
  SetStockDto,
  StockLedgerDto,
  UpdateInventoryDto,
  WeeklySnapshotDto,
} from '@/types';

export const inventoryApi = {
  getAll: (page = 1, pageSize = 20, facilityId?: string, lowStockOnly?: boolean) =>
    api
      .get<ApiResponse<PagedResult<InventoryDto>>>('/inventory', {
        params: { page, pageSize, facilityId, lowStockOnly },
      })
      .then((r) => r.data.data),

  getById: (id: string) =>
    api.get<ApiResponse<InventoryDto>>(`/inventory/${id}`).then((r) => r.data.data),

  getByFacility: (facilityId: string) =>
    api.get<ApiResponse<InventoryDto[]>>(`/inventory/facility/${facilityId}`).then((r) => r.data.data),

  create: (dto: CreateInventoryDto) =>
    api.post<ApiResponse<InventoryDto>>('/inventory', dto).then((r) => r.data.data),

  update: (id: string, dto: UpdateInventoryDto) =>
    api.put<ApiResponse<InventoryDto>>(`/inventory/${id}`, dto).then((r) => r.data.data),

  adjustStock: (id: string, dto: AdjustStockDto) =>
    api.post<ApiResponse<InventoryDto>>(`/inventory/${id}/adjust`, dto).then((r) => r.data.data),

  setStock: (id: string, dto: SetStockDto) =>
    api.post<ApiResponse<InventoryDto>>(`/inventory/${id}/set-stock`, dto).then((r) => r.data.data),

  getLowStockAlerts: (facilityId?: string) =>
    api
      .get<ApiResponse<InventoryDto[]>>('/inventory/alerts/low-stock', { params: { facilityId } })
      .then((r) => r.data.data),

  getNearExpiryAlerts: (withinDays = 90) =>
    api
      .get<ApiResponse<InventoryDto[]>>('/inventory/alerts/near-expiry', { params: { withinDays } })
      .then((r) => r.data.data),

  getStockHistory: (id: string, days = 90) =>
    api
      .get<ApiResponse<StockLedgerDto[]>>(`/inventory/${id}/history`, { params: { days } })
      .then((r) => r.data.data),

  getWeeklySnapshots: (id: string, weeks = 12) =>
    api
      .get<ApiResponse<WeeklySnapshotDto[]>>(`/inventory/${id}/weekly-snapshots`, { params: { weeks } })
      .then((r) => r.data.data),

  bulkImport: (rows: BulkImportRowDto[]) =>
    api.post<ApiResponse<BulkImportResultDto>>('/inventory/bulk-import', rows).then((r) => r.data),

  getForecast: (id: string, weeks = 12) =>
    api
      .get<ApiResponse<DemandForecastDto>>(`/inventory/${id}/forecast`, { params: { weeks } })
      .then((r) => r.data.data),

  getRiskSummary: (facilityId?: string) =>
    api
      .get<ApiResponse<RiskSummaryDto>>('/inventory/risk-summary', { params: { facilityId } })
      .then((r) => r.data.data),
};
