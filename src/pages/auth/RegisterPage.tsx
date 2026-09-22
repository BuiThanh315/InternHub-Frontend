import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Sparkles } from 'lucide-react';

import { Button } from '../../components/common/Button/Button';
import { Alert } from '../../components/common/Alert/Alert';
import {
  RegisterSuccessCard,
  RegisterFormFields,
  type RegisterFormData,
} from './components';
import { internService } from '../../services/internService';
import { documentService } from '../../services/documentService';
import styles from './RegisterPage.module.css';

const getInitialStartDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
};

const INITIAL_FORM: RegisterFormData = {
  fullName: '',
  email: '',
  phone: '',
  university: 'Đại Học Bách Khoa',
  major: 'Khoa Học Máy Tính',
  appliedPosition: 'Thực tập sinh Backend (Java/Spring)',
  startDate: getInitialStartDate(),
  gender: 'MALE',
  academicYear: '2022-2026',
};

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>(INITIAL_FORM);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ internCode: string; name: string } | null>(null);

  const updateField = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Tệp CV vượt quá dung lượng cho phép (tối đa 5MB)');
        return;
      }
      setCvFile(file);
      setErrorMessage(null);
    }
  };

  const handleFillSampleData = () => {
    const randomNum = Math.floor(Math.random() * 9000 + 1000);
    setFormData({
      fullName: 'Đặng Hoàng Lan',
      email: `lan.dang${randomNum}@gmail.com`,
      phone: `09${Math.floor(Math.random() * 90000000 + 10000000)}`,
      university: 'Đại Học Quốc Gia',
      major: 'Khoa Học Dữ Liệu & Trí Tuệ Nhân Tạo',
      appliedPosition: 'Thực tập sinh Frontend (React/TypeScript)',
      startDate: getInitialStartDate(),
      gender: 'FEMALE',
      academicYear: '2022-2026',
    });
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.appliedPosition.trim() || !formData.startDate) {
      setErrorMessage('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      setErrorMessage('Số điện thoại phải gồm 10 chữ số hợp lệ theo định dạng Việt Nam (bắt đầu bằng 03, 05, 07, 08, 09)');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const profile = await internService.createIntern({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        university: formData.university.trim(),
        major: formData.major.trim(),
        appliedPosition: formData.appliedPosition.trim(),
        startDate: formData.startDate,
        gender: formData.gender,
        academicYear: formData.academicYear.trim(),
      });

      if (cvFile && profile.internCode) {
        await documentService.uploadDocument(profile.internCode, cvFile, 'CV');
      }

      setSuccessData({ internCode: profile.internCode, name: profile.fullName });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi nộp hồ sơ';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className={`animate-fade-in ${styles.container}`}>
        <RegisterSuccessCard internCode={successData.internCode} name={successData.name} />
      </div>
    );
  }

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <div className={styles.headerRow}>
        <Link to="/login" className={styles.backLink}>
          <ArrowLeft size={16} /> Quay lại đăng nhập
        </Link>
        <Button variant="outline" size="sm" onClick={handleFillSampleData}>
          <Sparkles size={14} /> Điền Dữ Liệu Mẫu
        </Button>
      </div>

      <div className={styles.titleBox}>
        <h2 className={styles.mainTitle}>
          <GraduationCap size={28} color="var(--primary)" />
          Đăng Ký Thực Tập Sinh
        </h2>
        <p className={styles.subtitle}>
          Điền thông tin và nộp CV để gia nhập chương trình phát triển tài năng trẻ
        </p>
      </div>

      {errorMessage && (
        <Alert
          type="error"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
          className="mb-4"
        />
      )}

      <form onSubmit={handleSubmit} className="card">
        <RegisterFormFields
          formData={formData}
          updateField={updateField}
          cvFile={cvFile}
          onFileChange={handleFileChange}
        />

        <div className={styles.submitBtn}>
          <Button variant="primary" size="lg" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Đang Nộp Hồ Sơ...' : 'Xác Nhận & Nộp Hồ Sơ Ứng Tuyển'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
