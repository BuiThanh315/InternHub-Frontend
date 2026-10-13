import { apiClient } from './api';

export interface NotificationItem {
  id: number;
  recipientId: number;
  actorId?: number;
  title: string;
  content: string;
  type: string;
  referenceType?: string;
  referenceId?: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface SecurityCommand {
  action: 'FORCE_LOGOUT' | 'ACCOUNT_LOCKED' | 'TOKEN_EXPIRED' | 'PERMISSION_UPDATED';
  userId?: number;
  role?: string;
  roleId?: number;
  reason?: string;
  message?: string;
}

const API_BASE = '/api/notifications';

export const notificationService = {
  async getNotifications(cursorCreatedAt?: string, cursorId?: number, limit = 20): Promise<NotificationItem[]> {
    const params: Record<string, any> = { limit };
    if (cursorCreatedAt) params.cursorCreatedAt = cursorCreatedAt;
    if (cursorId) params.cursorId = cursorId;

    const res = await apiClient.get<NotificationItem[]>(API_BASE, { params });
    return res.data;
  },

  async getUnreadCount(): Promise<number> {
    const res = await apiClient.get<{ unreadCount: number }>(`${API_BASE}/unread-count`);
    return res.data.unreadCount;
  },

  async markAsRead(id: number): Promise<NotificationItem> {
    const res = await apiClient.patch<NotificationItem>(`${API_BASE}/${id}/read`, {});
    return res.data;
  },

  async markAllAsRead(): Promise<number> {
    const res = await apiClient.patch<{ updatedCount: number }>(`${API_BASE}/read-all`, {});
    return res.data.updatedCount;
  },
};
