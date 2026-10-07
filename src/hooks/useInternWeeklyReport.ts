import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { weeklyReportService } from '../services/weeklyReportService';
import type {
  WeeklyReportTimelineItem,
  WeeklyReportStatus,
  WeeklyReportDetail,
  SaveWeeklyReportPayload,
  SuggestedKanbanTasksResponse,
  SuggestedKanbanTaskItem,
  WeeklyReportTaskItem,
} from '../types';

export interface UseInternWeeklyReportReturn {
  // Timeline State
  timeline: WeeklyReportTimelineItem[];
  selectedWeekNumber: number | null;
  currentTimelineItem: WeeklyReportTimelineItem | null;
  selectWeek: (weekNumber: number) => void;

  // Active Report Detail & Form
  reportDetail: WeeklyReportDetail | null;
  formValues: SaveWeeklyReportPayload;
  updateFormField: (field: keyof SaveWeeklyReportPayload, value: any) => void;
  resetForm: () => void;
  isDirty: boolean;
  isEditable: boolean;

  // Kanban Suggestions
  suggestedTasks: SuggestedKanbanTasksResponse | null;
  isLoadingSuggestions: boolean;
  loadSuggestedTasks: () => Promise<void>;
  applySuggestedTasks: (
    completed: SuggestedKanbanTaskItem[],
    unfinished: SuggestedKanbanTaskItem[]
  ) => void;

  // Metrics
  metrics: {
    totalWeeks: number;
    submittedCount: number;
    draftCount: number;
    averageScore: number | null;
  };

  // Async States & Actions
  isLoadingTimeline: boolean;
  isLoadingDetail: boolean;
  isSavingDraft: boolean;
  isSubmitting: boolean;
  error: string | null;
  saveDraft: () => Promise<boolean>;
  submitReport: () => Promise<boolean>;
  reloadAll: () => Promise<void>;
}

const isCancelError = (error: any): boolean =>
  axios.isCancel(error) ||
  error?.name === 'CanceledError' ||
  error?.name === 'AbortError' ||
  error?.code === 'ERR_CANCELED' ||
  error?.message === 'canceled';

const initialPayload: SaveWeeklyReportPayload = {
  completedTasksSummary: '',
  unfinishedTasksSummary: '',
  difficultiesAndChallenges: '',
  learningsAndKnowledge: '',
  nextWeekPlan: '',
  reportAttachmentUrl: '',
  tasks: [],
};

export const useInternWeeklyReport = (): UseInternWeeklyReportReturn => {
  const [timeline, setTimeline] = useState<WeeklyReportTimelineItem[]>([]);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number | null>(null);
  const [reportDetail, setReportDetail] = useState<WeeklyReportDetail | null>(null);
  const [formValues, setFormValues] = useState<SaveWeeklyReportPayload>(initialPayload);
  const [isDirty, setIsDirty] = useState(false);

  const [isLoadingTimeline, setIsLoadingTimeline] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [suggestedTasks, setSuggestedTasks] = useState<SuggestedKanbanTasksResponse | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const timelineAbortRef = useRef<AbortController | null>(null);
  const detailAbortRef = useRef<AbortController | null>(null);

  // 1. Tải danh sách Trục thời gian (Timeline)
  const fetchTimeline = useCallback(async () => {
    timelineAbortRef.current?.abort();
    timelineAbortRef.current = new AbortController();

    setIsLoadingTimeline(true);
    setError(null);

    try {
      const data = await weeklyReportService.getTimeline(timelineAbortRef.current.signal);
      setTimeline(data);

      // Tự động chọn tuần hiện tại nếu chưa chọn tuần nào
      setSelectedWeekNumber((prev) => {
        if (prev !== null) return prev;
        const current = data.find((item) => item.isCurrentWeek);
        return current ? current.weekNumber : data[0]?.weekNumber ?? 1;
      });
    } catch (err: any) {
      if (!isCancelError(err)) {
        const msg = err.message || 'Không thể tải danh sách tiến độ các tuần';
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setIsLoadingTimeline(false);
    }
  }, []);

  // 2. Tải chi tiết báo cáo khi chọn tuần
  const fetchReportDetail = useCallback(
    async (weekNumber: number, status?: WeeklyReportStatus) => {
      detailAbortRef.current?.abort();
      detailAbortRef.current = new AbortController();

      // Nếu tuần ở trạng thái NOT_STARTED (chưa tạo báo cáo), chắc chắn chưa có bản ghi trong DB
      // Bỏ qua request GET để tránh log 404 không cần thiết trên DevTools
      if (status === 'NOT_STARTED' || status === 'NOT_SUBMITTED') {
        setReportDetail(null);
        setFormValues(initialPayload);
        setIsDirty(false);
        setIsLoadingDetail(false);
        return;
      }

      setIsLoadingDetail(true);
      setError(null);

      try {
        const detail = await weeklyReportService.getReportDetail(
          weekNumber,
          detailAbortRef.current.signal
        );
        setReportDetail(detail);

        // Điền form với dữ liệu đã lưu hoặc reset nếu chưa có
        if (detail) {
          setFormValues({
            completedTasksSummary: detail.completedTasksSummary || '',
            unfinishedTasksSummary: detail.unfinishedTasksSummary || '',
            difficultiesAndChallenges: detail.difficultiesAndChallenges || '',
            learningsAndKnowledge: detail.learningsAndKnowledge || '',
            nextWeekPlan: detail.nextWeekPlan || '',
            reportAttachmentUrl: detail.reportAttachmentUrl || '',
            tasks: detail.tasks || [],
          });
        } else {
          setFormValues(initialPayload);
        }
        setIsDirty(false);
      } catch (err: any) {
        if (!isCancelError(err)) {
          const msg = err.message || `Lỗi khi tải chi tiết báo cáo tuần ${weekNumber}`;
          setError(msg);
          toast.error(msg);
        }
      } finally {
        setIsLoadingDetail(false);
      }
    },
    []
  );

  // Khởi động nạp timeline
  useEffect(() => {
    void fetchTimeline();
    return () => {
      timelineAbortRef.current?.abort();
      detailAbortRef.current?.abort();
    };
  }, [fetchTimeline]);

  // Nạp chi tiết khi tuần được chọn thay đổi
  useEffect(() => {
    if (selectedWeekNumber !== null) {
      const currentItem = timeline.find((item) => item.weekNumber === selectedWeekNumber);
      void fetchReportDetail(selectedWeekNumber, currentItem?.status);
    }
  }, [selectedWeekNumber, timeline, fetchReportDetail]);

  // Chọn tuần
  const selectWeek = useCallback((weekNumber: number) => {
    setSelectedWeekNumber(weekNumber);
  }, []);

  // Cập nhật giá trị một trường trong form
  const updateFormField = useCallback((field: keyof SaveWeeklyReportPayload, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsDirty(true);
  }, []);

  // Khôi phục form về trạng thái ban đầu
  const resetForm = useCallback(() => {
    if (reportDetail) {
      setFormValues({
        completedTasksSummary: reportDetail.completedTasksSummary || '',
        unfinishedTasksSummary: reportDetail.unfinishedTasksSummary || '',
        difficultiesAndChallenges: reportDetail.difficultiesAndChallenges || '',
        learningsAndKnowledge: reportDetail.learningsAndKnowledge || '',
        nextWeekPlan: reportDetail.nextWeekPlan || '',
        reportAttachmentUrl: reportDetail.reportAttachmentUrl || '',
        tasks: reportDetail.tasks || [],
      });
    } else {
      setFormValues(initialPayload);
    }
    setIsDirty(false);
  }, [reportDetail]);

  // 3. Tải gợi ý nhiệm vụ Kanban cho tuần hiện tại
  const loadSuggestedTasks = useCallback(async () => {
    if (!selectedWeekNumber) return;
    setIsLoadingSuggestions(true);
    try {
      const result = await weeklyReportService.getSuggestedTasks(selectedWeekNumber);
      setSuggestedTasks(result);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lấy gợi ý nhiệm vụ từ Kanban');
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [selectedWeekNumber]);

  // 4. Áp dụng các nhiệm vụ gợi ý từ Kanban vào form báo cáo
  const applySuggestedTasks = useCallback(
    (completed: SuggestedKanbanTaskItem[], unfinished: SuggestedKanbanTaskItem[]) => {
      // Chuyển đổi thành dạng snapshot task
      const newSnapshotTasks: WeeklyReportTaskItem[] = [
        ...completed.map((t) => ({
          missionItemId: t.missionItemId,
          taskTitle: t.title,
          taskStatus: t.status,
          taskType: t.statusDisplayName || 'Hoàn thành',
          submissionUrl: t.submissionUrl,
          completionNote: t.completionNote,
          isCompleted: true,
        })),
        ...unfinished.map((t) => ({
          missionItemId: t.missionItemId,
          taskTitle: t.title,
          taskStatus: t.status,
          taskType: t.statusDisplayName || 'Đang thực hiện',
          submissionUrl: t.submissionUrl,
          completionNote: t.completionNote,
          isCompleted: false,
        })),
      ];

      // Tạo văn bản gạch đầu dòng tự động
      const completedText = completed
        .map((t) => {
          const linkStr = t.submissionUrl ? ` (Link: ${t.submissionUrl})` : '';
          return `• [Hoàn thành] ${t.title}${linkStr}`;
        })
        .join('\n');

      const unfinishedText = unfinished
        .map((t) => `• [${t.statusDisplayName || t.status}] ${t.title} - Nguyên nhân: `)
        .join('\n');

      setFormValues((prev) => {
        const nextCompleted = prev.completedTasksSummary
          ? `${prev.completedTasksSummary}\n${completedText}`
          : completedText;
        const nextUnfinished = prev.unfinishedTasksSummary
          ? `${prev.unfinishedTasksSummary}\n${unfinishedText}`
          : unfinishedText;

        return {
          ...prev,
          completedTasksSummary: nextCompleted.trim(),
          unfinishedTasksSummary: nextUnfinished.trim(),
          tasks: newSnapshotTasks,
        };
      });

      setIsDirty(true);
      toast.success(`Đã nhập thành công ${completed.length + unfinished.length} nhiệm vụ từ Kanban!`);
    },
    []
  );

  // 5. Thao tác Lưu nháp
  const saveDraft = useCallback(async (): Promise<boolean> => {
    if (!selectedWeekNumber) return false;
    setIsSavingDraft(true);
    try {
      const updated = await weeklyReportService.saveDraft(selectedWeekNumber, formValues);
      setReportDetail(updated);
      setIsDirty(false);
      toast.success(`Đã lưu nháp báo cáo tuần ${selectedWeekNumber} thành công!`);

      // Cập nhật lại status trong danh sách timeline
      setTimeline((prev) =>
        prev.map((item) =>
          item.weekNumber === selectedWeekNumber
            ? { ...item, status: 'DRAFT' }
            : item
        )
      );
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu nháp báo cáo tuần');
      return false;
    } finally {
      setIsSavingDraft(false);
    }
  }, [selectedWeekNumber, formValues]);

  // 6. Thao tác Nộp chính thức
  const submitReport = useCallback(async (): Promise<boolean> => {
    if (!selectedWeekNumber) return false;

    // Client-side quick check
    if (!formValues.completedTasksSummary.trim()) {
      toast.error('Vui lòng tổng hợp các công việc đã hoàn thành trước khi nộp');
      return false;
    }

    setIsSubmitting(true);
    try {
      const updated = await weeklyReportService.submitReport(selectedWeekNumber, formValues);
      setReportDetail(updated);
      setIsDirty(false);
      toast.success(
        `Đã nộp chính thức báo cáo tuần ${selectedWeekNumber}! Mentor đã nhận được thông báo.`
      );

      // Cập nhật status trên timeline
      setTimeline((prev) =>
        prev.map((item) =>
          item.weekNumber === selectedWeekNumber
            ? { ...item, status: 'SUBMITTED', submittedAt: updated.submittedAt }
            : item
        )
      );
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi nộp báo cáo tuần');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedWeekNumber, formValues]);

  // Reload toàn bộ
  const reloadAll = useCallback(async () => {
    await fetchTimeline();
    if (selectedWeekNumber !== null) {
      const currentItem = timeline.find((item) => item.weekNumber === selectedWeekNumber);
      await fetchReportDetail(selectedWeekNumber, currentItem?.status);
    }
  }, [fetchTimeline, fetchReportDetail, selectedWeekNumber, timeline]);

  // Tính toán Current Timeline Item
  const currentTimelineItem = useMemo(() => {
    if (!selectedWeekNumber) return null;
    return timeline.find((item) => item.weekNumber === selectedWeekNumber) || null;
  }, [timeline, selectedWeekNumber]);

  // Kiểm tra quyền chỉnh sửa
  const isEditable = useMemo(() => {
    if (!currentTimelineItem) return false;
    return currentTimelineItem.isEditable && currentTimelineItem.status !== 'REVIEWED';
  }, [currentTimelineItem]);

  // Thống kê Metrics
  const metrics = useMemo(() => {
    const totalWeeks = timeline.length;
    const submittedCount = timeline.filter(
      (t) => t.status === 'SUBMITTED' || t.status === 'REVIEWED'
    ).length;
    const draftCount = timeline.filter((t) => t.status === 'DRAFT').length;

    const scoredItems = timeline.filter((t) => t.score !== null && t.score !== undefined);
    const averageScore =
      scoredItems.length > 0
        ? Number(
            (
              scoredItems.reduce((acc, cur) => acc + (cur.score || 0), 0) /
              scoredItems.length
            ).toFixed(1)
          )
        : null;

    return { totalWeeks, submittedCount, draftCount, averageScore };
  }, [timeline]);

  return {
    timeline,
    selectedWeekNumber,
    currentTimelineItem,
    selectWeek,
    reportDetail,
    formValues,
    updateFormField,
    resetForm,
    isDirty,
    isEditable,
    suggestedTasks,
    isLoadingSuggestions,
    loadSuggestedTasks,
    applySuggestedTasks,
    metrics,
    isLoadingTimeline,
    isLoadingDetail,
    isSavingDraft,
    isSubmitting,
    error,
    saveDraft,
    submitReport,
    reloadAll,
  };
};
