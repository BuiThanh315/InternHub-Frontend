import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';

import { toast } from 'sonner';
import { Button, Skeleton, Modal } from '../../../../../../components/common';
import { internService } from '../../../../../../services/internService';
import { formatDate } from '../../../../../../utils/formatters';
import type { InternProfile } from '../../../../../../types';
import type { ApplicationsTabProps } from '../../types/ProgramWorkspace.types';
import styles from '../../styles/ProgramWorkspace.module.css';

export const ApplicationsTab: React.FC<ApplicationsTabProps> = ({
  program,
  onEnrollSuccess,
  onViewInternDetail,
}) => {
  const [applicants, setApplicants] = useState<InternProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionInternId, setActionInternId] = useState<number | null>(null);

  // Rejection Dialog State
  const [rejectingIntern, setRejectingIntern] = useState<InternProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const fetchApplicants = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await internService.getInterns({
        programId: program.id,
        status: 'PENDING',
        size: 50,
      });
      setApplicants(res.items || res.content || []);
    } catch (err: any) {
      console.error('Lỗi khi nạp danh sách ứng viên chờ tiếp nhận:', err);
      setErrorMessage(err.message || 'Không thể tải danh sách đơn đăng ký.');
    } finally {
      setIsLoading(false);
    }
  }, [program.id]);

  useEffect(() => {
    void fetchApplicants();
  }, [fetchApplicants]);

  const currentCount = Number(program.currentInterns || 0);
  const maxCount = Number(program.maxInterns || 0);
  const isFull = maxCount > 0 && currentCount >= maxCount;

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
    if (!rejectingIntern) return;
    if (!rejectionReason.trim() || rejectionReason.trim().length < 5) {
      toast.error('Lý do từ chối cần có ít nhất 5 ký tự.');
      return;
    }

    try {
      setIsRejecting(true);
      await internService.submitDecision(rejectingIntern.id, {
        decision: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
      });
      toast.success(`Đã từ chối đơn đăng ký của "${rejectingIntern.fullName}".`);
      setApplicants((prev) => prev.filter((item) => item.id !== rejectingIntern.id));
      setRejectingIntern(null);
      setRejectionReason('');
      onEnrollSuccess();
    } catch (err: any) {
      console.error('Lỗi từ chối:', err);
      toast.error(err.response?.data?.message || 'Không thể cập nhật từ chối đơn.');
    } finally {
      setIsRejecting(false);
    }
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
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} aria-hidden="true" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className={styles.errorBanner} role="alert">
          <div className={styles.errorBannerContent}>
            <AlertCircle size={18} aria-hidden="true" />
            <span>{errorMessage}</span>
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
      {isLoading && (
        <div className="space-y-3 py-4">
          <Skeleton height={52} />
          <Skeleton height={52} />
          <Skeleton height={52} />
          <Skeleton height={52} />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !errorMessage && applicants.length === 0 && (
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

      {/* Applicants Table */}
      {!isLoading && !errorMessage && applicants.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ứng Viên</th>
                <th>Trường & Chuyên Ngành</th>
                <th>GPA</th>
                <th>Ngày Nộp Đơn</th>
                <th>Ghi Chú</th>
                <th style={{ textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((intern) => {
                const isProcessing = actionInternId === intern.id;
                const initials = (intern.fullName || 'U')
                  .split(' ')
                  .map((n) => n[0])
                  .slice(-2)
                  .join('')
                  .toUpperCase();

                return (
                  <tr key={intern.id}>
                    {/* Cột Ứng viên */}
                    <td>
                      <div className={styles.internAvatarCell}>
                        <div className={styles.avatarCircle} aria-hidden="true">
                          {initials}
                        </div>
                        <div>
                          <div className={styles.internName}>{intern.fullName}</div>
                          <div className={styles.internEmail}>{intern.email} • {intern.phone}</div>
                        </div>
                      </div>
                    </td>

                    {/* Cột Trường & Ngành */}
                    <td>
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                        <GraduationCap size={14} className="text-slate-400" aria-hidden="true" />
                        <span>{intern.university || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="text-xs text-slate-500">{intern.major || 'Chưa rõ'}</div>
                    </td>

                    {/* Cột GPA */}
                    <td className="font-tabular font-medium">
                      {intern.gpa ? (
                        <span className={intern.gpa >= 3.2 ? 'text-emerald-600 font-semibold' : 'text-slate-700 dark:text-slate-300'}>
                          {intern.gpa.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-400">--</span>
                      )}
                    </td>

                    {/* Cột Ngày nộp */}
                    <td className="font-tabular text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" aria-hidden="true" />
                        <span>{formatDate(intern.createdAt)}</span>
                      </div>
                    </td>

                    {/* Cột Ghi chú */}
                    <td className="text-xs text-slate-500 max-w-45 truncate" title={intern.notes || ''}>
                      {intern.notes || <span className="text-slate-400 italic">Không có</span>}
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
                            setRejectingIntern(intern);
                            setRejectionReason('Hồ sơ chưa đạt tiêu chí tuyển sinh của chương trình.');
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
      {rejectingIntern && (
        <Modal
          isOpen={!!rejectingIntern}
          onClose={() => setRejectingIntern(null)}
          title={`Từ chối hồ sơ ứng viên: ${rejectingIntern.fullName}`}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Vui lòng cung cấp lý do từ chối để hệ thống lưu hồ sơ và phản hồi đến ứng viên.
            </p>

            <div>
              <label htmlFor="rejectionReasonInput" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Lý do từ chối <span className="text-red-500">*</span>
              </label>
              <textarea
                id="rejectionReasonInput"
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Nhập lý do chi tiết..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => setRejectingIntern(null)}
                disabled={isRejecting}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmReject}
                disabled={isRejecting || rejectionReason.trim().length < 5}
              >
                {isRejecting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
