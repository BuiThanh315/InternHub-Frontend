import React, { useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import type { DocumentResponse } from '../../../types';
import { Modal, Button } from '../../../components/common';

interface RejectDocModalProps {
  doc: DocumentResponse | null;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}

export const RejectDocModal: React.FC<RejectDocModalProps> = ({
  doc,
  onClose,
  onSubmit,
}) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!doc) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      toast.error('Lý do từ chối phải có tối thiểu 5 ký tự để ứng viên hiểu rõ nguyên nhân và bổ sung hồ sơ!');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(reason.trim());
      setReason('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={!!doc}
      onClose={onClose}
      title="Từ Chối Tài Liệu & Phản Hồi Lý Do"
      size="md"
      footer={
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Hủy Bỏ
          </Button>
          <Button type="submit" form="reject-doc-form" variant="danger" isLoading={submitting}>
            Xác Nhận Từ Chối
          </Button>
        </div>
      }
    >
      <form id="reject-doc-form" onSubmit={handleSubmit}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.75rem',
            borderRadius: '8px',
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            color: 'var(--danger)',
            fontSize: '0.825rem',
            marginBottom: '1rem',
          }}
        >
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>
            Bạn đang từ chối tệp: <strong>{doc.originalFileName || doc.fileName}</strong> của TTS <strong>{doc.internCode}</strong>
          </span>
        </div>

        <div className="form-group">
          <label className="form-label">Lý do từ chối cụ thể *</label>
          <textarea
            required
            rows={4}
            className="form-textarea"
            placeholder="Ví dụ: Tệp tin scan bị mờ, thiếu chữ ký xác nhận của nhà trường hoặc bảng điểm chưa cập nhật học kỳ mới nhất..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};

export default RejectDocModal;
