import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmReasonDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  confirmLabel?: string;
  isDangerous?: boolean;
  requireReason?: boolean;
  onConfirm: (reason: string) => Promise<void>;
  onClose: () => void;
}

/**
 * ConfirmReasonDialog - Confirmation dialog requiring reason for critical state changes
 * (Rejected / Terminated) as specified in docs/spec.md section 7.1 & 9.2
 */
export const ConfirmReasonDialog: React.FC<ConfirmReasonDialogProps> = ({
  isOpen,
  title,
  description,
  reasonLabel = 'Lý do thực hiện',
  reasonPlaceholder = 'Nhập lý do chi tiết để lưu vào audit log...',
  confirmLabel = 'Xác nhận',
  isDangerous = false,
  requireReason = true,
  onConfirm,
  onClose,
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      setError('Vui lòng nhập lý do để ghi nhận vào hệ thống');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onConfirm(reason.trim());
      setReason('');
      onClose();
    } catch (err) {
      setError('Đã có lỗi xảy ra khi thực hiện');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-[12px] shadow-[var(--shadow-pop)] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                isDangerous
                  ? 'bg-[var(--danger-soft)] text-[var(--danger)]'
                  : 'bg-[var(--warning-soft)] text-[var(--warning)]'
              }`}
            >
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-[var(--text-1)]">{title}</h3>
              <p className="text-xs text-[var(--text-2)] mt-1">{description}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-[var(--text-3)] hover:text-[var(--text-1)]"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-[var(--text-2)] mb-1">
              {reasonLabel} {requireReason && <span className="text-[var(--danger)]">*</span>}
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder={reasonPlaceholder}
              className="w-full p-2.5 text-sm rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
            />
            {error && <p className="text-xs text-[var(--danger)] mt-1 font-medium">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-2.5 mt-5 pt-3 border-t border-[var(--border-soft)]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--surface-2)] transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className={`px-4 py-2 text-xs font-semibold rounded-lg text-white transition-colors shadow-xs ${
                isDangerous
                  ? 'bg-[var(--danger)] hover:bg-[var(--danger)]/90'
                  : 'bg-[var(--primary)] hover:bg-[var(--primary-hover)]'
              }`}
            >
              {loading ? 'Đang lưu…' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
