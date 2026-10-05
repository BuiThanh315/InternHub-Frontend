import { apiClient } from './api';
import { INTERN_ENDPOINTS } from '../constants/endpoints/intern.endpoints';
import type {
  WeeklyAssessment,
  CreateWeeklyAssessmentPayload,
  MentorTriageOverview,
} from '../types';

export const assessmentService = {
  /**
   * Tạo mới hoặc cập nhật đánh giá tuần của thực tập sinh (Dành cho Mentor)
   */
  async saveWeeklyAssessment(
    internCode: string,
    payload: CreateWeeklyAssessmentPayload
  ): Promise<WeeklyAssessment> {
    const response = await apiClient.post(
      INTERN_ENDPOINTS.WEEKLY_ASSESSMENTS(internCode),
      payload
    );
    return response.data?.data;
  },

  /**
   * Lấy lịch sử đánh giá tuần của 1 TTS
   * Role INTERN: Backend tự động chỉ trả về các bản ghi PUBLISHED
   * Role MENTOR / HR / ADMIN: Trả về cả DRAFT và PUBLISHED
   */
  async getWeeklyAssessments(internCode: string): Promise<WeeklyAssessment[]> {
    const response = await apiClient.get(
      INTERN_ENDPOINTS.WEEKLY_ASSESSMENTS(internCode)
    );
    return response.data?.data || [];
  },

  /**
   * Lấy dữ liệu tổng quan Triage Hub cho Mentor phụ trách (Scale Triage)
   */
  async getMentorTriageOverview(): Promise<MentorTriageOverview> {
    const response = await apiClient.get(INTERN_ENDPOINTS.MENTOR_OVERVIEW);
    return response.data?.data;
  },

  /**
   * Lấy thông tin đánh giá tổng kết / mốc kỳ (MIDTERM hoặc FINAL)
   */
  async getEvaluation(internCode: string, type: 'MIDTERM' | 'FINAL' = 'FINAL') {
    const response = await apiClient.get(INTERN_ENDPOINTS.EVALUATIONS(internCode), {
      params: { type },
    });
    return response.data?.data;
  },

  /**
   * Lưu hoặc nộp đánh giá tổng kết / mốc kỳ
   */
  async saveEvaluation(
    internCode: string,
    payload: import('../types').CreateInternEvaluationPayload
  ) {
    const response = await apiClient.post(
      INTERN_ENDPOINTS.EVALUATIONS(internCode),
      payload
    );
    return response.data?.data;
  },

  /**
   * HR Lấy danh sách tổng hợp đánh giá thực tập sinh phục vụ rà soát & xuất báo cáo
   */
  async getHrEvaluationSummary(params?: {
    programId?: number;
    university?: string;
    status?: string;
    keyword?: string;
  }): Promise<import('../types').HrEvaluationSummaryItem[]> {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.programId) cleanParams.programId = params.programId;
      if (params.university?.trim()) cleanParams.university = params.university.trim();
      if (params.status?.trim() && params.status !== 'ALL') cleanParams.status = params.status.trim();
      if (params.keyword?.trim()) cleanParams.keyword = params.keyword.trim();
    }
    const response = await apiClient.get('/api/evaluations/hr/summary', { params: cleanParams });
    return response.data?.data || [];
  },

  /**
   * HR Phê duyệt đánh giá cuối kỳ và hoàn thành kỳ thực tập cho sinh viên
   */
  async hrApproveEvaluation(
    internCode: string,
    payload: import('../types').HrApproveEvaluationPayload
  ): Promise<any> {
    const response = await apiClient.patch(
      `/api/interns/${internCode}/evaluations/hr-approve`,
      payload
    );
    return response.data?.data;
  },
};
