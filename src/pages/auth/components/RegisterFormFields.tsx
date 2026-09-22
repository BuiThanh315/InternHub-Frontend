import React from 'react';
import { UploadCloud, FileText } from 'lucide-react';

import styles from '../RegisterPage.module.css';

export interface RegisterFormData {
  fullName: string;
  email: string;
  phone: string;
  university: string;
  major: string;
  appliedPosition: string;
  startDate: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  academicYear: string;
}

interface RegisterFormFieldsProps {
  formData: RegisterFormData;
  updateField: (field: keyof RegisterFormData, value: string) => void;
  cvFile: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RegisterFormFields: React.FC<RegisterFormFieldsProps> = ({
  formData,
  updateField,
  cvFile,
  onFileChange,
}) => {
  return (
    <div className={styles.formGrid}>
      <div className={styles.formGroup}>
        <label className={styles.label}>
          Họ và Tên <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          required
          placeholder="Nguyễn Văn A"
          value={formData.fullName}
          onChange={(e) => updateField('fullName', e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          Email Liên Hệ <span className={styles.required}>*</span>
        </label>
        <input
          type="email"
          required
          placeholder="candidate@gmail.com"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          Số Điện Thoại <span className={styles.required}>*</span>
        </label>
        <input
          type="tel"
          required
          placeholder="0912345678"
          value={formData.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Giới Tính</label>
        <select
          value={formData.gender}
          onChange={(e) => updateField('gender', e.target.value as 'MALE' | 'FEMALE' | 'OTHER')}
          className={styles.select}
        >
          <option value="MALE">Nam</option>
          <option value="FEMALE">Nữ</option>
          <option value="OTHER">Khác</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Trường Đại Học</label>
        <input
          type="text"
          value={formData.university}
          onChange={(e) => updateField('university', e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Chuyên Ngành</label>
        <input
          type="text"
          value={formData.major}
          onChange={(e) => updateField('major', e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          Vị Trí Ứng Tuyển <span className={styles.required}>*</span>
        </label>
        <select
          value={formData.appliedPosition}
          onChange={(e) => updateField('appliedPosition', e.target.value)}
          className={styles.select}
        >
          <option value="Thực tập sinh Backend (Java/Spring)">Backend (Java/Spring Boot)</option>
          <option value="Thực tập sinh Frontend (React/TypeScript)">Frontend (React/TypeScript)</option>
          <option value="Thực tập sinh Fullstack (Java/React)">Fullstack (Java/React)</option>
          <option value="Thực tập sinh QA/Tester">QA / Tester Automation</option>
          <option value="Thực tập sinh DevOps/Cloud">DevOps / Cloud</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          Ngày Bắt Đầu Dự Kiến <span className={styles.required}>*</span>
        </label>
        <input
          type="date"
          required
          value={formData.startDate}
          onChange={(e) => updateField('startDate', e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.fullWidth}>
        <label className={styles.label}>Đính Kèm CV Ứng Tuyển (PDF / Word, Tối đa 5MB)</label>
        <label className={styles.uploadBox}>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={onFileChange}
            className={styles.fileInput}
          />
          {cvFile ? (
            <div>
              <FileText size={28} color="var(--primary)" />
              <p className={styles.uploadText}>{cvFile.name}</p>
              <p className={styles.uploadHint}>
                {(cvFile.size / (1024 * 1024)).toFixed(2)} MB - Nhấn để chọn tệp khác
              </p>
            </div>
          ) : (
            <div>
              <UploadCloud size={28} color="var(--text-muted)" />
              <p className={styles.uploadText}>Kéo thả hoặc nhấn vào đây để tải CV lên</p>
              <p className={styles.uploadHint}>Định dạng hỗ trợ: PDF, DOC, DOCX (Dưới 5MB)</p>
            </div>
          )}
        </label>
      </div>
    </div>
  );
};

export default RegisterFormFields;
