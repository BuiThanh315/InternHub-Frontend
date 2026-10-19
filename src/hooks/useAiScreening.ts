import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useAiJob } from '../contexts/AiJobContext';
import { aiService } from '../services/aiService';
import type { InternProfile, ScreeningResultDto } from '../types';

export type AiFilterOption = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNRATED';

export const useAiScreening = (programId: number) => {
  const { startJob, activeJob, completedVersion } = useAiJob();

  // State 1: Danh sách ID ứng viên được chọn
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // State 2: Bộ lọc mức điểm AI
  const [aiScoreFilter, setAiScoreFilter] = useState<AiFilterOption>('ALL');

  // State 3: Bản đồ lưu kết quả đánh giá AI theo internId
  const [evaluationsMap, setEvaluationsMap] = useState<Record<number, ScreeningResultDto>>({});

  // State 4: Trạng thái đang gửi yêu cầu batch
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Cập nhật kết quả realtime từ activeJob khi có kết quả mới
  useEffect(() => {
    if (activeJob?.results && activeJob.results.length > 0) {
      setEvaluationsMap((prev) => {
        const next = { ...prev };
        activeJob.results.forEach((res) => {
          next[res.internId] = res;
        });
        return next;
      });
    }
  }, [activeJob?.results]);

  // Chọn hoặc bỏ chọn một ứng viên
  const toggleSelect = useCallback((internId: number) => {
    setSelectedIds((prev) =>
      prev.includes(internId) ? prev.filter((id) => id !== internId) : [...prev, internId]
    );
  }, []);

  // Chọn tất cả hoặc bỏ chọn tất cả
  const toggleSelectAll = useCallback((allIds: number[]) => {
    setSelectedIds((prev) => (prev.length === allIds.length ? [] : [...allIds]));
  }, []);

  // Xóa danh sách đã chọn
  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Kiểm tra một ứng viên có đang được chọn không
  const isSelected = useCallback(
    (internId: number) => selectedIds.includes(internId),
    [selectedIds]
  );

  // Kích hoạt thẩm định AI hàng loạt
  const triggerBatch = useCallback(
    async (targetIds?: number[]) => {
      const idsToScreen = targetIds && targetIds.length > 0 ? targetIds : selectedIds;

      if (!idsToScreen || idsToScreen.length === 0) {
        toast.warning('Vui lòng chọn ít nhất một ứng viên để thẩm định AI.');
        return;
      }

      try {
        setIsSubmitting(true);
        await startJob(programId, idsToScreen);
        clearSelection();
      } catch (err: any) {
        console.error('Lỗi khi kích hoạt AI Screening batch:', err);
        toast.error(err?.response?.data?.message || 'Không thể khởi tạo tiến trình thẩm định AI.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedIds, programId, startJob, clearSelection]
  );

  // Nạp kết quả đánh giá đã lưu từ database cho danh sách ứng viên
  const loadEvaluations = useCallback(async (interns: InternProfile[]) => {
    if (!interns || interns.length === 0) return;

    const promises = interns.map(async (intern) => {
      try {
        const evaluation = await aiService.getInternEvaluation(intern.id);
        if (evaluation) {
          return { internId: intern.id, evaluation };
        }
      } catch {
        // Bỏ qua nếu ứng viên chưa có kết quả đánh giá
      }
      return null;
    });

    const results = await Promise.all(promises);
    setEvaluationsMap((prev) => {
      const next = { ...prev };
      results.forEach((item) => {
        if (item) {
          next[item.internId] = item.evaluation;
        }
      });
      return next;
    });
  }, []);

  // Lọc danh sách ứng viên theo tiêu chí điểm số AI
  const filterApplicants = useCallback(
    (applicants: InternProfile[]): InternProfile[] => {
      if (aiScoreFilter === 'ALL') {
        return applicants;
      }

      return applicants.filter((intern) => {
        const evalResult = evaluationsMap[intern.id];
        if (!evalResult) {
          return aiScoreFilter === 'UNRATED';
        }

        const score = evalResult.overallScore;
        if (aiScoreFilter === 'HIGH') return score >= 75;
        if (aiScoreFilter === 'MEDIUM') return score >= 50 && score < 75;
        if (aiScoreFilter === 'LOW') return score < 50;
        return true;
      });
    },
    [aiScoreFilter, evaluationsMap]
  );

  return useMemo(
    () => ({
      selectedIds,
      aiScoreFilter,
      evaluationsMap,
      isSubmitting,
      completedVersion,
      activeJob,
      setAiScoreFilter,
      toggleSelect,
      toggleSelectAll,
      clearSelection,
      isSelected,
      triggerBatch,
      loadEvaluations,
      filterApplicants,
    }),
    [
      selectedIds,
      aiScoreFilter,
      evaluationsMap,
      isSubmitting,
      completedVersion,
      activeJob,
      setAiScoreFilter,
      toggleSelect,
      toggleSelectAll,
      clearSelection,
      isSelected,
      triggerBatch,
      loadEvaluations,
      filterApplicants,
    ]
  );
};
