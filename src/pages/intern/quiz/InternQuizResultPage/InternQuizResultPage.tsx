import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  FileCheck,
  Check,
  X,
} from 'lucide-react';
import { Button, Skeleton } from '../../../../components/common';
import { formatDate } from '../../../../utils/formatters';
import { quizService } from '../../../../services/quizService';
import { QUIZ_ROUTES } from '../../../../constants/routes/quiz.routes';
import type {
  QuizResultResponse,
  QuizAnswerResultResponse,
  QuizOptionResponse,
} from '../../../../types/quiz.types';
import styles from './InternQuizResultPage.module.css';

export const InternQuizResultPage: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

  const [result, setResult] = useState<QuizResultResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!submissionId) {
      setError('Mã kết quả bài thi không hợp lệ');
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchResult = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await quizService.getSubmissionResult(Number(submissionId));
        if (isMounted) setResult(data);
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Không thể tải kết quả bài thi Quiz');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchResult();

    return () => {
      isMounted = false;
    };
  }, [submissionId]);

  // Format duration in minutes and seconds
  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m === 0) return `${s} giây`;
    return `${m} phút ${s > 0 ? `${s} giây` : ''}`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Skeleton height="140px" style={{ borderRadius: '16px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <Skeleton height="90px" style={{ borderRadius: '12px' }} />
            <Skeleton height="90px" style={{ borderRadius: '12px' }} />
            <Skeleton height="90px" style={{ borderRadius: '12px' }} />
          </div>
          <Skeleton height="260px" style={{ borderRadius: '16px' }} />
          <Skeleton height="180px" style={{ borderRadius: '16px' }} />
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className={styles.errorBox}>
        <XCircle size={48} style={{ color: 'var(--danger)' }} />
        <h2 style={{ color: 'var(--text-main)', margin: 0 }}>Không thể hiển thị kết quả</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        <Button variant="outline" onClick={() => navigate(QUIZ_ROUTES.LIST)}>
          <ArrowLeft size={16} /> Về danh sách bài quiz
        </Button>
      </div>
    );
  }

  const answerResults = result.answerResults || [];
  const correctCount = answerResults.filter((a: QuizAnswerResultResponse) => a.isCorrect).length;
  const totalQuestions = answerResults.length;
  const durationSec = result.submittedAt && result.startedAt
    ? Math.max(0, Math.floor((new Date(result.submittedAt).getTime() - new Date(result.startedAt).getTime()) / 1000))
    : 0;

  return (
    <div className={styles.container}>
      {/* Top Nav */}
      <div className={styles.topNav}>
        <button
          type="button"
          className={styles.backLink}
          onClick={() => navigate(QUIZ_ROUTES.LIST)}
        >
          <ArrowLeft size={16} /> Quay lại danh sách bài kiểm tra
        </button>
      </div>

      {/* Hero Result Banner */}
      <div className={styles.heroCard}>
        <div className={styles.heroTop}>
          <div className={styles.heroTitleGroup}>
            <h1 className={styles.heroTitle}>{result.quizTitle}</h1>
            <p className={styles.heroSub}>
              Kết quả bài làm lần thứ {result.attemptNumber}/{result.maxAttempts} • Nộp lúc {formatDate(result.submittedAt)}
            </p>
          </div>

          {/* Big Score Gauge */}
          <div className={styles.scoreGauge}>
            <div
              className={`${styles.scoreCircle} ${
                result.passed ? styles.scorePassed : styles.scoreFailed
              }`}
            >
              <span className={styles.scorePercent}>{Math.round(result.percentageScore)}%</span>
              <span className={styles.scoreStatusText}>
                {result.passed ? 'ĐẠT' : 'CHƯA ĐẠT'}
              </span>
            </div>
          </div>
        </div>

        {/* Bento Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statIconWrapper}>
              <CheckCircle2 size={18} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statVal}>
                {correctCount} / {totalQuestions}
              </span>
              <span className={styles.statDesc}>Số câu trả lời đúng</span>
            </div>
          </div>

          <div className={styles.statItem}>
            <div className={styles.statIconWrapper}>
              <Award size={18} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statVal}>
                {result.score} / {result.totalPoints}
              </span>
              <span className={styles.statDesc}>Tổng điểm đạt được</span>
            </div>
          </div>

          <div className={styles.statItem}>
            <div className={styles.statIconWrapper}>
              <Clock size={18} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statVal}>{formatDuration(durationSec)}</span>
              <span className={styles.statDesc}>Thời gian hoàn thành</span>
            </div>
          </div>

          <div className={styles.statItem}>
            <div className={styles.statIconWrapper}>
              <FileCheck size={18} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statVal}>{result.passingScore}%</span>
              <span className={styles.statDesc}>Điểm chuẩn yêu cầu</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.heroActions}>
          {result.attemptNumber < result.maxAttempts && (
            <Button
              variant="primary"
              onClick={() => navigate(QUIZ_ROUTES.TAKE(result.assignmentId))}
            >
              <RotateCcw size={15} /> Làm lại bài thi ({result.maxAttempts - result.attemptNumber} lượt còn)
            </Button>
          )}

          <Button variant="outline" onClick={() => navigate(QUIZ_ROUTES.LIST)}>
            <ArrowLeft size={15} /> Danh sách bài Quiz
          </Button>
        </div>
      </div>

      {/* Detailed Review Section */}
      <section className={styles.reviewSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <HelpCircle size={20} /> Đối Soát Chi Tiết Từng Câu Hỏi
          </h2>
        </div>

        <div className={styles.questionsReviewList}>
          {answerResults.map((item: QuizAnswerResultResponse, idx: number) => {
            const isMultiple = item.questionType === 'MULTIPLE_CHOICE';

            return (
              <div key={item.questionId || idx} className={styles.questionReviewCard}>
                <div className={styles.questionTopBar}>
                  <span className={styles.questionLabel}>Câu hỏi {item.orderIndex || idx + 1}</span>

                  <div className={styles.questionBadges}>
                    <span
                      className={`${styles.resultBadge} ${
                        item.isCorrect ? styles.resultBadgeCorrect : styles.resultBadgeIncorrect
                      }`}
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

                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {isMultiple ? 'Nhiều đáp án (All-or-Nothing)' : 'Một đáp án'}
                    </span>
                  </div>
                </div>

                <p className={styles.questionReviewText}>{item.questionText}</p>

                {/* Options Review */}
                <div className={styles.optionsReviewList}>
                  {item.options.map((opt: QuizOptionResponse) => {
                    const isUserSelected = (item.selectedOptionIds || []).includes(opt.id);
                    const isOptionCorrect = (item.correctOptionIds || []).includes(opt.id);

                    let rowClass = styles.optionReviewItem;
                    let tag = null;

                    if (isOptionCorrect && isUserSelected) {
                      rowClass = `${styles.optionReviewItem} ${styles.optionCorrectItem}`;
                      tag = <span className={`${styles.optionTag} ${styles.tagUserCorrect}`}>Bạn chọn đúng</span>;
                    } else if (isOptionCorrect && !isUserSelected) {
                      rowClass = `${styles.optionReviewItem} ${styles.optionCorrectItem}`;
                      tag = <span className={`${styles.optionTag} ${styles.tagCorrect}`}>Đáp án đúng</span>;
                    } else if (!isOptionCorrect && isUserSelected) {
                      rowClass = `${styles.optionReviewItem} ${styles.optionUserWrongItem}`;
                      tag = <span className={`${styles.optionTag} ${styles.tagUserWrong}`}>Bạn chọn sai</span>;
                    }

                    return (
                      <div key={opt.id} className={rowClass}>
                        <div className={styles.optionTextGroup}>
                          {isUserSelected ? (
                            isOptionCorrect ? (
                              <Check size={16} style={{ color: 'var(--success)' }} />
                            ) : (
                              <X size={16} style={{ color: 'var(--danger)' }} />
                            )
                          ) : isOptionCorrect ? (
                            <Check size={16} style={{ color: 'var(--success)' }} />
                          ) : (
                            <div style={{ width: 16 }} />
                          )}
                          <span>
                            <strong>{opt.optionLabel}.</strong> {opt.optionText}
                          </span>
                        </div>
                        {tag}
                      </div>
                    );
                  })}
                </div>

                {/* AI Explanation Box */}
                {item.explanation && (
                  <div className={styles.explanationBox}>
                    <div className={styles.explanationTitle}>
                      <Sparkles size={14} /> Lời giải & Phân tích từ AI
                    </div>
                    <p className={styles.explanationContent}>{item.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default InternQuizResultPage;
