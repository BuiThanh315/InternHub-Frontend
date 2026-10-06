import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { notificationService, type NotificationItem, type SecurityCommand } from '../services/notificationService';
import { useQueryClient } from '@tanstack/react-query';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchMore: () => Promise<void>;
  hasMore: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, logout, syncPermissionsWithRefreshToken } = useAuth();
  const queryClient = useQueryClient();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const stompClientRef = useRef<Client | null>(null);
  const toastBufferRef = useRef<number>(0);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Buffer Toast chống spam UI khi có hàng loạt tin nhắn dồn dập
  const queueToast = useCallback((title: string, content: string) => {
    toastBufferRef.current += 1;
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      const count = toastBufferRef.current;
      toastBufferRef.current = 0;
      if (count === 1) {
        toast.info(title, { description: content });
      } else if (count > 1) {
        toast.info(`Bạn có ${count} thông báo mới`, {
          description: 'Vui lòng kiểm tra danh sách thông báo.',
        });
      }
    }, 500);
  }, []);

  // Fetch initial unread count & notifications
  const loadInitialData = useCallback(async () => {
    try {
      const [count, list] = await Promise.all([
        notificationService.getUnreadCount(),
        notificationService.getNotifications(undefined, undefined, 20),
      ]);
      setUnreadCount(count);
      setNotifications(list);
      setHasMore(list.length === 20);
    } catch (err) {
      console.warn('Lỗi tải dữ liệu notifications:', err);
    }
  }, []);

  const fetchMore = async () => {
    if (!hasMore || notifications.length === 0) return;
    const lastItem = notifications[notifications.length - 1];
    try {
      const more = await notificationService.getNotifications(lastItem.createdAt, lastItem.id, 20);
      if (more.length < 20) setHasMore(false);
      setNotifications((prev) => [...prev, ...more]);
    } catch (err) {
      console.warn('Lỗi tải thêm notifications:', err);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const updated = await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Lỗi markAsRead:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Lỗi markAllAsRead:', err);
    }
  };

  // Quản lý vòng đời WebSocket theo Authentication State
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!isAuthenticated || !token || !user) {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      setIsConnected(false);
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    loadInitialData();

    // Khởi tạo STOMP Client qua SockJS
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setIsConnected(true);

        // 1. Kênh cá nhân nhận thông báo
        client.subscribe('/user/queue/notifications', (msg) => {
          try {
            const item: NotificationItem = JSON.parse(msg.body);
            setNotifications((prev) => [item, ...prev]);
            setUnreadCount((prev) => prev + 1);
            queueToast(item.title, item.content);
          } catch (e) {
            console.error('Lỗi parse notification STOMP frame:', e);
          }
        });

        // 2. Kênh cá nhân nhận lệnh bảo mật (FORCE_LOGOUT, ACCOUNT_LOCKED, TOKEN_EXPIRED, PERMISSION_UPDATED)
        client.subscribe('/user/queue/security', async (msg) => {
          try {
            const command: SecurityCommand = JSON.parse(msg.body);
            if (command.action === 'FORCE_LOGOUT' || command.action === 'ACCOUNT_LOCKED') {
              toast.error(command.message || 'Phiên làm việc đã bị chấm dứt bởi quản trị viên.');
              client.deactivate();
              logout();
              window.location.href = '/login';
            } else if (command.action === 'TOKEN_EXPIRED') {
              // Phiên hết hạn -> logout an toàn
              toast.warning('Phiên xác thực đã hết hạn. Vui lòng đăng nhập lại.');
              client.deactivate();
              logout();
              window.location.href = '/login';
            } else if (command.action === 'PERMISSION_UPDATED') {
              // Đồng bộ ngầm Access Token mới nhất từ server, không làm gián đoạn màn hình đang làm việc
              await syncPermissionsWithRefreshToken();
              toast.info('Phân quyền tài khoản của bạn đã được cập nhật bởi Quản trị viên.', {
                duration: 3500,
              });
            }
          } catch (e) {
            console.error('Lỗi parse security command STOMP frame:', e);
          }
        });

        // 3. Role-based Subscription (Chỉ subscribe đúng role đã biết, tránh lỗi 403)
        const userRole = user.role;
        if (userRole === 'ADMIN' || userRole === 'HR') {
          client.subscribe('/topic/live/contracts', (msg) => {
            try {
              const data = JSON.parse(msg.body);
              if (data.id) {
                queryClient.invalidateQueries({ queryKey: ['contracts', data.id] });
              }
              queryClient.invalidateQueries({ queryKey: ['contracts', 'list'] });
            } catch (e) {
              console.error('Lỗi sync live contract:', e);
            }
          });

          client.subscribe('/topic/live/applications', () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
          });
        }
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.warn('STOMP Error:', frame.headers['message']);
      },
    });

    client.activate();
    stompClientRef.current = client;

    // Fallback định kỳ nhẹ nhàng phòng trường hợp rớt kết nối
    const fallbackInterval = setInterval(() => {
      if (!stompClientRef.current?.connected) {
        notificationService.getUnreadCount().then(setUnreadCount).catch(() => {});
      }
    }, 90000);

    return () => {
      clearInterval(fallbackInterval);
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [isAuthenticated, user?.userId, user?.role, logout, loadInitialData, queueToast, queryClient]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        fetchMore,
        hasMore,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return ctx;
};
