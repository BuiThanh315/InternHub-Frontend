import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  ArrowLeft,
  Send,
  User as UserIcon,
  GraduationCap,
  Paperclip,
  Trash2,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { internService } from '../../services/internService';
import { documentService } from '../../services/documentService';
import { userService } from '../../services/userService';
import { ROUTES } from '../../constants/routes';
import type { GenderType } from '../../types';
import styles from './InternApplyPage.module.css';

export const InternApplyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Personal Info (Auto pre-filled from user account)
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || (user?.username?.includes('@') ? user.username : ''));
  const [phone, setPhone] = useState(user?.phone || user?.phoneNumber || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '');
  const [gender, setGender] = useState<GenderType>(user?.gender || 'MALE');
  const [address, setAddress] = useState(user?.address || '');

  // Academic & Application Info
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [academicYear, setAcademicYear] = useState('2022 - 2026');
  const [appliedPosition, setAppliedPosition] = useState('Thực Tập Sinh Backend');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // CV File Upload
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [internCodeResult, setInternCodeResult] = useState<string | null>(null);

  // If user details are incomplete, attempt to fetch full user info via userService
  useEffect(() => {
    if (user?.userId) {
      userService
        .getUserById(user.userId)
        .then((u) => {
          if (u) {
            if (!fullName && u.fullName) setFullName(u.fullName);
            if (!email && u.email) setEmail(u.email);
            if (!phone && (u.phone || u.phoneNumber)) setPhone(u.phone || u.phoneNumber || '');
            if (!dateOfBirth && u.dateOfBirth) setDateOfBirth(u.dateOfBirth);
            if (u.gender) setGender(u.gender);
            if (!address && u.address) setAddress(u.address);
          }
        })
        .catch((err) => {
          console.warn('Không thể tự động tải chi tiết tài khoản:', err);
        });
    }
  }, [user, fullName, email, phone, dateOfBirth, address]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
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

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      toast.error('Vui lòng điền đầy đủ Họ và tên, Email và Số điện thoại liên hệ.');
      return;
    }

    if (!university.trim() || !major.trim()) {
      toast.error('Vui lòng cung cấp thông tin Trường ĐH/CĐ và Chuyên ngành đào tạo.');
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Gửi đơn ứng tuyển trực tuyến qua API TM-10
      const profile = await internService.applyOnline({
        userId: user?.userId,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
        address: address.trim() || undefined,
        university: university.trim(),
        major: major.trim(),
        academicYear: academicYear.trim() || undefined,
        appliedPosition,
        startDate,
        notes: notes.trim() || undefined,
      });

      // 2. Upload file CV đính kèm nếu có
      if (cvFile && profile.internCode) {
        try {
          const cvDoc = await documentService.uploadDocument(profile.internCode, cvFile, 'CV');
          if (cvDoc) {
            internService.saveLocalDocument(profile.internCode, cvDoc);
          }
        } catch (uploadErr: any) {
          console.error('Lỗi tải tệp CV:', uploadErr);
          toast.warning('Hồ sơ đã được lưu, tuy nhiên tải tệp CV gặp sự cố. Bạn có thể bổ sung tại Dashboard.');
        }
      }

      setInternCodeResult(profile.internCode);
      setIsSubmitted(true);
      toast.success('Nộp hồ sơ ứng tuyển thành công!');
    } catch (err: any) {
      console.error('Lỗi nộp hồ sơ ứng tuyển:', err);
      toast.error(err.message || 'Không thể gửi hồ sơ. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.successCard}>
          <div className={styles.successIconBadge}>
            <CheckCircle size={44} />
          </div>

          <h2 className={styles.successTitle}>
            Hồ Sơ Đã Được Gửi Thành Công!
          </h2>

          <p className={styles.successSubtitle}>
            Cảm ơn bạn đã quan tâm đến chương trình thực tập. Hồ sơ của bạn đã được chuyển tới bộ phận HR và đang ở trạng thái <strong>PENDING (Chờ thẩm định)</strong>.
          </p>

          {internCodeResult && (
            <div className={styles.successCodeWrapper}>
              <span className={styles.successCodeLabel}>Mã Thực Tập Sinh:</span>
              <strong className={styles.successCodeValue}>
                {internCodeResult}
              </strong>
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={() => navigate(ROUTES.INTERN.DASHBOARD)}
              className={styles.submitBtn}
              style={{ margin: '0 auto' }}
            >
              <span>Về Cổng Thực Tập Sinh (Dashboard)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Breadcrumb Navigation */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to={ROUTES.ROOT} className={styles.breadcrumbLink}>
          Trang Chủ
        </Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <Link to={ROUTES.INTERN.DASHBOARD} className={styles.breadcrumbLink}>
          Cổng Thực Tập Sinh
        </Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>Nộp Hồ Sơ Ứng Tuyển</span>
      </nav>

      {/* Page Header */}
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <GraduationCap size={32} style={{ color: 'var(--primary, #4f46e5)' }} />
          Đơn Ứng Tuyển Thực Tập Sinh Doanh Nghiệp
        </h1>
        <p className={styles.pageSubtitle}>
          Thông tin cá nhân được tự động điền sẵn từ tài khoản đã đăng ký của bạn. Vui lòng cung cấp
          thông tin học vấn, nguyện vọng và tệp CV để Hội đồng Tuyển dụng xét duyệt.
        </p>
      </header>

      {/* Main Application Form */}
      <form onSubmit={handleSubmit} className={styles.formCard}>
        {/* Section 1: Thông tin cá nhân */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIconWrapper}>
              <UserIcon size={18} />
            </div>
            <h2 className={styles.sectionTitle}>1. Thông Tin Cá Nhân</h2>
          </div>
          <span className={styles.sectionSubtitle}>
            Đã đồng bộ hóa với tài khoản @{user?.username || 'user'}
          </span>

          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label htmlFor="fullName" className={styles.formLabel}>
                Họ và tên <span className={styles.requiredStar}>*</span>
                <span className={styles.prefilledBadge}>Tự điền</span>
              </label>
              <input
                id="fullName"
                type="text"
                required
                className={styles.input}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>
                Email liên hệ <span className={styles.requiredStar}>*</span>
                <span className={styles.prefilledBadge}>Tự điền</span>
              </label>
              <input
                id="email"
                type="email"
                required
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="VD: nguyenvana@gmail.com"
              />
            </div>
          </div>

          <div className={styles.grid3}>
            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.formLabel}>
                Số điện thoại <span className={styles.requiredStar}>*</span>
                <span className={styles.prefilledBadge}>Tự điền</span>
              </label>
              <input
                id="phone"
                type="tel"
                required
                className={styles.input}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0987654321"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="dateOfBirth" className={styles.formLabel}>
                Ngày sinh
              </label>
              <input
                id="dateOfBirth"
                type="date"
                className={styles.input}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="gender" className={styles.formLabel}>
                Giới tính
              </label>
              <select
                id="gender"
                className={styles.select}
                value={gender}
                onChange={(e) => setGender(e.target.value as GenderType)}
              >
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address" className={styles.formLabel}>
              Địa chỉ cư trú hiện tại
            </label>
            <input
              id="address"
              type="text"
              className={styles.input}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="VD: Quận Cầu Giấy, TP. Hà Nội"
            />
          </div>
        </section>

        {/* Section 2: Học vấn & Vị trí ứng tuyển */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIconWrapper}>
              <GraduationCap size={18} />
            </div>
            <h2 className={styles.sectionTitle}>2. Thông Tin Học Vấn & Vị Trí Ứng Tuyển</h2>
          </div>

          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label htmlFor="university" className={styles.formLabel}>
                Trường Đại Học / Cao Đẳng <span className={styles.requiredStar}>*</span>
              </label>
              <input
                id="university"
                type="text"
                required
                className={styles.input}
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="VD: Đại Học Bách Khoa Hà Nội, ĐHQG..."
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="major" className={styles.formLabel}>
                Chuyên ngành đào tạo <span className={styles.requiredStar}>*</span>
              </label>
              <input
                id="major"
                type="text"
                required
                className={styles.input}
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="VD: Công Nghệ Thông Tin, Kỹ Thuật Phần Mềm..."
              />
            </div>
          </div>

          <div className={styles.grid3}>
            <div className={styles.formGroup}>
              <label htmlFor="academicYear" className={styles.formLabel}>
                Niên khóa đào tạo
              </label>
              <input
                id="academicYear"
                type="text"
                className={styles.input}
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="VD: 2022 - 2026"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="appliedPosition" className={styles.formLabel}>
                Vị trí ứng tuyển <span className={styles.requiredStar}>*</span>
              </label>
              <select
                id="appliedPosition"
                className={styles.select}
                value={appliedPosition}
                onChange={(e) => setAppliedPosition(e.target.value)}
              >
                <option value="Thực Tập Sinh Backend">Thực Tập Sinh Backend (Java / Spring)</option>
                <option value="Thực Tập Sinh Frontend">Thực Tập Sinh Frontend (React / TypeScript)</option>
                <option value="Thực Tập Sinh Fullstack">Thực Tập Sinh Fullstack</option>
                <option value="Thực Tập Sinh AI & Data">Thực Tập Sinh AI & Data Science</option>
                <option value="Thực Tập Sinh QA/QC">Thực Tập Sinh QA / QC</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="startDate" className={styles.formLabel}>
                Ngày dự kiến bắt đầu <span className={styles.requiredStar}>*</span>
              </label>
              <input
                id="startDate"
                type="date"
                required
                className={styles.input}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Section 3: Hồ sơ đính kèm & Nguyện vọng */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIconWrapper}>
              <Paperclip size={18} />
            </div>
            <h2 className={styles.sectionTitle}>3. Tệp Đính Kèm (CV) & Nguyện Vọng</h2>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Tệp CV / Sơ yếu lý lịch (Định dạng PDF, Word tối đa 10MB)
            </label>

            {!cvFile ? (
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`${styles.dropzone} ${isDragOver ? styles.dropzoneDragOver : ''}`}
              >
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  className="hidden"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <UploadCloud size={32} className={styles.dropzoneIcon} />
                <span className={styles.dropzoneText}>
                  Kéo thả tệp CV vào đây hoặc bấm để chọn tệp từ máy tính
                </span>
                <span className={styles.dropzoneHint}>
                  Chấp nhận các định dạng tài liệu: .PDF, .DOCX, .DOC (Tối đa 10MB)
                </span>
              </label>
            ) : (
              <div className={styles.filePreviewCard}>
                <div className={styles.fileInfo}>
                  <FileText size={24} style={{ color: '#818cf8' }} />
                  <div>
                    <div className={styles.fileName}>{cvFile.name}</div>
                    <div className={styles.fileSize}>
                      {(cvFile.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCvFile(null)}
                  className={styles.removeFileBtn}
                  title="Xóa tệp đã chọn"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="notes" className={styles.formLabel}>
              Ghi chú nguyện vọng gửi đến Hội đồng Tuyển dụng
            </label>
            <textarea
              id="notes"
              className={styles.textarea}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Mong muốn thực tập toàn thời gian, tham gia dự án thực tế về Microservices hoặc phát triển hệ thống..."
            />
          </div>
        </section>

        {/* Footer Actions */}
        <div className={styles.actionsFooter}>
          <Link to={ROUTES.INTERN.DASHBOARD} className={styles.backBtn}>
            <ArrowLeft size={16} />
            <span>Quay Lại Dashboard</span>
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitBtn}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Đang Xử Lý Gửi Hồ Sơ...</span>
              </>
            ) : (
              <>
                <span>Xác Nhận Nộp Hồ Sơ Ứng Tuyển</span>
                <Send size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InternApplyPage;
