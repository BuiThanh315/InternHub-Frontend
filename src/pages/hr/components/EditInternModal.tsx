import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { InternProfile, UpdateInternRequest } from '../../../types';

interface EditInternModalProps {
  intern: InternProfile | null;
  onClose: () => void;
  onSave: (id: number, form: UpdateInternRequest) => Promise<void>;
}

export const EditInternModal: React.FC<EditInternModalProps> = ({
  intern,
  onClose,
  onSave,
}) => {
  const [editForm, setEditForm] = useState<UpdateInternRequest | null>(null);

  useEffect(() => {
    if (intern) {
      setEditForm({
        fullName: intern.fullName,
        email: intern.email,
        phone: intern.phone,
        university: intern.university,
        major: intern.major,
        appliedPosition: intern.appliedPosition || 'Thực tập sinh',
        startDate: intern.startDate || new Date().toISOString().split('T')[0],
        endDate: intern.endDate,
        dateOfBirth: intern.dateOfBirth,
        gender: intern.gender,
        address: intern.address,
        notes: intern.notes,
        academicYear: intern.academicYear,
        status: intern.status,
      });
    } else {
      setEditForm(null);
    }
  }, [intern]);

  if (!intern || !editForm) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(intern.id, editForm);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '580px',
          margin: '1rem',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
              Chỉnh Sửa Hồ Sơ TTS (TM-2)
            </h4>
            <span
              style={{
                fontSize: '0.78rem',
                color: 'var(--primary)',
                fontWeight: 700,
              }}
            >
              {intern.internCode} - {intern.fullName}
            </span>
          </div>
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Họ và tên *</label>
            <input
              type="text"
              required
              className="form-input"
              value={editForm.fullName}
              onChange={(e) =>
                setEditForm({ ...editForm, fullName: e.target.value })
              }
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
            }}
          >
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                required
                className="form-input"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Số điện thoại *</label>
              <input
                type="tel"
                required
                className="form-input"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
              />
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.3fr 1fr',
              gap: '0.75rem',
            }}
          >
            <div className="form-group">
              <label className="form-label">Trường Đại học *</label>
              <input
                type="text"
                required
                className="form-input"
                value={editForm.university}
                onChange={(e) =>
                  setEditForm({ ...editForm, university: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Chuyên ngành *</label>
              <input
                type="text"
                required
                className="form-input"
                value={editForm.major}
                onChange={(e) =>
                  setEditForm({ ...editForm, major: e.target.value })
                }
              />
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 1fr',
              gap: '0.75rem',
            }}
          >
            <div className="form-group">
              <label className="form-label">Vị trí thực tập *</label>
              <input
                type="text"
                required
                className="form-input"
                value={editForm.appliedPosition}
                onChange={(e) =>
                  setEditForm({ ...editForm, appliedPosition: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Trạng thái (Status) *</label>
              <select
                className="form-select"
                value={editForm.status}
                onChange={(e) =>
                  setEditForm({ ...editForm, status: e.target.value as any })
                }
              >
                <option value="PENDING">PENDING (Chờ tiếp nhận)</option>
                <option value="APPROVED">APPROVED (Đã duyệt)</option>
                <option value="INTERNING">INTERNING (Đang thực tập)</option>
                <option value="COMPLETED">COMPLETED (Hoàn thành)</option>
                <option value="REJECTED">REJECTED (Bị từ chối)</option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
            }}
          >
            <div className="form-group">
              <label className="form-label">Ngày bắt đầu *</label>
              <input
                type="date"
                required
                className="form-input"
                value={editForm.startDate}
                onChange={(e) =>
                  setEditForm({ ...editForm, startDate: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Ngày kết thúc</label>
              <input
                type="date"
                className="form-input"
                value={editForm.endDate || ''}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    endDate: e.target.value || undefined,
                  })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Ghi chú hướng dẫn / đánh giá</label>
            <textarea
              rows={3}
              className="form-textarea"
              value={editForm.notes || ''}
              onChange={(e) =>
                setEditForm({ ...editForm, notes: e.target.value })
              }
              placeholder="Nhập ghi chú hoặc yêu cầu bổ sung..."
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.5rem',
              marginTop: '1.25rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Lưu Thay Đổi Qua API (PUT)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
