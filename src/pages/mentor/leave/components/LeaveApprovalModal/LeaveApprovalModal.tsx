import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, UserCheck } from 'lucide-react';
import { Modal, Button } from '../../../../../components/common';
import { formatDate } from '../../../../../utils/formatters';
import type { LeaveApprovalModalProps } from './LeaveApprovalModal.types';
import styles from './LeaveApprovalModal.module.css';

export const LeaveApprovalModal: React.FC<LeaveApprovalModalProps> = ({
  item,
  isOpen,
  onClose,
  onApprove,
  onReject,
  isSubmitting,
}) => {
  const [activeTab, setActiveTab] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [approvalNote, setApprovalNote] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab('APPROVE');
      setApprovalNote('');
      setRejectionReason('');
      setError('');
    }
  }, [isOpen]);

  if (!item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'APPROVE') {
      await onApprove(item.id, approvalNote.trim() || undefined);
    } else {
      const reasonTrimmed = rejectionReason.trim();
      if (!reasonTrimmed) {
        setError('Lý do từ chối không được để trống');
        return;
      }
      if (reasonTrimmed.length < 5) {
        setError('Lý do từ chối phải có ít nhất 5 ký tự');
        return;
      }
      if (reasonTrimmed.length > 500) {
        setError('Lý do từ chối không được vượt quá 500 ký tự');
        return;
      }
      await onReject(item.id, reasonTrimmed);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      closeOnBackdrop={!isSubmitting}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <UserCheck size={20} style={{ color: 'var(--primary)' }} />
          <span>Xét Duyệt Đơn Xin Nghỉ Phép #LR-{item.id}</span>
        </div>
      }
      footer={
        <div className={styles.modalFooter}>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Đóng
          </Button>

          {activeTab === 'APPROVE' ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Đang phê duyệt...'
              ) : (
                <>
                  <CheckCircle2 size={15} style={{ marginRight: 6 }} />
                  Xác Nhận Phê Duyệt
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              variant="danger"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Đang từ chối...'
              ) : (
                <>
                  <XCircle size={15} style={{ marginRight: 6 }} />
                  Xác Nhận Từ Chối
                </>
              )}
            </Button>
          )}
        </div>
      }
    >
      <form onSubmit={handleSubmit} className={styles.modalBody}>
        {/* Tóm tắt thông tin Thực tập sinh và đơn nghỉ */}
        <div className={styles.internInfoCard}>
          <div className={styles.internHeader}>
            <span className={styles.internName}>{item.internName}</span>
            <span className={styles.internCode}>{item.internCode}</span>
          </div>

          <div className={styles.gridTwo}>
            <div>
              <strong>Loại nghỉ:</strong> {item.leaveTypeDescription || item.leaveType}
            </div>
            <div>
              <strong>Khung giờ:</strong> {item.durationTypeDescription || item.durationType}
            </div>
            <div>
              <strong>Thời gian:</strong> {formatDate(item.startDate)} ➔ {formatDate(item.endDate)}
            </div>
            <div>
              <strong>Số ngày công:</strong>{' '}
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                {item.totalDays?.toFixed(1)} ngày
              </span>
            </div>
          </div>

          <div>
            <strong>Lý do của TTS:</strong>
            <div className={styles.reasonBox}>&ldquo;{item.reason}&rdquo;</div>
          </div>
        </div>

        {/* Tab lựa chọn hành động: Phê duyệt / Từ chối */}
        <div className={styles.actionTabs}>
          <button
            type="button"
            className={`${styles.actionTab} ${
              activeTab === 'APPROVE' ? styles.actionTabActiveApprove : ''
            }`}
            onClick={() => {
              setActiveTab('APPROVE');
              setError('');
            }}
          >
            <CheckCircle2 size={16} />
            <span>Phê Duyệt Đơn</span>
          </button>

          <button
            type="button"
            className={`${styles.actionTab} ${
              activeTab === 'REJECT' ? styles.actionTabActiveReject : ''
            }`}
            onClick={() => {
              setActiveTab('REJECT');
              setError('');
            }}
          >
            <XCircle size={16} />
            <span>Từ Chối Đơn</span>
          </button>
        </div>

        {/* Form nhập tương ứng */}
        {activeTab === 'APPROVE' ? (
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="approvalNote">
              <span>Lời Dặn / Ghi Chú Phê Duyệt (Tùy chọn)</span>
            </label>
            <textarea
              id="approvalNote"
              className={styles.textareaControl}
              placeholder="Nhập lời dặn hoặc lưu ý cho thực tập sinh (ví dụ: Chúc em hoàn thành tốt kỳ thi, bàn giao công việc trước khi nghỉ...)"
              value={approvalNote}
              onChange={(e) => setApprovalNote(e.target.value)}
              maxLength={500}
            />
          </div>
        ) : (
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="rejectionReason">
              <span>
                Lý Do Từ Chối<span className={styles.required}>*</span> (5 - 500 ký tự)
              </span>
            </label>
            <textarea
              id="rejectionReason"
              className={styles.textareaControl}
              placeholder="Nêu rõ lý do từ chối để thực tập sinh nắm được thông tin..."
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                if (error) setError('');
              }}
              maxLength={500}
            />
            {error && <span className={styles.errorText}>{error}</span>}
          </div>
        )}
      </form>
    </Modal>
  );
};
