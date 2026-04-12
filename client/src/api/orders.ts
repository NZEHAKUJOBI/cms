import api from '@/lib/api';
import type {
  ApiResponse,
  ApproveOrderDto,
  CreateOrderDto,
  OrderDto,
  PagedResult,
  RejectOrderDto,
} from '@/types';

export const ordersApi = {
  getAll: (page = 1, pageSize = 20, facilityId?: string, status?: string) =>
    api
      .get<ApiResponse<PagedResult<OrderDto>>>('/orders', {
        params: { page, pageSize, facilityId, status },
      })
      .then((r) => r.data.data),

  getById: (id: string) =>
    api.get<ApiResponse<OrderDto>>(`/orders/${id}`).then((r) => r.data.data),

  create: (dto: CreateOrderDto) =>
    api.post<ApiResponse<OrderDto>>('/orders', dto).then((r) => r.data.data),

  approve: (id: string, dto: ApproveOrderDto) =>
    api.post<ApiResponse<OrderDto>>(`/orders/${id}/approve`, dto).then((r) => r.data.data),

  reject: (id: string, dto: RejectOrderDto) =>
    api.post<ApiResponse<OrderDto>>(`/orders/${id}/reject`, dto).then((r) => r.data.data),

  cancel: (id: string) =>
    api.post<ApiResponse<string>>(`/orders/${id}/cancel`).then((r) => r.data),
};
