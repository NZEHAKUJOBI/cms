import api from '@/lib/api';
import type { ApiResponse, AuthResponseDto, ChangePasswordDto, CreateUserDto, LoginDto, RegisterDto, UserDto } from '@/types';

export const authApi = {
  login: (dto: LoginDto) =>
    api.post<ApiResponse<AuthResponseDto>>('/auth/login', dto).then((r) => r.data.data),

  register: (dto: RegisterDto) =>
    api.post<ApiResponse<AuthResponseDto>>('/auth/register', dto).then((r) => r.data.data),

  changePassword: (dto: ChangePasswordDto) =>
    api.post<ApiResponse<string>>('/auth/change-password', dto).then((r) => r.data),

  // Facility Manager — users scoped to their facility
  getMyFacilityUsers: () =>
    api.get<ApiResponse<UserDto[]>>('/auth/users/my-facility').then((r) => r.data.data),

  createMyFacilityUser: (dto: CreateUserDto) =>
    api.post<ApiResponse<UserDto>>('/auth/users/my-facility', dto).then((r) => r.data.data),

  toggleFacilityUser: (id: string, isActive: boolean) =>
    api.patch<ApiResponse<UserDto>>(`/auth/users/my-facility/${id}`, { isActive }).then((r) => r.data.data),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<{ resetToken?: string }>>('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (token: string, newPassword: string) =>
    api.post<ApiResponse<string>>('/auth/reset-password', { token, newPassword }).then((r) => r.data),
};
