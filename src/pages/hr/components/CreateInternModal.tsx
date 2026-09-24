import React, { useState } from 'react';
import { toast } from 'sonner';
import type { CreateInternRequest } from '../../../types';
import { Modal, Button } from '../../../components/common';

interface CreateInternModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CreateInternRequest) => Promise<void>;
}

export const CreateInternModal: React.FC<CreateInternModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreateInternRequest>({
    fullName: '',
    email: '',
    phone: '',
    university: '',
    major: '',
    appliedPosition: 'Thực tập sinh Backend (Java/Spring)',
    startDate: new Date().toISOString().split('T')[0],
    gender: 'MALE',
    academicYear: '',
    address: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      toast.error('Số điện thoại phải gồm 10 chữ số hợp lệ theo định dạng Việt Nam (bắt đầu bằng 03, 05, 07, 08, 09)');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm Hồ Sơ Thực Tập Sinh Mới"
      size="lg"
      footer={
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Hủy Bỏ
          </Button>
          <Button type="submit" form="create-intern-form" variant="primary" isLoading={submitting}>
            Tạo Hồ Sơ Mới
          </Button>
        </div>
      }
    >
      <form id="create-intern-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Họ và tên *</label>
          <input
            type="text"
            required
            className="form-input"
            placeholder="Ví dụ: Nguyễn Văn An"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
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
            <label className="form-label">Địa chỉ Email *</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="nguyenvanan@gmail.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Số điện thoại *</label>
            <input
              type="tel"
              required
              className="form-input"
              placeholder="0912345678"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
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
            <label className="form-label">Trường Đại học *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="VD: Đại Học Bách Khoa, ĐHQG..."
              value={formData.university}
              onChange={(e) =>
                setFormData({ ...formData, university: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Chuyên ngành *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="VD: Kỹ Thuật Phần Mềm, CNTT..."
              value={formData.major}
              onChange={(e) =>
                setFormData({ ...formData, major: e.target.value })
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
            <label className="form-label">Vị trí ứng tuyển *</label>
            <select
              className="form-select"
              value={formData.appliedPosition}
              onChange={(e) =>
                setFormData({ ...formData, appliedPosition: e.target.value })
              }
            >
              <option value="Thực tập sinh Backend (Java/Spring)">
                Thực tập sinh Backend (Java/Spring)
              </option>
              <option value="Thực tập sinh Frontend (React/TypeScript)">
                Thực tập sinh Frontend (React/TypeScript)
              </option>
              <option value="Thực tập sinh Fullstack">
                Thực tập sinh Fullstack
              </option>
              <option value="Thực tập sinh Mobile (Flutter/React Native)">
                Thực tập sinh Mobile (Flutter/React Native)
              </option>
              <option value="Thực tập sinh QA/QC">Thực tập sinh QA/QC</option>
              <option value="Thực tập sinh DevOps/Cloud">
                Thực tập sinh DevOps/Cloud
              </option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Giới tính</label>
            <select
              className="form-select"
              value={formData.gender}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER',
                })
              }
            >
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
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
            <label className="form-label">Niên khóa sinh viên</label>
            <input
              type="text"
              className="form-input"
              placeholder="VD: 2022-2026"
              value={formData.academicYear}
              onChange={(e) =>
                setFormData({ ...formData, academicYear: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Ngày bắt đầu dự kiến *</label>
            <input
              type="date"
              required
              className="form-input"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateInternModal;
