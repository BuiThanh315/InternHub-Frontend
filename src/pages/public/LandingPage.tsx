import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  UserPlus,
  ArrowRight,
  Code2,
  Database,
  Layers,
  Cpu,
  CheckSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { documentService } from '../../services/documentService';
import { programService } from '../../services/programService';
import { LoginModal } from '../../components/auth/LoginModal';
import { RegisterModal } from '../../components/auth/RegisterModal';
import { AccountActivationModal } from '../../components/auth/AccountActivationModal';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants/routes';
import type { DocumentType, ProgramSummaryResponse } from '../../types';

interface InternshipPosition {
  id: string;
  title: string;
  department: string;
  badgeColor: string;
  icon: React.ReactNode;
  tags: string[];
  description: string;
  slots: number;
}

const POSITIONS: InternshipPosition[] = [
  {
    id: 'backend',
    title: 'Thực Tập Sinh Backend (Java / Spring)',
    department: 'Software Engineering',
    badgeColor: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300',
    icon: <Database size={20} className="text-indigo-400" />,
    tags: ['Java 17', 'Spring Boot 3', 'PostgreSQL', 'Microservices', 'Redis'],
    description:
      'Thiết kế RESTful API chuẩn doanh nghiệp, tối ưu hóa truy vấn CSDL và tham gia phát triển nghiệp vụ Backend trên nền Spring Boot.',
    slots: 5,
  },
  {
    id: 'frontend',
    title: 'Thực Tập Sinh Frontend (React / TypeScript)',
    department: 'UI/UX Engineering',
    badgeColor: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
    icon: <Code2 size={20} className="text-sky-400" />,
    tags: ['React 18', 'TypeScript', 'TailwindCSS', 'CSS Modules', 'Vite'],
    description:
      'Xây dựng các giao diện web hiện đại, chuẩn thẩm mỹ, tương tác mượt mà và tuân thủ các nguyên lý UI/UX chuyên sâu.',
    slots: 4,
  },
  {
    id: 'fullstack',
    title: 'Thực Tập Sinh Fullstack',
    department: 'Fullstack Product',
    badgeColor: 'border-violet-500/40 bg-violet-500/10 text-violet-300',
    icon: <Layers size={20} className="text-violet-400" />,
    tags: ['Spring Boot', 'React', 'Docker', 'REST API', 'CI/CD'],
    description:
      'Nắm bắt chu trình phát triển sản phẩm toàn diện từ kiến trúc cơ sở dữ liệu đến giao diện người dùng và triển khai container hóa.',
    slots: 3,
  },
  {
    id: 'ai-data',
    title: 'Thực Tập Sinh AI & Data Science',
    department: 'AI Research & Innovation',
    badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    icon: <Cpu size={20} className="text-emerald-400" />,
    tags: ['Python', 'PyTorch', 'LangChain', 'NLP', 'Data Pipeline'],
    description:
      'Khám phá ứng dụng AI thế hệ mới, xử lý dữ liệu quy mô lớn và thử nghiệm tích hợp các mô hình ngôn ngữ lớn (LLMs).',
    slots: 3,
  },
  {
    id: 'qa-qc',
    title: 'Thực Tập Sinh QA / QC',
    department: 'Quality Assurance',
    badgeColor: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    icon: <CheckSquare size={20} className="text-amber-400" />,
    tags: ['Manual Testing', 'Selenium', 'Postman', 'Test Plan', 'Bug Tracking'],
    description:
      'Thiết kế kịch bản kiểm thử, vận hành kiểm thử tự động, phân tích tài liệu đặc tả và đảm bảo chất lượng hệ thống trước khi release.',
    slots: 2,
  },
];

export const LandingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(
    () => searchParams.get('login') === 'true' || searchParams.get('expired') === 'true'
  );
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(
    () => searchParams.get('register') === 'true'
  );
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(
    () => searchParams.get('activate') === 'true'
  );
  const [activationIdentifier, setActivationIdentifier] = useState(
    () => searchParams.get('username') || searchParams.get('email') || ''
  );
  const [activationMaskedEmail, setActivationMaskedEmail] = useState('');
  const isExpired = searchParams.get('expired') === 'true';

  // State for public document supplement
  const [showSupplementCard, setShowSupplementCard] = useState(false);
  const [existingCode, setExistingCode] = useState('');
  const [existingDocType, setExistingDocType] = useState<DocumentType>('CV');
  const [existingFile, setExistingFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const [openPrograms, setOpenPrograms] = useState<ProgramSummaryResponse[]>([]);
  const [programsLoading, setProgramsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchOpenPrograms = async () => {
      try {
        setProgramsLoading(true);
        const data = await programService.getOpenPrograms();
        if (isMounted && data) {
          setOpenPrograms(data);
        }
      } catch (err) {
        console.error('Không thể nạp danh sách chương trình mở tuyển:', err);
      } finally {
        if (isMounted) {
          setProgramsLoading(false);
        }
      }
    };

    fetchOpenPrograms();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (searchParams.get('login') === 'true' || searchParams.get('expired') === 'true') {
      setIsLoginModalOpen(true);
    }
    if (searchParams.get('register') === 'true') {
      setIsRegisterModalOpen(true);
    }
    if (searchParams.get('activate') === 'true') {
      setIsActivationModalOpen(true);
      const userParam = searchParams.get('username') || searchParams.get('email');
      if (userParam) {
        setActivationIdentifier(userParam);
      }
    }
  }, [searchParams]);

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
    if (searchParams.get('login') || searchParams.get('expired')) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('login');
      nextParams.delete('expired');
      setSearchParams(nextParams, { replace: true });
    }
  };

  const handleCloseRegisterModal = () => {
    setIsRegisterModalOpen(false);
    if (searchParams.get('register')) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('register');
      setSearchParams(nextParams, { replace: true });
    }
  };

  const handleCloseActivationModal = () => {
    setIsActivationModalOpen(false);
    if (searchParams.get('activate') || searchParams.get('username') || searchParams.get('email')) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('activate');
      nextParams.delete('username');
      nextParams.delete('email');
      setSearchParams(nextParams, { replace: true });
    }
  };

  const handleOpenActivation = (identifier: string, maskedEmail?: string) => {
    setActivationIdentifier(identifier);
    if (maskedEmail) {
      setActivationMaskedEmail(maskedEmail);
    }
    handleCloseRegisterModal();
    handleCloseLoginModal();
    setIsActivationModalOpen(true);
  };

  const handleSwitchToRegister = () => {
    handleCloseLoginModal();
    handleCloseActivationModal();
    setIsRegisterModalOpen(true);
  };

  const handleSwitchToLogin = () => {
    handleCloseRegisterModal();
    handleCloseActivationModal();
    setIsLoginModalOpen(true);
  };

  const handleApplyAction = (programId?: number | React.MouseEvent) => {
    const validProgramId = typeof programId === 'number' ? programId : undefined;
    if (validProgramId) {
      sessionStorage.setItem('intended_program_id', String(validProgramId));
    }
    if (authUser) {
      navigate(ROUTES.INTERN.APPLY);
    } else {
      setIsRegisterModalOpen(true);
    }
  };

  const handleRegisterSuccess = () => {
    toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập để hoàn tất hồ sơ ứng tuyển.');
    handleCloseRegisterModal();
    setIsLoginModalOpen(true);
  };

  const handleUploadExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingCode.trim()) {
      setUploadError('Vui lòng nhập Mã Thực Tập Sinh đã cấp (VD: INT-2026-001)');
      return;
    }
    if (!existingFile) {
      setUploadError('Vui lòng chọn tệp tin cần tải lên');
      return;
    }

    try {
      setUploadLoading(true);
      setUploadError(null);

      const res = await documentService.uploadDocument(
        existingCode.trim(),
        existingFile,
        existingDocType
      );

      setUploadSuccess(
        `Tài liệu "${res.fileName || existingFile.name}" đã được tải lên thành công cho hồ sơ ${existingCode.trim()}.`
      );
      setExistingFile(null);
    } catch (err: any) {
      setUploadError(err.message || 'Không thể tải lên tài liệu. Vui lòng kiểm tra lại Mã TTS.');
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-white selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute -top-36 -left-24 w-128 h-128 bg-[radial-gradient(circle,rgba(99,102,241,0.22)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-[30%] -right-36 w-144 h-144 bg-[radial-gradient(circle,rgba(14,165,233,0.15)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute -bottom-24 left-[20%] w-128 h-128 bg-[radial-gradient(circle,rgba(168,85,247,0.12)_0%,transparent_70%)] pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-20 border-b border-white/10 backdrop-blur-md bg-[#0b1120]/75 sticky top-0">
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
            <button
              type="button"
              onClick={handleApplyAction}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600/30 hover:bg-indigo-600/50 transition-all border border-indigo-500/40 cursor-pointer"
            >
              <span>Nộp Hồ Sơ Trực Tuyến</span>
              <ArrowRight size={13} />
            </button>
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-white/10 hover:bg-white/15 transition-all border border-white/10 cursor-pointer"
            >
              <UserPlus size={14} />
              <span>Đăng Ký Tài Khoản</span>
            </button>
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
            >
              <LogIn size={14} />
              <span>Đăng Nhập Cổng Nội Bộ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-14 lg:pt-24 lg:pb-20 max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles size={14} />
          <span>Chương Trình Đào Tạo Thực Tập Sinh Công Nghệ 2026</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-4xl mx-auto">
          Khởi Đầu Sự Nghiệp Cùng <br />
          <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
            InternHub Enterprise
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Môi trường đào tạo thực chiến hàng đầu cho sinh viên công nghệ. Đăng ký tài khoản, nộp hồ sơ
          trực tuyến và nhận lộ trình kèm cặp 1-1 từ các Kỹ sư cấp cao.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <button
            type="button"
            onClick={handleApplyAction}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all cursor-pointer"
          >
            <span>Nộp Hồ Sơ Ứng Tuyển Ngay</span>
            <ArrowRight size={16} />
          </button>
          <a
            href="#positions"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white font-semibold text-sm border border-white/10 transition-all"
          >
            <Briefcase size={16} />
            <span>Xem Các Vị Trí Mở Tuyển</span>
          </a>
        </div>

        {/* Feature Badges */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {[
            { icon: <GraduationCap size={16} className="text-indigo-400" />, label: 'Đào Tạo Thực Chiến 1-1' },
            { icon: <ShieldCheck size={16} className="text-emerald-400" />, label: 'Hồ Sơ Chuẩn Doanh Nghiệp' },
            { icon: <UploadCloud size={16} className="text-sky-400" />, label: 'Cấp Mã Tra Cứu Ngay' },
            { icon: <Briefcase size={16} className="text-amber-400" />, label: 'Cơ Hội Nhân Viên Chính Thức' },
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

      {/* Positions Showcase Section (Replaced the old inline apply form) */}
      <section id="positions" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Vị Trí Mở Tuyển Thực Tập Sinh 2026
          </h2>
          <p className="mt-3 text-sm text-slate-400 max-w-2xl mx-auto">
            Lựa chọn chuyên ngành phù hợp với định hướng nghề nghiệp của bạn. Nhấp &ldquo;Ứng Tuyển Ngay&rdquo;
            để chuyển đến biểu mẫu nộp hồ sơ trực tuyến.
          </p>
        </div>

        {/* Positions / Programs Grid */}
        {(() => {
          if (programsLoading) {
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 animate-pulse h-64 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="h-6 w-24 bg-slate-800 rounded-full" />
                      <div className="h-6 w-3/4 bg-slate-800 rounded" />
                      <div className="h-4 w-full bg-slate-800/60 rounded" />
                    </div>
                    <div className="h-10 w-full bg-slate-800/80 rounded-xl" />
                  </div>
                ))}
              </div>
            );
          }

          if (openPrograms.length > 0) {
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {openPrograms.map((prog) => (
                  <div
                    key={prog.id}
                    className="bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                          <Building2 size={20} />
                        </div>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
                          {prog.maxInterns ? `${prog.maxInterns} Chỉ tiêu` : 'Đang mở tuyển'}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono text-indigo-400 font-semibold mb-1">
                        {prog.programCode}
                      </div>
                      <h3 className="text-base font-bold text-white mb-2 leading-snug">
                        {prog.name}
                      </h3>
                      <p className="text-xs text-slate-400 mb-4 leading-relaxed line-clamp-3">
                        {prog.description || 'Chương trình thực tập chuyên nghiệp với lộ trình đào tạo bài bản và người hướng dẫn tận tâm.'}
                      </p>

                      <div className="flex flex-wrap gap-2 text-xs text-slate-300 mb-6">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60">
                          Phòng: <strong className="text-white">{prog.departmentName || 'Chung'}</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60">
                          Thời lượng: <strong className="text-white">{prog.durationWeeks ? `${prog.durationWeeks} tuần` : 'Linh hoạt'}</strong>
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyAction(prog.id)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-500/20"
                    >
                      <span>Ứng Tuyển Chương Trình Này</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {POSITIONS.map((pos) => (
                <div
                  key={pos.id}
                  className="bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                        {pos.icon}
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${pos.badgeColor}`}>
                        {pos.slots} Chỉ tiêu
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2 leading-snug">
                      {pos.title}
                    </h3>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed line-clamp-3">
                      {pos.description}
                    </p>

                    {/* Tech Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {pos.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyAction()}
                    className="w-full py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-indigo-500 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <span>Ứng Tuyển Vị Trí Này</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Quick Supplementary Document Upload Section (For applicants already holding internCode) */}
        <div className="mt-14 max-w-3xl mx-auto">
          <div className="text-center mb-4">
            <button
              type="button"
              onClick={() => setShowSupplementCard(!showSupplementCard)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              <UploadCloud size={15} />
              <span>
                {showSupplementCard
                  ? 'Thu gọn khu vực bổ sung tài liệu'
                  : 'Bạn đã có Mã Thực Tập Sinh? Bấm vào đây để bổ sung tài liệu/bảng điểm'}
              </span>
            </button>
          </div>

          {showSupplementCard && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl animate-fade-in">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <UploadCloud size={16} className="text-indigo-400" />
                Bổ Sung Tài Liệu Theo Mã Thực Tập Sinh (Không Cần Đăng Nhập)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Dành cho ứng viên đã nộp hồ sơ trước đó và được HR yêu cầu bổ sung bảng điểm, đơn xin thực tập hoặc CV cập nhật.
              </p>

              {uploadSuccess && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              {uploadError && (
                <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0 text-rose-400" />
                  <span>{uploadError}</span>
                </div>
              )}

              <form onSubmit={handleUploadExisting} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mã Thực Tập Sinh (VD: INT-2026-001) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="VD: INT-2026-001"
                      value={existingCode}
                      onChange={(e) => setExistingCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <Search size={15} className="absolute right-3 top-2.5 text-slate-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Loại tài liệu bổ sung
                    </label>
                    <select
                      value={existingDocType}
                      onChange={(e) => setExistingDocType(e.target.value as DocumentType)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="CV">CV / Sơ Yếu Lý Lịch</option>
                      <option value="INTERNSHIP_APPLICATION">Đơn Xin Thực Tập</option>
                      <option value="TRANSCRIPT">Bảng Điểm Tích Lũy</option>
                      <option value="RECOMMENDATION_LETTER">Giấy Giới Thiệu Từ Trường</option>
                      <option value="OTHER">Tài Liệu Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Chọn tệp tin (PDF, DOCX tối đa 5MB)
                    </label>
                    <label className="flex items-center justify-between px-3 py-2 border border-slate-700 hover:border-indigo-500 rounded-lg bg-slate-950/40 hover:bg-slate-950/60 cursor-pointer transition-colors text-xs text-slate-300">
                      <span className="truncate max-w-[180px]">
                        {existingFile ? existingFile.name : 'Bấm để chọn tệp...'}
                      </span>
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
                      <FileText size={15} className="text-indigo-400 shrink-0" />
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploadLoading || !existingFile}
                  className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {uploadLoading ? 'Đang Tải Lên...' : 'Tải Lên Bổ Sung Ngay'}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 InternHub Enterprise Portal. Giải pháp Quản trị Thực tập sinh toàn diện.</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 text-xs text-slate-400"
            >
              Cổng Quản Trị
            </button>
            <button
              type="button"
              onClick={handleApplyAction}
              className="hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 text-xs text-slate-400"
            >
              Nộp Hồ Sơ Ứng Tuyển
            </button>
          </div>
        </div>
      </footer>

      {/* Popup Đăng Nhập Cổng Nội Bộ */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        isExpired={isExpired}
        onSwitchToRegister={handleSwitchToRegister}
        onOpenActivation={(identifier) => handleOpenActivation(identifier)}
      />

      {/* Popup Đăng Ký Tài Khoản Thực Tập Sinh */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={handleCloseRegisterModal}
        onSwitchToLogin={handleSwitchToLogin}
        onRegisterSuccess={handleRegisterSuccess}
        onRequireActivation={({ identifier, maskedEmail }) => {
          handleOpenActivation(identifier, maskedEmail);
        }}
      />

      {/* Popup Kích Hoạt Tài Khoản Email OTP */}
      <AccountActivationModal
        isOpen={isActivationModalOpen}
        onClose={handleCloseActivationModal}
        identifier={activationIdentifier}
        maskedEmail={activationMaskedEmail}
        onActivationSuccess={() => {
          handleCloseActivationModal();
          setIsLoginModalOpen(true);
        }}
        onBackToRegister={() => {
          handleCloseActivationModal();
          setIsRegisterModalOpen(true);
        }}
      />
    </div>
  );
};

export default LandingPage;
