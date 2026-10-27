import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'sonner';
import type { MissionItemSyncEvent, TaskActorPresence } from '../types/missionSync.types';
import { getInMemoryAccessToken } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export interface UseMissionKanbanSyncOptions {
  boardId?: number | null;
  internId?: number | null;
  onItemStatusChanged?: (event: MissionItemSyncEvent) => void;
}

export function useMissionKanbanSync({
  boardId,
  internId,
  onItemStatusChanged,
}: UseMissionKanbanSyncOptions) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [presenceMap, setPresenceMap] = useState<Record<number, TaskActorPresence>>({});
  const stompClientRef = useRef<Client | null>(null);
  const timeoutsRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  // Giữ tham chiếu mới nhất của callback và user qua useRef để tránh kích hoạt lại useEffect
  const callbackRef = useRef(onItemStatusChanged);
  useEffect(() => {
    callbackRef.current = onItemStatusChanged;
  }, [onItemStatusChanged]);

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Cập nhật Actor Presence Badge khi nhận event từ đối phương
  const handleSyncEvent = useCallback((event: MissionItemSyncEvent) => {
    // Self-Echo Prevention: Nếu chính người dùng hiện tại là người tạo thay đổi thì bỏ qua badge
    const currentUserId = userRef.current?.userId;
    if (currentUserId && event.actorId && Number(currentUserId) === Number(event.actorId)) {
      return;
    }

    // 1. Kích hoạt Callback đồng bộ trạng thái mới nhất
    if (callbackRef.current) {
      callbackRef.current(event);
    }

    // 2. Thiết lập Actor Presence Badge trong 3 giây
    const presence: TaskActorPresence = {
      itemId: event.itemId,
      actorName: event.actorName || (event.actorRole === 'MENTOR' ? 'Mentor' : 'Thực tập sinh'),
      actorRole: event.actorRole || 'USER',
      actionText:
        event.action === 'STATUS_CHANGED'
          ? `vừa chuyển sang ${
              event.newStatus === 'COMPLETED'
                ? 'Hoàn thành'
                : event.newStatus === 'IN_PROGRESS'
                ? 'Đang làm'
                : 'Chưa làm'
            }`
          : 'vừa cập nhật',
      timestamp: Date.now(),
    };

    setPresenceMap((prev) => ({
      ...prev,
      [event.itemId]: presence,
    }));

    // Xóa timeout cũ nếu có cho item này
    if (timeoutsRef.current[event.itemId]) {
      clearTimeout(timeoutsRef.current[event.itemId]);
    }

    // Tự động gỡ badge sau 3000ms
    timeoutsRef.current[event.itemId] = setTimeout(() => {
      setPresenceMap((prev) => {
        const next = { ...prev };
        delete next[event.itemId];
        return next;
      });
      delete timeoutsRef.current[event.itemId];
    }, 3000);

    // Thông báo Toast dịu nhẹ góc màn hình
    toast.info(`Bảng công việc vừa cập nhật`, {
      description: `${presence.actorName} ${presence.actionText}: "${event.title || 'Công việc'}"`,
      duration: 3000,
    });
  }, []);

  useEffect(() => {
    // Chỉ kích hoạt nếu có boardId hoặc internId
    if (!boardId && !internId) return;

    const token = getInMemoryAccessToken();
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      beforeConnect: () => {
        // Cập nhật Bearer token mới nhất ngay trước mỗi lần kết nối / reconnect
        const currentToken = getInMemoryAccessToken();
        if (currentToken) {
          client.connectHeaders = { Authorization: `Bearer ${currentToken}` };
        }
      },
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setIsConnected(true);

        // Sub 1: Kênh Board dự án (dành cho Mentor & cả nhóm theo dõi theo Bảng)
        if (boardId) {
          client.subscribe(`/topic/missions/board/${boardId}`, (msg) => {
            try {
              const event: MissionItemSyncEvent = JSON.parse(msg.body);
              handleSyncEvent(event);
            } catch (err) {
              console.error('Lỗi parse MissionItemSyncEvent board:', err);
            }
          });
        }

        // Sub 2: Kênh cá nhân của Thực tập sinh
        if (internId) {
          client.subscribe(`/topic/missions/intern/${internId}`, (msg) => {
            try {
              const event: MissionItemSyncEvent = JSON.parse(msg.body);
              handleSyncEvent(event);
            } catch (err) {
              console.error('Lỗi parse MissionItemSyncEvent intern:', err);
            }
          });
        }
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      // Dọn dẹp timers
      Object.values(timeoutsRef.current).forEach((t) => clearTimeout(t));
      timeoutsRef.current = {};

      client.deactivate();
      stompClientRef.current = null;
    };
  }, [boardId, internId, handleSyncEvent]);

  return {
    isConnected,
    presenceMap,
  };
}
