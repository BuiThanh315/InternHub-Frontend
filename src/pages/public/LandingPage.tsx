import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Search,
  LogIn,
} from 'lucide-react';
import { internService } from '../../services/internService';
import { documentService } from '../../services/documentService';
import type { DocumentType } from '../../types';

export const LandingPage: React.FC = () => {
  // Tab state: 'new' = nộp hồ sơ ứng tuyển mới, 'existing' = bổ sung tài liệu theo mã TTS
  const [activeTab, setActiveTab] = useState<'new' | 'existing'>('new');

  // Form state: Ứng tuyển mới
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [university, setUniversity] = useState('Đại Học Bách Khoa');
  const [major, setMajor] = useState('Khoa Học Máy Tính');
  const [appliedPosition, setAppliedPosition] = useState('Thực Tập Sinh Backend');
  const [newFile, setNewFile] = useState<File | null>(null);

  // Form state: Bổ sung tài liệu vào mã TTS đã có (TM-4 Public)
  const [existingCode, setExistingCode] = useState('');
  const [existingDocType, setExistingDocType] = useState<DocumentType>('CV');
  const [existingFile, setExistingFile] = useState<File | null>(null);

  // Status state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    title: string;
    description: string;
    internCode: string;
  } | null>(null);

  // Xử lý nộp hồ sơ ứng tuyển mới (TM-1 + TM-4)
  const handleApplyNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ Họ tên, Email và Số điện thoại');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      // 1. Tạo hồ sơ thực tập sinh qua API
      const profile = await internService.createIntern({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        university: university.trim(),
        major: major.trim(),
        appliedPosition,
      });

      // 2. Nếu có đính kèm file CV / Đơn, gọi API upload TM-4
      if (newFile && profile.internCode) {
        await documentService.uploadDocument(profile.internCode, newFile, 'CV');
      }

      setSuccessInfo({
        title: 'Nộp Hồ Sơ Ứng Tuyển Thành Công!',
        description: `Hồ sơ của bạn đã được ghi nhận vào hệ thống InternHub. Vui lòng lưu lại Mã TTS này để tra cứu lộ trình và nộp bổ sung tài liệu khi cần.`,
        internCode: profile.internCode,
      });

      // Reset form
      setFullName('');
      setEmail('');
      setPhone('');
      setNewFile(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi nộp hồ sơ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý upload bổ sung tài liệu không cần đăng nhập (TM-4 Public)
  const handleUploadExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingCode.trim()) {
      setErrorMsg('Vui lòng nhập Mã Thực Tập Sinh (VD: INT-2026-001)');
      return;
    }
    if (!existingFile) {
      setErrorMsg('Vui lòng chọn tệp tin cần tải lên');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const res = await documentService.uploadDocument(
        existingCode.trim(),
        existingFile,
        existingDocType
      );

      setSuccessInfo({
        title: 'Tải Lên Tài Liệu Thành Công!',
        description: `Tài liệu "${res.fileName || existingFile.name}" đã được tải lên thành công cho hồ sơ ${existingCode.trim()}. Bộ phận HR sẽ xem xét thẩm định trong thời gian sớm nhất.`,
        internCode: existingCode.trim(),
      });

      setExistingFile(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể tải lên tài liệu. Vui lòng kiểm tra lại Mã TTS.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-white selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-150px] left-[-100px] w-[550px] h-[550px] bg-[radial-gradient(circle,rgba(99,102,241,0.25)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-[30%] right-[-150px] w-[650px] h-[650px] bg-[radial-gradient(circle,rgba(14,165,233,0.18)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(168,85,247,0.15)_0%,transparent_70%)] pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-20 border-b border-white/10 backdrop-blur-md bg-[#0b1120]/70 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
              <Building2 size={22} className="text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                InternHub
              </span>
              <span className="text-[10px] block text-indigo-300 font-semibold tracking-wider uppercase">
                Enterprise Talent Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#apply-form"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-white/10 hover:bg-white/15 transition-all border border-white/10"
            >
              Nộp Hồ Sơ Trực Tuyến
            </a>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-500/25 transition-all"
            >
              <LogIn size={14} />
              <span>Đăng Nhập Cổng Nội Bộ</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-12 lg:pt-24 lg:pb-16 max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles size={14} />
          <span>Cổng Nộp Hồ Sơ Thực Tập Trực Tuyến 2026 · Hoàn Toàn Miễn Phí</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-4xl mx-auto">
          Khởi Đầu Sự Nghiệp Cùng <br />
          <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
            InternHub Enterprise
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Ứng viên và sinh viên có thể <strong>nộp CV, Đơn xin thực tập và bảng điểm trực tuyến ngay lập tức</strong> mà không cần tạo tài khoản hay đăng nhập.
        </p>

        {/* Feature Badges */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {[
            { icon: <UploadCloud size={16} className="text-sky-400" />, label: 'Không Cần Đăng Nhập' },
            { icon: <ShieldCheck size={16} className="text-emerald-400" />, label: 'Bảo Mật Chuẩn Doanh Nghiệp' },
            { icon: <GraduationCap size={16} className="text-indigo-400" />, label: 'Cấp Mã TTS Ngay' },
            { icon: <Briefcase size={16} className="text-amber-400" />, label: 'HR Phê Duyệt Nhanh' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200"
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Main Form Section (TM-4 / TM-1) */}
      <section id="apply-form" className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl p-6 sm:p-8">
          {/* Tab Selector */}
          <div className="flex border-b border-slate-800 mb-6">
            <button
              onClick={() => {
                setActiveTab('new');
                setErrorMsg(null);
                setSuccessInfo(null);
              }}
              className={`flex-1 pb-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'new'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase size={16} />
              <span>1. Ứng Tuyển Mới & Nộp CV</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('existing');
                setErrorMsg(null);
                setSuccessInfo(null);
              }}
              className={`flex-1 pb-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'existing'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <UploadCloud size={16} />
              <span>2. Bổ Sung Tài Liệu (Có sẵn mã TTS)</span>
            </button>
          </div>

          {/* Success Banner */}
          {successInfo && (
            <div className="mb-6 p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={24} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-white">{successInfo.title}</h4>
                  <p className="text-xs text-emerald-200 leading-relaxed">
                    {successInfo.description}
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 font-mono text-xs font-bold text-emerald-300">
                    <span>Mã TTS của bạn:</span>
                    <strong className="text-white text-sm">{successInfo.internCode}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle size={18} className="shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: ỨNG TUYỂN MỚI */}
          {activeTab === 'new' && (
            <form onSubmit={handleApplyNew} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Họ và tên ứng viên <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-950/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email liên hệ <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="VD: nguyenvana@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-950/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Số điện thoại <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-950/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Vị trí ứng tuyển
                  </label>
                  <select
                    value={appliedPosition}
                    onChange={(e) => setAppliedPosition(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-950/60 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Thực Tập Sinh Backend">Thực Tập Sinh Backend (Java / Spring)</option>
                    <option value="Thực Tập Sinh Frontend">Thực Tập Sinh Frontend (React / TypeScript)</option>
                    <option value="Thực Tập Sinh Fullstack">Thực Tập Sinh Fullstack</option>
                    <option value="Thực Tập Sinh AI & Data">Thực Tập Sinh AI & Data Science</option>
                    <option value="Thực Tập Sinh QA/QC">Thực Tập Sinh QA / QC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Trường Đại Học / Cao Đẳng
                  </label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-950/60 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Chuyên ngành
                  </label>
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-950/60 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Upload Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Đính kèm CV / Sơ yếu lý lịch (PDF, DOCX tối đa 5MB)
                </label>
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl bg-slate-950/40 hover:bg-slate-950/60 cursor-pointer transition-colors text-center">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNewFile(e.target.files[0]);
                      }
                    }}
                  />
                  {newFile ? (
                    <div>
                      <FileText size={28} className="text-indigo-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-white">{newFile.name}</p>
                      <span className="text-[11px] text-slate-400">
                        {(newFile.size / (1024 * 1024)).toFixed(2)} MB · Bấm để đổi tệp khác
                      </span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={28} className="text-indigo-400 mb-2" />
                      <p className="text-xs font-semibold text-white">
                        Kéo thả tệp hoặc bấm để chọn CV của bạn
                      </p>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        Hỗ trợ PDF, Word (.docx) tối đa 5MB
                      </span>
                    </>
                  )}
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Đang Xử Lý Nộp Hồ Sơ...' : 'Nộp Hồ Sơ Ứng Tuyển & CV Ngay'}
              </button>
            </form>
          )}

          {/* TAB 2: BỔ SUNG TÀI LIỆU VÀO MÃ TTS ĐÃ CÓ (TM-4 PUBLIC) */}
          {activeTab === 'existing' && (
            <form onSubmit={handleUploadExisting} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mã Thực Tập Sinh Đã Cấp <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="VD: INT-2026-001 hoặc INT-202609-0001"
                    value={existingCode}
                    onChange={(e) => setExistingCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-950/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <Search size={16} className="absolute right-3 top-3 text-slate-400" />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Mã được cung cấp khi bạn nộp hồ sơ hoặc nhận từ email của HR.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Loại tài liệu cần bổ sung (TM-4)
                </label>
                <select
                  value={existingDocType}
                  onChange={(e) => setExistingDocType(e.target.value as DocumentType)}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-950/60 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="CV">CV / Sơ Yếu Lý Lịch Cập Nhật</option>
                  <option value="INTERNSHIP_APPLICATION">Đơn Xin Thực Tập (Có dấu nhà trường)</option>
                  <option value="TRANSCRIPT">Bảng Điểm Tích Lũy</option>
                  <option value="RECOMMENDATION_LETTER">Giấy Giới Thiệu Từ Trường</option>
                  <option value="OTHER">Tài Liệu Khác</option>
                </select>
              </div>

              {/* Upload Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chọn tệp tin (PDF, DOCX tối đa 5MB)
                </label>
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl bg-slate-950/40 hover:bg-slate-950/60 cursor-pointer transition-colors text-center">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setExistingFile(e.target.files[0]);
                      }
                    }}
                  />
                  {existingFile ? (
                    <div>
                      <FileText size={28} className="text-indigo-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-white">{existingFile.name}</p>
                      <span className="text-[11px] text-slate-400">
                        {(existingFile.size / (1024 * 1024)).toFixed(2)} MB · Bấm để đổi tệp khác
                      </span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={28} className="text-indigo-400 mb-2" />
                      <p className="text-xs font-semibold text-white">
                        Bấm để chọn tệp tài liệu cần nộp
                      </p>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        Hỗ trợ PDF, DOCX tối đa 5MB (TM-4 Public Endpoint)
                      </span>
                    </>
                  )}
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !existingFile}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-violet-600 hover:from-sky-500 hover:to-violet-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Đang Tải Lên Hệ Thống...' : 'Tải Lên Tài Liệu Ngay (Không Cần Đăng Nhập)'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 InternHub Enterprise Portal. Giải pháp Quản trị Thực tập sinh toàn diện.</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-white transition-colors">
              Cổng Quản Trị
            </Link>
            <a href="#apply-form" className="hover:text-white transition-colors">
              Nộp CV & Hồ Sơ
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
