import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'sonner';
import type { ProctoringAlertEvent, CandidateLiveProctoringState } from '../types/proctoring.types';
import { getInMemoryAccessToken } from '../services/api';

export function useLiveProctoring(scheduleId: number | null) {
  const [candidates, setCandidates] = useState<Record<number, CandidateLiveProctoringState>>({});
  const [eventFeed, setEventFeed] = useState<ProctoringAlertEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef<Client | null>(null);

  const handleProctoringAlert = useCallback((event: ProctoringAlertEvent) => {
    // 1. Thêm sự kiện vào Feed (tối đa 50 sự kiện gần nhất)
    setEventFeed((prev) => [event, ...prev.slice(0, 49)]);

    // 2. Cập nhật trạng thái từng thí sinh trong Lưới Grid
    setCandidates((prev) => {
      const existing = prev[event.sessionId] || {
        sessionId: event.sessionId,
        candidateName: event.candidateName,
        candidateEmail: event.candidateEmail,
        status: 'IN_PROGRESS',
        cameraActive: true,
        micActive: true,
        networkQuality: 'EXCELLENT',
        strikeCount: 0,
        maxStrikes: event.maxStrikes || 3,
        lastHeartbeat: new Date().toISOString(),
      };

      const updatedStatus = event.severity === 'DISQUALIFIED' ? 'DISQUALIFIED' : existing.status;

      return {
        ...prev,
        [event.sessionId]: {
          ...existing,
          status: updatedStatus,
          strikeCount: event.strikeCount,
          maxStrikes: event.maxStrikes || existing.maxStrikes,
          lastEvent: event,
          lastHeartbeat: new Date().toISOString(),
        },
      };
    });

    // 3. Bắn toast nổi bật cho Giám thị nếu có hành vi vi phạm nghiêm trọng
    if (event.severity === 'DISQUALIFIED') {
      toast.error(`Ứng viên ${event.candidateName} đã bị đình chỉ thi!`, {
        description: event.details || 'Vượt quá số lần vi phạm hoặc bị truất quyền thi.',
      });
    } else if (event.severity === 'CRITICAL') {
      toast.warning(`Cảnh báo vi phạm cấp độ 2: ${event.candidateName}`, {
        description: `Đã vi phạm ${event.strikeCount}/${event.maxStrikes} lần!`,
      });
    }
  }, []);

  useEffect(() => {
    if (!scheduleId) return;

    const token = getInMemoryAccessToken();
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setIsConnected(true);
        // Đăng ký kênh phòng thi của toàn bộ ca thi
        client.subscribe(`/topic/proctoring/schedule/${scheduleId}`, (msg) => {
          try {
            const event: ProctoringAlertEvent = JSON.parse(msg.body);
            handleProctoringAlert(event);
          } catch (err) {
            console.error('Error parsing live proctoring message:', err);
          }
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
      stompClientRef.current = null;
    };
  }, [scheduleId, handleProctoringAlert]);

  return {
    candidates: Object.values(candidates),
    eventFeed,
    isConnected,
  };
}
