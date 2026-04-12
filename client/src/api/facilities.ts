import api from '@/lib/api';
import type { ApiResponse, CreateFacilityDto, FacilityDto, PagedResult, UpdateFacilityDto } from '@/types';

export const facilitiesApi = {
  getAll: (page = 1, pageSize = 20, search?: string) =>
    api
      .get<ApiResponse<PagedResult<FacilityDto>>>('/facilities', { params: { page, pageSize, search } })
      .then((r) => r.data.data),

  getById: (id: string) =>
    api.get<ApiResponse<FacilityDto>>(`/facilities/${id}`).then((r) => r.data.data),

  create: (dto: CreateFacilityDto) =>
    api.post<ApiResponse<FacilityDto>>('/facilities', dto).then((r) => r.data.data),

  update: (id: string, dto: UpdateFacilityDto) =>
    api.put<ApiResponse<FacilityDto>>(`/facilities/${id}`, dto).then((r) => r.data.data),

  delete: (id: string) =>
    api.delete<ApiResponse<string>>(`/facilities/${id}`).then((r) => r.data),
};
