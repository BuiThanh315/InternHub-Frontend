import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Send,
  UploadCloud,
  FileText,
  Trash2,
  Loader2,
  CheckCircle2,
  Building2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '../../../../contexts/AuthContext';
import { internService } from '../../../../services/internService';
import { documentService } from '../../../../services/documentService';
import { userService } from '../../../../services/userService';
import { ROUTES } from '../../../../constants/routes';
import type { GenderType, ApplyInternRequest } from '../../../../types';
import type { ApplyProgramModalProps } from './ApplyProgramModal.types';
import styles from './ApplyProgramModal.module.css';

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: GenderType;
  address: string;
  university: string;
  major: string;
  academicYear: string;
  appliedPosition: string;
  startDate: string;
  notes: string;
}

export const ApplyProgramModal: React.FC<ApplyProgramModalProps> = ({
  isOpen,
  program,
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    fullName: user?.fullName || '',
    email: user?.email || (user?.username?.includes('@') ? user.username : ''),
    phone: user?.phone || user?.phoneNumber || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: (user?.gender as GenderType) || 'MALE',
    address: user?.address || '',
    university: '',
    major: '',
    academicYear: '2022 - 2026',
    appliedPosition: 'Thực Tập Sinh Backend',
    startDate: program?.startDate || new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedInternCode, setSubmittedInternCode] = useState<string | null>(null);

  // Pre-fill thông tin tài khoản nếu có
  useEffect(() => {
    if (isOpen) {
      setSubmittedInternCode(null);
      setCvFile(null);
      if (user?.userId) {
        userService.getUserById(user.userId).then((u) => {
          if (u) {
            setForm((prev) => ({
              ...prev,
              fullName: prev.fullName || u.fullName || '',
              email: prev.email || u.email || '',
              phone: prev.phone || u.phone || u.phoneNumber || '',
              dateOfBirth: prev.dateOfBirth || u.dateOfBirth || '',
              gender: (u.gender as GenderType) || prev.gender,
              address: prev.address || u.address || '',
            }));
          }
        }).catch(() => {
          // ignore error
        });
      }
      if (program?.startDate) {
        setForm((prev) => ({
          ...prev,
          startDate: program.startDate,
        }));
      }
    }
  }, [isOpen, user, program]);

  if (!isOpen || !program) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Dung lượng tệp CV không được vượt quá 10MB.');
        return;
      }
      setCvFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Dung lượng tệp CV không được vượt quá 10MB.');
        return;
      }
      setCvFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error('Vui lòng điền đầy đủ Họ và tên, Email và Số điện thoại.');
      return;
    }
    if (!form.university.trim() || !form.major.trim()) {
      toast.error('Vui lòng điền thông tin Trường ĐH/CĐ và Chuyên ngành.');
      return;
    }

    try {
      setIsSubmitting(true);

      const requestPayload: ApplyInternRequest = {
        userId: user?.userId,
        programId: program.id,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        address: form.address.trim() || undefined,
        university: form.university.trim(),
        major: form.major.trim(),
        academicYear: form.academicYear.trim() || undefined,
        appliedPosition: form.appliedPosition.trim(),
        startDate: form.startDate || program.startDate || undefined,
        endDate: program.endDate || undefined,
        notes: form.notes.trim() || undefined,
      };

      const result = await internService.applyOnline(requestPayload);

      // Upload file CV đính kèm nếu có
      if (cvFile && result.internCode) {
        try {
          const cvDoc = await documentService.uploadDocument(result.internCode, cvFile, 'CV');
          if (cvDoc) {
            internService.saveLocalDocument(result.internCode, cvDoc);
          }
        } catch (uploadErr) {
          console.error('Lỗi tải tệp CV:', uploadErr);
          toast.warning('Hồ sơ đã được lưu, tuy nhiên tải tệp CV gặp sự cố. Bạn có thể bổ sung tại Dashboard.');
        }
      }

      setSubmittedInternCode(result.internCode);
      onSuccess(result.internCode, program);
      toast.success(`Nộp hồ sơ ứng tuyển thành công vào chương trình ${program.name}!`);
    } catch (err: any) {
      console.error('Lỗi nộp hồ sơ:', err);
      toast.error(err.message || 'Không thể gửi hồ sơ. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={(e) => e.target === e.currentTarget && !isSubmitting && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="apply-modal-title">
        {submittedInternCode ? (
          <div className={styles.successContainer}>
            <div className={styles.successIconBadge}>
              <CheckCircle2 size={44} />
            </div>
            <h2 className={styles.successTitle}>Hồ Sơ Đã Được Gửi Thành Công!</h2>
            <p className={styles.successDesc}>
              Hồ sơ ứng tuyển của bạn vào chương trình <strong>{program.name}</strong> đã được chuyển tới bộ phận HR và đang ở trạng thái <strong>PENDING (Chờ thẩm định)</strong>.
            </p>
            <div className={styles.codeBox}>
              <span className={styles.codeLabel}>Mã Hồ Sơ Của Bạn:</span>
              <strong className={styles.codeValue}>{submittedInternCode}</strong>
            </div>
            <div className={styles.successActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={onClose}
              >
                <span>Xem & Ứng Tuyển Chương Trình Khác</span>
              </button>
              <button
                type="button"
                className={styles.submitBtn}
                onClick={() => {
                  onClose();
                  navigate(ROUTES.INTERN.DASHBOARD);
                }}
              >
                <span>Về Dashboard Cá Nhân</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div className={styles.header}>
              <div className={styles.titleArea}>
                <h2 id="apply-modal-title" className={styles.title}>Nộp Hồ Sơ Ứng Tuyển</h2>
                <div className={styles.subtitle}>Điền thông tin và đính kèm CV để ứng tuyển vào chương trình đào tạo</div>
              </div>
              <button type="button" className={styles.closeButton} onClick={onClose} disabled={isSubmitting} aria-label="Đóng">
                <X size={20} />
              </button>
            </div>

            <div className={styles.body}>
              {/* Program Banner */}
              <div className={styles.programBanner}>
                <div className={styles.programBannerInfo}>
                  <div className={styles.programBannerTitle}>{program.name}</div>
                  <div className={styles.programBannerMeta}>
                    <span>Mã: <strong>{program.programCode}</strong></span>
                    <span>•</span>
                    <span>Phòng: <strong>{program.departmentName || 'Chung'}</strong></span>
                    <span>•</span>
                    <span>Thời lượng: <strong>{program.durationWeeks ? `${program.durationWeeks} tuần` : 'Linh hoạt'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Thông tin ứng viên */}
              <div>
                <div className={styles.sectionTitle}>
                  <Sparkles size={15} />
                  <span>1. Thông Tin Ứng Viên</span>
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="applicant-fullName" className={styles.label}>
                      Họ và tên <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="applicant-fullName"
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn A"
                      required
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="applicant-email" className={styles.label}>
                      Địa chỉ Email <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="applicant-email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="nguyenvana@gmail.com"
                      required
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="applicant-phone" className={styles.label}>
                      Số điện thoại liên hệ <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="applicant-phone"
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="0987654321"
                      required
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="applicant-dob" className={styles.label}>Ngày sinh</label>
                    <input
                      id="applicant-dob"
                      type="date"
                      name="dateOfBirth"
                      value={form.dateOfBirth}
                      onChange={handleChange}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="applicant-gender" className={styles.label}>Giới tính</label>
                    <select
                      id="applicant-gender"
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className={styles.select}
                    >
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="applicant-address" className={styles.label}>Địa chỉ hiện tại</label>
                    <input
                      id="applicant-address"
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Quận/Huyện, Tỉnh/Thành phố"
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>

              {/* Thông tin học vấn & vị trí */}
              <div>
                <div className={styles.sectionTitle}>
                  <Building2 size={15} />
                  <span>2. Học Vấn & Vị Trí Nguyện Vọng</span>
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="applicant-university" className={styles.label}>
                      Trường ĐH / Cao đẳng <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="applicant-university"
                      type="text"
                      name="university"
                      value={form.university}
                      onChange={handleChange}
                      placeholder="Đại học Bách Khoa Hà Nội"
                      required
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="applicant-major" className={styles.label}>
                      Chuyên ngành đào tạo <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="applicant-major"
                      type="text"
                      name="major"
                      value={form.major}
                      onChange={handleChange}
                      placeholder="Công nghệ thông tin / KTPM"
                      required
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="applicant-academicYear" className={styles.label}>Niên khóa học tập</label>
                    <input
                      id="applicant-academicYear"
                      type="text"
                      name="academicYear"
                      value={form.academicYear}
                      onChange={handleChange}
                      placeholder="2022 - 2026"
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="applicant-position" className={styles.label}>
                      Vị trí ứng tuyển <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="applicant-position"
                      type="text"
                      name="appliedPosition"
                      value={form.appliedPosition}
                      onChange={handleChange}
                      placeholder="Thực Tập Sinh Backend Java"
                      required
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="applicant-startDate" className={styles.label}>Ngày bắt đầu thực tập dự kiến</label>
                    <input
                      id="applicant-startDate"
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>

              {/* Tệp đính kèm CV */}
              <div>
                <div className={styles.sectionTitle}>
                  <FileText size={15} />
                  <span>3. Tệp Hồ Sơ Đính Kèm (CV)</span>
                </div>

                {cvFile ? (
                  <div className={styles.filePreview}>
                    <div className={styles.fileInfo}>
                      <FileText size={20} className={styles.uploadIcon} />
                      <div>
                        <div>{cvFile.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {(cvFile.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.removeFileBtn}
                      onClick={() => setCvFile(null)}
                      aria-label="Xóa tệp"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="modal-cv-upload"
                    className={`${styles.uploadZone} ${isDragOver ? styles.uploadZoneActive : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <UploadCloud size={32} className={styles.uploadIcon} />
                    <div className={styles.uploadTitle}>Kéo thả tệp CV hoặc bấm để chọn tệp</div>
                    <div className={styles.uploadHint}>Hỗ trợ định dạng PDF, DOC, DOCX (Dung lượng tối đa 10MB)</div>
                    <input
                      id="modal-cv-upload"
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="applicant-notes" className={styles.label}>Ghi chú thêm cho bộ phận HR</label>
                <textarea
                  id="applicant-notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Nguyện vọng làm việc full-time, kỹ năng nổi bật hoặc câu hỏi dành cho nhà tuyển dụng..."
                  className={styles.textarea}
                />
              </div>
            </div>

            {/* Sticky Footer */}
            <div className={styles.footer}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={onClose}
                disabled={isSubmitting}
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Đang Gửi Hồ Sơ...</span>
                  </>
                ) : (
                  <>
                    <span>Gửi Hồ Sơ Ứng Tuyển</span>
                    <Send size={15} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
