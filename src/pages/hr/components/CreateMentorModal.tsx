import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Mail, Phone, User, Building2, Send, Info } from 'lucide-react';
import type { CreateMentorRequest, DepartmentResponse } from '../../../types';
import { Modal, Button } from '../../../components/common';
import { programService } from '../../../services/programService';

interface CreateMentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CreateMentorRequest) => Promise<void>;
}

export const CreateMentorModal: React.FC<CreateMentorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreateMentorRequest>({
    fullName: '',
    email: '',
    phone: '',
    departmentId: 0,
  });
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        departmentId: 0,
      });
      fetchDepartments();
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const list = await programService.getDepartments();
      setDepartments(list);
      if (list.length > 0) {
        setFormData((prev) => ({ ...prev, departmentId: prev.departmentId || list[0].id }));
      }
    } catch (err: any) {
      toast.error('Không thể tải danh sách phòng ban: ' + (err?.message || 'Lỗi kết nối'));
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error('Vui lòng nhập họ và tên của Mentor');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Email không hợp lệ. Vui lòng nhập đúng định dạng email (VD: mentor@company.com)');
      return;
    }

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      toast.error('Số điện thoại phải gồm 10 chữ số hợp lệ theo định dạng Việt Nam (bắt đầu bằng 03, 05, 07, 08, 09)');
      return;
    }

    if (!formData.departmentId || formData.departmentId === 0) {
      toast.error('Vui lòng chọn phòng ban trực thuộc cho Mentor');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        departmentId: Number(formData.departmentId),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm Mới Người Hướng Dẫn (Mentor)"
      size="md"
      footer={
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Hủy Bỏ
          </Button>
          <Button
            type="submit"
            form="create-mentor-form"
            variant="primary"
            isLoading={submitting}
            leftIcon={<Send size={16} />}
          >
            Tạo & Gửi Thư Mời
          </Button>
        </div>
      }
    >
      <form id="create-mentor-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
        {/* Notice Info Box */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md, 8px)',
            background: 'rgba(79, 70, 229, 0.06)',
            border: '1px solid rgba(79, 70, 229, 0.2)',
            fontSize: '0.825rem',
            lineHeight: 1.5,
            color: 'var(--text-main, #334155)',
          }}
        >
          <Info size={18} style={{ color: 'var(--primary, #4f46e5)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Quy trình kích hoạt bảo mật:</strong> Hệ thống không yêu cầu tạo mật khẩu trực tiếp.
            Sau khi lưu thông tin, một email thư mời kèm liên kết Onboarding sẽ được gửi tự động tới hộp thư của Mentor để họ tự thiết lập mật khẩu truy cập.
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
            Họ và Tên Mentor <span style={{ color: 'var(--danger, #ef4444)' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              required
              className="form-input"
              style={{ width: '100%', paddingLeft: '2.3rem' }}
              placeholder="Ví dụ: Nguyễn Văn An"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              disabled={submitting}
            />
          </div>
        </div>

        {/* Work Email */}
        <div>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
            Email Công Tác (Nhận thư mời) <span style={{ color: 'var(--danger, #ef4444)' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="email"
              required
              className="form-input"
              style={{ width: '100%', paddingLeft: '2.3rem' }}
              placeholder="mentor.name@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={submitting}
            />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
            Email này sẽ được dùng làm tài khoản đăng nhập và nhận thông báo phân công TTS.
          </span>
        </div>

        {/* Phone Number */}
        <div>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
            Số Điện Thoại <span style={{ color: 'var(--danger, #ef4444)' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <Phone size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="tel"
              required
              className="form-input"
              style={{ width: '100%', paddingLeft: '2.3rem' }}
              placeholder="0912345678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={submitting}
            />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
            Định dạng 10 chữ số theo nhà mạng Việt Nam (03x, 05x, 07x, 08x, 09x).
          </span>
        </div>

        {/* Department Selection */}
        <div>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
            Phòng Ban Trực Thuộc <span style={{ color: 'var(--danger, #ef4444)' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <Building2 size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
            <select
              className="form-select"
              required
              style={{ width: '100%', paddingLeft: '2.3rem' }}
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: Number(e.target.value) })}
              disabled={loadingDepartments || submitting}
            >
              {loadingDepartments ? (
                <option value={0}>Đang tải danh sách phòng ban...</option>
              ) : (
                departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
};
