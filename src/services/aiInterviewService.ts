import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/endpoints';
import type {
  InterviewQuestionSet,
  InterviewQuestionItem,
  GenerateInterviewQuestionsPayload,
  UpdateInterviewQuestionSetPayload,
} from '../types/aiInterview.types';

export const aiInterviewService = {
  /**
   * Sinh bộ câu hỏi phỏng vấn tự động bằng AI (hỗ trợ Program-based hoặc Candidate-based)
   */
  async generateQuestions(
    payload: GenerateInterviewQuestionsPayload,
    signal?: AbortSignal
  ): Promise<InterviewQuestionSet> {
    const response = await apiClient.post<InterviewQuestionSet>(
      API_ENDPOINTS.AI.INTERVIEW_GENERATE,
      payload,
      {
        signal,
        timeout: 90000, // AI generation có thể mất 15-45s
      }
    );
    return response.data;
  },

  /**
   * Lấy chi tiết bộ câu hỏi theo ID
   */
  async getQuestionSetById(id: number, signal?: AbortSignal): Promise<InterviewQuestionSet> {
    const response = await apiClient.get<InterviewQuestionSet>(
      API_ENDPOINTS.AI.INTERVIEW_SET_DETAIL(id),
      { signal }
    );
    return response.data;
  },

  /**
   * Lấy danh sách bộ câu hỏi theo programId hoặc internId
   */
  async getQuestionSets(
    params: { programId?: number; internId?: number },
    signal?: AbortSignal
  ): Promise<InterviewQuestionSet[]> {
    const response = await apiClient.get<InterviewQuestionSet[]>(
      API_ENDPOINTS.AI.INTERVIEW_SETS,
      {
        params,
        signal,
      }
    );
    return response.data;
  },

  /**
   * Cập nhật bộ câu hỏi (sửa câu hỏi, chốt trạng thái FINALIZED)
   */
  async updateQuestionSet(
    id: number,
    payload: UpdateInterviewQuestionSetPayload,
    signal?: AbortSignal
  ): Promise<InterviewQuestionSet> {
    const response = await apiClient.put<InterviewQuestionSet>(
      API_ENDPOINTS.AI.INTERVIEW_SET_DETAIL(id),
      payload,
      { signal }
    );
    return response.data;
  },

  /**
   * Xóa bộ câu hỏi
   */
  async deleteQuestionSet(id: number, signal?: AbortSignal): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.AI.INTERVIEW_SET_DETAIL(id), { signal });
  },

  /**
   * Đổi câu hỏi khác (Regenerate single question)
   */
  async regenerateSingleQuestion(
    setId: number,
    questionId: number,
    signal?: AbortSignal
  ): Promise<InterviewQuestionItem> {
    const response = await apiClient.post<InterviewQuestionItem>(
      API_ENDPOINTS.AI.INTERVIEW_REGENERATE_QUESTION(setId, questionId),
      {},
      { signal, timeout: 45000 }
    );
    return response.data;
  },

  /**
   * Xuất phiếu phỏng vấn chuẩn ra file PDF
   */
  async exportEvaluationPdf(id: number, fileName?: string): Promise<void> {
    const response = await apiClient.get(API_ENDPOINTS.AI.INTERVIEW_EXPORT_PDF(id), {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName || `Phieu_Danh_Gia_Phong_Van_Set_${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },
};
