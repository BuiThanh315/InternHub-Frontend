import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  GraduationCap,
  Calendar,
  Inbox,
  Clock,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { toast } from 'sonner';

import { Modal, Button, Skeleton } from '../../../../../components/common';
import { internService } from '../../../../../services/internService';
import { formatDate } from '../../../../../utils/formatters';
import type { InternProfile, CreateInternRequest } from '../../../../../types';
import type { EnrollInternModalProps } from './EnrollInternModal.types';
import { ExcelImportTab } from './tabs';
import styles from './EnrollInternModal.module.css';

export const EnrollInternModal: React.FC<EnrollInternModalProps> = ({
  isOpen,
  program,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'create' | 'excel'>('pending');
  const [pendingInterns, setPendingInterns] = useState<InternProfile[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [actionInternId, setActionInternId] = useState<number | null>(null);
  const [rejectingIntern, setRejectingIntern] = useState<InternProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form thêm mới trực tiếp
  const [formData, setFormData] = useState<CreateInternRequest>({
    fullName: '',
    email: '',
    phone: '',
    university: '',
    major: '',
    appliedPosition: 'Thực tập sinh',
    startDate: new Date().toISOString().split('T')[0],
    gender: 'MALE',
    notes: '',
  });

  const loadPendingApplicants = useCallback(async () => {
    if (!program?.id) return;
    try {
      setIsLoadingList(true);
      const res = await internService.getInterns({
        programId: program.id,
        status: 'PENDING',
        size: 50,
      });
      setPendingInterns(res.items || res.content || []);
    } catch (err: unknown) {
      console.error('Lỗi khi tải đơn ứng tuyển:', err);
      toast.error('Không thể tải danh sách đơn đăng ký chờ tuyển.');
    } finally {
      setIsLoadingList(false);
    }
  }, [program?.id]);

  useEffect(() => {
    if (isOpen && program) {
      setActiveTab('pending');
      setRejectingIntern(null);
      setRejectionReason('');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        university: '',
        major: '',
        appliedPosition: program.name || 'Thực tập sinh',
        startDate: program.startDate || new Date().toISOString().split('T')[0],
        endDate: program.endDate,
        gender: 'MALE',
        notes: '',
      });
      void loadPendingApplicants();
    }
  }, [isOpen, program, loadPendingApplicants]);

  if (!isOpen || !program) return null;

  const currentCount = Number(program.currentInterns || 0);
  const maxCount = Number(program.maxInterns || 0);
  const isFull = currentCount >= maxCount;
  const availableSlots = Math.max(0, maxCount - currentCount);

  // Phê duyệt tiếp nhận ứng viên vào kỳ
  const handleApprove = async (intern: InternProfile) => {
    if (isFull) {
      toast.error(`Kỳ thực tập "${program.name}" đã đạt tối đa ${maxCount} chỉ tiêu.`);
      return;
    }

    try {
      setActionInternId(intern.id);
      await internService.submitDecision(intern.id, {
        decision: 'APPROVED',
        programId: program.id,
      });
      toast.success(`Đã tiếp nhận thành công ứng viên "${intern.fullName}" vào kỳ thực tập.`);
      setPendingInterns((prev) => prev.filter((item) => item.id !== intern.id));
      onSuccess();
    } catch (err: any) {
      console.error('Lỗi tiếp nhận ứng viên:', err);
      toast.error(err.response?.data?.message || 'Không thể tiếp nhận ứng viên.');
    } finally {
      setActionInternId(null);
    }
  };

  // Mở box từ chối đơn
  const handleOpenReject = (intern: InternProfile) => {
    setRejectingIntern(intern);
    setRejectionReason('Hồ sơ chưa phù hợp với tiêu chí tuyển sinh của kỳ thực tập này.');
  };

  // Xác nhận từ chối đơn
  const handleConfirmReject = async () => {
    if (!rejectingIntern) return;
    if (!rejectionReason.trim() || rejectionReason.trim().length < 5) {
      toast.error('Lý do từ chối phải có ít nhất 5 ký tự.');
      return;
    }

    try {
      setActionInternId(rejectingIntern.id);
      await internService.submitDecision(rejectingIntern.id, {
        decision: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
      });
      toast.success(`Đã từ chối đơn đăng ký của "${rejectingIntern.fullName}".`);
      setPendingInterns((prev) => prev.filter((item) => item.id !== rejectingIntern.id));
      setRejectingIntern(null);
      setRejectionReason('');
      onSuccess();
    } catch (err: any) {
      console.error('Lỗi từ chối đơn:', err);
      toast.error(err.response?.data?.message || 'Không thể cập nhật trạng thái từ chối.');
    } finally {
      setActionInternId(null);
    }
  };

  // Thêm mới hồ sơ trực tiếp vào chương trình
  const handleCreateSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const phoneRegex = /^(0[35789])\d{8}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      toast.error('Số điện thoại phải gồm 10 chữ số hợp lệ theo định dạng Việt Nam (bắt đầu bằng 03, 05, 07, 08, 09).');
      return;
    }

    try {
      setIsSubmitting(true);
      await internService.createIntern({
        ...formData,
        programId: program.id,
      });
      toast.success(`Đã thêm thành công hồ sơ ứng viên "${formData.fullName}" vào kỳ thực tập.`);
      onSuccess();
      setActiveTab('pending');
      void loadPendingApplicants();
    } catch (err: any) {
      console.error('Lỗi tạo hồ sơ:', err);
      toast.error(err.response?.data?.message || 'Không thể tạo hồ sơ thực tập sinh.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPillStatusClass = () => {
    if (isFull) return styles.quotaPillDanger;
    if (availableSlots <= 3) return styles.quotaPillWarning;
    return styles.quotaPillPrimary;
  };

  const renderPendingTabContent = () => {
    if (isLoadingList) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Skeleton height="80px" />
          <Skeleton height="80px" />
        </div>
      );
    }

    if (pendingInterns.length === 0) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrapper}>
            <Inbox size={26} />
          </div>
          <h4 className={styles.emptyTitle}>Chưa có đơn đăng ký chờ tuyển</h4>
          <p className={styles.emptyText}>
            Hiện tại không có ứng viên nào đang nộp đơn chờ tiếp nhận vào kỳ này. Bạn có thể sang tab &quot;Thêm mới hồ sơ trực tiếp&quot; để bổ sung ứng viên.
          </p>
        </div>
      );
    }

    return (
      <div className={styles.applicantList}>
        {pendingInterns.map((intern) => {
          const isProcessing = actionInternId === intern.id;
          const isRejectingThis = rejectingIntern?.id === intern.id;
          const displayDate = intern.createdAt || intern.startDate;

          return (
            <div key={intern.id} className={styles.applicantCard}>
              <div className={styles.applicantMain}>
                <div className={styles.applicantHeader}>
                  <span className={styles.applicantName}>{intern.fullName}</span>
                  <span className={styles.applicantCode}>{intern.internCode}</span>
                  <span className={styles.appliedDate}>
                    <Clock size={12} />
                    <span>Nộp: {formatDate(displayDate)}</span>
                  </span>
                </div>

                <div className={styles.applicantDetails}>
                  <span className={styles.detailItem}>
                    <GraduationCap size={13} />
                    <span>{intern.university} · {intern.major}</span>
                  </span>
                  <span className={styles.detailItem}>
                    <Sparkles size={13} />
                    <span>Ứng tuyển: <strong>{intern.appliedPosition}</strong></span>
                  </span>
                  <span className={styles.detailItem}>
                    Email: {intern.email} · SĐT: {intern.phone}
                  </span>
                </div>

                {/* Box nhập lý do từ chối nếu đang mở */}
                {isRejectingThis && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--danger-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--danger-border)' }}>
                    <label htmlFor={`reject-reason-${intern.id}`} style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--danger)', display: 'block', marginBottom: '0.35rem' }}>
                      Lý do từ chối đơn ứng tuyển:
                    </label>
                    <input
                      id={`reject-reason-${intern.id}`}
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Nhập lý do từ chối (tối thiểu 5 ký tự)..."
                      className={styles.input}
                      style={{ marginBottom: '0.5rem' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setRejectingIntern(null)}
                        disabled={isProcessing}
                      >
                        Hủy bỏ
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={handleConfirmReject}
                        isLoading={isProcessing}
                      >
                        Xác nhận từ chối
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {!isRejectingThis && (
                <div className={styles.applicantActions}>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={isFull || isProcessing}
                    isLoading={isProcessing}
                    onClick={() => handleApprove(intern)}
                    title={isFull ? 'Kỳ thực tập đã hết chỗ' : 'Tiếp nhận ứng viên vào kỳ'}
                  >
                    <UserCheck size={14} />
                    <span>Tiếp Nhận</span>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => handleOpenReject(intern)}
                    title="Từ chối đơn ứng tuyển"
                  >
                    <UserX size={14} />
                    <span>Từ Chối</span>
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tiếp Nhận & Điều Phối Thực Tập Sinh"
      size={activeTab === 'excel' ? 'xl' : 'lg'}
      footer={
        <div className={styles.modalFooter}>
          <span className={styles.footerNote}>
            {isFull ? (
              <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
                Lưu ý: Kỳ thực tập đã đủ chỉ tiêu tiếp nhận ({maxCount} TTS).
              </span>
            ) : (
              <span>Còn <strong>{availableSlots}</strong> vị trí tiếp nhận cho chương trình này.</span>
            )}
          </span>
          <div className={styles.footerButtons}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      }
    >
      <div className={styles.container}>
        {/* Banner tóm tắt thông tin chương trình */}
        <div className={styles.programBanner}>
          <div className={styles.bannerMain}>
            <div className={styles.programIdentity}>
              <span className={styles.programCode}>{program.programCode}</span>
              <span className={styles.programTitle}>{program.name}</span>
            </div>
            <span className={styles.deptBadge}>
              Phòng ban: <strong>{program.departmentName || 'Chung'}</strong>
            </span>
          </div>

          <div className={styles.quotaMetrics}>
            <div className={`${styles.quotaPill} ${isFull ? styles.quotaPillDanger : styles.quotaPillPrimary}`}>
              <Users size={14} />
              <span>
                Đã tiếp nhận: <strong>{currentCount}</strong> / {maxCount} TTS
              </span>
            </div>

            <div className={`${styles.quotaPill} ${getPillStatusClass()}`}>
              <Clock size={14} />
              <span>
                {isFull ? 'Hết slot tiếp nhận' : `Còn trống: ${availableSlots} vị trí`}
              </span>
            </div>

            <div className={styles.quotaPill}>
              <Calendar size={14} />
              <span>
                {formatDate(program.startDate)} - {formatDate(program.endDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabsNav} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'pending'}
            className={`${styles.tabBtn} ${activeTab === 'pending' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <Users size={16} />
            <span>Đơn Chờ Xét Tuyển</span>
            <span className={styles.tabCountBadge}>{pendingInterns.length}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'create'}
            className={`${styles.tabBtn} ${activeTab === 'create' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <UserPlus size={16} />
            <span>Thêm Mới Hồ Sơ Trực Tiếp</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'excel'}
            className={`${styles.tabBtn} ${activeTab === 'excel' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('excel')}
          >
            <FileSpreadsheet size={16} />
            <span>Nhập từ File Excel</span>
          </button>
        </div>

        {/* Tab 1: Danh sách Đơn Chờ Duyệt */}
        {activeTab === 'pending' && (
          <div className={styles.tabContent}>
            {renderPendingTabContent()}
          </div>
        )}

        {/* Tab 2: Thêm Mới Hồ Sơ Trực Tiếp */}
        {activeTab === 'create' && (
          <form id="create-intern-program-form" onSubmit={handleCreateSubmit} className={styles.createForm}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="create-intern-fullname" className={styles.label}>Họ và tên *</label>
                <input
                  id="create-intern-fullname"
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className={styles.input}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="create-intern-email" className={styles.label}>Địa chỉ Email *</label>
                <input
                  id="create-intern-email"
                  type="email"
                  required
                  placeholder="nguyenvanan@gmail.com"
                  className={styles.input}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="create-intern-phone" className={styles.label}>Số điện thoại *</label>
                <input
                  id="create-intern-phone"
                  type="tel"
                  required
                  placeholder="0912345678"
                  className={styles.input}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="create-intern-gender" className={styles.label}>Giới tính *</label>
                <select
                  id="create-intern-gender"
                  className={styles.select}
                  value={formData.gender || 'MALE'}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="create-intern-university" className={styles.label}>Trường Đại học / Học viện *</label>
                <input
                  id="create-intern-university"
                  type="text"
                  required
                  placeholder="Ví dụ: ĐH Bách Khoa Hà Nội"
                  className={styles.input}
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="create-intern-major" className={styles.label}>Chuyên ngành đào tạo *</label>
                <input
                  id="create-intern-major"
                  type="text"
                  required
                  placeholder="Ví dụ: Công nghệ thông tin"
                  className={styles.input}
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="create-intern-position" className={styles.label}>Vị trí tiếp nhận thực tập *</label>
                <input
                  id="create-intern-position"
                  type="text"
                  required
                  placeholder="Ví dụ: Thực tập sinh Backend Java"
                  className={styles.input}
                  value={formData.appliedPosition}
                  onChange={(e) => setFormData({ ...formData, appliedPosition: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="create-intern-notes" className={styles.label}>Ghi chú thêm</label>
                <input
                  id="create-intern-notes"
                  type="text"
                  placeholder="Thông tin bổ sung hoặc kỹ năng..."
                  className={styles.input}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                <UserPlus size={16} />
                <span>Lưu Hồ Sơ Vào Chương Trình</span>
              </Button>
            </div>
          </form>
        )}

        {/* Tab 3: Nhập dữ liệu từ Excel */}
        {activeTab === 'excel' && (
          <div className={styles.tabContent}>
            <ExcelImportTab program={program} onSuccess={onSuccess} />
          </div>
        )}
      </div>
    </Modal>
  );
};
