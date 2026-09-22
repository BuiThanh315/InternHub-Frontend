import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { CreateInternRequest } from '../../../types';

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
    university: 'Đại Học Bách Khoa',
    major: 'Khoa Học Máy Tính',
    appliedPosition: 'Thực tập sinh Backend (Java/Spring)',
    startDate: new Date().toISOString().split('T')[0],
    gender: 'MALE',
    academicYear: '2022-2026',
    address: 'Hà Nội',
    notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      alert(
        'Số điện thoại phải gồm 10 chữ số hợp lệ theo định dạng Việt Nam (bắt đầu bằng 03, 05, 07, 08, 09)'
      );
      return;
    }
    await onSubmit(formData);
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
        style={{
          width: '100%',
          maxWidth: '560px',
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
          <h4 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
            Thêm Hồ Sơ Thực Tập Sinh Mới (TM-1)
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

        <form onSubmit={handleSubmit}>
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
                placeholder="email@domain.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Số điện thoại (10 số) *</label>
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
              gridTemplateColumns: '1.4fr 1fr',
              gap: '0.75rem',
            }}
          >
            <div className="form-group">
              <label className="form-label">Trường Đại Học *</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.university}
                onChange={(e) =>
                  setFormData({ ...formData, university: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Giới tính</label>
              <select
                className="form-select"
                value={formData.gender || 'MALE'}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value as any })
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
              gridTemplateColumns: '1.2fr 1fr',
              gap: '0.75rem',
            }}
          >
            <div className="form-group">
              <label className="form-label">Chuyên ngành *</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.major}
                onChange={(e) =>
                  setFormData({ ...formData, major: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Niên khóa</label>
              <input
                type="text"
                className="form-input"
                placeholder="2022-2026"
                value={formData.academicYear || ''}
                onChange={(e) =>
                  setFormData({ ...formData, academicYear: e.target.value })
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
              <label className="form-label">Vị trí thực tập *</label>
              <select
                className="form-select"
                required
                value={formData.appliedPosition}
                onChange={(e) =>
                  setFormData({ ...formData, appliedPosition: e.target.value })
                }
              >
                <option value="Thực tập sinh Backend (Java/Spring)">Backend (Java/Spring)</option>
                <option value="Thực tập sinh Frontend (React/TypeScript)">Frontend (React/TypeScript)</option>
                <option value="Thực tập sinh Fullstack">Fullstack Developer</option>
                <option value="Thực tập sinh QA/QC Tester">QA/QC Tester</option>
                <option value="Thực tập sinh DevOps/Cloud">DevOps / Cloud</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Ngày bắt đầu *</label>
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
              Tạo Hồ Sơ Qua API
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
