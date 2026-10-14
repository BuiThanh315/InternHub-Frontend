import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { aiService } from '../services/aiService';
import type { BatchJobStatusResponse, BatchScreeningRequest } from '../types';

interface AiJobContextType {
  activeJob: BatchJobStatusResponse | null;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  startJob: (programId: number, internIds: number[]) => Promise<string>;
  dismissJob: () => void;
  completedVersion: number;
}

const AiJobContext = createContext<AiJobContextType | undefined>(undefined);

export const AiJobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeJob, setActiveJob] = useState<BatchJobStatusResponse | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [completedVersion, setCompletedVersion] = useState<number>(0);
  const pollingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  }, []);

  const pollJobStatus = useCallback(async (jobId: string) => {
    try {
      const statusRes = await aiService.getBatchJobStatus(jobId);
      setActiveJob(statusRes);

      if (statusRes.status === 'COMPLETED') {
        stopPolling();
        setCompletedVersion((prev) => prev + 1);
        toast.success(`Đã hoàn tất thẩm định AI cho ${statusRes.totalCount} hồ sơ!`, {
          description: 'Hệ thống đã cập nhật kết quả và điểm đối soát năng lực.',
        });
      } else if (statusRes.status === 'FAILED') {
        stopPolling();
        toast.error('Quá trình thẩm định AI gặp sự cố.', {
          description: 'Vui lòng kiểm tra lại cấu hình hoặc thử lại sau.',
        });
      } else {
        // Tiếp tục polling sau 2.5s
        pollingTimerRef.current = setTimeout(() => {
          void pollJobStatus(jobId);
        }, 2500);
      }
    } catch (err: any) {
      console.error('Lỗi khi polling trạng thái AI batch job:', err);
      // Thử lại sau 3.5s nếu tạm thời mất kết nối
      pollingTimerRef.current = setTimeout(() => {
        void pollJobStatus(jobId);
      }, 3500);
    }
  }, [stopPolling]);

  const startJob = useCallback(async (programId: number, internIds: number[]): Promise<string> => {
    stopPolling();
    const req: BatchScreeningRequest = { programId, internIds, forceReevaluate: false };
    const created = await aiService.startBatchScreening(req);

    const initialJob: BatchJobStatusResponse = {
      jobId: created.jobId,
      programId: created.programId,
      status: 'PROCESSING',
      totalCount: created.totalCandidates,
      processedCount: 0,
      percent: 0,
      results: [],
      createdAt: created.createdAt,
      updatedAt: created.createdAt,
    };

    setActiveJob(initialJob);
    setIsExpanded(true); // Tự động mở rộng khi vừa tạo job

    toast.info(`Bắt đầu thẩm định ${internIds.length} ứng viên bằng AI`, {
      description: 'Bạn có thể tự do rời trang, tiến trình sẽ tiếp tục chạy ngầm.',
    });

    // Bắt đầu polling sau 1.5s
    pollingTimerRef.current = setTimeout(() => {
      void pollJobStatus(created.jobId);
    }, 1500);

    return created.jobId;
  }, [pollJobStatus, stopPolling]);

  const dismissJob = useCallback(() => {
    stopPolling();
    setActiveJob(null);
    setIsExpanded(false);
  }, [stopPolling]);

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  const contextValue = React.useMemo(
    () => ({
      activeJob,
      isExpanded,
      setIsExpanded,
      startJob,
      dismissJob,
      completedVersion,
    }),
    [activeJob, isExpanded, startJob, dismissJob, completedVersion]
  );

  return (
    <AiJobContext.Provider value={contextValue}>
      {children}
    </AiJobContext.Provider>
  );
};

export const useAiJob = (): AiJobContextType => {
  const context = useContext(AiJobContext);
  if (!context) {
    throw new Error('useAiJob must be used within an AiJobProvider');
  }
  return context;
};
