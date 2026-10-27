import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, AlertCircle, Eye } from 'lucide-react';
import { Modal, Button, Skeleton } from '../../../../../../../../../components/common';
import { quizService } from '../../../../../../../../../services/quizService';
import type { QuizReportResponse, QuizInternReportDto } from '../../../../../../../../../types/quiz.types';
import type { QuizReportModalProps } from './QuizReportModal.types';
import { QuizSubmissionReviewModal } from '../QuizSubmissionReviewModal';
import styles from './QuizReportModal.module.css';

export const QuizReportModal: React.FC<QuizReportModalProps> = ({
  isOpen,
  onClose,
  quizId,
}) => {
  const [report, setReport] = useState<QuizReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<{
    submissionId: number;
    internName: string;
    internCode: string;
    groupName?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen && quizId) {
      let isMounted = true;
      setLoading(true);
      quizService
        .getQuizReport(quizId)
        .then((data: QuizReportResponse) => {
          if (isMounted) setReport(data);
        })
        .catch(() => {
          if (isMounted) setReport(null);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });

      return () => {
        isMounted = false;
      };
    } else {
      setReport(null);
    }
  }, [isOpen, quizId]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={report ? `Báo Cáo Điểm Số: ${report.quizTitle}` : 'Báo Cáo Kết Quả Bài Quiz'}
        size="lg"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
          </div>
        }
      >
        <div className={styles.container}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                <Skeleton height="70px" />
                <Skeleton height="70px" />
                <Skeleton height="70px" />
                <Skeleton height="70px" />
              </div>
              <Skeleton height="200px" />
            </div>
          ) : !report ? (
            <div className={styles.emptyBox}>
              <AlertCircle size={32} />
              <p>Không thể tải dữ liệu báo cáo cho bài Quiz này.</p>
            </div>
          ) : (
            <>
              {/* Bento 4 ô metrics */}
              <div className={styles.bentoGrid}>
                <div className={styles.bentoCard}>
                  <span className={styles.bentoLabel}>Đã giao</span>
                  <span className={styles.bentoValue}>{report.totalAssigned}</span>
                </div>
                <div className={styles.bentoCard}>
                  <span className={styles.bentoLabel}>Hoàn thành</span>
                  <span className={styles.bentoValue}>{report.completedCount}</span>
                </div>
                <div className={styles.bentoCard}>
                  <span className={styles.bentoLabel} style={{ color: 'var(--success)' }}>
                    Thi Đạt (Pass)
                  </span>
                  <span className={styles.bentoValue} style={{ color: 'var(--success)' }}>
                    {report.passedCount}
                  </span>
                </div>
                <div className={styles.bentoCard}>
                  <span className={styles.bentoLabel} style={{ color: 'var(--primary)' }}>
                    Điểm Trung Bình
                  </span>
                  <span className={styles.bentoValue} style={{ color: 'var(--primary)' }}>
                    {report.averageScore}
                  </span>
                </div>
              </div>

              {/* Bảng danh sách kết quả học viên */}
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Học viên</th>
                      <th>Nhóm</th>
                      <th>Lượt thi</th>
                      <th>Điểm cao nhất</th>
                      <th>Kết quả</th>
                      <th>Thời điểm nộp</th>
                      <th style={{ textAlign: 'center' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.internReports.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          Chưa có học viên nào làm bài thi này.
                        </td>
                      </tr>
                    ) : (
                      report.internReports.map((r: QuizInternReportDto) => (
                        <tr key={r.internId}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{r.fullName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.internCode}</div>
                          </td>
                          <td>{r.groupName || 'Chưa chia nhóm'}</td>
                          <td>{r.attemptsCount} lần</td>
                          <td>
                            {r.highestScore != null ? (
                              <span style={{ fontWeight: 700 }}>
                                {r.highestScore} / {r.totalPoints}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>Chưa thi</span>
                            )}
                          </td>
                          <td>
                            {r.attemptsCount === 0 ? (
                              <span className={styles.badgePending}>
                                <Clock size={12} /> Chưa làm
                              </span>
                            ) : r.passed ? (
                              <span className={styles.badgeSuccess}>
                                <CheckCircle2 size={12} /> ĐẠT
                              </span>
                            ) : (
                              <span className={styles.badgeDanger}>
                                <XCircle size={12} /> CHƯA ĐẠT
                              </span>
                            )}
                          </td>
                          <td>
                            {r.latestSubmittedAt ? (
                              new Date(r.latestSubmittedAt).toLocaleString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })
                            ) : (
                              '-'
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {(() => {
                              const targetSubId = r.submissionId ?? r.latestSubmissionId;
                              if (r.attemptsCount > 0 && targetSubId) {
                                return (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setSelectedSubmission({
                                        submissionId: targetSubId,
                                        internName: r.fullName,
                                        internCode: r.internCode,
                                        groupName: r.groupName,
                                      })
                                    }
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.35rem',
                                      padding: '0.25rem 0.65rem',
                                      fontSize: '0.78rem',
                                      fontWeight: 600,
                                    }}
                                  >
                                    <Eye size={13} /> Xem bài làm
                                  </Button>
                                );
                              }
                              if (r.attemptsCount > 0) {
                                return (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Đã nộp ({r.attemptsCount} lần)
                                  </span>
                                );
                              }
                              return (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  Chưa làm bài
                                </span>
                              );
                            })()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Modal Xem lại bài làm của học viên */}
      <QuizSubmissionReviewModal
        isOpen={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        submissionId={selectedSubmission?.submissionId ?? null}
        internName={selectedSubmission?.internName}
        internCode={selectedSubmission?.internCode}
        groupName={selectedSubmission?.groupName}
      />
    </>
  );
};
