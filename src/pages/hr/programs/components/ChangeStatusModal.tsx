import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import type { ProgramDetailResponse, ProgramStatusType, ChangeProgramStatusRequest } from '../../../../types';
import styles from '../styles/ProgramModal.module.css';

interface ChangeStatusModalProps {
  isOpen: boolean;
  program: ProgramDetailResponse | null;
  onClose: () => void;
  onSubmit: (id: number, request: ChangeProgramStatusRequest) => Promise<void>;
}

export const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({
  isOpen,
  program,
  onClose,
  onSubmit,
}) => {
  const [targetStatus, setTargetStatus] = useState<ProgramStatusType>('PLANNING');
  const [cancellationReason, setCancellationReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reasonError, setReasonError] = useState<string | null>(null);

  useEffect(() => {
    if (program) {
      setError(null);
      setReasonError(null);
      setCancellationReason('');
      if (program.status === 'PLANNING') setTargetStatus('OPEN');
      else if (program.status === 'OPEN') setTargetStatus('ONGOING');
      else if (program.status === 'ONGOING') setTargetStatus('COMPLETED');
      else setTargetStatus('CANCELLED');
    }
  }, [program]);

  if (!isOpen || !program) return null;

  const getAvailableNextStatuses = (): ProgramStatusType[] => {
    switch (program.status) {
      case 'PLANNING':
        return ['OPEN', 'CANCELLED'];
      case 'OPEN':
        return ['ONGOING', 'CANCELLED'];
      case 'ONGOING':
        return ['COMPLETED', 'CANCELLED'];
      case 'COMPLETED':
      case 'CANCELLED':
      default:
        return [];
    }
  };

  const nextStatuses = getAvailableNextStatuses();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setReasonError(null);

    if (targetStatus === 'CANCELLED' && !cancellationReason.trim()) {
      setReasonError('Vui lòng nhập lý do hủy chương trình.');
      const reasonEl = document.getElementById('change-status-reason');
      reasonEl?.focus();
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(program.id, {
        targetStatus,
        cancellationReason: targetStatus === 'CANCELLED' ? cancellationReason.trim() : undefined,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Không thể thay đổi trạng thái.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true" style={{ maxWidth: '520px' }}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitleWrapper}>
            <div className={styles.iconWrapper} style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', color: 'var(--info)' }}>
              <RefreshCw size={22} aria-hidden="true" />
            </div>
            <div>
              <h3 className={styles.title}>Chuyển Trạng Thái Kỳ Thực Tập</h3>
              <p className={styles.subtitle}>Tuân thủ quy trình State Machine hệ thống</p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Đóng cửa sổ chuyển trạng thái"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        {nextStatuses.length === 0 ? (
          <div className={styles.body}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
              Chương trình đã ở trạng thái kết thúc (<strong>{program.status}</strong>), không thể chuyển đổi trạng thái nào khác.
            </p>
            <div className={styles.footer} style={{ padding: 0, border: 'none', background: 'none' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
            <div className={styles.body}>
              {error && (
                <div className={styles.alertError} role="status">
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              {/* Thông tin vắn tắt */}
              <div style={{ backgroundColor: 'var(--border-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Chương trình</span>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '0.15rem' }}>
                  <span className="font-tabular">[{program.programCode}]</span> {program.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                  Trạng thái hiện tại: <strong>{program.status}</strong>
                </div>
              </div>

              {/* Lựa chọn trạng thái đích */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="change-status-target">
                  Trạng thái đích mong muốn <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  id="change-status-target"
                  className="form-select"
                  value={targetStatus}
                  onChange={(e) => {
                    setTargetStatus(e.target.value as ProgramStatusType);
                    setReasonError(null);
                  }}
                  required
                >
                  {nextStatuses.map((s) => (
                    <option key={s} value={s}>
                      Chuyển sang: {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cảnh báo khi Hủy */}
              {targetStatus === 'CANCELLED' && (
                <div style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--danger)', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                    <AlertTriangle size={16} aria-hidden="true" /> Cảnh báo hủy chương trình
                  </div>
                  <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: '0 0 0.65rem 0' }}>
                    Hồ sơ thực tập sinh thuộc chương trình này sẽ tự động chuyển sang cờ <strong>Cần phân công lại (needs_reassignment)</strong>.
                  </p>
                  <label className="form-label" htmlFor="change-status-reason" style={{ color: 'var(--danger)' }}>
                    Lý do hủy chương trình <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <textarea
                    id="change-status-reason"
                    className={`form-textarea ${reasonError ? 'form-input-error' : ''}`}
                    rows={2}
                    placeholder="VD: Điều chỉnh kế hoạch tuyển dụng quý của phòng ban…"
                    value={cancellationReason}
                    onChange={(e) => {
                      setCancellationReason(e.target.value);
                      if (reasonError) setReasonError(null);
                    }}
                    aria-invalid={!!reasonError}
                    aria-describedby={reasonError ? 'change-status-reason-error' : undefined}
                    required
                  />
                  {reasonError && (
                    <span id="change-status-reason-error" style={{ color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 500, marginTop: '0.25rem', display: 'block' }}>
                      {reasonError}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Sticky Footer */}
            <div className={styles.footer}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className={targetStatus === 'CANCELLED' ? 'btn btn-danger' : 'btn btn-primary'}
                disabled={isSubmitting}
                style={{ minWidth: '160px' }}
              >
                {isSubmitting ? 'Đang xử lý…' : `Xác Nhận Chuyển`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
