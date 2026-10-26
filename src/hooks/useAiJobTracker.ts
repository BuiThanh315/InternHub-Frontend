import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { AiJobProgressEvent } from '../types/aiJob.types';

export function useAiJobTracker(filterJobId?: string) {
  const [currentJob, setCurrentJob] = useState<AiJobProgressEvent | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const handleJobEvent = useCallback((event: CustomEvent<AiJobProgressEvent>) => {
    const job = event.detail;
    if (filterJobId && job.jobId !== filterJobId) {
      return;
    }

    setCurrentJob(job);

    if (job.status === 'COMPLETED') {
      setIsCompleted(true);
      toast.success(job.currentStep || 'Tác vụ AI hoàn tất thành công!', {
        description: `Mã tiến trình: ${job.jobId.slice(0, 8)}...`,
      });

      // Invalidate relevant queries theo nghiệp vụ
      if (job.jobType === 'INTERVIEW_REGRADE') {
        queryClient.invalidateQueries({ queryKey: ['interview-evaluation', job.referenceId] });
        queryClient.invalidateQueries({ queryKey: ['evaluation-dossier'] });
      } else if (job.jobType === 'CV_BATCH_SCREENING') {
        queryClient.invalidateQueries({ queryKey: ['applications'] });
      } else if (job.jobType === 'WEEKLY_REPORT_REVIEW') {
        queryClient.invalidateQueries({ queryKey: ['weekly-reports'] });
      }
    } else if (job.status === 'FAILED') {
      setIsCompleted(false);
      toast.error('Tác vụ AI thất bại', {
        description: job.errorMessage || 'Hệ thống gặp sự cố trong quá trình xử lý.',
      });
    }
  }, [filterJobId, queryClient]);

  useEffect(() => {
    const listener = (e: Event) => handleJobEvent(e as CustomEvent<AiJobProgressEvent>);
    window.addEventListener('internhub:ai-job-event', listener);
    return () => {
      window.removeEventListener('internhub:ai-job-event', listener);
    };
  }, [handleJobEvent]);

  const resetTracker = useCallback(() => {
    setCurrentJob(null);
    setIsCompleted(false);
  }, []);

  return {
    currentJob,
    progress: currentJob?.progress ?? 0,
    status: currentJob?.status,
    currentStep: currentJob?.currentStep,
    detail: currentJob?.detail,
    isCompleted,
    resetTracker,
  };
}
