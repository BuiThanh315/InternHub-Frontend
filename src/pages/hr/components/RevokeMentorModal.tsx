import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal, Button } from '../../../components/common';
import { internService } from '../../../services/internService';
import type { InternResponse } from '../../../types/intern.types';

interface RevokeMentorModalProps {
  intern: InternResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RevokeMentorModal: React.FC<RevokeMentorModalProps> = ({
  intern,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !intern) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do thu hồi mentor.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await internService.revokeMentor(intern.id, { reason: reason.trim() });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Lỗi khi thu hồi mentor:', err);
      setError(err?.response?.data?.message || 'Không thể thu hồi mentor. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thu Hồi Mentor Hướng Dẫn"
      size="md"
      footer={
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => handleSubmit()}
            isLoading={submitting}
            disabled={submitting || !reason.trim()}
          >
            Xác Nhận Thu Hồi
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger)',
              fontSize: '0.85rem',
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            background: 'var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.875rem',
            border: '1px solid var(--border-default)',
            fontSize: '0.875rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Thực tập sinh:</span>
            <strong style={{ color: 'var(--text-main)' }}>{intern.fullName} ({intern.internCode})</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Mentor hiện tại:</span>
            <strong style={{ color: 'var(--warning)' }}>{intern.mentorName || 'Đang phụ trách'}</strong>
          </div>
        </div>

        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--warning)', marginBottom: '0.35rem' }}>
            <AlertTriangle size={15} />
            <span>Lưu ý nghiệp vụ sau khi thu hồi:</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.5 }}>
            <li>Thực tập sinh sẽ trở về trạng thái <strong>Chưa có Mentor</strong>.</li>
            <li>Hệ thống tự động kích hoạt cờ cảnh báo <strong>Cần đổi Mentor</strong> trên bảng HR.</li>
          </ul>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
            Lý do thu hồi <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            rows={3}
            placeholder="VD: Mentor bận công tác đột xuất, TTS đổi định hướng chuyên môn..."
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              background: 'var(--bg-main)',
              color: 'var(--text-main)',
              fontSize: '0.875rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>
    </Modal>
  );
};
