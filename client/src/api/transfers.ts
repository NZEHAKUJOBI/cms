import api from '@/lib/api';
import type {
  ApiResponse,
  CreateStockTransferDto,
  PagedResult,
  StockTransferDto,
  UpdateTransferStatusDto,
} from '@/types';

export const transfersApi = {
  getAll: (page = 1, pageSize = 20, facilityId?: string, status?: string) =>
    api
      .get<ApiResponse<PagedResult<StockTransferDto>>>('/transfers', {
        params: { page, pageSize, facilityId, status },
      })
      .then((r) => r.data.data),

  getById: (id: string) =>
    api.get<ApiResponse<StockTransferDto>>(`/transfers/${id}`).then((r) => r.data.data),

  create: (dto: CreateStockTransferDto) =>
    api.post<ApiResponse<StockTransferDto>>('/transfers', dto).then((r) => r.data.data),

  updateStatus: (id: string, dto: UpdateTransferStatusDto) =>
    api.patch<ApiResponse<StockTransferDto>>(`/transfers/${id}/status`, dto).then((r) => r.data.data),
};
