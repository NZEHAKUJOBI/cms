import api from '@/lib/api';
import type { ApiResponse, AuthResponseDto, ChangePasswordDto, LoginDto, RegisterDto } from '@/types';

export const authApi = {
  login: (dto: LoginDto) =>
    api.post<ApiResponse<AuthResponseDto>>('/auth/login', dto).then((r) => r.data.data),

  register: (dto: RegisterDto) =>
    api.post<ApiResponse<AuthResponseDto>>('/auth/register', dto).then((r) => r.data.data),

  changePassword: (dto: ChangePasswordDto) =>
    api.post<ApiResponse<string>>('/auth/change-password', dto).then((r) => r.data),
};
