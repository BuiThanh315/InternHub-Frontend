import React from 'react';
import { Mail, CheckCircle2, Download, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkEmail?: () => void;
  onBulkStatusChange?: () => void;
  onBulkExport?: () => void;
  onBulkDelete?: () => void;
  canDelete?: boolean;
}

/**
 * BulkActionsBar - Floating Action Bar replacing the filter bar when ≥1 row selected
 * docs/spec.md section 4.2
 */
export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkEmail,
  onBulkStatusChange,
  onBulkExport,
  onBulkDelete,
  canDelete = false,
}) => {
  if (selectedCount === 0) return null;

  const handleEmail = () => {
    if (onBulkEmail) {
      onBulkEmail();
    } else {
      toast.info(`Chuẩn bị gửi email cho ${selectedCount} thực tập sinh`);
    }
  };

  const handleExport = () => {
    if (onBulkExport) {
      onBulkExport();
    } else {
      toast.success(`Đang xuất dữ liệu của ${selectedCount} hồ sơ ra file Excel...`);
    }
  };

  const handleDelete = () => {
    if (onBulkDelete) {
      onBulkDelete();
    } else {
      toast.error(`Đã gửi yêu cầu xóa ${selectedCount} thực tập sinh`);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-[var(--primary-soft)] border border-[var(--primary)] text-[var(--text-1)] shadow-xs animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-white text-xs font-bold flex items-center justify-center">
          {selectedCount}
        </span>
        <span className="text-sm font-semibold text-[var(--primary)]">
          Đang chọn {selectedCount} thực tập sinh
        </span>
        <button
          onClick={onClearSelection}
          className="text-xs text-[var(--text-2)] hover:text-[var(--text-1)] underline ml-2 flex items-center gap-1"
        >
          <X size={12} /> Bỏ chọn
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleEmail}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[var(--surface)] border border-[var(--border)] text-[var(--text-1)] hover:bg-[var(--surface-2)] shadow-xs transition-colors"
        >
          <Mail size={13} /> Gửi Email
        </button>

        {onBulkStatusChange && (
          <button
            onClick={onBulkStatusChange}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[var(--surface)] border border-[var(--border)] text-[var(--text-1)] hover:bg-[var(--surface-2)] shadow-xs transition-colors"
          >
            <CheckCircle2 size={13} /> Đổi Trạng Thái
          </button>
        )}

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[var(--surface)] border border-[var(--border)] text-[var(--text-1)] hover:bg-[var(--surface-2)] shadow-xs transition-colors"
        >
          <Download size={13} /> Xuất Excel
        </button>

        {canDelete && (
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[var(--danger-soft)] text-[var(--danger)] border border-[var(--danger)]/20 hover:bg-[var(--danger-soft)]/80 shadow-xs transition-colors"
          >
            <Trash2 size={13} /> Xóa
          </button>
        )}
      </div>
    </div>
  );
};
