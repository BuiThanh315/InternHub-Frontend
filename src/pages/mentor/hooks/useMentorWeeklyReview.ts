import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { assessmentService } from '../../../services/assessmentService';
import type {
  MentorWeeklyReportReviewResponse,
  CreateWeeklyAssessmentPayload,
  WeeklyAssessment,
  ReportRevisionResponse,
} from '../../../types';

export interface UseMentorWeeklyReviewProps {
  internCode: string;
  initialWeek?: number;
  onAssessmentSaved?: (assessment: WeeklyAssessment) => void;
}

export const useMentorWeeklyReview = ({
  internCode,
  initialWeek = 1,
  onAssessmentSaved,
}: UseMentorWeeklyReviewProps) => {
  const [selectedWeek, setSelectedWeek] = useState<number>(initialWeek);
  const [reviewData, setReviewData] = useState<MentorWeeklyReportReviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const loadWeeklyReview = useCallback(
    async (weekNumber: number) => {
      if (!internCode) return;

      // Hủy request trước đó nếu còn đang chờ
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        setLoading(true);
        setError(null);
        const data = await assessmentService.getMentorWeeklyReportReview(
          internCode,
          weekNumber,
          controller.signal
        );
        setReviewData(data);
      } catch (err: any) {
        if (err.name === 'CanceledError' || err.name === 'AbortError') {
          return; // Bỏ qua nếu bị abort
        }
        const msg = err.message || 'Không thể tải chi tiết báo cáo và đánh giá tuần.';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [internCode]
  );

  useEffect(() => {
    void loadWeeklyReview(selectedWeek);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadWeeklyReview, selectedWeek]);

  // Đổi tuần
  const changeWeek = useCallback((week: number) => {
    setSelectedWeek(week);
  }, []);

  // Lưu nháp hoặc công bố đánh giá
  const saveAssessment = useCallback(
    async (payload: CreateWeeklyAssessmentPayload): Promise<WeeklyAssessment> => {
      try {
        setIsSubmitting(true);
        const saved = await assessmentService.saveWeeklyAssessment(internCode, payload);

        // Cập nhật lại reviewData trong state
        setReviewData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            assessment: {
              id: saved.id,
              mentorId: saved.mentorId,
              mentorName: saved.mentorName,
              technicalScore: saved.technicalScore,
              attitudeScore: saved.attitudeScore,
              teamworkScore: saved.teamworkScore,
              productivityScore: saved.productivityScore,
              averageScore: saved.averageScore,
              feedback: saved.feedback,
              nextWeekGoals: saved.nextWeekGoals,
              status: saved.status,
              publishedAt: saved.publishedAt,
            },
            report: prev.report && saved.status === 'PUBLISHED'
              ? {
                  ...prev.report,
                  status: 'REVIEWED',
                  statusDisplayName: 'Đã hoàn tất đánh giá',
                }
              : prev.report,
          };
        });

        if (payload.isPublish) {
          toast.success(`Đã gửi đánh giá Tuần ${payload.weekNumber} cho thực tập sinh thành công!`);
        } else {
          toast.success(`Đã lưu nháp đánh giá Tuần ${payload.weekNumber} (Chỉ Mentor).`);
        }

        if (onAssessmentSaved) {
          onAssessmentSaved(saved);
        }

        return saved;
      } catch (err: any) {
        const msg = err.message || 'Lỗi khi lưu đánh giá tuần.';
        toast.error(msg);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [internCode, onAssessmentSaved]
  );

  // Yêu cầu TTS sửa lại báo cáo
  const requestRevision = useCallback(
    async (revisionNote: string): Promise<ReportRevisionResponse> => {
      try {
        setIsSubmitting(true);
        const res = await assessmentService.requestReportRevision(internCode, selectedWeek, {
          revisionNote,
        });

        // Cập nhật lại trạng thái report trong reviewData
        setReviewData((prev) => {
          if (!prev?.report) return prev;
          return {
            ...prev,
            report: {
              ...prev.report,
              status: 'REVISION_REQUESTED',
              statusDisplayName: 'Yêu cầu làm lại',
              revisionNote,
            },
          };
        });


        toast.warning(
          `Đã gửi yêu cầu chỉnh sửa Báo cáo Tuần ${selectedWeek} đến thực tập sinh!`
        );

        return res;
      } catch (err: any) {
        const msg = err.message || 'Lỗi khi gửi yêu cầu làm lại báo cáo.';
        toast.error(msg);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [internCode, selectedWeek]
  );

  return {
    selectedWeek,
    reviewData,
    loading,
    error,
    isSubmitting,
    changeWeek,
    saveAssessment,
    requestRevision,
    refetch: () => loadWeeklyReview(selectedWeek),
  };
};
