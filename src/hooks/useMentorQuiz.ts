import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { quizService } from '../services/quizService';
import type {
  QuizSummaryResponse,
  QuizDetailResponse,
  QuizReportResponse,
  GenerateAiQuizRequest,
  UpdateQuizRequest,
  AssignQuizRequest,
} from '../types/quiz.types';

export function useMentorQuiz(programId?: number) {
  const [quizzes, setQuizzes] = useState<QuizSummaryResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchQuizzes = useCallback(async () => {
    if (!programId) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);
      const data = await quizService.getQuizzesByProgram(programId, abortControllerRef.current.signal);
      setQuizzes(data);
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
        return;
      }
      const msg = err?.message || 'Không thể tải danh sách bài Quiz';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    fetchQuizzes();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchQuizzes]);

  const generateAiQuiz = useCallback(async (payload: GenerateAiQuizRequest): Promise<QuizDetailResponse | null> => {
    try {
      setActionLoading(true);
      const result = await quizService.generateAiQuiz(payload);
      toast.success('AI đã sinh thành công bộ câu hỏi bài Quiz nháp!');
      await fetchQuizzes();
      return result;
    } catch (err: any) {
      const msg = err?.message || 'Lỗi khi yêu cầu AI sinh bài Quiz';
      toast.error(msg);
      return null;
    } finally {
      setActionLoading(false);
    }
  }, [fetchQuizzes]);

  const updateQuiz = useCallback(async (id: number, payload: UpdateQuizRequest): Promise<QuizDetailResponse | null> => {
    try {
      setActionLoading(true);
      const result = await quizService.updateQuiz(id, payload);
      toast.success('Đã lưu bài Quiz thành công');
      await fetchQuizzes();
      return result;
    } catch (err: any) {
      const msg = err?.message || 'Lỗi khi lưu bài Quiz';
      toast.error(msg);
      return null;
    } finally {
      setActionLoading(false);
    }
  }, [fetchQuizzes]);

  const assignQuiz = useCallback(async (id: number, payload: AssignQuizRequest): Promise<boolean> => {
    try {
      setActionLoading(true);
      await quizService.assignQuiz(id, payload);
      toast.success('Phân công bài Quiz thành công! Đã tạo thẻ nhiệm vụ trên Kanban.');
      await fetchQuizzes();
      return true;
    } catch (err: any) {
      const msg = err?.message || 'Lỗi khi phân công bài Quiz';
      toast.error(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [fetchQuizzes]);

  const getQuizDetail = useCallback(async (id: number): Promise<QuizDetailResponse | null> => {
    try {
      return await quizService.getQuizDetail(id);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể lấy thông tin chi tiết bài Quiz');
      return null;
    }
  }, []);

  const getQuizReport = useCallback(async (id: number): Promise<QuizReportResponse | null> => {
    try {
      return await quizService.getQuizReport(id);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể lấy báo cáo kết quả bài Quiz');
      return null;
    }
  }, []);

  return {
    quizzes,
    loading,
    error,
    actionLoading,
    fetchQuizzes,
    generateAiQuiz,
    updateQuiz,
    assignQuiz,
    getQuizDetail,
    getQuizReport,
  };
}
