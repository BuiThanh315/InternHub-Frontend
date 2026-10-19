import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Download,
  Clock,
  Mail,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../../components/common';
import { aiInterviewService } from '../../../../services/aiInterviewService';
import { internService } from '../../../../services/internService';
import { AssignMentorModal } from '../AssignMentorModal';
import type { InternProfile } from '../../../../types';
import type { EvaluationDossier, HrEvaluationStatus } from '../../../../types/aiEvaluation.types';
import styles from './AiInterviewEvaluationTab.module.css';

interface AiInterviewEvaluationTabProps {
  intern: InternProfile;
}

export const AiInterviewEvaluationTab: React.FC<AiInterviewEvaluationTabProps> = ({ intern }) => {
  const [currentIntern, setCurrentIntern] = useState<InternProfile>(intern);
  const [loading, setLoading] = useState<boolean>(true);
  const [dossier, setDossier] = useState<EvaluationDossier | null>(null);
  const [expandedQId, setExpandedQId] = useState<number | null>(null);
  const [overrides, setOverrides] = useState<Record<number, number>>({});
  const [hrNotes, setHrNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [isSendingOffer, setIsSendingOffer] = useState<boolean>(false);
  const [isAssignMentorOpen, setIsAssignMentorOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setCurrentIntern(intern);
  }, [intern]);

  useEffect(() => {
    loadInterviewEvaluation();
  }, [intern.id, intern.email]);

  const loadInterviewEvaluation = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const session = await aiInterviewService.getCandidateInterviewSession({
        candidateId: intern.id,
        email: intern.email,
      });

      if (!session || !session.sessionId) {
        setDossier(null);
        return;
      }

      const data = await aiInterviewService.getEvaluationDossier(session.sessionId);
      setDossier(data);
      setHrNotes(data.hrReview?.notes || '');
      const initialOverrides: Record<number, number> = {};
      data.answers?.forEach((a) => {
        if (a.hrOverrideScore !== null && a.hrOverrideScore !== undefined) {
          initialOverrides[a.questionId] = a.hrOverrideScore;
        }
      });
      setOverrides(initialOverrides);
      if (data.answers?.length) {
        setExpandedQId(data.answers[0].questionId);
      }
    } catch (err: any) {
      console.warn('Lỗi khi nạp phiếu đánh giá phỏng vấn AI:', err);
      const msg = err.response?.data?.message || err.message || 'Lỗi kết nối máy chủ.';
      setErrorMessage(msg);
      setDossier(null);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (questionId: number, valStr: string) => {
    const val = parseFloat(valStr);
    setOverrides((prev) => ({
      ...prev,
      [questionId]: isNaN(val) ? 0 : Math.min(100, Math.max(0, val)),
    }));
  };

  const handleSaveReview = async (status: HrEvaluationStatus) => {
    if (!dossier) return;
    try {
      setIsSubmitting(true);
      const questionOverrides = Object.entries(overrides).map(([qId, s]) => ({
        questionId: Number(qId),
        overrideScore: s,
      }));

      const res = await aiInterviewService.reviewEvaluation(dossier.sessionId, {
        hrStatus: status,
        notes: hrNotes.trim(),
        questionOverrides,
      });

      setDossier(res);

      // 1-Click Convert Hand-off: Đồng bộ quyết định sang intern-service để kích hoạt Onboarding & gửi Email chào mừng
      if (status === 'APPROVED' || status === 'REJECTED') {
        try {
          await internService.submitDecision(intern.id, {
            decision: status,
            rejectionReason: status === 'REJECTED' ? hrNotes.trim() || 'Không đạt yêu cầu kỹ thuật trong buổi phỏng vấn AI' : undefined,
            programId: intern.programId ?? undefined,
          });
          if (status === 'APPROVED') {
            toast.success('Đã tự động chuyển đổi hồ sơ: Kích hoạt Onboarding & Gửi email chào mừng thành công!');
          }
        } catch (decisionErr: any) {
          console.warn('Cảnh báo đồng bộ hồ sơ thực tập sinh:', decisionErr);
          toast.info('Kết quả AI đã lưu. Vui lòng kiểm tra trạng thái hồ sơ trong danh sách tuyển dụng.');
        }
      } else {
        toast.success('Đã lưu nháp điều chỉnh điểm thành công!');
      }
    } catch (err: any) {
      console.error('Lỗi khi lưu đánh giá:', err);
      toast.error(err.response?.data?.message || 'Không thể lưu phê duyệt kết quả.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!dossier) return;
    try {
      setIsDownloadingPdf(true);
      const blob = await aiInterviewService.exportDossierPdf(dossier.sessionId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Danh_Gia_AI_${intern.fullName || 'Ung_Vien'}_Session_${dossier.sessionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Đã tải xuống Báo cáo kết quả PDF thành công!');
    } catch (err: any) {
      console.error('Lỗi xuất PDF:', err);
      toast.error('Không thể xuất tệp PDF lúc này.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleResendOffer = async () => {
    try {
      setIsSendingOffer(true);
      await internService.resendDecisionEmail(currentIntern.id);
      toast.success(`Đã gửi Thư Mời Thực Tập (Offer Letter) tới ${currentIntern.email}!`);
    } catch (err: any) {
      console.error('Lỗi gửi email offer:', err);
      toast.error(err.response?.data?.message || 'Không thể gửi email lúc này.');
    } finally {
      setIsSendingOffer(false);
    }
  };

  const handleMentorAssignedSuccess = (updated: InternProfile) => {
    setCurrentIntern(updated);
    setIsAssignMentorOpen(false);
    toast.success(`Đã gán Mentor ${updated.mentorName || ''} thành công!`);
  };

  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <Clock size={24} className="animate-spin text-indigo-600 mb-2" />
        <span>Đang nạp dữ liệu đánh giá phỏng vấn AI...</span>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className={styles.emptyBox}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
        <div className={styles.emptyTitle} style={{ color: '#ef4444' }}>Không thể tải kết quả đánh giá</div>
        <p className={styles.emptyDesc}>{errorMessage}</p>
        <button
          type="button"
          onClick={() => void loadInterviewEvaluation()}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1.25rem',
            borderRadius: '6px',
            background: '#8b5cf6',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className={styles.emptyBox}>
        <Sparkles size={36} className="text-slate-400" />
        <div className={styles.emptyTitle}>Chưa có kết quả phỏng vấn AI</div>
        <p className={styles.emptyDesc}>
          Ứng viên <strong>{intern.fullName}</strong> chưa hoàn thành bài thi phỏng vấn trực tuyến
          hoặc bài làm đang trong tiến trình chấm điểm của AI Grader Engine.
        </p>
      </div>
    );
  }

  const effectiveTotal = dossier.hrFinalTotalScore ?? dossier.totalScore;
  const isHigh = effectiveTotal >= 70;
  const isMed = effectiveTotal >= 50 && effectiveTotal < 70;

  return (
    <div className={styles.container}>
      {/* Hero Score Section */}
      <div className={styles.heroCard}>
        <div className={styles.heroScoreSection}>
          <div
            className={`${styles.scoreCircle} ${
              isHigh
                ? styles.scoreCirclePass
                : isMed
                ? styles.scoreCircleReview
                : styles.scoreCircleFail
            }`}
          >
            <span className={styles.scoreNum}>{effectiveTotal.toFixed(1)}</span>
            <span className={styles.scoreLabel}>/ 100 Điểm</span>
          </div>
          <div className={styles.heroMeta}>
            <div className={styles.heroTitle}>{dossier.scheduleTitle}</div>
            <div className={styles.badgeRow}>
              <span
                className={`badge ${
                  dossier.aiRecommendation === 'PASSED'
                    ? 'badge-success'
                    : dossier.aiRecommendation === 'REVIEW_NEEDED'
                    ? 'badge-warning'
                    : 'badge-danger'
                }`}
              >
                AI: {dossier.aiRecommendation}
              </span>
              <span
                className={`badge ${
                  dossier.hrReview?.status === 'APPROVED'
                    ? 'badge-success'
                    : dossier.hrReview?.status === 'REJECTED'
                    ? 'badge-danger'
                    : 'badge-neutral'
                }`}
              >
                HR: {dossier.hrReview?.status || 'PENDING_REVIEW'}
              </span>
              {dossier.proctoringStatus === 'CLEAN' ? (
                <span className="badge badge-success flex items-center gap-1">
                  <ShieldCheck size={12} /> Giám sát: Sạch
                </span>
              ) : (
                <span className="badge badge-danger flex items-center gap-1">
                  <ShieldAlert size={12} /> Nghi vấn gian lận
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.heroActions}>
          <button
            type="button"
            className={styles.btnDownload}
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
          >
            <Download size={13} />
            <span>{isDownloadingPdf ? 'Đang tạo PDF...' : 'Tải Báo Cáo PDF'}</span>
          </button>
        </div>
      </div>

      {/* Hành động kế tiếp (Next Step Actions) khi ứng viên được HR Phê duyệt */}
      {(dossier.hrReview?.status === 'APPROVED' || currentIntern.status === 'APPROVED' || currentIntern.status === 'INTERNING') && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              🎉 Ứng viên đã vượt qua vòng phỏng vấn & được phê duyệt!
            </span>
            <span className="text-xs text-emerald-600">
              Mentor hiện tại: {currentIntern.mentorName ? (
                <span className="font-semibold">{currentIntern.mentorName} ({currentIntern.mentorEmail})</span>
              ) : (
                <span className="italic text-amber-700 font-medium">Chưa phân công Mentor</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResendOffer}
              disabled={isSendingOffer}
              className="flex items-center gap-1.5 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
            >
              <Mail size={14} />
              {isSendingOffer ? 'Đang gửi...' : 'Gửi lại Thư Mời (Offer)'}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsAssignMentorOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <UserCheck size={14} />
              {currentIntern.mentorId ? 'Đổi Mentor Phụ Trách' : 'Gán Mentor & Chương Trình'}
            </Button>
          </div>
        </div>
      )}

      {/* Rubric Radar Summary */}
      <div className={styles.radarGrid}>
        <div className={styles.rubricCard}>
          <span className={styles.rubricLabel}>Chính xác kỹ thuật (40%)</span>
          <span className={styles.rubricValue}>
            {dossier.answers?.[0]?.rubric?.technicalAccuracy ?? 0}/100
          </span>
        </div>
        <div className={styles.rubricCard}>
          <span className={styles.rubricLabel}>Tối ưu code / KT (30%)</span>
          <span className={styles.rubricValue}>
            {dossier.answers?.[0]?.rubric?.optimization ?? 0}/100
          </span>
        </div>
        <div className={styles.rubricCard}>
          <span className={styles.rubricLabel}>Mạch lạc & Trình bày (20%)</span>
          <span className={styles.rubricValue}>
            {dossier.answers?.[0]?.rubric?.articulation ?? 0}/100
          </span>
        </div>
        <div className={styles.rubricCard}>
          <span className={styles.rubricLabel}>Xử lý Ngoại lệ (10%)</span>
          <span className={styles.rubricValue}>
            {dossier.answers?.[0]?.rubric?.edgeCases ?? 0}/100
          </span>
        </div>
      </div>

      {/* AI Summary & Strengths / Weaknesses */}
      <div className={styles.summarySection}>
        <div className={styles.summaryTitle}>
          <Sparkles size={15} className="text-indigo-600" />
          <span>Nhận định tổng quan từ AI Grader</span>
        </div>
        <p className={styles.summaryText}>{dossier.aiSummary}</p>
        <div className={styles.twoCol}>
          <div className={styles.proBox}>
            <strong>✓ Điểm mạnh ghi nhận:</strong>
            <p className="mt-1">{dossier.strengthsSummary || 'Không có ghi nhận nổi bật'}</p>
          </div>
          <div className={styles.conBox}>
            <strong>✗ Điểm hạn chế cần cải thiện:</strong>
            <p className="mt-1">{dossier.weaknessesSummary || 'Không có ghi nhận tiêu cực'}</p>
          </div>
        </div>
      </div>

      {/* Danh sách câu hỏi và câu trả lời */}
      <div className={styles.answersList}>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
          Chi tiết từng câu hỏi & Đối soát câu trả lời ({dossier.answers?.length || 0})
        </div>

        {dossier.answers?.map((ans, idx) => {
          const isExpanded = expandedQId === ans.questionId;
          const currentScore = overrides[ans.questionId] ?? ans.score;

          return (
            <div key={ans.questionId} className={styles.answerItem}>
              <div
                className={styles.answerHeader}
                onClick={() => setExpandedQId(isExpanded ? null : ans.questionId)}
              >
                <div className={styles.answerHeaderLeft}>
                  <span className="text-indigo-600 font-mono">#{idx + 1}</span>
                  <span>{ans.questionText}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-slate-800">
                    {currentScore.toFixed(1)} / 100
                  </span>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {isExpanded && (
                <div className={styles.answerBody}>
                  <div>
                    <span className="text-xs font-semibold text-slate-500">
                      Bài làm của ứng viên:
                    </span>
                    <div className={styles.quoteBox}>
                      "{ans.candidateAnswer || '<Bỏ trắng>'}"
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-500">Đánh giá tiêu chí:</span>
                    <p className="text-xs text-slate-700 mt-0.5">{ans.rationale}</p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-500">
                      Đáp án & Lời giải chuẩn:
                    </span>
                    <p className="text-xs text-emerald-700 font-mono mt-0.5 bg-emerald-50 p-2 rounded border border-emerald-200">
                      {ans.suggestedSolution}
                    </p>
                  </div>

                  <div className={styles.overrideRow}>
                    <span className="text-xs font-medium text-slate-600">
                      HR điều chỉnh điểm câu này (Thang 100):
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={currentScore}
                        onChange={(e) => handleScoreChange(ans.questionId, e.target.value)}
                        className="w-20 px-2 py-1 text-xs border border-slate-300 rounded text-center font-bold"
                      />
                      <span className="text-xs text-slate-400">/ 100</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* HR Review Action Box */}
      <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-700">
          Ghi chú & Nhận xét thẩm định của HR:
        </label>
        <textarea
          rows={3}
          className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:outline-indigo-500"
          placeholder="Nhập lý do điều chỉnh điểm hoặc lưu ý cho kỳ tuyển dụng..."
          value={hrNotes}
          onChange={(e) => setHrNotes(e.target.value)}
        />
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => handleSaveReview('PENDING_REVIEW')}
            disabled={isSubmitting}
          >
            Lưu Nháp
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => handleSaveReview('REJECTED')}
            disabled={isSubmitting}
          >
            Từ Chối
          </Button>
          <Button
            type="button"
            variant="success"
            size="sm"
            onClick={() => handleSaveReview('APPROVED')}
            disabled={isSubmitting}
          >
            Phê Duyệt Kết Quả
          </Button>
        </div>
      </div>

      {/* Modal Phân công / Đổi Mentor trực tiếp */}
      {isAssignMentorOpen && (
        <AssignMentorModal
          intern={currentIntern}
          onClose={() => setIsAssignMentorOpen(false)}
          onSuccess={handleMentorAssignedSuccess}
        />
      )}
    </div>
  );
};
