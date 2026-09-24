import React, { useState, useEffect } from 'react';
import type { InternProfile, UpdateInternRequest } from '../../../types';
import { Modal, Button } from '../../../components/common';

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
  const [saving, setSaving] = useState(false);

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
    try {
      setSaving(true);
      await onSave(intern.id, editForm);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={!!intern}
      onClose={onClose}
      title={`Chỉnh Sửa Hồ Sơ: ${intern.fullName} (${intern.internCode})`}
      size="lg"
      footer={
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Hủy Bỏ
          </Button>
          <Button type="submit" form="edit-intern-form" variant="primary" isLoading={saving}>
            Lưu Thay Đổi
          </Button>
        </div>
      }
    >
      <form id="edit-intern-form" onSubmit={handleSubmit}>
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          <div className="form-group">
            <label className="form-label">Email liên hệ *</label>
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          <div className="form-group">
            <label className="form-label">Trường Đại Học</label>
            <input
              type="text"
              className="form-input"
              value={editForm.university}
              onChange={(e) =>
                setEditForm({ ...editForm, university: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Chuyên ngành</label>
            <input
              type="text"
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          <div className="form-group">
            <label className="form-label">Vị trí thực tập</label>
            <input
              type="text"
              className="form-input"
              value={editForm.appliedPosition}
              onChange={(e) =>
                setEditForm({ ...editForm, appliedPosition: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Trạng thái hồ sơ</label>
            <select
              className="form-select"
              value={editForm.status}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  status: e.target.value as any,
                })
              }
            >
              <option value="PENDING">Chờ Tiếp Nhận (PENDING)</option>
              <option value="APPROVED">Đã Phê Duyệt (APPROVED)</option>
              <option value="INTERNING">Đang Thực Tập (INTERNING)</option>
              <option value="COMPLETED">Đã Hoàn Thành (COMPLETED)</option>
              <option value="REJECTED">Từ Chối (REJECTED)</option>
            </select>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          <div className="form-group">
            <label className="form-label">Ngày bắt đầu</label>
            <input
              type="date"
              className="form-input"
              value={editForm.startDate || ''}
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
      </form>
    </Modal>
  );
};

export default EditInternModal;
