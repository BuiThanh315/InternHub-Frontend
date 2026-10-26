import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/endpoints';
import type {
  GenerateAiQuizRequest,
  CreateQuizRequest,
  UpdateQuizRequest,
  AssignQuizRequest,
  SubmitQuizRequest,
  QuizDetailResponse,
  QuizSummaryResponse,
  QuizTakingResponse,
  QuizResultResponse,
  QuizAssignmentResponse,
  QuizReportResponse,
} from '../types/quiz.types';

export const quizService = {
  // --- Mentor Services ---

  /**
   * Yêu cầu AI sinh câu hỏi và tạo bản nháp Quiz từ báo cáo tuần
   */
  async generateAiQuiz(
    payload: GenerateAiQuizRequest,
    signal?: AbortSignal
  ): Promise<QuizDetailResponse> {
    const response = await apiClient.post(API_ENDPOINTS.QUIZ.GENERATE_AI, payload, {
      signal,
      timeout: 60000, // Gemini AI sinh 10 câu hỏi trắc nghiệm nâng cao kèm lời giải thích có thể mất 12-25s
    });
    return response.data?.data;
  },

  /**
   * Tạo bài Quiz thủ công
   */
  async createQuiz(
    payload: CreateQuizRequest,
    signal?: AbortSignal
  ): Promise<QuizDetailResponse> {
    const response = await apiClient.post(API_ENDPOINTS.QUIZ.CREATE, payload, { signal });
    return response.data?.data;
  },

  /**
   * Cập nhật thông tin/câu hỏi bài Quiz nháp
   */
  async updateQuiz(
    id: number,
    payload: UpdateQuizRequest,
    signal?: AbortSignal
  ): Promise<QuizDetailResponse> {
    const response = await apiClient.put(API_ENDPOINTS.QUIZ.UPDATE(id), payload, { signal });
    return response.data?.data;
  },

  /**
   * Lấy chi tiết bài Quiz kèm bộ câu hỏi
   */
  async getQuizDetail(
    id: number,
    signal?: AbortSignal
  ): Promise<QuizDetailResponse> {
    const response = await apiClient.get(API_ENDPOINTS.QUIZ.DETAIL(id), { signal });
    return response.data?.data;
  },

  /**
   * Lấy danh sách bài Quiz theo chương trình thực tập
   */
  async getQuizzesByProgram(
    programId: number,
    signal?: AbortSignal
  ): Promise<QuizSummaryResponse[]> {
    const response = await apiClient.get(API_ENDPOINTS.QUIZ.BY_PROGRAM(programId), { signal });
    return response.data?.data || [];
  },

  /**
   * Giao bài Quiz cho học viên hoặc nhóm học viên
   */
  async assignQuiz(
    id: number,
    payload: AssignQuizRequest,
    signal?: AbortSignal
  ): Promise<void> {
    await apiClient.post(API_ENDPOINTS.QUIZ.ASSIGN(id), payload, { signal });
  },

  /**
   * Lấy báo cáo thống kê kết quả thi của bài Quiz
   */
  async getQuizReport(
    id: number,
    signal?: AbortSignal
  ): Promise<QuizReportResponse> {
    const response = await apiClient.get(API_ENDPOINTS.QUIZ.REPORT(id), { signal });
    return response.data?.data;
  },

  // --- Intern Services ---

  /**
   * Lấy danh sách bài Quiz được giao cho thực tập sinh hiện tại
   */
  async getMyAssignments(
    signal?: AbortSignal
  ): Promise<QuizAssignmentResponse[]> {
    const response = await apiClient.get(API_ENDPOINTS.QUIZ.MY_ASSIGNMENTS, { signal });
    return response.data?.data || [];
  },

  /**
   * Bắt đầu lượt làm bài thi (nhận câu hỏi, ẩn toàn bộ đáp án đúng)
   */
  async startQuizAttempt(
    assignmentId: number,
    signal?: AbortSignal
  ): Promise<QuizTakingResponse> {
    const response = await apiClient.post(API_ENDPOINTS.QUIZ.START_ATTEMPT(assignmentId), {}, { signal });
    return response.data?.data;
  },

  /**
   * Nộp bài thi Quiz (chấm điểm All-or-Nothing, mở khóa đáp án chi tiết)
   */
  async submitQuizAttempt(
    submissionId: number,
    payload: SubmitQuizRequest,
    signal?: AbortSignal
  ): Promise<QuizResultResponse> {
    const response = await apiClient.post(API_ENDPOINTS.QUIZ.SUBMIT_ATTEMPT(submissionId), payload, { signal });
    return response.data?.data;
  },

  /**
   * Lấy kết quả lượt thi và đáp án chi tiết
   */
  async getSubmissionResult(
    submissionId: number,
    signal?: AbortSignal
  ): Promise<QuizResultResponse> {
    const response = await apiClient.get(API_ENDPOINTS.QUIZ.SUBMISSION_RESULT(submissionId), { signal });
    return response.data?.data;
  },
};
