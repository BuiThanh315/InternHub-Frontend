import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { DocumentResponse } from '../../../types';

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

  if (!doc) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      alert(
        'Lý do từ chối phải có tối thiểu 5 ký tự để ứng viên hiểu rõ nguyên nhân và bổ sung hồ sơ!'
      );
      return;
    }
    await onSubmit(reason.trim());
    setReason('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        className="card"
        style={{ width: '100%', maxWidth: '480px', margin: '1rem' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <h4
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              margin: 0,
              color: 'var(--danger)',
            }}
          >
            Từ Chối Tài Liệu ({doc.internCode})
          </h4>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            marginBottom: '1rem',
          }}
        >
          Tệp: <strong>{doc.originalFileName || doc.fileName}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Lý do từ chối (Bắt buộc tối thiểu 5 ký tự theo backend) *
            </label>
            <textarea
              rows={3}
              className="form-textarea"
              placeholder="Ví dụ: Thiếu chữ ký xác nhận của khoa, CV chưa đúng mẫu chuẩn..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.5rem',
              marginTop: '1rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="btn btn-danger"
            >
              Xác Nhận Từ Chối
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
