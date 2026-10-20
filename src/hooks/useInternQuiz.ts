import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { quizService } from '../services/quizService';
import type {
  QuizAssignmentResponse,
  QuizTakingResponse,
  QuizResultResponse,
  SubmitQuizRequest,
} from '../types/quiz.types';

export function useInternQuiz() {
  const [assignments, setAssignments] = useState<QuizAssignmentResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchAssignments = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);
      const data = await quizService.getMyAssignments(abortControllerRef.current.signal);
      setAssignments(data);
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
        return;
      }
      const msg = err?.message || 'Không thể tải danh sách bài Quiz được giao';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchAssignments]);

  const startQuizAttempt = useCallback(async (assignmentId: number): Promise<QuizTakingResponse | null> => {
    try {
      setLoading(true);
      const data = await quizService.startQuizAttempt(assignmentId);
      toast.success('Bắt đầu làm bài thi Quiz!');
      return data;
    } catch (err: any) {
      toast.error(err?.message || 'Không thể bắt đầu làm bài thi');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitQuizAttempt = useCallback(async (
    submissionId: number,
    payload: SubmitQuizRequest
  ): Promise<QuizResultResponse | null> => {
    try {
      setLoading(true);
      const result = await quizService.submitQuizAttempt(submissionId, payload);
      toast.success('Nộp bài thi thành công! Đã chấm điểm tự động.');
      return result;
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi nộp bài thi');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSubmissionResult = useCallback(async (submissionId: number): Promise<QuizResultResponse | null> => {
    try {
      setLoading(true);
      return await quizService.getSubmissionResult(submissionId);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể lấy kết quả bài thi');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    assignments,
    loading,
    error,
    fetchAssignments,
    startQuizAttempt,
    submitQuizAttempt,
    getSubmissionResult,
  };
}
