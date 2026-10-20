import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Inbox,
  UserCheck,
  UserX,
  Eye,
  GraduationCap,
  Calendar,
  AlertCircle,
  RefreshCw,
  Clock,
  Sparkles,
  Filter,
  School,
  MessageSquareQuote,
  Bookmark,
  Scale,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button, Skeleton, Modal } from '../../../../../../components/common';
import { AiSteppedProgressSkeleton } from '../../../../../../components/ai/AiSteppedProgressSkeleton';
import { useAiScreening, type AiFilterOption } from '../../../../../../hooks';
import { internService } from '../../../../../../services/internService';
import { aiService } from '../../../../../../services/aiService';
import { formatDate } from '../../../../../../utils/formatters';
import type { InternProfile, ScreeningResultDto } from '../../../../../../types';
import type { ApplicationsTabProps } from '../../types/ProgramWorkspace.types';
import { InterviewQuestionModal } from '../InterviewQuestionModal';
import { CvComparisonModal } from '../CvComparisonModal';
import styles from '../../styles/ProgramWorkspace.module.css';

interface RejectionDialogState {
  intern: InternProfile | null;
  reason: string;
  isSubmitting: boolean;
}

export const ApplicationsTab: React.FC<ApplicationsTabProps> = ({
  program,
  onEnrollSuccess,
  onViewInternDetail,
  onOpenCreateSchedule,
  onOpenAiDossier,
}) => {
  // Rule 14: Tối đa 3 - 4 state trong 1 component (Gom nhóm dữ liệu nhất quán)
  // State 1: Danh sách ứng viên
  const [applicants, setApplicants] = useState<InternProfile[]>([]);

  // State 2: Trạng thái tải danh sách
  const [fetchStatus, setFetchStatus] = useState<{ isLoading: boolean; errorMessage: string | null }>({
    isLoading: true,
    errorMessage: null,
  });

  // State 3: Thao tác & Bộ lọc nguồn hồ sơ (Gom nhóm tuân thủ Rule 14 <= 4 state)
  const [filterAndAction, setFilterAndAction] = useState<{
    sourceFilter: 'ALL' | 'UNIVERSITY' | 'FREE_APPLICANT';
    actionInternId: number | null;
  }>({
    sourceFilter: 'ALL',
    actionInternId: null,
  });

  const actionInternId = filterAndAction.actionInternId;
  const setActionInternId = (id: number | null) =>
    setFilterAndAction((prev) => ({ ...prev, actionInternId: id }));
  const sourceFilter = filterAndAction.sourceFilter;
  const setSourceFilter = (val: 'ALL' | 'UNIVERSITY' | 'FREE_APPLICANT') =>
    setFilterAndAction((prev) => ({ ...prev, sourceFilter: val }));

  // State 4: Trạng thái Modal từ chối ứng viên
  const [rejectionDialog, setRejectionDialog] = useState<RejectionDialogState>({
    intern: null,
    reason: '',
    isSubmitting: false,
  });

  // State 5: Modal sinh câu hỏi phỏng vấn theo ứng viên
  const [interviewModalIntern, setInterviewModalIntern] = useState<InternProfile | null>(null);

  // AI-18 State: Bookmark và So sánh CV song song
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState<boolean>(false);
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState<boolean>(false);

  // Custom Hook quản lý AI Screening hàng loạt & bộ lọc
  const aiScreening = useAiScreening(program.id);

  // Nạp danh sách ứng viên đã Bookmark từ server
  const fetchBookmarks = useCallback(async () => {
    try {
      const ids = await aiService.getBookmarkedInternIds(program.id);
      setBookmarkedIds(ids || []);
    } catch (err) {
      console.error('Lỗi khi nạp danh sách bookmark:', err);
    }
  }, [program.id]);

  useEffect(() => {
    void fetchBookmarks();
  }, [fetchBookmarks]);

  const handleToggleBookmark = async (internId: number) => {
    const isCurrentlyBookmarked = bookmarkedIds.includes(internId);
    // Optimistic UI update
    setBookmarkedIds((prev) =>
      isCurrentlyBookmarked ? prev.filter((id) => id !== internId) : [...prev, internId]
    );

    try {
      const isBookmarkedNow = await aiService.toggleCandidateBookmark(program.id, internId);
      if (isBookmarkedNow) {
        toast.success('Đã ghim ứng viên vào danh sách ưu tiên');
      } else {
        toast.info('Đã bỏ ghim ứng viên');
      }
    } catch (err: any) {
      // Revert on error
      setBookmarkedIds((prev) =>
        isCurrentlyBookmarked ? [...prev, internId] : prev.filter((id) => id !== internId)
      );
      toast.error('Không thể cập nhật trạng thái ghim: ' + (err.message || 'Lỗi server'));
    }
  };

  const handleToggleCompare = (internId: number) => {
    setCompareIds((prev) => {
      if (prev.includes(internId)) {
        return prev.filter((id) => id !== internId);
      }
      if (prev.length >= 2) {
        toast.warning('Chỉ có thể so sánh tối đa 2 ứng viên cùng lúc. Hãy bỏ chọn 1 ứng viên trước.');
        return prev;
      }
      return [...prev, internId];
    });
  };

  const fetchApplicants = useCallback(async () => {
    try {
      setFetchStatus({ isLoading: true, errorMessage: null });
      const firstPage = await internService.getInterns({
        programId: program.id,
        status: 'PENDING',
        page: 0,
        size: 100,
      });

      let allItems = firstPage.items || firstPage.content || [];
      if (firstPage.totalPages > 1) {
        const remainingRequests = [];
        for (let p = 1; p < firstPage.totalPages; p++) {
          remainingRequests.push(
            internService.getInterns({
              programId: program.id,
              status: 'PENDING',
              page: p,
              size: 100,
            })
          );
        }
        const remainingResults = await Promise.all(remainingRequests);
        remainingResults.forEach((pageRes) => {
          allItems = allItems.concat(pageRes.items || pageRes.content || []);
        });
      }

      setApplicants(allItems);
    } catch (err: any) {
      console.error('Lỗi khi nạp danh sách ứng viên chờ tiếp nhận:', err);
      setFetchStatus({
        isLoading: false,
        errorMessage: err.message || 'Không thể tải danh sách đơn đăng ký.',
      });
    } finally {
      setFetchStatus((prev) => ({ ...prev, isLoading: false }));
    }
  }, [program.id]);

  useEffect(() => {
    void fetchApplicants();
  }, [fetchApplicants]);

  // Nạp kết quả đánh giá AI khi danh sách applicants thay đổi hoặc khi AI hoàn thành batch
  useEffect(() => {
    if (applicants.length > 0) {
      void aiScreening.loadEvaluations(applicants);
    }
  }, [applicants, aiScreening.loadEvaluations, aiScreening.completedVersion]);

  const currentCount = Number(program.currentInterns || 0);
  const maxCount = Number(program.maxInterns || 0);
  const isFull = maxCount > 0 && currentCount >= maxCount;

  // Lọc ứng viên theo tiêu chí điểm số AI và bộ lọc Bookmark
  const filteredApplicants = useMemo(() => {
    let result = aiScreening.filterApplicants(applicants);
    if (showOnlyBookmarked) {
      result = result.filter((item) => bookmarkedIds.includes(item.id));
    }
    return result;
  }, [applicants, aiScreening.filterApplicants, showOnlyBookmarked, bookmarkedIds]);
  // Lọc ứng viên theo tiêu chí điểm số AI và nguồn hồ sơ (CandidateType)
  const filteredApplicants = useMemo(() => {
    const aiFiltered = aiScreening.filterApplicants(applicants);
    if (sourceFilter === 'ALL') {
      return aiFiltered;
    }
    return aiFiltered.filter(
      (item) => (item.candidateType || 'UNIVERSITY') === sourceFilter
    );
  }, [applicants, aiScreening.filterApplicants, sourceFilter]);

  // Danh sách ứng viên trong danh sách hiển thị đã hoàn thiện CV (đủ điều kiện thẩm định AI)
  const eligibleForAiIds = useMemo(
    () => filteredApplicants.filter((item) => Boolean(item.hasCv)).map((item) => item.id),
    [filteredApplicants]
  );

  // Chỉ đánh dấu chọn tất cả khi toàn bộ ứng viên ĐÃ CÓ CV được chọn
  const isAllSelected =
    eligibleForAiIds.length > 0 &&
    eligibleForAiIds.every((id) => aiScreening.isSelected(id));

  // Tiếp nhận ứng viên vào kỳ
  const handleApprove = async (intern: InternProfile) => {
    if (isFull) {
      toast.error(`Kỳ thực tập "${program.name}" đã đạt đủ chỉ tiêu (${maxCount} TTS).`);
      return;
    }

    try {
      setActionInternId(intern.id);
      await internService.submitDecision(intern.id, {
        decision: 'APPROVED',
        programId: program.id,
      });
      toast.success(`Đã tiếp nhận thành công ứng viên "${intern.fullName}" vào kỳ thực tập!`);
      setApplicants((prev) => prev.filter((item) => item.id !== intern.id));
      onEnrollSuccess();
    } catch (err: any) {
      console.error('Lỗi tiếp nhận:', err);
      toast.error(err.response?.data?.message || 'Không thể tiếp nhận ứng viên.');
    } finally {
      setActionInternId(null);
    }
  };

  // Xác nhận từ chối đơn
  const handleConfirmReject = async () => {
    if (!rejectionDialog.intern) return;
    if (!rejectionDialog.reason.trim() || rejectionDialog.reason.trim().length < 5) {
      toast.error('Lý do từ chối cần có ít nhất 5 ký tự.');
      return;
    }

    try {
      setRejectionDialog((prev) => ({ ...prev, isSubmitting: true }));
      await internService.submitDecision(rejectionDialog.intern.id, {
        decision: 'REJECTED',
        rejectionReason: rejectionDialog.reason.trim(),
      });
      toast.success(`Đã từ chối đơn đăng ký của "${rejectionDialog.intern.fullName}".`);
      setApplicants((prev) => prev.filter((item) => item.id !== rejectionDialog.intern?.id));
      setRejectionDialog({ intern: null, reason: '', isSubmitting: false });
      onEnrollSuccess();
    } catch (err: any) {
      console.error('Lỗi từ chối:', err);
      toast.error(err.response?.data?.message || 'Không thể cập nhật từ chối đơn.');
    } finally {
      setRejectionDialog((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const renderAiBadge = (evaluation?: ScreeningResultDto) => {
    if (!evaluation) {
      return <span className="badge badge-neutral">-- Chưa quét</span>;
    }
    const score = evaluation.overallScore;
    if (score >= 75) {
      return (
        <span className="badge badge-success flex items-center gap-1 font-tabular">
          <Sparkles size={11} aria-hidden="true" />
          {score}% · Phù hợp
        </span>
      );
    }
    if (score >= 50) {
      return (
        <span className="badge badge-warning flex items-center gap-1 font-tabular">
          <Sparkles size={11} aria-hidden="true" />
          {score}% · Cân nhắc
        </span>
      );
    }
    return (
      <span className="badge badge-danger flex items-center gap-1 font-tabular">
        <Sparkles size={11} aria-hidden="true" />
        {score}% · Chưa đạt
      </span>
    );
  };

  return (
    <div>
      {/* Section Header */}
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>
            <Clock size={20} className="text-amber-500" aria-hidden="true" />
            Hồ Sơ Đăng Ký Chờ Tiếp Nhận ({applicants.length})
          </h2>
          <p className={styles.sectionSubtitle}>
            Xét duyệt các ứng viên đã ứng tuyển trực tiếp vào kỳ thực tập này.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchApplicants}
            disabled={fetchStatus.isLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw
              size={14}
              className={fetchStatus.isLoading ? 'animate-spin' : ''}
              aria-hidden="true"
            />
            Làm mới
          </Button>
        </div>
      </div>

      {/* AI Batch Screening Toolbar (TM-103) */}
      {applicants.length > 0 && (
        <div className={styles.aiToolbar} role="toolbar" aria-label="Thanh công cụ đánh giá AI">
          <div className={styles.aiToolbarLeft}>
            <label
              className={`flex items-center gap-2 text-sm font-medium ${
                eligibleForAiIds.length === 0
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-slate-700 dark:text-slate-300 cursor-pointer'
              }`}
              title={
                eligibleForAiIds.length === 0
                  ? 'Không có ứng viên nào đã cập nhật CV để chọn thẩm định AI'
                  : 'Chọn tất cả ứng viên đã hoàn thành CV'
              }
            >
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                checked={isAllSelected}
                disabled={eligibleForAiIds.length === 0}
                onChange={() => aiScreening.toggleSelectAll(eligibleForAiIds)}
                aria-label="Chọn tất cả ứng viên đã cập nhật CV"
              />
              <span>
                Chọn tất cả có CV ({eligibleForAiIds.length}/{filteredApplicants.length})
              </span>
            </label>

            {aiScreening.selectedIds.length > 0 && (
              <span className={styles.aiSelectionCount}>
                (Đã chọn {aiScreening.selectedIds.length} ứng viên)
              </span>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={() => void aiScreening.triggerBatch()}
              disabled={aiScreening.selectedIds.length === 0 || aiScreening.isSubmitting}
              leftIcon={<Sparkles size={14} />}
            >
              {aiScreening.isSubmitting
                ? 'Đang gửi...'
                : `Đánh giá AI đã chọn (${aiScreening.selectedIds.length})`}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => void aiScreening.triggerBatch(eligibleForAiIds)}
              disabled={eligibleForAiIds.length === 0 || aiScreening.isSubmitting}
              leftIcon={<Sparkles size={14} />}
              title={
                eligibleForAiIds.length === 0
                  ? 'Chưa có ứng viên nào cập nhật file CV'
                  : 'Quét AI tự động cho toàn bộ ứng viên đã có CV'
              }
            >
              Quét AI toàn bộ có CV ({eligibleForAiIds.length})
            </Button>

            {/* AI-18: Nút mở Modal So sánh 2 CV */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsComparisonModalOpen(true)}
              disabled={compareIds.length !== 2}
              leftIcon={<Scale size={14} />}
              title={
                compareIds.length === 2
                  ? 'Bấm để mở bảng đối soát so sánh song song 2 hồ sơ'
                  : 'Hãy tick chọn đúng 2 ứng viên trong bảng để so sánh'
              }
            >
              So sánh 2 CV ({compareIds.length}/2)
            </Button>
          </div>

          <div className={styles.aiToolbarRight}>
            {/* AI-18: Bộ lọc nhanh hồ sơ Đã Ghim (Bookmark) */}
            <button
              type="button"
              className={`${styles.bookmarkFilterBtn} ${showOnlyBookmarked ? styles.bookmarkFilterActive : ''}`}
              onClick={() => setShowOnlyBookmarked((prev) => !prev)}
              title="Chỉ hiển thị các ứng viên đã được ghim ưu tiên"
            >
              <Bookmark size={14} fill={showOnlyBookmarked ? 'currentColor' : 'none'} />
              <span>Đã ghim ({bookmarkedIds.length})</span>
            </button>

            <Filter size={14} className="text-slate-400" aria-hidden="true" />
            {/* Lọc nguồn ứng viên (TM-100 v3.0 - Frontend Design) */}
            <select
              className={styles.aiSelectFilter}
              value={sourceFilter}
              onChange={(e) =>
                setSourceFilter(e.target.value as 'ALL' | 'UNIVERSITY' | 'FREE_APPLICANT')
              }
              aria-label="Lọc nguồn ứng viên"
            >
              <option value="ALL">Tất cả nguồn hồ sơ</option>
              <option value="UNIVERSITY">🏫 Trường liên kết</option>
              <option value="FREE_APPLICANT">🌟 Ứng viên tự do</option>
            </select>

            {/* Lọc điểm số AI */}
            <select
              className={styles.aiSelectFilter}
              value={aiScreening.aiScoreFilter}
              onChange={(e) => aiScreening.setAiScoreFilter(e.target.value as AiFilterOption)}
              aria-label="Lọc ứng viên theo điểm số AI"
            >
              <option value="ALL">Tất cả mức điểm AI</option>
              <option value="HIGH">Phù hợp cao (≥ 75%)</option>
              <option value="MEDIUM">Cân nhắc (50 - 74%)</option>
              <option value="LOW">Chưa đạt (&lt; 50%)</option>
              <option value="UNRATED">Chưa quét AI</option>
            </select>
          </div>
        </div>
      )}

      {/* AI Batch Screening Progress Skeleton (AI-17) */}
      {(aiScreening.isSubmitting || (aiScreening.activeJob && aiScreening.activeJob.status === 'PROCESSING')) && (
        <div className="py-2">
          <AiSteppedProgressSkeleton
            title={`AI Đang Thẩm Định Hồ Sơ Hàng Loạt (${aiScreening.activeJob?.processedCount || 0}/${aiScreening.activeJob?.totalCount || aiScreening.selectedIds.length || 0} hoàn tất)`}
            estimatedSeconds={Math.max(10, (aiScreening.activeJob?.totalCount || 1) * 6)}
            steps={[
              {
                id: 1,
                title: 'Bước 1: Bóc tách văn bản CV & Khử định danh PII',
                description: 'Trích xuất học vấn, kinh nghiệm, kỹ năng & ẩn thông tin liên hệ nhạy cảm...',
                durationMs: 4000,
              },
              {
                id: 2,
                title: 'Bước 2: Đối chiếu kỹ năng & Yêu cầu vị trí thực tập',
                description: 'Đánh giá mức độ phù hợp kỹ năng cứng/mềm, tìm kiếm điểm khuyết & cảnh báo rủi ro...',
                durationMs: 6000,
              },
              {
                id: 3,
                title: 'Bước 3: Tổng hợp điểm số & Sinh bộ câu hỏi phỏng vấn gợi ý',
                description: 'Chấm điểm tổng quan (% Match), gợi ý câu hỏi chất vấn & lưu trữ hồ sơ thẩm định...',
                durationMs: 5000,
              },
            ]}
          />
        </div>
      )}

      {/* Error state */}
      {fetchStatus.errorMessage && (
        <div className={styles.errorBanner} role="alert">
          <div className={styles.errorBannerContent}>
            <AlertCircle size={18} aria-hidden="true" />
            <span>{fetchStatus.errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={fetchApplicants}
            className="btn btn-sm btn-secondary"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {fetchStatus.isLoading && (
        <div className="space-y-3 py-4">
          <Skeleton height={52} />
          <Skeleton height={52} />
          <Skeleton height={52} />
          <Skeleton height={52} />
        </div>
      )}

      {/* Empty State */}
      {!fetchStatus.isLoading && !fetchStatus.errorMessage && applicants.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconCircle}>
            <Inbox size={30} aria-hidden="true" />
          </div>
          <h3 className={styles.emptyTitle}>Chưa Có Đơn Chờ Tiếp Nhận</h3>
          <p className={styles.emptyDescription}>
            Hiện tại không có ứng viên nào đang ở trạng thái PENDING cho kỳ thực tập này.
            Nếu kỳ đang mở tuyển, ứng viên nộp hồ sơ sẽ xuất hiện tại đây.
          </p>
        </div>
      )}

      {/* Filtered Empty State */}
      {!fetchStatus.isLoading && !fetchStatus.errorMessage && applicants.length > 0 && filteredApplicants.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconCircle}>
            <Filter size={28} aria-hidden="true" />
          </div>
          <h3 className={styles.emptyTitle}>Không Tìm Thấy Ứng Viên Phù Hợp Bộ Lọc</h3>
          <p className={styles.emptyDescription}>
            Không có ứng viên nào thỏa mãn tiêu chí lọc điểm AI hiện tại.
          </p>
          <div className="pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => aiScreening.setAiScoreFilter('ALL')}
            >
              Đặt lại bộ lọc
            </Button>
          </div>
        </div>
      )}

      {/* Applicants Table */}
      {!fetchStatus.isLoading && !fetchStatus.errorMessage && filteredApplicants.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                    checked={isAllSelected}
                    disabled={eligibleForAiIds.length === 0}
                    onChange={() => aiScreening.toggleSelectAll(eligibleForAiIds)}
                    title={
                      eligibleForAiIds.length === 0
                        ? 'Không có ứng viên nào có CV để thẩm định'
                        : 'Chọn tất cả ứng viên đã nộp CV'
                    }
                    aria-label="Chọn tất cả ứng viên có CV"
                  />
                </th>
                <th>Ứng Viên</th>
                <th>Trường & Chuyên Ngành</th>
                <th>GPA</th>
                <th>Ngày Nộp Đơn</th>
                <th>Đánh Giá AI</th>
                <th style={{ textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.map((intern) => {
                const isProcessing = actionInternId === intern.id;
                const isSelected = aiScreening.isSelected(intern.id);
                const evaluation = aiScreening.evaluationsMap[intern.id];
                const initials = (intern.fullName || 'U')
                  .split(' ')
                  .map((n) => n[0])
                  .slice(-2)
                  .join('')
                  .toUpperCase();

                return (
                  <tr
                    key={intern.id}
                    className={isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''}
                  >
                    {/* Checkbox chọn hàng: Ẩn với TTS chưa hoàn thành CV */}
                    <td style={{ textAlign: 'center' }}>
                      {intern.hasCv ? (
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          checked={isSelected}
                          onChange={() => aiScreening.toggleSelect(intern.id)}
                          aria-label={`Chọn ứng viên ${intern.fullName}`}
                        />
                      ) : (
                        <span
                          className={styles.checkboxPlaceholder}
                          title="TTS chưa cập nhật CV - Không thể chọn thẩm định AI"
                          aria-hidden="true"
                        />
                      )}
                    </td>

                    {/* Cột Ứng viên */}
                    <td>
                      <div className={styles.internAvatarCell}>
                        <div className={styles.avatarCircle} aria-hidden="true">
                          {initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={styles.internName}>{intern.fullName}</span>
                            {intern.candidateType === 'FREE_APPLICANT' ? (
                              <span
                                className={styles.candidateSourceBadgeFree}
                                title="Ứng viên nộp hồ sơ tự do"
                              >
                                <Sparkles size={11} aria-hidden="true" />
                                Ứng viên tự do
                              </span>
                            ) : (
                              <span
                                className={styles.candidateSourceBadgeUniversity}
                                title="Sinh viên thuộc trường đại học liên kết"
                              >
                                <School size={11} aria-hidden="true" />
                                Trường liên kết
                              </span>
                            )}
                            {intern.hasCv ? (
                              <span
                                className={styles.cvBadgeSuccess}
                                title="Hồ sơ đã có file CV đính kèm"
                              >
                                <FileText size={10} aria-hidden="true" />
                                Đã nộp CV
                              </span>
                            ) : (
                              <span
                                className={styles.cvBadgeWarning}
                                title="TTS chưa cập nhật CV. Cần bổ sung CV để AI có thể đánh giá."
                              >
                                <AlertCircle size={10} aria-hidden="true" />
                                Chưa có CV
                              </span>
                            )}
                          </div>
                          <div className={styles.internEmail}>
                            {intern.email} • {intern.phone}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Cột Trường & Ngành */}
                    <td>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-xs">
                        <GraduationCap size={14} className="text-slate-400" aria-hidden="true" />
                        <span>{intern.university || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{intern.major || 'Chưa rõ'}</div>
                    </td>

                    {/* Cột GPA */}
                    <td className="font-tabular font-medium text-xs">
                      {intern.gpa ? (
                        <span
                          className={
                            intern.gpa >= 3.2
                              ? 'text-emerald-700 font-bold'
                              : 'text-slate-800 font-semibold'
                          }
                        >
                          {intern.gpa.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">--</span>
                      )}
                    </td>

                    {/* Cột Ngày nộp */}
                    <td className="font-tabular text-xs text-slate-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" aria-hidden="true" />
                        <span>{formatDate(intern.createdAt)}</span>
                      </div>
                    </td>

                    {/* Cột Đánh giá AI */}
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          className="bg-transparent border-0 p-0 cursor-pointer text-left"
                          onClick={() => onViewInternDetail(intern)}
                          title="Bấm để xem chi tiết đối soát năng lực AI"
                        >
                          {renderAiBadge(evaluation)}
                        </button>
                        {!evaluation && (
                          <button
                            type="button"
                            className={styles.actionIconBtn}
                            onClick={() => void aiScreening.triggerBatch([intern.id])}
                            disabled={!intern.hasCv || aiScreening.isSubmitting}
                            title={
                              intern.hasCv
                                ? 'Thẩm định hồ sơ bằng AI ngay'
                                : 'TTS chưa cập nhật CV. Cần tải lên CV để thẩm định AI.'
                            }
                            aria-label={`Thẩm định AI cho ${intern.fullName}`}
                            style={!intern.hasCv ? { opacity: 0.35, cursor: 'not-allowed' } : undefined}
                          >
                            <Sparkles
                              size={13}
                              className={intern.hasCv ? 'text-indigo-600' : 'text-slate-400'}
                            />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Cột Thao tác */}
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Ghim ứng viên tiềm năng (AI-18 Bookmark) */}
                        <button
                          type="button"
                          className={styles.actionIconBtn}
                          onClick={() => void handleToggleBookmark(intern.id)}
                          title={
                            bookmarkedIds.includes(intern.id)
                              ? 'Bỏ ghim ứng viên khỏi danh sách ưu tiên'
                              : 'Ghim ứng viên tiềm năng'
                          }
                          aria-label={`Ghim ứng viên ${intern.fullName}`}
                          style={{
                            color: bookmarkedIds.includes(intern.id) ? '#d97706' : undefined,
                            background: bookmarkedIds.includes(intern.id)
                              ? 'rgba(245, 158, 11, 0.12)'
                              : undefined,
                            borderColor: bookmarkedIds.includes(intern.id)
                              ? 'rgba(245, 158, 11, 0.3)'
                              : undefined,
                          }}
                        >
                          <Bookmark
                            size={15}
                            fill={bookmarkedIds.includes(intern.id) ? 'currentColor' : 'none'}
                            aria-hidden="true"
                          />
                        </button>

                        {/* Chọn để so sánh CV song song (AI-18 Comparison) */}
                        <button
                          type="button"
                          className={styles.actionIconBtn}
                          onClick={() => handleToggleCompare(intern.id)}
                          title={
                            compareIds.includes(intern.id)
                              ? 'Bỏ chọn so sánh'
                              : compareIds.length >= 2
                              ? 'Đã chọn tối đa 2 ứng viên'
                              : 'Chọn để so sánh với ứng viên khác'
                          }
                          aria-label={`So sánh CV của ${intern.fullName}`}
                          style={{
                            color: compareIds.includes(intern.id) ? '#6366f1' : undefined,
                            background: compareIds.includes(intern.id)
                              ? 'rgba(99, 102, 241, 0.12)'
                              : undefined,
                            borderColor: compareIds.includes(intern.id)
                              ? 'rgba(99, 102, 241, 0.4)'
                              : undefined,
                          }}
                        >
                          <Scale size={15} aria-hidden="true" />
                        </button>

                        {/* Xem chi tiết */}
                        <button
                          type="button"
                          className={styles.actionIconBtn}
                          onClick={() => onViewInternDetail(intern)}
                          title="Xem chi tiết hồ sơ ứng viên"
                          aria-label={`Xem chi tiết hồ sơ của ${intern.fullName}`}
                        >
                          <Eye size={15} aria-hidden="true" />
                        </button>

                        {/* Sinh / Xem câu hỏi phỏng vấn AI */}
                        <button
                          type="button"
                          className={styles.actionIconBtn}
                          onClick={() => setInterviewModalIntern(intern)}
                          title="Bộ câu hỏi phỏng vấn AI cho ứng viên này"
                          aria-label={`Bộ câu hỏi phỏng vấn cho ${intern.fullName}`}
                        >
                          <MessageSquareQuote size={15} className="text-indigo-600" aria-hidden="true" />
                        </button>

                        {/* Mời phỏng vấn AI trực tuyến */}
                        {onOpenCreateSchedule && (
                          <button
                            type="button"
                            className={styles.actionIconBtn}
                            onClick={() =>
                              onOpenCreateSchedule({
                                candidateId: intern.id,
                                email: intern.email || '',
                                fullName: intern.fullName || 'Ứng viên',
                              })
                            }
                            title="Tạo lịch & mời phỏng vấn AI cho ứng viên này"
                            aria-label={`Tạo lịch phỏng vấn AI cho ${intern.fullName}`}
                            style={{ color: '#6366f1' }}
                          >
                            <Calendar size={15} aria-hidden="true" />
                          </button>
                        )}

                        {/* Xem Phiếu Đánh Giá Phỏng Vấn AI (Module AI-02) */}
                        {onOpenAiDossier && (
                          <button
                            type="button"
                            className={styles.actionIconBtn}
                            onClick={() => onOpenAiDossier(intern)}
                            title="Xem Phiếu Đánh Giá Phỏng Vấn AI & Xếp Hạng Ứng Viên"
                            aria-label={`Phiếu đánh giá AI cho ${intern.fullName}`}
                            style={{
                              color: '#8b5cf6',
                              background: 'rgba(139, 92, 246, 0.08)',
                              borderColor: 'rgba(139, 92, 246, 0.25)',
                            }}
                          >
                            <Sparkles size={15} aria-hidden="true" />
                          </button>
                        )}

                        {/* Tiếp nhận */}
                        <button
                          type="button"
                          className={`${styles.actionIconBtn} ${styles.actionIconBtnSuccess}`}
                          onClick={() => handleApprove(intern)}
                          disabled={isProcessing || isFull}
                          title={isFull ? 'Kỳ thực tập đã hết chỉ tiêu' : 'Tiếp nhận ứng viên vào kỳ'}
                          aria-label={`Tiếp nhận ${intern.fullName} vào kỳ`}
                        >
                          <UserCheck size={15} className="text-emerald-600" aria-hidden="true" />
                        </button>

                        {/* Từ chối */}
                        <button
                          type="button"
                          className={`${styles.actionIconBtn} ${styles.actionIconBtnDanger}`}
                          onClick={() => {
                            const defaultReason =
                              evaluation?.draftRejectionReason ||
                              'Hồ sơ chưa đạt tiêu chí tuyển sinh của chương trình.';
                            setRejectionDialog({
                              intern,
                              reason: defaultReason,
                              isSubmitting: false,
                            });
                          }}
                          disabled={isProcessing}
                          title="Từ chối đơn ứng tuyển"
                          aria-label={`Từ chối hồ sơ của ${intern.fullName}`}
                        >
                          <UserX size={15} className="text-rose-500" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionDialog.intern && (
        <Modal
          isOpen={!!rejectionDialog.intern}
          onClose={() => setRejectionDialog({ intern: null, reason: '', isSubmitting: false })}
          title={`Từ chối hồ sơ ứng viên: ${rejectionDialog.intern.fullName}`}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Vui lòng cung cấp lý do từ chối để hệ thống lưu hồ sơ và phản hồi đến ứng viên.
            </p>

            <div>
              <label
                htmlFor="rejectionReasonInput"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Lý do từ chối <span className="text-red-500">*</span>
              </label>
              <textarea
                id="rejectionReasonInput"
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                rows={4}
                value={rejectionDialog.reason}
                onChange={(e) =>
                  setRejectionDialog((prev) => ({ ...prev, reason: e.target.value }))
                }
                placeholder="Nhập lý do chi tiết..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() =>
                  setRejectionDialog({ intern: null, reason: '', isSubmitting: false })
                }
                disabled={rejectionDialog.isSubmitting}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmReject}
                disabled={
                  rejectionDialog.isSubmitting || rejectionDialog.reason.trim().length < 5
                }
              >
                {rejectionDialog.isSubmitting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Câu hỏi phỏng vấn theo ứng viên (Candidate Scope) */}
      {interviewModalIntern && (
        <InterviewQuestionModal
          isOpen={!!interviewModalIntern}
          onClose={() => setInterviewModalIntern(null)}
          programId={program.id}
          programName={program.name}
          internId={interviewModalIntern.id}
          internName={interviewModalIntern.fullName}
        />
      )}

      {/* AI-18: Modal Đối soát & So sánh song song 2 CV */}
      {isComparisonModalOpen && compareIds.length === 2 && (() => {
        const internA = applicants.find((a) => a.id === compareIds[0]);
        const internB = applicants.find((a) => a.id === compareIds[1]);
        if (!internA || !internB) return null;

        const evalA = aiScreening.evaluationsMap[internA.id] || null;
        const evalB = aiScreening.evaluationsMap[internB.id] || null;

        return (
          <CvComparisonModal
            isOpen={isComparisonModalOpen}
            onClose={() => setIsComparisonModalOpen(false)}
            candidateA={{ intern: internA, evaluation: evalA }}
            candidateB={{ intern: internB, evaluation: evalB }}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={(internId) => void handleToggleBookmark(internId)}
            onOpenScheduleModal={onOpenCreateSchedule}
            onViewInternDetail={onViewInternDetail}
          />
        );
      })()}
    </div>
  );
};
