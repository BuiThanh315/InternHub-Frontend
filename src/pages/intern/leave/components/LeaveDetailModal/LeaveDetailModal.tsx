import React, { useEffect, useState } from 'react';
import {
  FileText,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { Modal, Button, Skeleton } from '../../../../../components/common';
import { leaveService } from '../../../../../services/leaveService';
import { formatDate, formatDateTime } from '../../../../../utils/formatters';
import type { LeaveDetailModalProps } from './LeaveDetailModal.types';
import type { LeaveRequestResponse } from '../../../../../types';
import styles from './LeaveDetailModal.module.css';

export const LeaveDetailModal: React.FC<LeaveDetailModalProps> = ({
  id,
  isOpen,
  onClose,
  onCancelRequest,
}) => {
  const [detail, setDetail] = useState<LeaveRequestResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && id) {
      const controller = new AbortController();
      setLoading(true);
      setError(null);
      leaveService
        .getLeaveRequestDetail(id, controller.signal)
        .then((data) => setDetail(data))
        .catch((err) => {
          if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
            setError(err.message || 'Không thể tải chi tiết đơn xin nghỉ phép.');
          }
        })
        .finally(() => setLoading(false));

      return () => controller.abort();
    } else {
      setDetail(null);
      setError(null);
    }
  }, [isOpen, id]);

  const isPending = detail?.status === 'PENDING';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <FileText size={20} style={{ color: 'var(--primary)' }} />
          <span>Chi Tiết Đơn Xin Nghỉ Phép {id ? `#LR-${id}` : ''}</span>
        </div>
      }
      footer={
        <div className={styles.modalFooter}>
          {isPending && onCancelRequest && detail ? (
            <Button
              type="button"
              variant="outline"
              style={{
                color: 'var(--danger)',
                borderColor: 'rgba(239, 68, 68, 0.4)',
              }}
              onClick={() => onCancelRequest(detail)}
            >
              <Trash2 size={14} style={{ marginRight: 6 }} />
              Hủy Đơn Này
            </Button>
          ) : (
            <div />
          )}

          <Button type="button" variant="primary" onClick={onClose}>
            Đóng
          </Button>
        </div>
      }
    >
      <div className={styles.modalBody}>
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Skeleton variant="text" width="60%" height="24px" />
            <Skeleton variant="rectangular" width="100%" height="100px" />
            <Skeleton variant="rectangular" width="100%" height="80px" />
          </div>
        )}

        {error && (
          <div style={{ color: 'var(--danger)', padding: '1rem 0' }}>
            {error}
          </div>
        )}

        {!loading && !error && detail && (
          <>
            {/* 1. Tiến trình xét duyệt */}
            <div className={styles.infoItem}>
              <span className={styles.sectionTitle}>Tiến Trình Xét Duyệt</span>
              {detail.status === 'PENDING' && (
                <div className={`${styles.timelineCard} ${styles.timelinePending}`}>
                  <div className={styles.timelineHeader} style={{ color: 'var(--warning)' }}>
                    <Clock size={18} />
                    <span>Đang Chờ Mentor / HR Xem Xét</span>
                  </div>
                  <div className={styles.timelineContent}>
                    Đơn đã được nộp vào lúc {formatDateTime(detail.createdAt)}. Bạn có
                    thể chủ động hủy đơn nếu thay đổi kế hoạch trước khi Mentor duyệt.
                  </div>
                </div>
              )}

              {detail.status === 'APPROVED' && (
                <div className={`${styles.timelineCard} ${styles.timelineApproved}`}>
                  <div className={styles.timelineHeader} style={{ color: 'var(--success)' }}>
                    <CheckCircle2 size={18} />
                    <span>Đã Phê Duyệt Bởi: {detail.approverName || 'Mentor / HR'}</span>
                  </div>
                  <div className={styles.timelineContent}>
                    Thời điểm duyệt: {formatDateTime(detail.approvedAt)}.
                    {detail.approvalNote && (
                      <div style={{ marginTop: '0.5rem', fontWeight: 500, color: 'var(--text-main)' }}>
                        Lời dặn: &ldquo;{detail.approvalNote}&rdquo;
                      </div>
                    )}
                  </div>
                </div>
              )}

              {detail.status === 'REJECTED' && (
                <div className={`${styles.timelineCard} ${styles.timelineRejected}`}>
                  <div className={styles.timelineHeader} style={{ color: 'var(--danger)' }}>
                    <XCircle size={18} />
                    <span>Đã Bị Từ Chối Bởi: {detail.approverName || 'Mentor / HR'}</span>
                  </div>
                  <div className={styles.timelineContent}>
                    <div style={{ fontWeight: 600, color: 'var(--danger)', marginBottom: '0.25rem' }}>
                      Lý do từ chối:
                    </div>
                    <div>&ldquo;{detail.rejectionReason || 'Không đủ điều kiện duyệt.'}&rdquo;</div>
                  </div>
                </div>
              )}

              {detail.status === 'CANCELLED' && (
                <div className={`${styles.timelineCard} ${styles.timelineCancelled}`}>
                  <div className={styles.timelineHeader} style={{ color: 'var(--text-muted)' }}>
                    <AlertCircle size={18} />
                    <span>Đơn Đã Bị Hủy Bỏ</span>
                  </div>
                  <div className={styles.timelineContent}>
                    Đơn đã được Thực tập sinh chủ động hủy lúc{' '}
                    {formatDateTime(detail.cancelledAt || detail.updatedAt)}.
                  </div>
                </div>
              )}
            </div>

            {/* 2. Thông tin chi tiết kỳ nghỉ */}
            <div>
              <span className={styles.sectionTitle}>Thông Tin Nghỉ Phép</span>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Loại Nghỉ Phép</span>
                  <span className={styles.infoValue}>
                    {detail.leaveTypeDescription || detail.leaveType}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Khung Thời Gian</span>
                  <span className={styles.infoValue}>
                    {detail.durationTypeDescription || detail.durationType}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Thời Gian Nghỉ</span>
                  <span className={styles.infoValue}>
                    {formatDate(detail.startDate)} ➔ {formatDate(detail.endDate)}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Tổng Số Ngày Công</span>
                  <span className={styles.infoValue} style={{ color: 'var(--primary)' }}>
                    {detail.totalDays?.toFixed(1)} ngày công
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Lý do chi tiết */}
            <div>
              <span className={styles.sectionTitle}>Lý Do Xin Nghỉ</span>
              <div className={styles.reasonBox}>{detail.reason}</div>
            </div>

            {/* 4. Tài liệu minh chứng nếu có */}
            {detail.attachmentUrl && (
              <div>
                <span className={styles.sectionTitle}>Tài Liệu Minh Chứng</span>
                <div>
                  <a
                    href={detail.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.attachmentLink}
                  >
                    <ExternalLink size={15} />
                    <span>Xem tài liệu đính kèm</span>
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
