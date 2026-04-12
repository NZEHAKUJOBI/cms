import api from '@/lib/api';
import type { ApiResponse, UserDto, CreateUserDto, UpdateUserDto } from '@/types';

export const usersApi = {
  getAll: () =>
    api.get<ApiResponse<UserDto[]>>('/auth/users').then((r) => r.data.data),

  create: (dto: CreateUserDto) =>
    api.post<ApiResponse<UserDto>>('/auth/users', dto).then((r) => r.data.data),

  update: (id: string, dto: UpdateUserDto) =>
    api.put<ApiResponse<UserDto>>(`/auth/users/${id}`, dto).then((r) => r.data.data),
};
