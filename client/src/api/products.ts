import api from '@/lib/api';
import type { ApiResponse, CreateProductDto, PagedResult, ProductDto, UpdateProductDto } from '@/types';

export const productsApi = {
  getAll: (page = 1, pageSize = 20, search?: string) =>
    api
      .get<ApiResponse<PagedResult<ProductDto>>>('/products', { params: { page, pageSize, search } })
      .then((r) => r.data.data),

  getById: (id: string) =>
    api.get<ApiResponse<ProductDto>>(`/products/${id}`).then((r) => r.data.data),

  create: (dto: CreateProductDto) =>
    api.post<ApiResponse<ProductDto>>('/products', dto).then((r) => r.data.data),

  update: (id: string, dto: UpdateProductDto) =>
    api.put<ApiResponse<ProductDto>>(`/products/${id}`, dto).then((r) => r.data.data),

  delete: (id: string) =>
    api.delete<ApiResponse<string>>(`/products/${id}`).then((r) => r.data),
};
