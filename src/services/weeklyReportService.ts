import axios from 'axios';
import { apiClient, AppError } from './api';
import { INTERN_ENDPOINTS } from '../constants/endpoints';
import type {
  ApiResponse,
  WeeklyReportTimelineItem,
  WeeklyReportTimelineBackendResponse,
  WeeklyReportStatus,
  SuggestedKanbanTasksResponse,
  WeeklyReportDetail,
  SaveWeeklyReportPayload,
} from '../types';

const isCancelError = (error: any): boolean =>
  axios.isCancel(error) ||
  error?.name === 'CanceledError' ||
  error?.name === 'AbortError' ||
  error?.code === 'ERR_CANCELED' ||
  error?.message === 'canceled';

const handleServiceError = (error: any, fallbackMessage: string): never => {
  if (isCancelError(error)) {
    throw error;
  }
  if (error instanceof AppError) throw error;
  throw new AppError(error.message || fallbackMessage);
};

export const weeklyReportService = {
  /**
   * Lấy danh sách Trục thời gian (Timeline) các tuần trong kỳ thực tập của TTS
   */
  async getTimeline(signal?: AbortSignal): Promise<WeeklyReportTimelineItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<WeeklyReportTimelineBackendResponse>>(
        INTERN_ENDPOINTS.MY_WEEKLY_REPORTS_TIMELINE,
        { signal }
      );
      const data = response.data.data;
      if (!data?.reports) return [];

      return data.reports.map((item) => ({
        weekNumber: item.weekNumber,
        startDate: item.startDate,
        endDate: item.endDate,
        status: (item.status as WeeklyReportStatus) || 'NOT_STARTED',
        statusDisplayName: item.statusDisplayName,
        submittedAt: item.submittedAt,
        isCurrentWeek: item.weekNumber === data.currentWeek,
        isEditable: item.status !== 'REVIEWED' && item.weekNumber <= data.currentWeek,
        score: item.mentorAverageScore ?? null,
        mentorFeedback: item.mentorFeedback ?? null,
        hasAssessment: item.status === 'REVIEWED',
      }));
    } catch (error: any) {
      return handleServiceError(error, 'Lỗi khi tải danh sách tuần thực tập');
    }
  },

  /**
   * Lấy danh sách nhiệm vụ gợi ý từ bảng Kanban TM-20 theo tuần
   */
  async getSuggestedTasks(
    weekNumber: number,
    signal?: AbortSignal
  ): Promise<SuggestedKanbanTasksResponse> {
    try {
      const response = await apiClient.get<ApiResponse<SuggestedKanbanTasksResponse>>(
        INTERN_ENDPOINTS.MY_WEEKLY_REPORTS_SUGGESTED_TASKS(weekNumber),
        { signal }
      );
      return response.data.data ?? { completedTasks: [], unfinishedTasks: [] };
    } catch (error: any) {
      return handleServiceError(error, 'Lỗi khi lấy gợi ý nhiệm vụ từ bảng Kanban');
    }
  },

  /**
   * Xem chi tiết nội dung báo cáo của tuần
   */
  async getReportDetail(
    weekNumber: number,
    signal?: AbortSignal
  ): Promise<WeeklyReportDetail | null> {
    try {
      const response = await apiClient.get<ApiResponse<WeeklyReportDetail>>(
        INTERN_ENDPOINTS.MY_WEEKLY_REPORT_DETAIL(weekNumber),
        { signal }
      );
      return response.data.data ?? null;
    } catch (error: any) {
      // Khi tuần chưa có báo cáo nào trong DB, Backend trả về 404 (ResourceNotFoundException)
      // Lưu ý AppError bọc status trong error.status và error.originalError.response.status
      if (
        error?.status === 404 ||
        error?.response?.status === 404 ||
        error?.originalError?.response?.status === 404
      ) {
        return null;
      }
      return handleServiceError(error, `Lỗi khi tải chi tiết báo cáo tuần ${weekNumber}`);
    }
  },

  /**
   * Lưu nháp báo cáo tuần
   */
  async saveDraft(
    weekNumber: number,
    payload: SaveWeeklyReportPayload
  ): Promise<WeeklyReportDetail> {
    try {
      const sanitizedTasks =
        payload.tasks?.map((t: any) => ({
          missionItemId: t.missionItemId,
          taskTitle: t.taskTitle || t.title,
          taskStatus: t.taskStatus || t.status,
          submissionUrl: t.submissionUrl || null,
          note: t.note || t.completionNote || null,
          isCompleted: Boolean(t.isCompleted),
        })) ?? [];

      const response = await apiClient.post<ApiResponse<WeeklyReportDetail>>(
        INTERN_ENDPOINTS.MY_WEEKLY_REPORT_SAVE,
        {
          ...payload,
          weekNumber,
          isSubmit: false,
          reportAttachmentUrl: payload.reportAttachmentUrl?.trim() || null,
          tasks: sanitizedTasks,
        }
      );
      return response.data.data;
    } catch (error: any) {
      return handleServiceError(error, `Lỗi khi lưu nháp báo cáo tuần ${weekNumber}`);
    }
  },

  /**
   * Nộp chính thức báo cáo tuần
   */
  async submitReport(
    weekNumber: number,
    payload: SaveWeeklyReportPayload
  ): Promise<WeeklyReportDetail> {
    try {
      const sanitizedTasks =
        payload.tasks?.map((t: any) => ({
          missionItemId: t.missionItemId,
          taskTitle: t.taskTitle || t.title,
          taskStatus: t.taskStatus || t.status,
          submissionUrl: t.submissionUrl || null,
          note: t.note || t.completionNote || null,
          isCompleted: Boolean(t.isCompleted),
        })) ?? [];

      const response = await apiClient.post<ApiResponse<WeeklyReportDetail>>(
        INTERN_ENDPOINTS.MY_WEEKLY_REPORT_SAVE,
        {
          ...payload,
          weekNumber,
          isSubmit: true,
          reportAttachmentUrl: payload.reportAttachmentUrl?.trim() || null,
          tasks: sanitizedTasks,
        }
      );
      return response.data.data;
    } catch (error: any) {
      return handleServiceError(error, `Lỗi khi nộp báo cáo tuần ${weekNumber}`);
    }
  },

  /**
   * Cập nhật báo cáo tuần (khi đã nộp nhưng Mentor chưa chấm điểm)
   */
  async updateReport(
    weekNumber: number,
    payload: SaveWeeklyReportPayload
  ): Promise<WeeklyReportDetail> {
    try {
      const sanitizedTasks =
        payload.tasks?.map((t: any) => ({
          missionItemId: t.missionItemId,
          taskTitle: t.taskTitle || t.title,
          taskStatus: t.taskStatus || t.status,
          submissionUrl: t.submissionUrl || null,
          note: t.note || t.completionNote || null,
          isCompleted: Boolean(t.isCompleted),
        })) ?? [];

      const response = await apiClient.put<ApiResponse<WeeklyReportDetail>>(
        INTERN_ENDPOINTS.MY_WEEKLY_REPORT_UPDATE(weekNumber),
        {
          ...payload,
          weekNumber,
          reportAttachmentUrl: payload.reportAttachmentUrl?.trim() || null,
          tasks: sanitizedTasks,
        }
      );
      return response.data.data;
    } catch (error: any) {
      return handleServiceError(error, `Lỗi khi cập nhật báo cáo tuần ${weekNumber}`);
    }
  },
};
