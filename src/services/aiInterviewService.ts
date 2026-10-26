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

  // ==========================================
  // MODULE AI-01: HR INTERVIEW SCHEDULE MANAGEMENT
  // ==========================================

  /**
   * HR Tạo đợt phỏng vấn và gửi lời mời cho ứng viên
   */
  async createSchedule(
    payload: import('../types/aiInterviewRoom.types').CreateInterviewSchedulePayload
  ): Promise<import('../types/aiInterviewRoom.types').InterviewScheduleDetail> {
    const response = await apiClient.post<import('../types/aiInterviewRoom.types').InterviewScheduleDetail>(
      API_ENDPOINTS.AI.INTERVIEW_SCHEDULES,
      payload
    );
    return response.data;
  },

  /**
   * HR Lấy chi tiết đợt phỏng vấn và danh sách ứng viên
   */
  async getScheduleDetail(
    scheduleId: number | string
  ): Promise<import('../types/aiInterviewRoom.types').InterviewScheduleDetail> {
    const response = await apiClient.get<import('../types/aiInterviewRoom.types').InterviewScheduleDetail>(
      API_ENDPOINTS.AI.INTERVIEW_SCHEDULE_DETAIL(scheduleId)
    );
    return response.data;
  },

  /**
   * HR Lấy danh sách đợt phỏng vấn (hỗ trợ phân trang)
   */
  async getSchedules(params?: { programId?: number; page?: number; size?: number }): Promise<any> {
    const response = await apiClient.get(API_ENDPOINTS.AI.INTERVIEW_SCHEDULES, { params });
    return response.data;
  },

  /**
   * HR Cập nhật thông tin đợt phỏng vấn
   */
  async updateSchedule(
    scheduleId: number | string,
    payload: Partial<import('../types/aiInterviewRoom.types').CreateInterviewSchedulePayload>
  ): Promise<import('../types/aiInterviewRoom.types').InterviewScheduleDetail> {
    const response = await apiClient.put<import('../types/aiInterviewRoom.types').InterviewScheduleDetail>(
      API_ENDPOINTS.AI.INTERVIEW_SCHEDULE_DETAIL(scheduleId),
      payload
    );
    return response.data;
  },

  /**
   * HR Hủy đợt phỏng vấn
   */
  async cancelSchedule(scheduleId: number | string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.AI.INTERVIEW_SCHEDULE_DETAIL(scheduleId));
  },

  /**
   * HR Gửi lại lời mời cho Ứng viên (kèm link thủ công)
   */
  async resendInvite(
    scheduleId: number | string,
    sessionId: number | string
  ): Promise<{ message: string; manualInviteLink: string }> {
    const response = await apiClient.post<{ message: string; manualInviteLink: string }>(
      API_ENDPOINTS.AI.INTERVIEW_RESEND_INVITE(scheduleId, sessionId)
    );
    return response.data;
  },

  /**
   * HR Thu hồi phiên làm bài của ứng viên
   */
  async revokeSession(sessionId: number | string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AI.INTERVIEW_REVOKE_SESSION(sessionId));
  },

  // ==========================================
  // CANDIDATE INTERVIEW ROOM METHODS
  // ==========================================

  /**
   * Trao đổi raw token lấy Candidate Session JWT ngắn hạn
   */
  async exchangeCandidateToken(
    rawInviteToken: string
  ): Promise<import('../types/aiInterviewRoom.types').CandidateSessionAccessData> {
    const response = await apiClient.post<import('../types/aiInterviewRoom.types').CandidateSessionAccessData>(
      API_ENDPOINTS.AI.CANDIDATE_EXCHANGE_TOKEN,
      { rawInviteToken }
    );
    return response.data;
  },

  /**
   * Bắt đầu làm bài thi
   */
  async startCandidateSession(
    sessionId: number | string,
    sessionToken: string
  ): Promise<import('../types/aiInterviewRoom.types').CandidateQuestionData> {
    const response = await apiClient.post<import('../types/aiInterviewRoom.types').CandidateQuestionData>(
      API_ENDPOINTS.AI.CANDIDATE_SESSION_START(sessionId),
      {},
      { headers: { Authorization: `Bearer ${sessionToken}` } }
    );
    return response.data;
  },

  /**
   * Lưu câu trả lời (Optimistic Locking & Server Authoritative)
   */
  async saveCandidateAnswer(
    sessionId: number | string,
    questionId: number | string,
    payload: {
      answerText: string;
      inputMethod?: string;
      baseRevision: number;
      idempotencyKey?: string;
      timeSpentSeconds?: number;
      isSubmitted?: boolean;
    },
    sessionToken: string
  ): Promise<any> {
    const response = await apiClient.put(
      API_ENDPOINTS.AI.CANDIDATE_SESSION_SAVE_ANSWER(sessionId, questionId),
      payload,
      { headers: { Authorization: `Bearer ${sessionToken}` } }
    );
    return response.data;
  },

  /**
   * Khôi phục trạng thái buồng thi khi F5
   */
  async getCandidateRecoveryState(
    sessionId: number | string,
    sessionToken: string
  ): Promise<import('../types/aiInterviewRoom.types').CandidateRecoveryStateData> {
    const response = await apiClient.get<import('../types/aiInterviewRoom.types').CandidateRecoveryStateData>(
      API_ENDPOINTS.AI.CANDIDATE_SESSION_RECOVERY(sessionId),
      { headers: { Authorization: `Bearer ${sessionToken}` } }
    );
    return response.data;
  },

  /**
   * Gửi bằng chứng Telemetry giám sát vi phạm
   */
  async recordCandidateEvidence(
    sessionId: number | string,
    payload: import('../types/aiInterviewRoom.types').CandidateEvidencePayload,
    sessionToken: string
  ): Promise<import('../types/aiInterviewRoom.types').CandidateEvidenceResponse> {
    const response = await apiClient.post<import('../types/aiInterviewRoom.types').CandidateEvidenceResponse>(
      API_ENDPOINTS.AI.CANDIDATE_SESSION_EVIDENCE(sessionId),
      payload,
      { headers: { Authorization: `Bearer ${sessionToken}` } }
    );
    return response.data;
  },

  /**
   * Nộp bài phỏng vấn
   */
  async submitCandidateSession(
    sessionId: number | string,
    reason?: string,
    sessionToken?: string
  ): Promise<import('../types/aiInterviewRoom.types').SubmitSessionResponse> {
    const response = await apiClient.post<import('../types/aiInterviewRoom.types').SubmitSessionResponse>(
      API_ENDPOINTS.AI.CANDIDATE_SESSION_SUBMIT(sessionId),
      {},
      {
        params: reason ? { reason } : undefined,
        headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : undefined,
      }
    );
    return response.data;
  },

  /**
   * Lấy danh sách lịch phỏng vấn AI được mời của TTS đang đăng nhập
   */
  async getMyInterviews(signal?: AbortSignal): Promise<import('../types/aiInterviewRoom.types').InternInterviewItem[]> {
    const response = await apiClient.get<import('../types/aiInterviewRoom.types').InternInterviewItem[]>(
      API_ENDPOINTS.AI.CANDIDATE_MY_INTERVIEWS,
      { signal }
    );
    return response.data;
  },

  // ==========================================
  // MODULE AI-02: AI INTERVIEW GRADER & RANKING
  // ==========================================

  /**
   * Lấy hồ sơ đánh giá chi tiết (Dossier) của phiên phỏng vấn
   */
  async getEvaluationDossier(
    sessionId: number | string,
    signal?: AbortSignal
  ): Promise<import('../types/aiEvaluation.types').EvaluationDossier> {
    const response = await apiClient.get<import('../types/aiEvaluation.types').EvaluationDossier>(
      API_ENDPOINTS.AI.EVALUATION_DOSSIER(sessionId),
      { signal }
    );
    return response.data;
  },

  /**
   * HR Phê duyệt / Lưu nháp kết quả đánh giá (hỗ trợ sửa điểm từng câu)
   */
  async reviewEvaluation(
    sessionId: number | string,
    payload: import('../types/aiEvaluation.types').HrReviewPayload
  ): Promise<import('../types/aiEvaluation.types').EvaluationDossier> {
    const response = await apiClient.post<import('../types/aiEvaluation.types').EvaluationDossier>(
      API_ENDPOINTS.AI.EVALUATION_REVIEW(sessionId),
      payload
    );
    return response.data;
  },

  /**
   * Hủy phê duyệt kết quả để cho phép sửa điểm hoặc chấm lại
   */
  async revokeApproval(
    sessionId: number | string
  ): Promise<import('../types/aiEvaluation.types').EvaluationDossier> {
    const response = await apiClient.post<import('../types/aiEvaluation.types').EvaluationDossier>(
      API_ENDPOINTS.AI.EVALUATION_REVOKE(sessionId),
      {}
    );
    return response.data;
  },

  /**
   * Kích hoạt chấm lại bài thi bằng AI (Tạo phiên bản mới và chạy ngầm Asynchronous)
   */
  async triggerRegrade(
    sessionId: number | string,
    payload: import('../types/aiEvaluation.types').RegradePayload
  ): Promise<{
    jobId?: string;
    sessionId: number;
    newEvaluationId?: number;
    newVersion: number;
    status?: string;
    gradingStatus?: string;
    message: string;
  }> {
    const response = await apiClient.post(
      API_ENDPOINTS.AI.EVALUATION_REGRADE(sessionId),
      payload
    );
    return response.data;
  },

  /**
   * Tải tệp PDF Báo cáo kết quả đánh giá (Evaluation Dossier)
   */
  async exportDossierPdf(sessionId: number | string): Promise<Blob> {
    const response = await apiClient.get(
      API_ENDPOINTS.AI.EVALUATION_EXPORT_PDF(sessionId),
      { responseType: 'blob' }
    );
    return response.data;
  },

  /**
   * Tìm phiên phỏng vấn AI gần nhất của ứng viên theo candidateId hoặc email
   */
  async getCandidateInterviewSession(params: {
    candidateId?: number;
    email?: string;
  }): Promise<{ sessionId: number; scheduleId: number; status: string; candidateEmail: string; candidateName: string } | null> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AI.CANDIDATE_INTERVIEW_SESSION, {
        params,
      });
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Giám thị (HR) đình chỉ phiên thi trực tiếp do vi phạm quy chế
   */
  async disqualifySession(sessionId: number | string, reason?: string): Promise<{ success: boolean; sessionId: number; message: string }> {
    const response = await apiClient.post(`/api/v1/ai/interviews/schedules/sessions/${sessionId}/evaluation/disqualify`, {
      reason: reason || 'Đình chỉ bởi giám thị phòng thi trực tuyến',
    });
    return response.data;
  },
};

