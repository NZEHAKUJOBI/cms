import api from '@/lib/api';
import type {
  ApiResponse,
  CreateShipmentDto,
  PagedResult,
  ShipmentDto,
  UpdateShipmentStatusDto,
} from '@/types';

export const shipmentsApi = {
  getAll: (page = 1, pageSize = 20, facilityId?: string, status?: string) =>
    api
      .get<ApiResponse<PagedResult<ShipmentDto>>>('/shipments', {
        params: { page, pageSize, facilityId, status },
      })
      .then((r) => r.data.data),

  getById: (id: string) =>
    api.get<ApiResponse<ShipmentDto>>(`/shipments/${id}`).then((r) => r.data.data),

  create: (dto: CreateShipmentDto) =>
    api.post<ApiResponse<ShipmentDto>>('/shipments', dto).then((r) => r.data.data),

  updateStatus: (id: string, dto: UpdateShipmentStatusDto) =>
    api.patch<ApiResponse<ShipmentDto>>(`/shipments/${id}/status`, dto).then((r) => r.data.data),
};
