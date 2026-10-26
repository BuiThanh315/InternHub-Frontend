import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { aiService } from '../services/aiService';
import { aiInterviewService } from '../services/aiInterviewService';
import type { BatchJobStatusResponse, BatchScreeningRequest, ScreeningResultDto } from '../types';
import type { GenerateInterviewQuestionsPayload } from '../types/aiInterview.types';
import { InterviewQuestionModal } from '../pages/hr/programs/workspace/components/InterviewQuestionModal';

export type AiJobType = 'SCREENING' | 'INTERVIEW_QUESTIONS';

export interface ActiveAiJob {
  jobType: AiJobType;
  jobId: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'NOT_FOUND';
  percent: number;
  currentStage?: string;
  createdAt?: string;
  updatedAt?: string;

  // Screening fields
  programId: number;
  totalCount?: number;
  processedCount?: number;
  results?: ScreeningResultDto[];

  // Interview Question fields
  programName?: string;
  internId?: number | null;
  internName?: string;
  targetRole?: string;
  questionSetId?: number | null;
  result?: any;
  errorMessage?: string | null;
}

export interface ViewingQuestionModalState {
  isOpen: boolean;
  programId: number;
  programName: string;
  internId?: number;
  internName?: string;
  questionSetId?: number;
}

interface AiJobContextType {
  activeJob: ActiveAiJob | null;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  startJob: (programId: number, internIds: number[], forceReevaluate?: boolean) => Promise<string>;
  startQuestionJob: (params: {
    programId: number;
    programName: string;
    internId?: number;
    internName?: string;
    targetRole?: string;
    totalQuestions?: number;
    includeScreeningDossier?: boolean;
    customRequirements?: string;
  }) => Promise<string>;
  dismissJob: () => void;
  completedVersion: number;
  viewingQuestionModal: ViewingQuestionModalState | null;
  openQuestionModal: (params?: Partial<ViewingQuestionModalState>) => void;
  closeQuestionModal: () => void;
}

const AiJobContext = createContext<AiJobContextType | undefined>(undefined);

export const AiJobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeJob, setActiveJob] = useState<ActiveAiJob | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [completedVersion, setCompletedVersion] = useState<number>(0);
  const [viewingQuestionModal, setViewingQuestionModal] = useState<ViewingQuestionModalState | null>(null);
  const pollingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  }, []);

  // Polling cho Screening Job
  const pollScreeningJobStatus = useCallback(
    async (jobId: string) => {
      try {
        const statusRes: BatchJobStatusResponse = await aiService.getBatchJobStatus(jobId);
        setActiveJob((prev) => ({
          ...prev,
          jobType: 'SCREENING',
          jobId: statusRes.jobId,
          programId: statusRes.programId,
          status: statusRes.status,
          totalCount: statusRes.totalCount,
          processedCount: statusRes.processedCount,
          percent: statusRes.percent,
          results: statusRes.results,
          createdAt: statusRes.createdAt,
          updatedAt: statusRes.updatedAt,
        }));

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
          pollingTimerRef.current = setTimeout(() => {
            void pollScreeningJobStatus(jobId);
          }, 2500);
        }
      } catch (err: any) {
        console.error('Lỗi khi polling trạng thái AI batch job:', err);
        pollingTimerRef.current = setTimeout(() => {
          void pollScreeningJobStatus(jobId);
        }, 3500);
      }
    },
    [stopPolling]
  );

  // Polling cho Question Generation Job
  const pollQuestionJobStatus = useCallback(
    async (jobId: string) => {
      try {
        const statusRes = await aiInterviewService.getQuestionJobStatus(jobId);
        setActiveJob((prev) => {
          if (!prev || prev.jobId !== jobId) return prev;
          return {
            ...prev,
            status: statusRes.status,
            percent: statusRes.percent,
            currentStage: statusRes.currentStage,
            questionSetId: statusRes.questionSetId,
            result: statusRes.result,
            errorMessage: statusRes.errorMessage,
            updatedAt: statusRes.updatedAt,
          };
        });

        if (statusRes.status === 'COMPLETED') {
          stopPolling();
          setCompletedVersion((prev) => prev + 1);
          toast.success('AI đã hoàn tất sinh bộ câu hỏi phỏng vấn!', {
            description: 'Nhấn vào thanh tiến trình để xem bộ câu hỏi vừa tạo.',
          });
        } else if (statusRes.status === 'FAILED') {
          stopPolling();
          toast.error('Quá trình sinh câu hỏi phỏng vấn gặp sự cố.', {
            description: statusRes.errorMessage || 'Vui lòng kiểm tra lại cấu hình hoặc thử lại sau.',
          });
        } else {
          pollingTimerRef.current = setTimeout(() => {
            void pollQuestionJobStatus(jobId);
          }, 2000);
        }
      } catch (err: any) {
        console.error('Lỗi khi polling trạng thái sinh câu hỏi:', err);
        pollingTimerRef.current = setTimeout(() => {
          void pollQuestionJobStatus(jobId);
        }, 3000);
      }
    },
    [stopPolling]
  );

  // Kích hoạt Screening Job
  const startJob = useCallback(
    async (programId: number, internIds: number[], forceReevaluate: boolean = false): Promise<string> => {
      stopPolling();
      const req: BatchScreeningRequest = { programId, internIds, forceReevaluate };
      const created = await aiService.startBatchScreening(req);

      const initialJob: ActiveAiJob = {
        jobType: 'SCREENING',
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
      setIsExpanded(true);

      toast.info(`Bắt đầu thẩm định ${internIds.length} ứng viên bằng AI`, {
        description: 'Bạn có thể tự do rời trang, tiến trình sẽ tiếp tục chạy ngầm.',
      });

      pollingTimerRef.current = setTimeout(() => {
        void pollScreeningJobStatus(created.jobId);
      }, 1500);

      return created.jobId;
    },
    [pollScreeningJobStatus, stopPolling]
  );

  // Kích hoạt Question Generation Job (Non-blocking)
  const startQuestionJob = useCallback(
    async (params: {
      programId: number;
      programName: string;
      internId?: number;
      internName?: string;
      targetRole?: string;
      totalQuestions?: number;
      includeScreeningDossier?: boolean;
      customRequirements?: string;
    }): Promise<string> => {
      stopPolling();
      const payload: GenerateInterviewQuestionsPayload = {
        programId: params.programId,
        internId: params.internId,
        targetRole: params.targetRole || params.programName,
        totalQuestions: params.totalQuestions || 8,
        includeScreeningDossier: params.includeScreeningDossier ?? true,
        customRequirements: params.customRequirements,
      };

      const created = await aiInterviewService.generateQuestionsAsync(payload);

      const initialJob: ActiveAiJob = {
        jobType: 'INTERVIEW_QUESTIONS',
        jobId: created.jobId,
        programId: params.programId,
        programName: params.programName,
        internId: params.internId,
        internName: params.internName,
        targetRole: params.targetRole || params.programName,
        status: 'PROCESSING',
        percent: 0,
        currentStage: created.currentStage || 'Đang khởi tạo tiến trình sinh câu hỏi AI...',
        questionSetId: created.questionSetId,
        createdAt: created.createdAt || new Date().toISOString(),
        updatedAt: created.updatedAt || new Date().toISOString(),
      };

      setActiveJob(initialJob);
      setIsExpanded(true);

      const scopeName = params.internName ? `ứng viên ${params.internName}` : `kỳ ${params.programName}`;
      toast.info(`Bắt đầu sinh bộ câu hỏi phỏng vấn cho ${scopeName}`, {
        description: 'Cửa sổ tiến độ đang chạy ngầm, bạn có thể tự do thực hiện tác vụ khác.',
      });

      pollingTimerRef.current = setTimeout(() => {
        void pollQuestionJobStatus(created.jobId);
      }, 1500);

      return created.jobId;
    },
    [pollQuestionJobStatus, stopPolling]
  );

  const dismissJob = useCallback(() => {
    stopPolling();
    setActiveJob(null);
    setIsExpanded(false);
  }, [stopPolling]);

  const openQuestionModal = useCallback((params?: Partial<ViewingQuestionModalState>) => {
    if (params) {
      setViewingQuestionModal((prev) => ({
        isOpen: true,
        programId: params.programId ?? prev?.programId ?? 0,
        programName: params.programName ?? prev?.programName ?? '',
        internId: params.internId ?? prev?.internId,
        internName: params.internName ?? prev?.internName,
        questionSetId: params.questionSetId ?? prev?.questionSetId,
      }));
    } else {
      setViewingQuestionModal((prev) => (prev ? { ...prev, isOpen: true } : null));
    }
  }, []);

  const closeQuestionModal = useCallback(() => {
    setViewingQuestionModal(null);
  }, []);

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
      startQuestionJob,
      dismissJob,
      completedVersion,
      viewingQuestionModal,
      openQuestionModal,
      closeQuestionModal,
    }),
    [
      activeJob,
      isExpanded,
      startJob,
      startQuestionJob,
      dismissJob,
      completedVersion,
      viewingQuestionModal,
      openQuestionModal,
      closeQuestionModal,
    ]
  );

  return (
    <AiJobContext.Provider value={contextValue}>
      {children}
      {/* Global Question Modal khi người dùng click Xem Bộ Câu Hỏi Vừa Tạo từ FloatingProgressWidget */}
      {viewingQuestionModal && viewingQuestionModal.isOpen && (
        <InterviewQuestionModal
          isOpen={viewingQuestionModal.isOpen}
          onClose={closeQuestionModal}
          programId={viewingQuestionModal.programId}
          programName={viewingQuestionModal.programName}
          internId={viewingQuestionModal.internId}
          internName={viewingQuestionModal.internName}
          initialSetId={viewingQuestionModal.questionSetId}
        />
      )}
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

