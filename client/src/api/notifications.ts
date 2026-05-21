import api from '@/lib/api';
import type { ApiResponse, NotificationDto } from '@/types';

export const notificationsApi = {
  getAll: () =>
    api.get<ApiResponse<NotificationDto[]>>('/notifications').then((r) => r.data.data),
};
