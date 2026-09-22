import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { useAuth } from '../../contexts/AuthContext';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [university, setUniversity] = useState('Đại Học Bách Khoa');
  const [major, setMajor] = useState('Khoa Học Máy Tính');
  const [gpa, setGpa] = useState('3.6');
  const [cvFile, setCvFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ internCode: string; name: string } | null>(null);

  const { demoLogin } = useAuth();
  const navigate = useNavigate();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Tạo hồ sơ thực tập sinh (TM-1)
      const profile = await internService.createIntern({
        fullName,
        email,
        phone,
        university,
        major,
        gpa: parseFloat(gpa) || undefined,
      });

      // 2. Tải lên tệp CV (TM-4) nếu có
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

  const handleAccessInternPortal = () => {
    demoLogin('intern');
    navigate('/intern/dashboard');
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
            <button
              onClick={handleAccessInternPortal}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              <Sparkles size={16} />
              <span>Truy Cập Ngay Không Gian Thực Tập Sinh</span>
            </button>

            <Link
              to="/login"
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              Về Trang Đăng Nhập
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
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', marginBottom: '0.35rem' }}>
              Ứng Tuyển Thực Tập Sinh
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.825rem' }}>
              Điền thông tin và đính kèm CV để tham gia kỳ thực tập doanh nghiệp tại InternHub.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 p-3 mb-4 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Họ và tên */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Họ và tên <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="sinhvien@edu.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Số điện thoại <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="0912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* University & GPA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Trường Đại Học
                  </label>
                  <select
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                  >
                    <option value="Đại Học Bách Khoa">ĐH Bách Khoa</option>
                    <option value="Đại Học Quốc Gia">ĐH Quốc Gia</option>
                    <option value="Đại Học FPT">ĐH FPT</option>
                    <option value="Đại Học Kinh Tế Quốc Dân">ĐH Kinh Tế Quốc Dân</option>
                    <option value="Học Viện Bưu Chính Viễn Thông">HV Bưu Chính Viễn Thông</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Điểm GPA (Thang 4.0)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.0"
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="3.5"
                    value={gpa}
                    onChange={(e) => setGpa(e.target.value)}
                  />
                </div>
              </div>

              {/* Major */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chuyên ngành
                </label>
                <input
                  type="text"
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Khoa Học Máy Tính, KTPM..."
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                />
              </div>

              {/* CV Upload Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tải lên CV (PDF / DOCX, tối đa 5MB)
                </label>
                <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-xl bg-slate-800/50 hover:bg-slate-800/80 cursor-pointer transition-all duration-150">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    disabled={loading}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {cvFile ? (
                    <div className="flex items-center gap-2.5 text-indigo-400">
                      <FileText size={24} />
                      <div className="text-left">
                        <p className="text-xs font-semibold text-white truncate max-w-xs">
                          {cvFile.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {(cvFile.size / (1024 * 1024)).toFixed(2)} MB · Nhấp để chọn lại
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={28} className="text-indigo-400 mb-1.5" />
                      <p className="text-xs font-semibold text-slate-200">
                        Kéo thả hoặc nhấp để chọn tệp CV
                      </p>
                      <span className="text-[11px] text-slate-500 mt-0.5">
                        Hỗ trợ định dạng PDF, DOCX (tối đa 5MB)
                      </span>
                    </>
                  )}
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 cursor-pointer pt-3"
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
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
