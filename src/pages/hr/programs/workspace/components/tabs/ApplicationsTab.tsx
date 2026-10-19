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
  MessageSquareQuote,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button, Skeleton, Modal } from '../../../../../../components/common';
import { useAiScreening, type AiFilterOption } from '../../../../../../hooks';
import { internService } from '../../../../../../services/internService';
import { formatDate } from '../../../../../../utils/formatters';
import type { InternProfile, ScreeningResultDto } from '../../../../../../types';
import type { ApplicationsTabProps } from '../../types/ProgramWorkspace.types';
import { InterviewQuestionModal } from '../InterviewQuestionModal';
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

  // State 3: ID ứng viên đang thực hiện thao tác duyệt
  const [actionInternId, setActionInternId] = useState<number | null>(null);

  // State 4: Trạng thái Modal từ chối ứng viên
  const [rejectionDialog, setRejectionDialog] = useState<RejectionDialogState>({
    intern: null,
    reason: '',
    isSubmitting: false,
  });

  // State 5: Modal sinh câu hỏi phỏng vấn theo ứng viên
  const [interviewModalIntern, setInterviewModalIntern] = useState<InternProfile | null>(null);

  // Custom Hook quản lý AI Screening hàng loạt & bộ lọc
  const aiScreening = useAiScreening(program.id);

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

  // Lọc ứng viên theo tiêu chí điểm số AI
  const filteredApplicants = useMemo(
    () => aiScreening.filterApplicants(applicants),
    [applicants, aiScreening.filterApplicants]
  );

  const displayedIds = useMemo(
    () => filteredApplicants.map((item) => item.id),
    [filteredApplicants]
  );

  const isAllSelected =
    displayedIds.length > 0 &&
    displayedIds.every((id) => aiScreening.isSelected(id));

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
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                checked={isAllSelected}
                onChange={() => aiScreening.toggleSelectAll(displayedIds)}
                aria-label="Chọn tất cả ứng viên đang hiển thị"
              />
              <span>Chọn tất cả</span>
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
              onClick={() => void aiScreening.triggerBatch(displayedIds)}
              disabled={displayedIds.length === 0 || aiScreening.isSubmitting}
              leftIcon={<Sparkles size={14} />}
            >
              Quét AI toàn bộ ({displayedIds.length})
            </Button>
          </div>

          <div className={styles.aiToolbarRight}>
            <Filter size={14} className="text-slate-400" aria-hidden="true" />
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
                  <span className="sr-only">Chọn dòng</span>
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
                    {/* Checkbox chọn hàng */}
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        checked={isSelected}
                        onChange={() => aiScreening.toggleSelect(intern.id)}
                        aria-label={`Chọn ứng viên ${intern.fullName}`}
                      />
                    </td>

                    {/* Cột Ứng viên */}
                    <td>
                      <div className={styles.internAvatarCell}>
                        <div className={styles.avatarCircle} aria-hidden="true">
                          {initials}
                        </div>
                        <div>
                          <div className={styles.internName}>{intern.fullName}</div>
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
                            title="Thẩm định hồ sơ bằng AI ngay"
                            aria-label={`Thẩm định AI cho ${intern.fullName}`}
                          >
                            <Sparkles size={13} className="text-indigo-600" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Cột Thao tác */}
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex items-center justify-end gap-1.5">
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
    </div>
  );
};
