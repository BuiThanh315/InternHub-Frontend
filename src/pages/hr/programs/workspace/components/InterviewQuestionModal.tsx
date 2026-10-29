import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  FileDown,
  CheckCircle2,
  HelpCircle,
  Edit2,
  Target,
  BookOpen,
  FolderGit2,
  HeartHandshake,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Copy,
  Check,
  Printer,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal, Button } from '../../../../../components/common';
import { AiSteppedProgressSkeleton } from '../../../../../components/ai/AiSteppedProgressSkeleton';
import { aiInterviewService } from '../../../../../services/aiInterviewService';
import { useAiJob } from '../../../../../contexts/AiJobContext';
import type {
  InterviewQuestionSet,
  InterviewQuestionItem,
  QuestionCategory,
  QuestionDifficulty,
} from '../../../../../types/aiInterview.types';

interface InterviewQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId: number;
  programName: string;
  internId?: number;
  internName?: string;
  initialSetId?: number;
}

export const InterviewQuestionModal: React.FC<InterviewQuestionModalProps> = ({
  isOpen,
  onClose,
  programId,
  programName,
  internId,
  internName,
  initialSetId,
}) => {
  const { startQuestionJob } = useAiJob();
  const [activeSet, setActiveSet] = useState<InterviewQuestionSet | null>(null);
  const [existingSets, setExistingSets] = useState<InterviewQuestionSet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [regeneratingQuestionId, setRegeneratingQuestionId] = useState<number | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [preferredCount, setPreferredCount] = useState<number>(6);
  const [customReq, setCustomReq] = useState<string>('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('ALL');
  const [showGlobalHints, setShowGlobalHints] = useState<boolean>(true);
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Record<number, boolean>>({});
  const [copiedQuestionId, setCopiedQuestionId] = useState<number | null>(null);
  const [isCopiedAll, setIsCopiedAll] = useState<boolean>(false);

  // Toggle accordion cho từng câu hỏi riêng lẻ
  const toggleQuestionAccordion = (questionId: number) => {
    setExpandedQuestionIds((prev) => {
      // Nếu đã có giá trị rõ ràng thì toggle, nếu chưa thì toggle dựa theo trạng thái toàn cục
      const current = prev[questionId] !== undefined ? prev[questionId] : showGlobalHints;
      return { ...prev, [questionId]: !current };
    });
  };

  // Toggle toàn cục cho toàn bộ danh sách
  const handleToggleGlobalHints = (checked: boolean) => {
    setShowGlobalHints(checked);
    // Reset các override cục bộ để đồng bộ theo trạng thái toàn cục mới
    setExpandedQuestionIds({});
  };

  // Sao chép 1 câu hỏi cụ thể vào Clipboard
  const handleCopySingleQuestion = async (q: InterviewQuestionItem) => {
    try {
      await navigator.clipboard.writeText(q.questionText);
      setCopiedQuestionId(q.id);
      toast.success('Đã sao chép câu hỏi vào bộ nhớ tạm!');
      setTimeout(() => setCopiedQuestionId(null), 2000);
    } catch {
      toast.error('Không thể sao chép văn bản.');
    }
  };

  // Sao chép toàn bộ bộ câu hỏi theo format tài liệu phỏng vấn
  const handleCopyAllQuestions = async () => {
    if (!activeSet || !activeSet.questions || activeSet.questions.length === 0) return;
    try {
      const scopeLabel = internId ? `ỨNG VIÊN: ${internName}` : `VỊ TRÍ: ${programName}`;
      let text = `==============================\n${activeSet.title.toUpperCase()}\n${scopeLabel}\n==============================\n\n`;

      const categories = [
        { key: 'TECHNICAL_FOUNDATION', title: 'I. KIẾN THỨC NỀN TẢNG' },
        { key: 'PROJECT_DEEP_DIVE', title: 'II. ĐÀO SÂU DỰ ÁN THỰC TẾ' },
        { key: 'BEHAVIORAL_AND_CULTURE_FIT', title: 'III. VĂN HÓA & KỸ NĂNG MỀM' },
      ];

      categories.forEach((cat) => {
        const questionsInCat = activeSet.questions.filter((q) => q.category === cat.key);
        if (questionsInCat.length > 0) {
          text += `\n${cat.title}\n------------------------------\n`;
          questionsInCat.forEach((q, idx) => {
            text += `Câu ${idx + 1}: ${q.questionText}\n`;
            if (q.focusArea) text += `   [Mục tiêu: ${q.focusArea}]\n`;
            if (q.expectedAnswer) text += `   - Gợi ý trả lời: ${q.expectedAnswer}\n`;
            if (q.evaluationCriteria) text += `   - Tiêu chí chấm: ${q.evaluationCriteria}\n`;
            text += `\n`;
          });
        }
      });

      await navigator.clipboard.writeText(text);
      setIsCopiedAll(true);
      toast.success('Đã sao chép toàn bộ danh sách câu hỏi phỏng vấn!');
      setTimeout(() => setIsCopiedAll(false), 2500);
    } catch {
      toast.error('Không thể sao chép bộ câu hỏi.');
    }
  };

  // Mở hộp thoại in trình duyệt trực tiếp
  const handlePrint = () => {
    window.print();
  };

  // Nạp danh sách bộ câu hỏi đã sinh trước đó
  const loadExistingSets = async () => {
    try {
      setIsLoading(true);
      const params = internId ? { internId } : { programId };
      const sets = await aiInterviewService.getQuestionSets(params);
      setExistingSets(sets);

      if (initialSetId) {
        const found = sets.find((s) => s.id === initialSetId);
        if (found) {
          setActiveSet(found);
        } else {
          try {
            const specificSet = await aiInterviewService.getQuestionSetById(initialSetId);
            setActiveSet(specificSet);
            setExistingSets((prev) => [specificSet, ...prev.filter((s) => s.id !== initialSetId)]);
          } catch {
            if (sets.length > 0) setActiveSet(sets[0]);
          }
        }
      } else if (sets.length > 0) {
        setActiveSet(sets[0]);
      } else {
        setActiveSet(null);
      }
    } catch (err: any) {
      console.error('Lỗi khi nạp danh sách bộ câu hỏi:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      void loadExistingSets();
    }
  }, [isOpen, programId, internId, initialSetId]);

  // Sinh bộ câu hỏi mới bằng AI (Non-blocking async: Đóng modal ngay và mở FloatingProgressWidget)
  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      await startQuestionJob({
        programId,
        programName,
        internId,
        internName,
        totalQuestions: preferredCount,
        customRequirements: customReq.trim() || undefined,
      });
      // Đóng modal ngay lập tức để không block người dùng, widget nổi sẽ tiếp quản tiến trình
      onClose();
    } catch (err: any) {
      console.error('Lỗi sinh câu hỏi:', err);
      toast.error(err.response?.data?.message || err.message || 'Không thể tạo bộ câu hỏi phỏng vấn.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Đổi câu hỏi khác (Regenerate single question)
  const handleRegenerateQuestion = async (questionId: number) => {
    if (!activeSet) return;
    try {
      setRegeneratingQuestionId(questionId);
      toast.info('AI đang tạo câu hỏi thay thế...');
      const updatedQuestion = await aiInterviewService.regenerateSingleQuestion(activeSet.id, questionId);
      
      const newQuestions = activeSet.questions.map((q) =>
        q.id === questionId ? updatedQuestion : q
      );
      setActiveSet({ ...activeSet, questions: newQuestions });
      toast.success('Đã làm mới câu hỏi!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể đổi câu hỏi.');
    } finally {
      setRegeneratingQuestionId(null);
    }
  };

  // Sửa câu hỏi
  const handleStartEdit = (q: InterviewQuestionItem) => {
    setEditingQuestionId(q.id);
    setEditText(q.questionText);
  };

  const handleSaveEdit = async (questionId: number) => {
    if (!activeSet || !editText.trim()) return;
    const newQuestions = activeSet.questions.map((q) =>
      q.id === questionId ? { ...q, questionText: editText.trim() } : q
    );
    try {
      const updated = await aiInterviewService.updateQuestionSet(activeSet.id, {
        questions: newQuestions,
      });
      setActiveSet(updated);
      setEditingQuestionId(null);
      toast.success('Đã lưu nội dung câu hỏi.');
    } catch (err: any) {
      toast.error('Lỗi khi cập nhật câu hỏi.');
    }
  };

  // Chốt bộ câu hỏi (FINALIZED)
  const handleFinalize = async () => {
    if (!activeSet) return;
    try {
      const updated = await aiInterviewService.updateQuestionSet(activeSet.id, {
        status: 'FINALIZED',
      });
      setActiveSet(updated);
      toast.success('Đã chốt (FINALIZED) bộ câu hỏi phỏng vấn!');
    } catch (err: any) {
      toast.error('Lỗi khi chốt bộ câu hỏi.');
    }
  };

  // Xuất file PDF
  const handleExportPdf = async () => {
    if (!activeSet) return;
    try {
      toast.info('Đang tạo và tải file PDF phiếu phỏng vấn...');
      await aiInterviewService.exportEvaluationPdf(activeSet.id);
      toast.success('Tải phiếu phỏng vấn thành công!');
    } catch (err: any) {
      toast.error('Không thể xuất file PDF.');
    }
  };

  // Category Icons & Helpers
  const getCategoryInfo = (cat: QuestionCategory) => {
    switch (cat) {
      case 'TECHNICAL_FOUNDATION':
        return {
          label: 'Kiến Thức Nền Tảng',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <BookOpen size={14} className="text-blue-600 mr-1.5" />,
        };
      case 'PROJECT_DEEP_DIVE':
        return {
          label: 'Đào Sâu Dự Án',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: <FolderGit2 size={14} className="text-purple-600 mr-1.5" />,
        };
      case 'BEHAVIORAL_AND_CULTURE_FIT':
        return {
          label: 'Văn Hóa & Xử Lý Tình Huống',
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: <HeartHandshake size={14} className="text-amber-600 mr-1.5" />,
        };
      default:
        return {
          label: 'Khác',
          color: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: <HelpCircle size={14} className="text-slate-600 mr-1.5" />,
        };
    }
  };

  const getDifficultyBadge = (diff: QuestionDifficulty) => {
    switch (diff) {
      case 'HARD':
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-700">Khó</span>;
      case 'MEDIUM':
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-700">Trung bình</span>;
      default:
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">Cơ bản</span>;
    }
  };

  const filteredQuestions = activeSet?.questions?.filter((q) => {
    if (selectedCategoryTab === 'ALL') return true;
    return q.category === selectedCategoryTab;
  }) || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <Sparkles className="text-indigo-600" size={20} />
          <span>Bộ Câu Hỏi Phỏng Vấn AI {internName ? `• ${internName}` : `• ${programName}`}</span>
        </div>
      }
      size="xl"
    >
      <div className="space-y-5">
        {/* Banner Thông Tin Phạm Vi */}
        <div className="bg-gradient-to-r from-indigo-50/80 to-blue-50/80 p-4 rounded-xl border border-indigo-100 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-600 text-white">
                {internId ? 'Candidate Scope' : 'Program Scope'}
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {internId ? `Ứng viên: ${internName}` : `Vị trí: ${programName}`}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {internId
                ? 'AI đối chiếu CV, điểm kỹ năng thiếu & nghi vấn trong bài thẩm định lọc hồ sơ để sinh câu hỏi chất vấn.'
                : 'AI phân tích Bản mô tả công việc (JD) để sinh bộ câu hỏi kỹ thuật & kỹ năng mềm chuẩn mực cho kỳ thực tập.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {activeSet && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAllQuestions}
                  className="gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100"
                  title="Sao chép toàn bộ danh sách câu hỏi để gửi vào Meet/Zoom/Slack"
                >
                  {isCopiedAll ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{isCopiedAll ? 'Đã Sao Chép' : 'Sao Chép Tất Cả'}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100"
                  title="In trực tiếp ra máy in (Print Preview)"
                >
                  <Printer size={14} />
                  <span>In Phiếu</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPdf}
                  className="gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100"
                  title="Tải file PDF bảng điểm về máy tính"
                >
                  <FileDown size={14} />
                  <span>Xuất PDF</span>
                </Button>
              </>
            )}
            {activeSet && activeSet.status === 'DRAFT' && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleFinalize}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 size={14} />
                <span>Chốt Bộ Câu Hỏi</span>
              </Button>
            )}
          </div>
        </div>

        {/* Thanh Điều Khiển Sinh Mới */}
        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span>Số câu hỏi:</span>
              <select
                value={preferredCount}
                onChange={(e) => setPreferredCount(Number(e.target.value))}
                className="text-xs border border-slate-300 rounded px-2 py-1 bg-white font-medium focus:ring-1 focus:ring-indigo-500"
                disabled={isGenerating}
              >
                <option value={3}>3 câu (Rút gọn)</option>
                <option value={6}>6 câu (Chuẩn)</option>
                <option value={9}>9 câu (Chi tiết)</option>
                <option value={12}>12 câu (Toàn diện)</option>
              </select>
            </label>

            <input
              type="text"
              placeholder="Ghi chú thêm (VD: tập trung hỏi Spring Security, React Hooks...)"
              value={customReq}
              onChange={(e) => setCustomReq(e.target.value)}
              className="text-xs border border-slate-300 rounded px-2.5 py-1 w-64 md:w-80 bg-white placeholder-slate-400 focus:ring-1 focus:ring-indigo-500"
              disabled={isGenerating}
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerate}
            isLoading={isGenerating}
            disabled={isGenerating}
            className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <Sparkles size={14} />
            <span>{activeSet ? 'Tạo Lại Toàn Bộ' : 'Sinh Câu Hỏi Bằng AI'}</span>
          </Button>
        </div>

        {/* Danh Sách Bộ Câu Hỏi Cũ (Nếu có nhiều bộ) */}
        {existingSets.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-500 font-semibold shrink-0">Lịch sử:</span>
            {existingSets.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSet(s)}
                className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${
                  activeSet?.id === s.id
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                #{s.id} ({s.questions.length} câu - {s.status === 'FINALIZED' ? 'Chính thức' : 'Bản nháp'})
              </button>
            ))}
          </div>
        )}

        {/* Bộ Lọc Theo Nhóm (Category Tabs) */}
        {activeSet && (
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-1.5">
              {[
                { id: 'ALL', label: `Tất cả (${activeSet.questions.length})` },
                { id: 'TECHNICAL_FOUNDATION', label: 'Kiến Thức Nền Tảng' },
                { id: 'PROJECT_DEEP_DIVE', label: 'Dự Án Khai Báo' },
                { id: 'BEHAVIORAL_AND_CULTURE_FIT', label: 'Văn Hóa & Soft-skills' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategoryTab(tab.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    selectedCategoryTab === tab.id
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700 select-none hover:text-indigo-600 transition-colors">
                <input
                  type="checkbox"
                  checked={showGlobalHints}
                  onChange={(e) => handleToggleGlobalHints(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="flex items-center gap-1">
                  {showGlobalHints ? <Eye size={13} className="text-indigo-600" /> : <EyeOff size={13} className="text-slate-400" />}
                  Hiện gợi ý & tiêu chí
                </span>
              </label>

              <div className="text-xs font-medium text-slate-500 border-l border-slate-200 pl-3">
                Trạng thái: <strong className={activeSet.status === 'FINALIZED' ? 'text-emerald-600' : 'text-amber-600'}>{activeSet.status === 'FINALIZED' ? 'Đã chốt chính thức' : 'Bản nháp'}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Danh Sách Các Câu Hỏi */}
        {isGenerating ? (
          <AiSteppedProgressSkeleton
            title="AI Đang Phân Tích & Sinh Bộ Câu Hỏi Phỏng Vấn"
            steps={[
              {
                id: 1,
                title: 'Bước 1: Trích xuất JD & Đánh giá năng lực ứng viên',
                description: 'Bóc tách các yêu cầu chuyên môn, điểm thiếu hụt từ CV & bài test...',
                durationMs: 3000,
              },
              {
                id: 2,
                title: 'Bước 2: Xây dựng câu hỏi chất vấn theo 3 nhóm cốt lõi',
                description: 'Sinh các câu hỏi Nền tảng, Đào sâu dự án và Văn hóa phù hợp...',
                durationMs: 4500,
              },
              {
                id: 3,
                title: 'Bước 3: Tổng hợp tiêu chuẩn câu trả lời mong đợi & Tiêu chí chấm',
                description: 'Thiết lập thang điểm, gợi ý phỏng vấn viên và chốt bộ câu hỏi...',
                durationMs: 4000,
              },
            ]}
            estimatedSeconds={15}
            className="my-4"
          />
        ) : isLoading ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            <RefreshCw size={24} className="animate-spin mx-auto text-indigo-600 mb-2" />
            Đang tải dữ liệu bộ câu hỏi...
          </div>
        ) : !activeSet ? (
          <div className="py-12 text-center text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-300">
            <HelpCircle size={36} className="mx-auto text-slate-400 mb-2" />
            <div className="font-semibold text-slate-700 text-sm">Chưa có bộ câu hỏi phỏng vấn nào</div>
            <p className="text-xs text-slate-500 mt-1">Bấm nút "Sinh Câu Hỏi Bằng AI" ở trên để AI tạo ngay.</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            Không có câu hỏi nào trong nhóm này.
          </div>
        ) : (
          <div className="space-y-3.5 max-h-[55vh] overflow-y-auto pr-1">
            {filteredQuestions.map((q, idx) => {
              const catInfo = getCategoryInfo(q.category);
              const isEditing = editingQuestionId === q.id;
              const isRegenerating = regeneratingQuestionId === q.id;
              const isHintVisible = expandedQuestionIds[q.id] !== undefined
                ? expandedQuestionIds[q.id]
                : showGlobalHints;

              return (
                <div
                  key={q.id || idx}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-sm space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                      <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${catInfo.color}`}>
                        {catInfo.icon}
                        {catInfo.label}
                      </span>
                      {getDifficultyBadge(q.difficulty)}
                      {q.focusArea && (
                        (() => {
                          const lower = q.focusArea.toLowerCase();
                          const isRedFlag = lower.includes('nghi vấn') || lower.includes('red flag') || lower.includes('bất thường') || lower.includes('xác minh');
                          const isMissingSkill = lower.includes('thiếu') || lower.includes('chưa có') || lower.includes('missing');

                          if (isRedFlag) {
                            return (
                              <span className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-semibold flex items-center gap-1 shadow-2xs">
                                <AlertTriangle size={11} className="text-rose-600" />
                                Đối chất nghi vấn: {q.focusArea}
                              </span>
                            );
                          }
                          if (isMissingSkill) {
                            return (
                              <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded font-semibold flex items-center gap-1 shadow-2xs">
                                <Target size={11} className="text-amber-600" />
                                Kiểm tra kỹ năng thiếu: {q.focusArea}
                              </span>
                            );
                          }
                          return (
                            <span className="text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                              <Target size={11} />
                              Mục tiêu: {q.focusArea}
                            </span>
                          );
                        })()
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Nút Sao Chép câu hỏi */}
                      <button
                        type="button"
                        onClick={() => handleCopySingleQuestion(q)}
                        title="Sao chép nội dung câu hỏi"
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        {copiedQuestionId === q.id ? (
                          <Check size={14} className="text-emerald-600" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>

                      {activeSet.status === 'DRAFT' && !isEditing && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleRegenerateQuestion(q.id)}
                            disabled={isRegenerating}
                            title="AI tạo câu hỏi khác thay thế"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <RefreshCw size={14} className={isRegenerating ? 'animate-spin text-indigo-600' : ''} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(q)}
                            title="Sửa nội dung câu hỏi"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Nội Dung Câu Hỏi */}
                  {isEditing ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full text-xs border border-indigo-300 rounded-lg p-2.5 bg-indigo-50/20 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        rows={3}
                      />
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingQuestionId(null)}
                          className="text-xs py-1"
                        >
                          Hủy
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSaveEdit(q.id)}
                          className="text-xs py-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          Lưu
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs font-semibold text-slate-800 leading-relaxed">
                      {q.questionText}
                    </div>
                  )}

                  {/* Hướng Dẫn Trả Lời & Tiêu Chí Đánh Giá (Hỗ trợ Accordion & Checkbox toàn cục) */}
                  {(q.expectedAnswer || q.evaluationCriteria) && (
                    <div className="pt-0.5">
                      {/* Nút Thu gọn / Mở rộng cho riêng từng câu hỏi */}
                      <button
                        type="button"
                        onClick={() => toggleQuestionAccordion(q.id)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-indigo-600 transition-colors py-0.5 group"
                      >
                        {isHintVisible ? (
                          <>
                            <ChevronUp size={13} className="text-slate-400 group-hover:text-indigo-600 transition-transform" />
                            <span>Thu gọn gợi ý & tiêu chí</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown size={13} className="text-slate-400 group-hover:text-indigo-600 transition-transform" />
                            <span className="underline decoration-slate-300 underline-offset-2">Xem gợi ý câu trả lời & tiêu chí chấm</span>
                          </>
                        )}
                      </button>

                      {isHintVisible && (
                        <div className="mt-1.5 bg-slate-50/90 rounded-lg p-2.5 border border-slate-100 text-[11px] text-slate-600 space-y-1.5 animate-fadeIn">
                          {q.expectedAnswer && (
                            <div>
                              <strong className="text-slate-700">Gợi ý câu trả lời kỳ vọng:</strong>{' '}
                              <span>{q.expectedAnswer}</span>
                            </div>
                          )}
                          {q.evaluationCriteria && (
                            <div>
                              <strong className="text-slate-700">Tiêu chí chấm điểm:</strong>{' '}
                              <span>{q.evaluationCriteria}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Modal */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            {activeSet ? `Tổng cộng: ${activeSet.questions.length} câu hỏi` : ''}
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};
