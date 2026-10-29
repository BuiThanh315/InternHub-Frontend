import React, { useState, useEffect } from 'react';
import {
  X,
  Bookmark,
  Scale,
  UserCheck,
  UserX,
  FileText,
  Sparkles,
  MessageSquare,
  ExternalLink,
  Download,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  RotateCw,
  ChevronDown,
  ChevronUp,
  FileDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { documentService } from '../../../../../../services/documentService';
import { aiService } from '../../../../../../services/aiService';
import { aiInterviewService } from '../../../../../../services/aiInterviewService';
import {
  formatDate,
  getDifficultyLabel,
  getQuestionCategoryLabel,
  getInterviewSessionStatusLabel,
} from '../../../../../../utils/formatters';
import type { DocumentResponse, ScreeningResultDto } from '../../../../../../types';
import type { InterviewQuestionSet, InterviewQuestionItem } from '../../../../../../types/aiInterview.types';
import type { EvaluationDossier, AnswerEvaluationDetail } from '../../../../../../types/aiEvaluation.types';
import type { CandidateWorkspaceModalProps, CandidateWorkspaceTab } from './CandidateWorkspaceModal.types';
import styles from './CandidateWorkspaceModal.module.css';

export const CandidateWorkspaceModal: React.FC<CandidateWorkspaceModalProps> = ({
  candidate,
  isOpen,
  onClose,
  program,
  evaluation: initialEvaluation,
  isBookmarked,
  onToggleBookmark,
  isCompared,
  onToggleCompare,
  onApprove,
  onReject,
  onTriggerAiScreening,
  isAiScreeningSubmitting = false,
  onOpenScheduleModal,
  initialTab = 'profile',
}) => {
  const [activeTab, setActiveTab] = useState<CandidateWorkspaceTab>(initialTab);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [localEvaluation, setLocalEvaluation] = useState<ScreeningResultDto | null>(null);
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState<boolean>(!initialEvaluation);
  const [interviewSession, setInterviewSession] = useState<{ sessionId: number; status: string } | null>(null);
  const [questionSets, setQuestionSets] = useState<InterviewQuestionSet[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(true);

  // Inline Rejection States (Không mở thêm bất kỳ modal/popup nào)
  const [isRejectingInline, setIsRejectingInline] = useState<boolean>(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');
  const [isSubmittingReject, setIsSubmittingReject] = useState<boolean>(false);

  // Integrated Dossier States (Nhúng trực tiếp, không mở cửa trượt drawer)
  const [dossier, setDossier] = useState<EvaluationDossier | null>(null);
  const [isLoadingDossier, setIsLoadingDossier] = useState<boolean>(false);
  const [showDossierDetail, setShowDossierDetail] = useState<boolean>(false);
  const [expandedQId, setExpandedQId] = useState<number | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);

  const evaluation = initialEvaluation || localEvaluation;

  // Handle Escape key and body scroll lock for Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Load candidate resources on open
  useEffect(() => {
    let isCancelled = false;
    if (isOpen && candidate) {
      if (candidate.internCode) {
        documentService
          .getDocumentsByInternCode(candidate.internCode)
          .then((docs) => {
            if (!isCancelled) setDocuments(docs);
          })
          .catch((err) => {
            console.error('Không thể tải tài liệu ứng viên:', err);
          });
      }

      if (!initialEvaluation) {
        aiService
          .getInternEvaluation(candidate.id)
          .then((res) => {
            if (!isCancelled && res) setLocalEvaluation(res);
          })
          .catch(() => {})
          .finally(() => {
            if (!isCancelled) setIsLoadingEvaluation(false);
          });
      }

      Promise.allSettled([
        aiInterviewService.getCandidateInterviewSession({
          candidateId: candidate.id,
          email: candidate.email,
        }),
        aiInterviewService.getQuestionSets({ internId: candidate.id }),
      ])
        .then(([session, sets]) => {
          if (isCancelled) return;
          if (session.status === 'fulfilled' && session.value) {
            setInterviewSession({
              sessionId: session.value.sessionId,
              status: session.value.status,
            });
          } else {
            setInterviewSession(null);
          }

          if (sets.status === 'fulfilled' && sets.value) {
            setQuestionSets(sets.value);
          } else {
            setQuestionSets([]);
          }
        })
        .catch((err) => {
          console.error('Lỗi khi tải dữ liệu phỏng vấn:', err);
        })
        .finally(() => {
          if (!isCancelled) setIsLoadingQuestions(false);
        });
    }

    return () => {
      isCancelled = true;
    };
  }, [isOpen, candidate, initialEvaluation]);

  if (!isOpen || !candidate) return null;

  const initials = (candidate.fullName || 'U')
    .split(' ')
    .map((n: string) => n[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  // Document CV finder
  const cvDoc = documents.find(
    (d: DocumentResponse) =>
      d.documentType === 'CV' ||
      d.fileName?.toLowerCase().includes('.pdf') ||
      d.originalFileName?.toLowerCase().includes('.pdf') ||
      d.fileName?.toLowerCase().includes('cv') ||
      d.originalFileName?.toLowerCase().includes('cv')
  ) || documents[0];

  const handleDownloadCv = (doc: DocumentResponse) => {
    try {
      const url = documentService.getDocumentDownloadUrl(doc.id);
      window.open(url, '_blank');
    } catch {
      toast.error('Không thể tải tệp CV.');
    }
  };

  const handleTriggerScreening = async () => {
    if (!candidate.hasCv) {
      toast.error('Ứng viên chưa tải lên CV. Không thể kích hoạt thẩm định AI.');
      return;
    }
    try {
      await onTriggerAiScreening(candidate.id);
      toast.success('Đã gửi yêu cầu thẩm định AI cho ứng viên thành công!');
      const updated = await aiService.getInternEvaluation(candidate.id);
      if (updated) {
        setLocalEvaluation(updated);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Không thể kích hoạt thẩm định AI.');
    }
  };

  // Inline Rejection Logic
  const handleStartReject = () => {
    setRejectionReasonInput(
      evaluation?.draftRejectionReason ||
      'Hồ sơ chưa đạt tiêu chí tuyển sinh của kỳ thực tập.'
    );
    setIsRejectingInline(true);
  };

  const handleConfirmRejectInline = async () => {
    if (!rejectionReasonInput.trim() || rejectionReasonInput.trim().length < 5) {
      toast.error('Lý do từ chối cần có ít nhất 5 ký tự.');
      return;
    }
    try {
      setIsSubmittingReject(true);
      await onReject(candidate, rejectionReasonInput.trim());
      setIsRejectingInline(false);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể cập nhật từ chối hồ sơ.');
    } finally {
      setIsSubmittingReject(false);
    }
  };

  // Integrated Dossier View (Nhúng thẳng vào Modal, không mở Drawer)
  const handleLoadAndShowDossier = async () => {
    if (!interviewSession?.sessionId) {
      toast.info('Ứng viên chưa có phiên phỏng vấn AI hợp lệ.');
      return;
    }
    try {
      setIsLoadingDossier(true);
      const data = await aiInterviewService.getEvaluationDossier(interviewSession.sessionId);
      setDossier(data);
      setShowDossierDetail(true);
      if (data.answers?.length) {
        setExpandedQId(data.answers[0].questionId);
      }
    } catch (err: any) {
      toast.error('Không thể tải phiếu đánh giá: ' + (err.response?.data?.message || err.message || 'Lỗi mạng'));
    } finally {
      setIsLoadingDossier(false);
    }
  };

  const handleExportDossierPdf = async () => {
    if (!dossier) return;
    try {
      setDownloadingPdf(true);
      const blob = await aiInterviewService.exportDossierPdf(dossier.sessionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Interview_Evaluation_Session_${dossier.sessionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Đã tải phiếu đánh giá PDF thành công!');
    } catch (err: any) {
      toast.error('Lỗi tải file PDF: ' + (err.message || 'Không thể xuất file'));
    } finally {
      setDownloadingPdf(false);
    }
  };

  const score = evaluation?.overallScore;
  const isHighMatch = score !== undefined && score >= 75;
  const isMediumMatch = score !== undefined && score >= 50 && score < 75;

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className={styles.modalHeader}>
          <div className={styles.candidateHeaderInfo}>
            <div className={styles.avatarCircle} aria-hidden="true">
              {initials}
            </div>
            <div className={styles.headerTextGroup}>
              <h2 className={styles.candidateName}>{candidate.fullName}</h2>
              <div className={styles.candidateSubMeta}>
                {candidate.candidateType === 'FREE_APPLICANT' ? (
                  <span className="badge badge-warning">Ứng viên tự do</span>
                ) : (
                  <span className="badge badge-info">Trường liên kết</span>
                )}
                {candidate.hasCv ? (
                  <span className="badge badge-success">
                    <span className="status-dot status-dot-success mr-1" /> Có CV
                  </span>
                ) : (
                  <span className="badge badge-neutral">
                    <span className="status-dot status-dot-neutral mr-1" /> Chưa có CV
                  </span>
                )}
                <span className="text-xs text-slate-500 font-tabular">
                  #{candidate.internCode || `APP-${candidate.id}`}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.headerToolsGroup}>
            {/* Ghim hồ sơ */}
            <button
              type="button"
              className={`${styles.toolIconBtn} ${
                isBookmarked ? styles.toolIconBtnActiveBookmark : ''
              }`}
              onClick={() => onToggleBookmark(candidate.id)}
              title={isBookmarked ? 'Bỏ ghim ứng viên này' : 'Ghim ứng viên tiềm năng'}
              aria-label="Ghim ứng viên"
            >
              <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>

            {/* Chọn so sánh */}
            <button
              type="button"
              className={`${styles.toolIconBtn} ${
                isCompared ? styles.toolIconBtnActiveCompare : ''
              }`}
              onClick={() => onToggleCompare(candidate.id)}
              title={isCompared ? 'Bỏ chọn so sánh' : 'Thêm vào so sánh hồ sơ'}
              aria-label="So sánh hồ sơ"
            >
              <Scale size={16} />
            </button>

            {/* Nút đóng */}
            <button
              type="button"
              className={styles.toolIconBtn}
              onClick={onClose}
              title="Đóng cửa sổ làm việc (Esc)"
              aria-label="Đóng cửa sổ"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Sticky Decision Bar */}
        <div className={styles.decisionBar}>
          <div className={styles.decisionLabel}>
            <span className="text-slate-500 font-medium">Quyết định tiếp nhận kỳ:</span>
            <span className="text-slate-800 font-bold">{program.name}</span>
          </div>

          <div className={styles.decisionButtonsGroup}>
            <button
              type="button"
              className={styles.approveBtn}
              onClick={() => onApprove(candidate)}
              title="Tiếp nhận ứng viên chính thức vào kỳ thực tập"
            >
              <UserCheck size={15} />
              <span>Tiếp nhận vào kỳ</span>
            </button>

            <button
              type="button"
              className={styles.rejectBtn}
              onClick={handleStartReject}
              title="Từ chối hồ sơ ứng tuyển này"
            >
              <UserX size={15} />
              <span>Từ chối hồ sơ</span>
            </button>
          </div>
        </div>

        {/* Inline Rejection Box (Xử lý trực tiếp, không mở cửa sổ hay modal phụ) */}
        {isRejectingInline && (
          <div className={styles.inlineRejectBox}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-rose-600" />
                Xác nhận từ chối hồ sơ ứng viên: {candidate.fullName}
              </span>
              <button
                type="button"
                className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                onClick={() => setIsRejectingInline(false)}
              >
                Hủy bỏ
              </button>
            </div>
            <textarea
              className={styles.inlineRejectTextarea}
              rows={2}
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="Nhập lý do từ chối ứng viên (tối thiểu 5 ký tự)..."
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="btn btn-xs btn-outline"
                onClick={() => setIsRejectingInline(false)}
                disabled={isSubmittingReject}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn btn-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1"
                onClick={handleConfirmRejectInline}
                disabled={isSubmittingReject || rejectionReasonInput.trim().length < 5}
              >
                <UserX size={13} />
                <span>{isSubmittingReject ? 'Đang từ chối...' : 'Xác nhận từ chối'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className={styles.tabNav}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FileText size={16} />
            <span>Hồ Sơ &amp; CV</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'screening' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('screening')}
          >
            <Sparkles size={16} />
            <span>Thẩm Định AI</span>
            {evaluation?.overallScore !== undefined && (
              <span
                className={`ml-1 text-[11px] font-bold font-tabular px-1.5 py-0.5 rounded-full ${
                  isHighMatch
                    ? 'bg-emerald-100 text-emerald-700'
                    : isMediumMatch
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {evaluation.overallScore}%
              </span>
            )}
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'interview' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('interview')}
          >
            <MessageSquare size={16} />
            <span>Phỏng Vấn AI</span>
            {interviewSession?.status && (
              <span className="ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                {getInterviewSessionStatusLabel(interviewSession.status)}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content Body */}
        <div className={styles.tabContent}>
          {/* TAB 1: PROFILE & CV */}
          {activeTab === 'profile' && (
            <div>
              {/* Thông tin học vấn & cá nhân */}
              <div className={styles.serviceCard}>
                <div className={styles.serviceCardHeader}>
                  <h3 className={styles.serviceCardTitle}>
                    <FileText size={17} className="text-indigo-600" />
                    <span>Thông Tin Ứng Viên &amp; Học Vấn</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Nộp ngày: {formatDate(candidate.createdAt)}
                  </span>
                </div>

                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Trường đại học</span>
                    <span className={styles.infoValue}>
                      {candidate.university || 'Chưa cập nhật'}
                    </span>
                  </div>

                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Chuyên ngành đào tạo</span>
                    <span className={styles.infoValue}>
                      {candidate.major || 'Chưa cập nhật'}
                    </span>
                  </div>

                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Điểm GPA tích lũy</span>
                    <span className="font-tabular font-bold text-slate-800 text-sm">
                      {candidate.gpa !== undefined && candidate.gpa !== null ? (
                        <span className={candidate.gpa >= 3.2 ? 'text-emerald-700' : 'text-slate-800'}>
                          {candidate.gpa.toFixed(2)} / 4.0
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">Chưa cung cấp</span>
                      )}
                    </span>
                  </div>

                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Địa chỉ Email</span>
                    <span className={styles.infoValue}>{candidate.email}</span>
                  </div>

                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Số điện thoại</span>
                    <span className="font-tabular text-sm font-semibold text-slate-800">
                      {candidate.phone || 'Chưa cập nhật'}
                    </span>
                  </div>

                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Mã định danh thực tập sinh</span>
                    <span className="font-tabular text-sm font-semibold text-indigo-700">
                      {candidate.internCode || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tài liệu CV đính kèm */}
              <div className={styles.serviceCard}>
                <div className={styles.serviceCardHeader}>
                  <h3 className={styles.serviceCardTitle}>
                    <FileText size={17} className="text-indigo-600" />
                    <span>Tài Liệu Hồ Sơ Tuyển Dụng (CV)</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {documents.length} tệp đính kèm
                  </span>
                </div>

                {cvDoc ? (
                  <div className={styles.cvCard}>
                    <div className={styles.cvCardLeft}>
                      <div className={styles.cvIconWrapper}>
                        <FileText size={22} />
                      </div>
                      <div className={styles.cvMeta}>
                        <span className={styles.cvName}>
                          {cvDoc.fileName || `CV_${candidate.fullName}.pdf`}
                        </span>
                        <span className={styles.cvStatusText}>
                          Tải lên: {formatDate(cvDoc.createdAt)} •{' '}
                          {cvDoc.fileSize
                            ? `${(cvDoc.fileSize / 1024 / 1024).toFixed(2)} MB`
                            : 'Định dạng PDF'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline flex items-center gap-1.5"
                        onClick={() => handleDownloadCv(cvDoc)}
                        title="Mở tài liệu CV trong tab mới"
                      >
                        <ExternalLink size={14} />
                        <span>Xem CV</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline flex items-center gap-1.5"
                        onClick={() => handleDownloadCv(cvDoc)}
                        title="Tải tệp CV về máy tính"
                      >
                        <Download size={14} />
                        <span>Tải về</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
                    <span>
                      Ứng viên chưa tải lên tệp CV hoặc tài liệu hồ sơ chưa đồng bộ xong vào hệ thống.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: AI SCREENING */}
          {activeTab === 'screening' && (
            <div>
              {isLoadingEvaluation ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
                  Đang tải dữ liệu thẩm định năng lực AI...
                </div>
              ) : evaluation ? (
                <div>
                  {/* AI Match Score Hero Card */}
                  <div className={styles.aiScoreHero}>
                    <div className={styles.aiScoreHeroLeft}>
                      <div
                        className={`${styles.aiScoreCircle} ${
                          isHighMatch
                            ? styles.aiScoreCircleSuccess
                            : isMediumMatch
                            ? styles.aiScoreCircleWarning
                            : styles.aiScoreCircleDanger
                        }`}
                      >
                        <span>{evaluation.overallScore}%</span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          Match
                        </span>
                      </div>
                      <div>
                        <h4 className={styles.aiRecommendationTitle}>
                          {isHighMatch
                            ? 'Khuyến Nghị Tiếp Nhận (Highly Recommended)'
                            : isMediumMatch
                            ? 'Cân Nhắc Phỏng Vấn (Consider with Interview)'
                            : 'Chưa Đạt Tiêu Chuẩn (Recommended Reject)'}
                        </h4>
                        <p className={styles.aiRecommendationDesc}>
                          {evaluation.matchSummary ||
                            'Hồ sơ đã được mô hình AI đối soát năng lực toàn diện với chuẩn vị trí thực tập.'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline flex items-center gap-1.5 flex-shrink-0"
                      onClick={handleTriggerScreening}
                      disabled={isAiScreeningSubmitting}
                      title="Kích hoạt thẩm định lại hồ sơ bằng AI"
                    >
                      <RotateCw
                        size={14}
                        className={isAiScreeningSubmitting ? 'animate-spin' : ''}
                      />
                      <span>{isAiScreeningSubmitting ? 'Đang quét...' : 'Quét lại AI'}</span>
                    </button>
                  </div>

                  {/* 2 Cột: Điểm Mạnh & Rủi Ro */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Strengths */}
                    <div className={styles.serviceCard}>
                      <div className={styles.serviceCardHeader}>
                        <h3 className={styles.serviceCardTitle}>
                          <CheckCircle2 size={16} className="text-emerald-600" />
                          <span>Điểm Mạnh Nổi Trội</span>
                        </h3>
                        <span className="text-xs text-emerald-700 font-semibold">
                          {evaluation.strengths?.length || 0} điểm
                        </span>
                      </div>
                      {evaluation.strengths && evaluation.strengths.length > 0 ? (
                        <ul className={styles.pointList}>
                          {evaluation.strengths.map((str: string, idx: number) => (
                            <li key={idx} className={`${styles.pointItem} ${styles.pointItemSuccess}`}>
                              <span className="text-emerald-500 font-bold mt-0.5">•</span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Chưa ghi nhận điểm mạnh nổi bật.</p>
                      )}
                    </div>

                    {/* Weaknesses / Risks */}
                    <div className={styles.serviceCard}>
                      <div className={styles.serviceCardHeader}>
                        <h3 className={styles.serviceCardTitle}>
                          <AlertTriangle size={16} className="text-amber-600" />
                          <span>Khoảng Trống &amp; Rủi Ro</span>
                        </h3>
                        <span className="text-xs text-amber-700 font-semibold">
                          {evaluation.weaknesses?.length || 0} lưu ý
                        </span>
                      </div>
                      {evaluation.weaknesses && evaluation.weaknesses.length > 0 ? (
                        <ul className={styles.pointList}>
                          {evaluation.weaknesses.map((weak: string, idx: number) => (
                            <li key={idx} className={`${styles.pointItem} ${styles.pointItemWarning}`}>
                              <span className="text-amber-500 font-bold mt-0.5">•</span>
                              <span>{weak}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Không phát hiện rủi ro nghiêm trọng.</p>
                      )}
                    </div>
                  </div>

                  {/* Kỹ Năng Khớp (Skills Matched) */}
                  {evaluation.skillsMatched && evaluation.skillsMatched.length > 0 && (
                    <div className={styles.serviceCard}>
                      <div className={styles.serviceCardHeader}>
                        <h3 className={styles.serviceCardTitle}>
                          <Sparkles size={16} className="text-indigo-600" />
                          <span>Kỹ Năng Trùng Khớp Với Yêu Cầu Vị Trí</span>
                        </h3>
                        <span className="text-xs text-indigo-700 font-semibold">
                          {evaluation.skillsMatched.length} kỹ năng
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {evaluation.skillsMatched.map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lý do từ chối nháp (nếu có) */}
                  {evaluation.draftRejectionReason && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
                      <strong>Lý do từ chối đề xuất (AI Draft):</strong>{' '}
                      {evaluation.draftRejectionReason}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <Sparkles size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">
                    Chưa Có Kết Quả Thẩm Định AI
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                    Ứng viên này chưa được hệ thống AI quét và đối soát hồ sơ CV với chương trình thực tập.
                  </p>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary inline-flex items-center gap-1.5"
                    onClick={handleTriggerScreening}
                    disabled={isAiScreeningSubmitting}
                  >
                    <Sparkles size={14} />
                    <span>{isAiScreeningSubmitting ? 'Đang gửi yêu cầu...' : 'Kích hoạt Thẩm định AI ngay'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AI INTERVIEW & EMBEDDED DOSSIER */}
          {activeTab === 'interview' && (
            <div>
              {/* Quản lý lịch & trạng thái phỏng vấn */}
              <div className={styles.serviceCard}>
                <div className={styles.serviceCardHeader}>
                  <h3 className={styles.serviceCardTitle}>
                    <Calendar size={17} className="text-indigo-600" />
                    <span>Lịch Phỏng Vấn AI Tuyển Dụng</span>
                  </h3>
                  {interviewSession && (
                    <span className="badge badge-info">
                      Mã phiên: #{interviewSession.sessionId}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-xs text-slate-700 font-semibold mb-1">
                      {interviewSession
                        ? `Trạng thái phiên: ${getInterviewSessionStatusLabel(interviewSession.status)}`
                        : 'Chưa có phiên phỏng vấn AI được kích hoạt'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Gửi thư mời phỏng vấn AI tự động qua email hoặc đánh giá năng lực ứng viên trực tuyến.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenScheduleModal && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline flex items-center gap-1.5"
                        onClick={() => {
                          onClose();
                          onOpenScheduleModal({
                            candidateId: candidate.id,
                            email: candidate.email,
                            fullName: candidate.fullName,
                          });
                        }}
                        title="Đóng popup hiện tại và mở lịch mời phỏng vấn AI"
                      >
                        <Calendar size={14} />
                        <span>Mời Phỏng Vấn AI</span>
                      </button>
                    )}

                    {interviewSession?.sessionId && (
                      <button
                        type="button"
                        className="btn btn-sm btn-primary flex items-center gap-1.5"
                        onClick={handleLoadAndShowDossier}
                        disabled={isLoadingDossier}
                        title="Xem toàn bộ kết quả chấm điểm và phân tích AI trực tiếp trong popup"
                      >
                        <Sparkles size={14} className={isLoadingDossier ? 'animate-spin' : ''} />
                        <span>
                          {isLoadingDossier
                            ? 'Đang nạp...'
                            : showDossierDetail
                            ? 'Làm mới Phiếu Đánh Giá'
                            : 'Xem Phiếu Đánh Giá AI'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* PHIẾU ĐÁNH GIÁ AI ĐƯỢC NHÚNG TRỰC TIẾP (KHÔNG MỞ DRAWER) */}
              {showDossierDetail && dossier ? (
                <div className={styles.serviceCard}>
                  <div className={styles.serviceCardHeader}>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-xs btn-outline"
                        onClick={() => setShowDossierDetail(false)}
                      >
                        ← Quay lại câu hỏi gợi ý
                      </button>
                      <h3 className={styles.serviceCardTitle}>
                        <span>Hồ Sơ Đánh Giá Phỏng Vấn (Dossier v{dossier.version})</span>
                      </h3>
                    </div>

                    <button
                      type="button"
                      className="btn btn-xs btn-outline flex items-center gap-1.5"
                      onClick={handleExportDossierPdf}
                      disabled={downloadingPdf}
                    >
                      <FileDown size={13} />
                      <span>{downloadingPdf ? 'Đang xuất...' : 'Xuất file PDF'}</span>
                    </button>
                  </div>

                  {/* Summary Hero Score */}
                  <div className={styles.dossierSummaryHero}>
                    <div className={styles.dossierHeroScore}>
                      <div className={styles.aiScoreCircle}>
                        <span className={styles.dossierScoreNumber}>
                          {dossier.hrFinalTotalScore !== null && dossier.hrFinalTotalScore !== undefined
                            ? dossier.hrFinalTotalScore
                            : dossier.totalScore}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Điểm</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`badge ${
                              dossier.aiRecommendation === 'PASSED'
                                ? 'badge-success'
                                : dossier.aiRecommendation === 'REVIEW_NEEDED'
                                ? 'badge-warning'
                                : 'badge-danger'
                            }`}
                          >
                            Khuyến nghị AI: {dossier.aiRecommendation}
                          </span>
                          <span
                            className={`badge ${
                              dossier.proctoringStatus === 'CLEAN'
                                ? 'badge-success'
                                : 'badge-warning'
                            }`}
                          >
                            Giám sát: {dossier.proctoringStatus}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 max-w-lg mb-0">
                          {dossier.aiSummary || 'Phiếu đánh giá tự động tạo bởi mô hình AI phỏng vấn.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2 Cột: Điểm mạnh & Điểm cần cải thiện */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg text-xs">
                      <strong className="text-emerald-800 flex items-center gap-1 mb-1">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        Điểm mạnh trong bài thi:
                      </strong>
                      <p className="text-slate-700 m-0 leading-relaxed">
                        {dossier.strengthsSummary || 'Thể hiện tốt kiến thức nền tảng.'}
                      </p>
                    </div>

                    <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs">
                      <strong className="text-amber-800 flex items-center gap-1 mb-1">
                        <AlertTriangle size={14} className="text-amber-600" />
                        Điểm cần lưu ý &amp; cải thiện:
                      </strong>
                      <p className="text-slate-700 m-0 leading-relaxed">
                        {dossier.weaknessesSummary || 'Cần bổ sung thêm ví dụ thực tế.'}
                      </p>
                    </div>
                  </div>

                  {/* Chi tiết từng câu hỏi & bài trả lời của ứng viên */}
                  {dossier.answers && dossier.answers.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Chi tiết câu hỏi &amp; câu trả lời ({dossier.answers.length} câu)
                      </h4>
                      {dossier.answers.map((ans: AnswerEvaluationDetail, idx: number) => {
                        const isExpanded = expandedQId === ans.questionId;
                        return (
                          <div key={ans.questionId || idx} className={styles.answerCard}>
                            <div
                              className={`${styles.answerCardHeader} cursor-pointer`}
                              onClick={() => setExpandedQId(isExpanded ? null : ans.questionId)}
                            >
                              <div className="flex items-center gap-2">
                                <span className={styles.questionBadge}>
                                  Câu {idx + 1} · {ans.category || 'Chuyên môn'}
                                </span>
                                <span className="font-semibold text-xs text-slate-800">
                                  {ans.questionText}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                                  {ans.score} / 100 điểm
                                </span>
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="pt-3 border-t border-slate-100 text-xs space-y-2.5">
                                {/* Rubric Metrics */}
                                {ans.rubric && (
                                  <div className={styles.rubricGrid}>
                                    <div className={styles.rubricItem}>
                                      <span className={styles.rubricLabel}>Chính xác kỹ thuật</span>
                                      <span className={styles.rubricValue}>{ans.rubric.technicalAccuracy}</span>
                                    </div>
                                    <div className={styles.rubricItem}>
                                      <span className={styles.rubricLabel}>Tối ưu giải pháp</span>
                                      <span className={styles.rubricValue}>{ans.rubric.optimization}</span>
                                    </div>
                                    <div className={styles.rubricItem}>
                                      <span className={styles.rubricLabel}>Khả năng diễn đạt</span>
                                      <span className={styles.rubricValue}>{ans.rubric.articulation}</span>
                                    </div>
                                    <div className={styles.rubricItem}>
                                      <span className={styles.rubricLabel}>Xử lý trường hợp biên</span>
                                      <span className={styles.rubricValue}>{ans.rubric.edgeCases}</span>
                                    </div>
                                  </div>
                                )}

                                {ans.candidateAnswer && (
                                  <div>
                                    <strong className="text-slate-700 block mb-0.5">Câu trả lời ứng viên:</strong>
                                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 italic leading-relaxed">
                                      &ldquo;{ans.candidateAnswer}&rdquo;
                                    </div>
                                  </div>
                                )}

                                {ans.rationale && (
                                  <div>
                                    <strong className="text-slate-700 block mb-0.5">Nhận xét của AI:</strong>
                                    <p className="text-slate-600 m-0 leading-relaxed">{ans.rationale}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Bộ câu hỏi phỏng vấn chuẩn hóa */
                <div className={styles.serviceCard}>
                  <div className={styles.serviceCardHeader}>
                    <h3 className={styles.serviceCardTitle}>
                      <MessageSquare size={17} className="text-indigo-600" />
                      <span>Bộ Câu Hỏi Phỏng Vấn Gợi Ý Theo Năng Lực</span>
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">
                      {questionSets.length > 0 && questionSets[0].questions
                        ? `${questionSets[0].questions.length} câu hỏi`
                        : evaluation?.suggestedInterviewQuestions
                        ? `${evaluation.suggestedInterviewQuestions.length} câu hỏi`
                        : 'Tự động tạo bởi AI'}
                    </span>
                  </div>

                  {isLoadingQuestions ? (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      Đang tải bộ câu hỏi phỏng vấn...
                    </div>
                  ) : questionSets.length > 0 && questionSets[0].questions?.length ? (
                    <div>
                      {questionSets[0].questions.map((q: InterviewQuestionItem, idx: number) => (
                        <div key={q.id || idx} className={styles.questionBox}>
                          <div className={styles.questionHeader}>
                            <span className={styles.questionBadge}>
                              Câu {idx + 1} · {getQuestionCategoryLabel(q.category)}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {getDifficultyLabel(q.difficulty)}
                            </span>
                          </div>
                          <p className={styles.questionText}>{q.questionText}</p>
                          {q.expectedAnswer && (
                            <div className={styles.questionPurpose}>
                              <strong>Mục đích:</strong> {q.expectedAnswer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : evaluation?.suggestedInterviewQuestions && evaluation.suggestedInterviewQuestions.length > 0 ? (
                    <div>
                      {evaluation.suggestedInterviewQuestions.map((q: string, idx: number) => (
                        <div key={idx} className={styles.questionBox}>
                          <div className={styles.questionHeader}>
                            <span className={styles.questionBadge}>
                              Câu {idx + 1} · Gợi ý từ CV Screening
                            </span>
                          </div>
                          <p className={styles.questionText}>{q}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-slate-500 text-xs">
                      <p className="mb-2">Chưa có bộ câu hỏi phỏng vấn riêng biệt cho ứng viên này.</p>
                      <p className="text-slate-400">
                        Hệ thống sẽ tự động tổng hợp câu hỏi khi bạn tạo lịch phỏng vấn hoặc kích hoạt thẩm định AI.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateWorkspaceModal;
