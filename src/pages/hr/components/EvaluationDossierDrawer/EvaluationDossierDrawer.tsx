import React, { useState, useEffect } from 'react';
import styles from './EvaluationDossierDrawer.module.css';
import { Modal } from '../../../../components/common/Modal/Modal';
import { ConfirmModal } from '../../../../components/common/Modal/ConfirmModal';
import { toast } from 'sonner';
import { aiInterviewService } from '../../../../services/aiInterviewService';
import type { EvaluationDossier, AnswerEvaluationDetail } from '../../../../types/aiEvaluation.types';

export interface EvaluationDossierModalProps {
  sessionId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export const EvaluationDossierModal: React.FC<EvaluationDossierModalProps> = ({
  sessionId,
  isOpen,
  onClose,
  onRefresh,
}) => {
  const [dossier, setDossier] = useState<EvaluationDossier | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedQId, setExpandedQId] = useState<number | null>(null);
  const [hrNotes, setHrNotes] = useState<string>('');
  const [overrides, setOverrides] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRevokeConfirmOpen, setIsRevokeConfirmOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && sessionId) {
      setErrorMessage(null);
      loadDossier(sessionId);
    } else {
      setDossier(null);
      setOverrides({});
      setHrNotes('');
      setErrorMessage(null);
    }
  }, [isOpen, sessionId]);

  const loadDossier = async (sId: number) => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await aiInterviewService.getEvaluationDossier(sId);
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
      console.error('Không thể tải phiếu đánh giá:', err);
      const msg = err.response?.data?.message || err.message || 'Lỗi kết nối máy chủ.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (qId: number, valStr: string) => {
    const val = parseFloat(valStr);
    setOverrides((prev) => ({
      ...prev,
      [qId]: isNaN(val) ? 0 : Math.min(100, Math.max(0, val)),
    }));
  };

  const handleReviewDecision = async (status: 'APPROVED' | 'REJECTED') => {
    if (!dossier) return;
    try {
      setSubmitting(true);
      const questionOverrides = Object.entries(overrides).map(([qId, score]) => ({
        questionId: Number(qId),
        overrideScore: score,
      }));
      await aiInterviewService.reviewEvaluation(dossier.sessionId, {
        hrStatus: status,
        notes: hrNotes,
        questionOverrides,
      });
      toast.success(status === 'APPROVED' ? 'Đã phê duyệt đạt kết quả phỏng vấn!' : 'Đã từ chối kết quả phỏng vấn.');
      await loadDossier(dossier.sessionId);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error('Lỗi phê duyệt: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeConfirm = async () => {
    if (!dossier) return;
    try {
      setSubmitting(true);
      await aiInterviewService.revokeApproval(dossier.sessionId);
      toast.success('Đã hủy phê duyệt hồ sơ thành công.');
      setIsRevokeConfirmOpen(false);
      await loadDossier(dossier.sessionId);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error('Lỗi hủy phê duyệt: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegrade = async () => {
    if (!dossier) return;
    const reason = window.prompt('Nhập lý do kích hoạt chấm lại bằng AI:');
    if (!reason || !reason.trim()) return;
    try {
      setSubmitting(true);
      await aiInterviewService.triggerRegrade(dossier.sessionId, { reason: reason.trim() });
      toast.success('Đã kích hoạt chấm lại bài thi trong nền. Vui lòng tải lại sau ít phút.');
      await loadDossier(dossier.sessionId);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error('Lỗi kích hoạt chấm lại: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportPdf = async () => {
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
      toast.success('Tải hồ sơ PDF thành công!');
    } catch (err: any) {
      toast.error('Lỗi tải file PDF: ' + (err.message || 'Không thể xuất file'));
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (!isOpen || !sessionId) return null;

  const isApproved = dossier?.hrReview?.status === 'APPROVED';
  const isRejected = dossier?.hrReview?.status === 'REJECTED';
  const isLocked = isApproved || isRejected;

  const modalTitle = (
    <div className={styles.modalHeaderTitle}>
      <h2 className={styles.headerTitle}>Hồ Sơ Đánh Giá Phỏng Vấn AI</h2>
      {dossier && <span className={styles.versionBadge}>v{dossier.version}</span>}
    </div>
  );

  const modalFooter = dossier ? (
    <div className={styles.footerContainer}>
      <div className={styles.footerLeftActions}>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={handleExportPdf}
          disabled={downloadingPdf}
        >
          {downloadingPdf ? '⏳ Đang tạo PDF...' : '📄 Xuất PDF'}
        </button>
        {isLocked ? (
          <button
            type="button"
            className={styles.btnWarning}
            onClick={() => setIsRevokeConfirmOpen(true)}
            disabled={submitting}
          >
            🔓 Hủy phê duyệt
          </button>
        ) : (
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleRegrade}
            disabled={submitting}
          >
            🔄 Chấm lại (AI)
          </button>
        )}
      </div>

      <div className={styles.footerRightActions}>
        {!isLocked ? (
          <>
            <button
              type="button"
              className={styles.btnDanger}
              onClick={() => handleReviewDecision('REJECTED')}
              disabled={submitting}
            >
              ❌ Từ chối
            </button>
            <button
              type="button"
              className={styles.btnSuccess}
              onClick={() => handleReviewDecision('APPROVED')}
              disabled={submitting}
            >
              ✅ Phê duyệt (Pass)
            </button>
          </>
        ) : (
          <span
            className={`${styles.statusPill} ${
              isApproved ? styles.statusPillApproved : styles.statusPillRejected
            }`}
          >
            {isApproved ? '✅ ĐÃ PHÊ DUYỆT' : '❌ ĐÃ TỪ CHỐI'}
          </span>
        )}
      </div>
    </div>
  ) : undefined;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      footer={modalFooter}
      size="xl"
    >
      <div className={styles.modalContentWrapper}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted, #64748b)' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main, #0f172a)' }}>
              Đang nạp dữ liệu đánh giá...
            </div>
            <div>Hệ thống đang tải bảng điểm và phân tích năng lực từ máy chủ AI.</div>
          </div>
        ) : errorMessage ? (
          <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--danger, #ef4444)', marginBottom: '0.5rem' }}>
              Không thể tải kết quả đánh giá
            </h3>
            <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={() => sessionId && loadDossier(sessionId)}
              className={styles.btnPrimary}
            >
              Thử lại
            </button>
          </div>
        ) : !dossier ? (
          <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main, #1e293b)', marginBottom: '0.5rem' }}>
              Chưa có dữ liệu đánh giá
            </h3>
            <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', maxWidth: '360px', margin: '0 auto' }}>
              Ứng viên chưa hoàn thành bài thi hoặc tiến trình AI chấm điểm đang được xử lý trong nền. Vui lòng kiểm tra lại sau.
            </p>
          </div>
        ) : (
          <>
            {/* Summary Bar */}
            <div className={styles.summaryCard}>
              <div className={styles.candidateInfo}>
                <h3>{dossier.candidateName}</h3>
                <p className={styles.candidateEmail}>{dossier.candidateEmail}</p>
                <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted, #64748b)' }}>
                  Đề thi: <strong style={{ color: 'var(--text-main, #0f172a)' }}>{dossier.scheduleTitle}</strong>
                </p>
              </div>
              <div className={styles.scoreBadgeGroup}>
                <div className={styles.scoreCircle}>
                  <span className={styles.scoreNumber}>
                    {dossier.hrFinalTotalScore !== null && dossier.hrFinalTotalScore !== undefined
                      ? dossier.hrFinalTotalScore
                      : dossier.totalScore}
                  </span>
                  <span className={styles.scoreLabel}>Điểm / 100</span>
                </div>
              </div>
            </div>

            {/* Anti-cheat & Proctoring Status */}
            <div
              className={`${styles.proctoringBar} ${
                dossier.proctoringStatus === 'CLEAN' ? styles.proctoringClean : styles.proctoringSuspicious
              }`}
            >
              <div>
                <strong style={{ color: 'var(--text-main, #0f172a)' }}>Trạng thái giám sát: </strong>
                <span
                  style={{
                    color: dossier.proctoringStatus === 'CLEAN' ? 'var(--success, #16a34a)' : 'var(--danger, #dc2626)',
                    fontWeight: 700,
                  }}
                >
                  {dossier.proctoringStatus}
                </span>
              </div>
              <div style={{ color: 'var(--text-muted, #64748b)' }}>
                Rời tab: <strong>{dossier.antiCheatInfo?.blurCount || 0}</strong> lần | Dán văn bản:{' '}
                <strong>{dossier.antiCheatInfo?.pasteCount || 0}</strong> lần
              </div>
            </div>

            {/* Insights Section */}
            <div className={styles.insightsSection}>
              <h4 className={styles.sectionHeading}>🤖 Đánh Giá Tổng Quan Từ AI (Gemini 1.5 Pro)</h4>
              <div className={styles.aiSummaryText}>{dossier.aiSummary}</div>
              <div className={styles.insightGrid}>
                <div className={`${styles.insightBox} ${styles.strengthBox}`}>
                  <strong style={{ color: 'var(--success, #10b981)' }}>✨ Điểm sáng nổi bật:</strong>
                  <p style={{ margin: '0.25rem 0 0 0' }}>{dossier.strengthsSummary}</p>
                </div>
                <div className={`${styles.insightBox} ${styles.weaknessBox}`}>
                  <strong style={{ color: 'var(--warning, #d97706)' }}>⚠️ Điểm cần cải thiện:</strong>
                  <p style={{ margin: '0.25rem 0 0 0' }}>{dossier.weaknessesSummary}</p>
                </div>
              </div>
            </div>

            {/* Question Breakdown Accordion */}
            <div>
              <h4 className={styles.sectionHeading}>📝 Chi Tiết Câu Trả Lời & Tiêu Chí Rubric</h4>
              {dossier.answers?.map((ans: AnswerEvaluationDetail, idx: number) => {
                const isExpanded = expandedQId === ans.questionId;
                return (
                  <div key={ans.questionId} className={styles.accordionItem}>
                    <div
                      className={styles.accordionHeader}
                      onClick={() => setExpandedQId(isExpanded ? null : ans.questionId)}
                    >
                      <span className={styles.qTitle}>
                        Câu {idx + 1}: {ans.questionText.slice(0, 70)}...
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success, #10b981)' }}>
                          {overrides[ans.questionId] !== undefined ? overrides[ans.questionId] : ans.score}/100
                        </span>
                        <span style={{ color: 'var(--text-muted, #94a3b8)' }}>{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className={styles.accordionContent}>
                        <div className={styles.rubricPills}>
                          <span className={styles.rubricPill}>Accuracy: {ans.rubric?.technicalAccuracy}</span>
                          <span className={styles.rubricPill}>Optimization: {ans.rubric?.optimization}</span>
                          <span className={styles.rubricPill}>Articulation: {ans.rubric?.articulation}</span>
                          <span className={styles.rubricPill}>Edge Cases: {ans.rubric?.edgeCases}</span>
                        </div>

                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>
                            BÀI LÀM CỦA ỨNG VIÊN:
                          </span>
                          <div className={styles.candidateAnswerBox}>
                            {ans.candidateAnswer || '[Không có nội dung trả lời]'}
                          </div>
                        </div>

                        <div style={{ fontSize: '0.85rem', color: 'var(--text-main, #334155)' }}>
                          <strong>Trích dẫn căn cứ: </strong>
                          <em style={{ color: 'var(--primary, #6366f1)' }}>"{ans.evidenceQuote}"</em>
                        </div>

                        <div style={{ fontSize: '0.85rem', color: 'var(--text-main, #334155)' }}>
                          <strong>Lý giải của AI: </strong>
                          {ans.rationale}
                        </div>

                        {/* HR Override input for each question */}
                        <div
                          style={{
                            marginTop: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            background: 'var(--bg-subtle, #f8fafc)',
                            borderRadius: 'var(--radius-md, 6px)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            border: '1px solid var(--border-default, #e2e8f0)',
                          }}
                        >
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main, #475569)' }}>
                            HR điều chỉnh điểm câu này:
                          </span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            disabled={isLocked}
                            value={overrides[ans.questionId] !== undefined ? overrides[ans.questionId] : ans.score}
                            onChange={(e) => handleScoreChange(ans.questionId, e.target.value)}
                            style={{
                              width: '70px',
                              padding: '0.25rem 0.5rem',
                              borderRadius: 'var(--radius-sm, 4px)',
                              border: '1px solid var(--border-default, #cbd5e1)',
                              background: 'var(--bg-card, #ffffff)',
                              color: 'var(--text-main, #0f172a)',
                              fontWeight: 600,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* HR Notes */}
            <div>
              <h4 className={styles.sectionHeading}>📌 Nhận Xét Của HR</h4>
              <textarea
                rows={3}
                disabled={isLocked}
                value={hrNotes}
                onChange={(e) => setHrNotes(e.target.value)}
                placeholder="Ghi chú nội bộ dành cho ứng viên này..."
                className={styles.hrNotesTextarea}
              />
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={isRevokeConfirmOpen}
        title="Xác nhận hủy phê duyệt"
        message="Bạn có chắc chắn muốn hủy phê duyệt hồ sơ này để sửa điểm/chấm lại? Dữ liệu đánh giá sẽ quay về trạng thái chờ xử lý."
        confirmText="Hủy phê duyệt"
        cancelText="Đóng"
        variant="warning"
        isLoading={submitting}
        onConfirm={handleRevokeConfirm}
        onClose={() => setIsRevokeConfirmOpen(false)}
      />
    </Modal>
  );
};

// Backward-compatible alias
export const EvaluationDossierDrawer = EvaluationDossierModal;
export type EvaluationDossierDrawerProps = EvaluationDossierModalProps;
