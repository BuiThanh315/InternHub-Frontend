import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Check,
  X,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Modal, Button, Skeleton } from '../../../../../../../../../components/common';
import { quizService } from '../../../../../../../../../services/quizService';
import type {
  QuizResultResponse,
  QuizAnswerResultResponse,
  QuizOptionResponse,
} from '../../../../../../../../../types/quiz.types';
import type { QuizSubmissionReviewModalProps } from './QuizSubmissionReviewModal.types';
import styles from './QuizSubmissionReviewModal.module.css';

export const QuizSubmissionReviewModal: React.FC<QuizSubmissionReviewModalProps> = ({
  isOpen,
  onClose,
  submissionId,
  internName,
  internCode,
  groupName,
}) => {
  const [result, setResult] = useState<QuizResultResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && submissionId) {
      let isMounted = true;
      setLoading(true);
      setError(null);

      quizService
        .getMentorSubmissionResult(submissionId)
        .then((data: QuizResultResponse) => {
          if (isMounted) setResult(data);
        })
        .catch((err: any) => {
          if (isMounted) {
            setError(err?.message || 'Không thể tải chi tiết bài làm của học viên.');
            setResult(null);
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });

      return () => {
        isMounted = false;
      };
    } else {
      setResult(null);
      setError(null);
    }
  }, [isOpen, submissionId]);

  const formatDuration = (startedAt?: string, submittedAt?: string) => {
    if (!startedAt || !submittedAt) return '-';
    const sec = Math.max(
      0,
      Math.floor((new Date(submittedAt).getTime() - new Date(startedAt).getTime()) / 1000)
    );
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m === 0) return `${s} giây`;
    return `${m} phút ${s > 0 ? `${s} giây` : ''}`;
  };

  const answerResults = result?.answerResults || [];
  const correctCount = answerResults.filter((a: QuizAnswerResultResponse) => a.isCorrect).length;
  const totalQuestions = answerResults.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={result ? `Chi Tiết Bài Làm: ${result.quizTitle}` : 'Xem Lại Bài Làm Của Học Viên'}
      size="xl"
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
            <Skeleton height="60px" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              <Skeleton height="75px" />
              <Skeleton height="75px" />
              <Skeleton height="75px" />
              <Skeleton height="75px" />
            </div>
            <Skeleton height="150px" />
            <Skeleton height="150px" />
          </div>
        ) : error || !result ? (
          <div className={styles.emptyState}>
            <AlertCircle size={36} style={{ color: 'var(--danger)' }} />
            <p>{error || 'Không tìm thấy dữ liệu bài thi của học viên.'}</p>
          </div>
        ) : (
          <>
            {/* Thanh thông tin Học viên */}
            <div className={styles.studentMetaBar}>
              <div className={styles.studentInfo}>
                <div className={styles.studentAvatar}>
                  {(internName || 'U').charAt(0).toUpperCase()}
                </div>
                <div className={styles.studentNameGroup}>
                  <span className={styles.studentName}>{internName || 'Học viên'}</span>
                  <span className={styles.studentCode}>{internCode || 'Mã học viên'}</span>
                </div>
              </div>
              {groupName && <span className={styles.studentGroupTag}>{groupName}</span>}
            </div>

            {/* Bento Metrics Tóm Tắt */}
            <div className={styles.bentoGrid}>
              <div className={styles.bentoCard}>
                <span className={styles.bentoLabel}>Điểm Số Đạt Được</span>
                <div className={styles.bentoValue}>
                  <span>
                    {result.score} / {result.totalPoints}
                  </span>
                  <span className={styles.bentoSub}>({Math.round(result.percentageScore)}%)</span>
                </div>
                <div>
                  {result.passed ? (
                    <span className={styles.badgePassed}>
                      <CheckCircle2 size={13} /> ĐẠT
                    </span>
                  ) : (
                    <span className={styles.badgeFailed}>
                      <XCircle size={13} /> CHƯA ĐẠT
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.bentoCard}>
                <span className={styles.bentoLabel}>Lượt Làm Bài</span>
                <div className={styles.bentoValue}>
                  <span>Lần {result.attemptNumber}</span>
                  <span className={styles.bentoSub}>/ {result.maxAttempts}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Chuẩn đạt: {result.passingScore}%
                </span>
              </div>

              <div className={styles.bentoCard}>
                <span className={styles.bentoLabel}>Thời Gian Làm Bài</span>
                <div className={styles.bentoValue} style={{ fontSize: '1.15rem' }}>
                  {formatDuration(result.startedAt, result.submittedAt)}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Nộp: {result.submittedAt ? new Date(result.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                </span>
              </div>

              <div className={styles.bentoCard}>
                <span className={styles.bentoLabel}>Tỷ Lệ Câu Đúng</span>
                <div className={styles.bentoValue}>
                  <span>{correctCount}</span>
                  <span className={styles.bentoSub}>/ {totalQuestions} câu</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0}% độ chính xác
                </span>
              </div>
            </div>

            {/* Danh Sách Đối Soát Chi Tiết Từng Câu Hỏi */}
            <div className={styles.questionsList}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <HelpCircle size={18} style={{ color: 'var(--primary)' }} />
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Chi Tiết Câu Hỏi & Đáp Án Học Viên Đã Chọn
                </h4>
              </div>

              {answerResults.map((item: QuizAnswerResultResponse, idx: number) => {
                const isMultiple = item.questionType === 'MULTIPLE_CHOICE';

                return (
                  <div key={item.questionId || idx} className={styles.questionCard}>
                    <div className={styles.questionTopBar}>
                      <span className={styles.questionIndexBadge}>
                        Câu {item.orderIndex || idx + 1}
                      </span>

                      <div className={styles.questionRightBadges}>
                        <span
                          className={
                            item.isCorrect
                              ? styles.resultBadgeCorrect
                              : styles.resultBadgeIncorrect
                          }
                        >
                          {item.isCorrect ? (
                            <>
                              <CheckCircle2 size={13} /> Chính xác (+{item.scoreAwarded}đ)
                            </>
                          ) : (
                            <>
                              <XCircle size={13} /> Chưa chính xác (0đ)
                            </>
                          )}
                        </span>

                        <span className={styles.questionTypeLabel}>
                          {isMultiple ? 'Nhiều đáp án (All-or-Nothing)' : 'Một đáp án'}
                        </span>
                      </div>
                    </div>

                    <p className={styles.questionText}>{item.questionText}</p>

                    {/* Danh sách các lựa chọn */}
                    <div className={styles.optionsList}>
                      {item.options.map((opt: QuizOptionResponse) => {
                        const isUserSelected = (item.selectedOptionIds || []).includes(opt.id);
                        const isOptionCorrect = (item.correctOptionIds || []).includes(opt.id);

                        let rowStyle = styles.optionItem;
                        let tag = null;

                        if (isOptionCorrect && isUserSelected) {
                          rowStyle = `${styles.optionItem} ${styles.optionCorrectSelected}`;
                          tag = (
                            <span className={`${styles.tagPill} ${styles.tagCorrectSelected}`}>
                              Học viên chọn đúng
                            </span>
                          );
                        } else if (!isOptionCorrect && isUserSelected) {
                          rowStyle = `${styles.optionItem} ${styles.optionUserWrong}`;
                          tag = (
                            <span className={`${styles.tagPill} ${styles.tagUserWrong}`}>
                              Học viên chọn sai
                            </span>
                          );
                        } else if (isOptionCorrect && !isUserSelected) {
                          rowStyle = `${styles.optionItem} ${styles.optionCorrectUnselected}`;
                          tag = (
                            <span className={`${styles.tagPill} ${styles.tagCorrectMissed}`}>
                              Đáp án đúng
                            </span>
                          );
                        }

                        return (
                          <div key={opt.id} className={rowStyle}>
                            <div className={styles.optionLeft}>
                              <div className={styles.optionIconSlot}>
                                {isUserSelected ? (
                                  isOptionCorrect ? (
                                    <Check size={16} style={{ color: '#059669' }} />
                                  ) : (
                                    <X size={16} style={{ color: '#dc2626' }} />
                                  )
                                ) : isOptionCorrect ? (
                                  <Check size={16} style={{ color: '#059669' }} />
                                ) : (
                                  <div
                                    style={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      background: 'var(--border-color)',
                                    }}
                                  />
                                )}
                              </div>
                              <span className={styles.optionLabel}>{opt.optionLabel}.</span>
                              <span className={styles.optionText}>{opt.optionText}</span>
                            </div>
                            {tag}
                          </div>
                        );
                      })}
                    </div>

                    {/* Lời giải thích từ AI */}
                    {item.explanation && (
                      <div className={styles.explanationBox}>
                        <div className={styles.explanationHeader}>
                          <Sparkles size={13} /> Lời giải thích kỹ thuật từ AI
                        </div>
                        <p className={styles.explanationContent}>{item.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
