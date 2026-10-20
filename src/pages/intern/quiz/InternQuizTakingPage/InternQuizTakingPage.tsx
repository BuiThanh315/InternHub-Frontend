import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Check,
  Send,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../../components/common';
import { quizService } from '../../../../services/quizService';
import { QUIZ_ROUTES } from '../../../../constants/routes/quiz.routes';
import type {
  QuizTakingResponse,
  QuizTakingQuestionResponse,
  QuizTakingOptionResponse,
} from '../../../../types/quiz.types';
import { SubmitConfirmModal } from './components/SubmitConfirmModal';
import styles from './InternQuizTakingPage.module.css';

export const InternQuizTakingPage: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  const [quizData, setQuizData] = useState<QuizTakingResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number[]>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const timerRef = useRef<any>(null);
  const isAutoSubmittingRef = useRef<boolean>(false);

  // 1. Fetch / Start Quiz Attempt
  useEffect(() => {
    if (!assignmentId) {
      setError('Mã bài tập không hợp lệ');
      setLoading(false);
      return;
    }

    let isMounted = true;
    const initQuiz = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await quizService.startQuizAttempt(Number(assignmentId));
        if (!isMounted) return;

        setQuizData(data);

        // Restore saved answers from sessionStorage if present
        const storageKey = `intern_quiz_answers_${data.submissionId}`;
        const saved = sessionStorage.getItem(storageKey);
        if (saved) {
          try {
            setSelectedAnswers(JSON.parse(saved));
          } catch {
            // ignore JSON parse error
          }
        }

        // Calculate initial remaining seconds from startedAt + timeLimitMinutes
        const startTime = new Date(data.startedAt).getTime();
        const durationMs = data.timeLimitMinutes * 60 * 1000;
        const expiresAtMs = startTime + durationMs;
        const diffSeconds = Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000));
        setTimeLeft(diffSeconds);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message || 'Không thể bắt đầu làm bài thi Quiz');
        toast.error(err?.message || 'Lỗi khởi tạo bài thi');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initQuiz();

    return () => {
      isMounted = false;
    };
  }, [assignmentId]);

  // 2. Auto-save answers to sessionStorage
  useEffect(() => {
    if (quizData && Object.keys(selectedAnswers).length > 0) {
      const storageKey = `intern_quiz_answers_${quizData.submissionId}`;
      sessionStorage.setItem(storageKey, JSON.stringify(selectedAnswers));
    }
  }, [selectedAnswers, quizData]);

  // 3. Submit Handler
  const handleSubmit = useCallback(async () => {
    if (!quizData || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const answersPayload = Object.entries(selectedAnswers).map(([qid, optionIds]) => ({
        questionId: Number(qid),
        selectedOptionIds: optionIds,
      }));

      const result = await quizService.submitQuizAttempt(quizData.submissionId, {
        answers: answersPayload,
      });

      // Clear cached answers
      sessionStorage.removeItem(`intern_quiz_answers_${quizData.submissionId}`);
      toast.success('Nộp bài thi thành công!');
      navigate(QUIZ_ROUTES.RESULT(result.submissionId), { replace: true });
    } catch (err: any) {
      toast.error(err?.message || 'Có lỗi xảy ra khi nộp bài thi');
      setIsSubmitting(false);
      setIsSubmitModalOpen(false);
    }
  }, [quizData, isSubmitting, selectedAnswers, navigate]);

  // 4. Timer interval & auto-submit on expiry
  useEffect(() => {
    if (!quizData) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (!isAutoSubmittingRef.current) {
            isAutoSubmittingRef.current = true;
            toast.warning('Thời gian làm bài đã kết thúc! Hệ thống đang tự động nộp bài...');
            handleSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizData, handleSubmit]);

  // 5. Anti-Leave beforeunload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (quizData && !isSubmitting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [quizData, isSubmitting]);

  // Formatted Time Left
  const timeLeftFormatted = useMemo(() => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [timeLeft]);

  // Current Question
  const questions = useMemo(() => quizData?.questions || [], [quizData]);
  const currentQuestion: QuizTakingQuestionResponse | undefined = questions[currentQuestionIndex];

  // Option selection logic
  const handleToggleOption = (questionId: number, optionId: number, isMultiple: boolean) => {
    setSelectedAnswers((prev) => {
      const current = prev[questionId] || [];
      if (isMultiple) {
        const next = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
        return { ...prev, [questionId]: next };
      }
      return { ...prev, [questionId]: [optionId] };
    });
  };

  // Stats for modal
  const answeredCount = useMemo(() => {
    return questions.filter((q: QuizTakingQuestionResponse) => (selectedAnswers[q.id] || []).length > 0).length;
  }, [questions, selectedAnswers]);

  const unansweredCount = questions.length - answeredCount;

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 size={36} className="animate-spin" style={{ color: 'var(--primary)' }} />
        <p>Đang chuẩn bị phòng thi và bộ câu hỏi...</p>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={44} style={{ color: 'var(--danger)' }} />
        <h2 style={{ color: 'var(--text-main)', margin: 0 }}>Không thể truy cập bài thi</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 440 }}>{error}</p>
        <Button variant="outline" onClick={() => navigate(QUIZ_ROUTES.LIST)}>
          <ArrowLeft size={16} /> Quay lại danh sách bài Quiz
        </Button>
      </div>
    );
  }

  const isTimerCritical = timeLeft < 300; // Under 5 minutes

  return (
    <div className={styles.examContainer}>
      {/* Sticky Top Header */}
      <header className={styles.examHeader}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => setIsSubmitModalOpen(true)}
            title="Dừng làm bài và nộp bài"
          >
            <ArrowLeft size={16} /> Thoát & Nộp
          </button>
          <div className={styles.quizInfoGroup}>
            <h1 className={styles.quizTitle}>{quizData.quizTitle}</h1>
            <span className={styles.attemptBadge}>Lần làm bài thứ {quizData.attemptNumber}</span>
          </div>
        </div>

        {/* Floating Timer */}
        <div
          className={`${styles.timerWrapper} ${isTimerCritical ? styles.timerWarning : ''}`}
          title="Thời gian làm bài còn lại"
        >
          <Clock size={18} />
          <span>{timeLeftFormatted}</span>
        </div>

        <div className={styles.headerRight}>
          <Button
            variant="primary"
            onClick={() => setIsSubmitModalOpen(true)}
            disabled={isSubmitting}
          >
            <Send size={15} /> Nộp bài
          </Button>
        </div>
      </header>

      {/* Main Body */}
      <main className={styles.examBody}>
        {/* Left: Question Stage Card */}
        {currentQuestion && (
          <div className={styles.questionStage}>
            <div className={styles.stageHeader}>
              <span className={styles.questionCounter}>
                Câu {currentQuestionIndex + 1} / {questions.length}
              </span>

              <span
                className={`${styles.typeBadge} ${
                  currentQuestion.questionType === 'MULTIPLE_CHOICE'
                    ? styles.typeBadgeMultiple
                    : ''
                }`}
              >
                {currentQuestion.questionType === 'MULTIPLE_CHOICE'
                  ? 'Chọn nhiều đáp án (All-or-Nothing)'
                  : 'Chọn 1 đáp án duy nhất'}
              </span>
            </div>

            <h2 className={styles.questionText}>{currentQuestion.questionText}</h2>

            {/* Options List */}
            <div className={styles.optionsList}>
              {currentQuestion.options.map((opt: QuizTakingOptionResponse) => {
                const isSelected = (selectedAnswers[currentQuestion.id] || []).includes(opt.id);
                const isMultiple = currentQuestion.questionType === 'MULTIPLE_CHOICE';

                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`${styles.optionCard} ${
                      isSelected ? styles.optionCardSelected : ''
                    }`}
                    onClick={() => handleToggleOption(currentQuestion.id, opt.id, isMultiple)}
                  >
                    <div
                      className={`${styles.optionIndicator} ${
                        isMultiple ? styles.optionIndicatorSquare : ''
                      } ${isSelected ? styles.optionIndicatorSelected : ''}`}
                    >
                      {isSelected && <Check size={14} />}
                    </div>
                    <span className={styles.optionText}>
                      <strong>{opt.optionLabel}.</strong> {opt.optionText}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Stage Footer Navigation */}
            <div className={styles.stageFooter}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft size={16} /> Câu trước
              </Button>

              {currentQuestionIndex < questions.length - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))
                  }
                >
                  Câu tiếp theo <ChevronRight size={16} />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsSubmitModalOpen(true)}
                >
                  <CheckCircle2 size={16} /> Hoàn thành & Nộp bài
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Right: Question Dock */}
        <aside className={styles.dockCard}>
          <div className={styles.dockHeader}>
            <h3 className={styles.dockTitle}>Danh Sách Câu Hỏi</h3>
            <span className={styles.dockAnsweredCount}>
              Đã làm {answeredCount}/{questions.length}
            </span>
          </div>

          <div className={styles.dockGrid}>
            {questions.map((q: QuizTakingQuestionResponse, idx: number) => {
              const isAnswered = (selectedAnswers[q.id] || []).length > 0;
              const isCurrent = idx === currentQuestionIndex;

              return (
                <button
                  key={q.id}
                  type="button"
                  className={`${styles.dockBtn} ${
                    isAnswered ? styles.dockBtnAnswered : ''
                  } ${isCurrent ? styles.dockBtnCurrent : ''}`}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  title={`Câu ${idx + 1} ${isAnswered ? '(Đã làm)' : '(Chưa làm)'}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className={styles.dockLegend}>
            <div className={styles.legendItem}>
              <div className={`${styles.legendDot} ${styles.legendCurrent}`} />
              <span>Câu hiện tại</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendDot} ${styles.legendAnswered}`} />
              <span>Đã trả lời</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendDot} ${styles.legendUnanswered}`} />
              <span>Chưa trả lời</span>
            </div>
          </div>
        </aside>
      </main>

      {/* Submit Confirmation Modal */}
      <SubmitConfirmModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={handleSubmit}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        unansweredCount={unansweredCount}
        timeLeftFormatted={timeLeftFormatted}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default InternQuizTakingPage;
