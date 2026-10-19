import React, { useState, useEffect } from 'react';
import styles from './EvaluationDossierDrawer.module.css';
import { aiInterviewService } from '../../../../services/aiInterviewService';
import type { EvaluationDossier, AnswerEvaluationDetail } from '../../../../types/aiEvaluation.types';

interface EvaluationDossierDrawerProps {
  sessionId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export const EvaluationDossierDrawer: React.FC<EvaluationDossierDrawerProps> = ({
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

  if (!isOpen || !sessionId) return null;

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
      await loadDossier(dossier.sessionId);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert('Lỗi phê duyệt: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async () => {
    if (!dossier) return;
    if (!window.confirm('Bạn có chắc chắn muốn hủy phê duyệt hồ sơ này để sửa điểm/chấm lại?')) return;
    try {
      setSubmitting(true);
      await aiInterviewService.revokeApproval(dossier.sessionId);
      await loadDossier(dossier.sessionId);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert('Lỗi hủy phê duyệt: ' + (err.response?.data?.message || err.message));
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
      alert('Đã kích hoạt chấm lại bài thi trong nền. Vui lòng tải lại sau ít phút.');
      await loadDossier(dossier.sessionId);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert('Lỗi kích hoạt chấm lại: ' + (err.response?.data?.message || err.message));
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
    } catch (err: any) {
      alert('Lỗi tải file PDF: ' + (err.message || 'Không thể xuất file'));
    } finally {
      setDownloadingPdf(false);
    }
  };

  const isApproved = dossier?.hrReview?.status === 'APPROVED';
  const isRejected = dossier?.hrReview?.status === 'REJECTED';
  const isLocked = isApproved || isRejected;

  return (
    <div className={styles.drawerOverlay} onClick={onClose}>
      <div className={styles.drawerContainer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.drawerHeader}>
          <div className={styles.headerTitleGroup}>
            <h2 className={styles.headerTitle}>Hồ Sơ Đánh Giá Phỏng Vấn AI</h2>
            {dossier && <span className={styles.versionBadge}>v{dossier.version}</span>}
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.drawerBody}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Đang nạp dữ liệu đánh giá...</div>
              <div>Hệ thống đang tải bảng điểm và phân tích năng lực từ máy chủ AI.</div>
            </div>
          ) : errorMessage ? (
            <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
              <h3 style={{ fontSize: '1.1rem', color: '#ef4444', marginBottom: '0.5rem' }}>Không thể tải kết quả đánh giá</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{errorMessage}</p>
              <button
                type="button"
                onClick={() => sessionId && loadDossier(sessionId)}
                style={{
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
          ) : !dossier ? (
            <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</div>
              <h3 style={{ fontSize: '1.1rem', color: '#334155', marginBottom: '0.5rem' }}>Chưa có dữ liệu đánh giá</h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', maxWidth: '360px', margin: '0 auto' }}>
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
                  <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Đề thi: <strong>{dossier.scheduleTitle}</strong>
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
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  background: dossier.proctoringStatus === 'CLEAN' ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${dossier.proctoringStatus === 'CLEAN' ? '#bbf7d0' : '#fecaca'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <strong>Trạng thái giám sát: </strong>
                  <span
                    style={{
                      color: dossier.proctoringStatus === 'CLEAN' ? '#16a34a' : '#dc2626',
                      fontWeight: 700,
                    }}
                  >
                    {dossier.proctoringStatus}
                  </span>
                </div>
                <div style={{ color: '#64748b' }}>
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
                    <strong>✨ Điểm sáng nổi bật:</strong>
                    <p style={{ margin: '0.25rem 0 0 0' }}>{dossier.strengthsSummary}</p>
                  </div>
                  <div className={`${styles.insightBox} ${styles.weaknessBox}`}>
                    <strong>⚠️ Điểm cần cải thiện:</strong>
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
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#065f46' }}>
                            {overrides[ans.questionId] !== undefined ? overrides[ans.questionId] : ans.score}/100
                          </span>
                          <span style={{ color: '#94a3b8' }}>{isExpanded ? '▲' : '▼'}</span>
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
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                              BÀI LÀM CỦA ỨNG VIÊN:
                            </span>
                            <div className={styles.candidateAnswerBox}>
                              {ans.candidateAnswer || '[Không có nội dung trả lời]'}
                            </div>
                          </div>

                          <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                            <strong>Trích dẫn căn cứ: </strong>
                            <em style={{ color: '#4338ca' }}>"{ans.evidenceQuote}"</em>
                          </div>

                          <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                            <strong>Lý giải của AI: </strong>
                            {ans.rationale}
                          </div>

                          {/* HR Override input for each question */}
                          <div
                            style={{
                              marginTop: '0.5rem',
                              padding: '0.5rem 0.75rem',
                              background: '#f8fafc',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                            }}
                          >
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
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
                                padding: '0.2rem 0.4rem',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
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
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {dossier && (
          <div className={styles.drawerFooter}>
            <div className={styles.footerLeftActions}>
              <button
                className={styles.btnSecondary}
                onClick={handleExportPdf}
                disabled={downloadingPdf}
              >
                {downloadingPdf ? '⏳ Đang tạo PDF...' : '📄 Xuất PDF'}
              </button>
              {isLocked ? (
                <button
                  className={styles.btnSecondary}
                  onClick={handleRevoke}
                  disabled={submitting}
                  style={{ color: '#d97706', borderColor: '#fde68a' }}
                >
                  🔓 Hủy phê duyệt
                </button>
              ) : (
                <button
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
                    className={styles.btnDanger}
                    onClick={() => handleReviewDecision('REJECTED')}
                    disabled={submitting}
                  >
                    ❌ Từ chối
                  </button>
                  <button
                    className={styles.btnSuccess}
                    onClick={() => handleReviewDecision('APPROVED')}
                    disabled={submitting}
                  >
                    ✅ Phê duyệt (Pass)
                  </button>
                </>
              ) : (
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: isApproved ? '#16a34a' : '#dc2626',
                    padding: '0.4rem 0.75rem',
                    background: isApproved ? '#f0fdf4' : '#fef2f2',
                    borderRadius: '6px',
                  }}
                >
                  {isApproved ? '✅ ĐÃ PHÊ DUYỆT' : '❌ ĐÃ TỪ CHỐI'}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
