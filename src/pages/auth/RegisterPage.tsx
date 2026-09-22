import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { internService } from '../../services/internService';
import { documentService } from '../../services/documentService';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [university, setUniversity] = useState('Đại Học Bách Khoa');
  const [major, setMajor] = useState('Khoa Học Máy Tính');
  const [appliedPosition, setAppliedPosition] = useState('Thực tập sinh Backend (Java/Spring)');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [academicYear, setAcademicYear] = useState('2022-2026');
  const [cvFile, setCvFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ internCode: string; name: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('Tệp CV vượt quá dung lượng cho phép (tối đa 5MB)');
        return;
      }
      setCvFile(file);
      setError(null);
    }
  };

  const handleFillSampleData = () => {
    const randomNum = Math.floor(Math.random() * 9000 + 1000);
    setFullName('Đặng Hoàng Lan');
    setEmail(`lan.dang${randomNum}@gmail.com`);
    setPhone(`09${Math.floor(Math.random() * 90000000 + 10000000)}`);
    setUniversity('Đại Học Quốc Gia');
    setMajor('Khoa Học Dữ Liệu & Trí Tuệ Nhân Tạo');
    setAppliedPosition('Thực tập sinh Frontend (React/TypeScript)');
    setGender('FEMALE');
    setAcademicYear('2022-2026');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !appliedPosition.trim() || !startDate) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    // Kiểm tra định dạng số điện thoại Việt Nam chuẩn 10 chữ số
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(phone.trim())) {
      setError('Số điện thoại phải gồm 10 chữ số hợp lệ theo định dạng Việt Nam (bắt đầu bằng 03, 05, 07, 08, 09)');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Tạo hồ sơ thực tập sinh (TM-1) gọi Axios POST /api/employees/interns
      const profile = await internService.createIntern({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        university: university.trim(),
        major: major.trim(),
        appliedPosition: appliedPosition.trim(),
        startDate,
        gender,
        academicYear: academicYear.trim(),
      });

      // 2. Tải lên tệp CV (TM-4) nếu có qua Axios POST multipart
      if (cvFile && profile.internCode) {
        await documentService.uploadDocument(profile.internCode, cvFile, 'CV');
      }

      setSuccessData({ internCode: profile.internCode, name: profile.fullName });
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi nộp hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {successData ? (
        /* Success Screen */
        <div style={{
          backgroundColor: 'rgba(30, 41, 59, 0.9)',
          border: '1px solid #334155',
          borderRadius: '16px',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}>
            <CheckCircle2 size={36} />
          </div>

          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
            Nộp Hồ Sơ Thành Công!
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Hồ sơ ứng tuyển của <strong>{successData.name}</strong> đã được lưu trên hệ thống InternHub.
          </p>

          <div style={{
            backgroundColor: '#1e293b',
            border: '1px dashed #4f46e5',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.5rem',
          }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Mã Thực Tập Sinh Của Bạn
            </span>
            <div style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: '#818cf8',
              letterSpacing: '0.05em',
              marginTop: '0.25rem',
            }}>
              {successData.internCode}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.4rem 0 0' }}>
              (Hãy lưu lại mã này để tra cứu và nộp thêm tài liệu thẩm định)
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link
              to="/login"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <span>Về Trang Đăng Nhập Để Tiếp Tục</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Form Screen */
        <div>
          {/* Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#94a3b8',
                fontSize: '0.8rem',
                marginBottom: '0.75rem',
              }}
            >
              <ArrowLeft size={14} /> Về trang đăng nhập
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', marginBottom: '0.35rem' }}>
                  Ứng Tuyển Thực Tập Sinh
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.825rem', margin: 0 }}>
                  Điền thông tin và đính kèm CV để tham gia kỳ thực tập doanh nghiệp tại InternHub.
                </p>
              </div>
              <button
                type="button"
                onClick={handleFillSampleData}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  border: '1px solid #6366f1',
                  color: '#a5b4fc',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Sparkles size={13} /> Điền Mẫu Nhanh
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: '#fca5a5',
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#cbd5e1' }}>Họ và tên *</label>
              <input
                type="text"
                className="form-input"
                style={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                placeholder="Nguyễn Văn A"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#cbd5e1' }}>Email *</label>
                <input
                  type="email"
                  className="form-input"
                  style={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  placeholder="sinhvien@edu.vn"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#cbd5e1' }}>Số điện thoại *</label>
                <input
                  type="tel"
                  className="form-input"
                  style={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  placeholder="0912345678"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#cbd5e1' }}>Trường Đại Học *</label>
                <select
                  className="form-select"
                  style={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                >
                  <option value="Đại Học Bách Khoa">ĐH Bách Khoa</option>
                  <option value="Đại Học Quốc Gia">ĐH Quốc Gia</option>
                  <option value="Đại Học FPT">ĐH FPT</option>
                  <option value="Đại Học Kinh Tế Quốc Dân">ĐH Kinh Tế Quốc Dân</option>
                  <option value="Học Viện Bưu Chính Viễn Thông">HV Bưu Chính Viễn Thông</option>
                  <option value="Đại Học Công Nghệ">ĐH Công Nghệ - ĐHQGHN</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#cbd5e1' }}>Giới tính</label>
                <select
                  className="form-select"
                  style={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#cbd5e1' }}>Chuyên ngành *</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  placeholder="Khoa Học Máy Tính, KTPM..."
                  required
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#cbd5e1' }}>Niên khóa</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  placeholder="2022-2026"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#cbd5e1' }}>Vị trí thực tập *</label>
                <select
                  className="form-select"
                  style={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  value={appliedPosition}
                  onChange={(e) => setAppliedPosition(e.target.value)}
                  required
                >
                  <option value="Thực tập sinh Backend (Java/Spring)">Backend (Java/Spring)</option>
                  <option value="Thực tập sinh Frontend (React/TypeScript)">Frontend (React/TypeScript)</option>
                  <option value="Thực tập sinh Fullstack">Fullstack Developer</option>
                  <option value="Thực tập sinh QA/QC Tester">QA/QC Tester</option>
                  <option value="Thực tập sinh DevOps/Cloud">DevOps / Cloud</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#cbd5e1' }}>Ngày bắt đầu *</label>
                <input
                  type="date"
                  className="form-input"
                  style={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            {/* CV Upload Dropzone */}
            <div className="form-group">
              <label className="form-label" style={{ color: '#cbd5e1' }}>Tải lên CV (PDF / DOCX, tối đa 5MB)</label>
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.25rem',
                  border: '2px dashed #475569',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                {cvFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#818cf8' }}>
                    <FileText size={24} />
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, color: '#fff' }}>
                        {cvFile.name}
                      </p>
                      <p style={{ fontSize: '0.725rem', color: '#94a3b8', margin: 0 }}>
                        {(cvFile.size / (1024 * 1024)).toFixed(2)} MB - Nhấp để chọn lại
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <UploadCloud size={28} color="#818cf8" style={{ marginBottom: '0.35rem' }} />
                    <p style={{ fontSize: '0.825rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
                      Kéo thả hoặc nhấp để chọn tệp CV
                    </p>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Hỗ trợ định dạng PDF, DOCX (tối đa 5MB)</span>
                  </>
                )}
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}
            >
              {loading ? (
                'Đang gửi hồ sơ...'
              ) : (
                <>
                  <GraduationCap size={18} />
                  <span>Gửi Hồ Sơ Ứng Tuyển</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
