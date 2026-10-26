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
  Flag,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  ShieldCheck,
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
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [paletteFilter, setPaletteFilter] = useState<'ALL' | 'UNANSWERED' | 'FLAGGED'>('ALL');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

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

        // Restore saved answers from sessionStorage
        const answersKey = `intern_quiz_answers_${data.submissionId}`;
        const savedAnswers = sessionStorage.getItem(answersKey);
        if (savedAnswers) {
          try {
            setSelectedAnswers(JSON.parse(savedAnswers));
          } catch {
            // ignore JSON parse error
          }
        }

        // Restore flagged questions from sessionStorage
        const flaggedKey = `intern_quiz_flagged_${data.submissionId}`;
        const savedFlags = sessionStorage.getItem(flaggedKey);
        if (savedFlags) {
          try {
            setFlaggedQuestions(JSON.parse(savedFlags));
          } catch {
            // ignore JSON parse error
          }
        }

        // Calculate initial remaining seconds (3-tier fallback against timezone/format mismatch)
        let initialTime = data.remainingSeconds;
        if (initialTime === undefined || initialTime === null) {
          const rawStart = data.startedAt?.endsWith('Z') || data.startedAt?.includes('+') ? data.startedAt : `${data.startedAt}Z`;
          const startTime = new Date(rawStart).getTime();
          const durationMs = (data.timeLimitMinutes || 20) * 60 * 1000;
          initialTime = Math.max(0, Math.floor((startTime + durationMs - Date.now()) / 1000));
        }
        if (initialTime <= 0 && data.timeLimitMinutes > 0) {
          initialTime = data.timeLimitMinutes * 60;
        }
        setTimeLeft(initialTime);
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

  // 2. Auto-save answers & flags to sessionStorage
  useEffect(() => {
    if (quizData && Object.keys(selectedAnswers).length > 0) {
      const answersKey = `intern_quiz_answers_${quizData.submissionId}`;
      sessionStorage.setItem(answersKey, JSON.stringify(selectedAnswers));
    }
  }, [selectedAnswers, quizData]);

  useEffect(() => {
    if (quizData && Object.keys(flaggedQuestions).length > 0) {
      const flaggedKey = `intern_quiz_flagged_${quizData.submissionId}`;
      sessionStorage.setItem(flaggedKey, JSON.stringify(flaggedQuestions));
    }
  }, [flaggedQuestions, quizData]);

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

      // Clear cached answers & flags
      sessionStorage.removeItem(`intern_quiz_answers_${quizData.submissionId}`);
      sessionStorage.removeItem(`intern_quiz_flagged_${quizData.submissionId}`);
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

  // Fullscreen change listener
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

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
  const handleToggleOption = useCallback((questionId: number, optionId: number, isMultiple: boolean) => {
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
  }, []);

  // Clear answer for current question
  const handleClearAnswer = useCallback((questionId: number) => {
    setSelectedAnswers((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  }, []);

  // Toggle flag for current question
  const handleToggleFlag = useCallback((questionId: number) => {
    setFlaggedQuestions((prev) => {
      const isFlagged = !prev[questionId];
      if (isFlagged) {
        return { ...prev, [questionId]: true };
      }
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  }, []);

  // Keyboard Shortcuts Support: A-F, 1-6, Left/Right arrow, F
  useEffect(() => {
    if (!currentQuestion || isSubmitModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toUpperCase();

      // Navigation: ArrowLeft / ArrowRight
      if (e.key === 'ArrowLeft') {
        setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
        return;
      }
      if (e.key === 'ArrowRight') {
        setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1));
        return;
      }

      // Flag question: F
      if (key === 'F' && !e.ctrlKey && !e.metaKey) {
        handleToggleFlag(currentQuestion.id);
        return;
      }

      // Options: 1-6 or A-F
      const numKey = parseInt(e.key, 10);
      let optIndex = -1;
      if (!isNaN(numKey) && numKey >= 1 && numKey <= currentQuestion.options.length) {
        optIndex = numKey - 1;
      } else if (key >= 'A' && key <= 'F') {
        optIndex = key.charCodeAt(0) - 'A'.charCodeAt(0);
      }

      if (optIndex >= 0 && optIndex < currentQuestion.options.length) {
        const targetOpt = currentQuestion.options[optIndex];
        const isMultiple = currentQuestion.questionType === 'MULTIPLE_CHOICE';
        handleToggleOption(currentQuestion.id, targetOpt.id, isMultiple);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentQuestion, questions.length, isSubmitModalOpen, handleToggleFlag, handleToggleOption]);

  // Stats calculation
  const answeredCount = useMemo(() => {
    return questions.filter((q: QuizTakingQuestionResponse) => (selectedAnswers[q.id] || []).length > 0).length;
  }, [questions, selectedAnswers]);

  const flaggedCount = useMemo(() => {
    return questions.filter((q: QuizTakingQuestionResponse) => !!flaggedQuestions[q.id]).length;
  }, [questions, flaggedQuestions]);

  const unansweredCount = questions.length - answeredCount;
  const progressPercent = Math.round((answeredCount / (questions.length || 1)) * 100);

  // Filtered list of questions in dock
  const filteredQuestionIndices = useMemo(() => {
    return questions
      .map((q: QuizTakingQuestionResponse, idx: number) => ({ q, idx }))
      .filter(({ q }) => {
        if (paletteFilter === 'UNANSWERED') {
          return (selectedAnswers[q.id] || []).length === 0;
        }
        if (paletteFilter === 'FLAGGED') {
          return !!flaggedQuestions[q.id];
        }
        return true;
      });
  }, [questions, paletteFilter, selectedAnswers, flaggedQuestions]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinnerWrap}>
          <Loader2 size={36} className="animate-spin" />
        </div>
        <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>
          Đang khởi tạo phòng thi bảo mật...
        </p>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Vui lòng đợi giây lát trong khi hệ thống nạp đề thi và cấu hình tính giờ.
        </span>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIconWrap}>
          <AlertCircle size={44} />
        </div>
        <h2 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1.4rem' }}>
          Không thể truy cập bài thi
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 460, margin: 0, lineHeight: 1.6 }}>
          {error}
        </p>
        <Button variant="outline" onClick={() => navigate(QUIZ_ROUTES.LIST)}>
          <ArrowLeft size={16} /> Quay lại danh sách bài Quiz
        </Button>
      </div>
    );
  }

  const isTimerWarning = timeLeft <= 300 && timeLeft > 60; // 1 to 5 minutes
  const isTimerCritical = timeLeft <= 60; // Under 1 minute

  const isCurrentFlagged = currentQuestion ? !!flaggedQuestions[currentQuestion.id] : false;
  const currentAnswers = currentQuestion ? selectedAnswers[currentQuestion.id] || [] : [];

  return (
    <div className={styles.examContainer}>
      {/* Sticky Top Header */}
      <header className={styles.examHeader}>
        {/* Dynamic linear progress bar */}
        <div className={styles.headerProgressBar}>
          <div
            className={styles.headerProgressFill}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className={styles.headerLeft}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => setIsSubmitModalOpen(true)}
            title="Dừng làm bài và nộp bài thi"
          >
            <ArrowLeft size={15} /> Thoát & Nộp
          </button>
          <div className={styles.quizInfoGroup}>
            <h1 className={styles.quizTitle}>
              {quizData.quizTitle}
              <span title="Phòng thi đã được mã hóa an toàn" className="inline-flex items-center">
                <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
              </span>
            </h1>
            <span className={styles.attemptBadge}>
              Lần làm bài #{quizData.attemptNumber} • Hoàn thành {answeredCount}/{questions.length} câu ({progressPercent}%)
            </span>
          </div>
        </div>

        {/* Center: Dynamic Timer */}
        <div className={styles.headerCenter}>
          <div
            className={`${styles.timerWrapper} ${
              isTimerCritical
                ? styles.timerCritical
                : isTimerWarning
                ? styles.timerWarning
                : ''
            }`}
            title="Thời gian làm bài còn lại"
          >
            <Clock size={18} className={isTimerCritical ? 'animate-pulse' : ''} />
            <span className={styles.timerLabel}>Còn lại:</span>
            <span>{timeLeftFormatted}</span>
          </div>
        </div>

        <div className={styles.headerRight}>
          <button
            type="button"
            className={styles.fullscreenBtn}
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình (Tập trung)'}
          >
            {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>

          <Button
            variant="primary"
            onClick={() => setIsSubmitModalOpen(true)}
            disabled={isSubmitting}
            className={styles.submitHeaderBtn}
          >
            <Send size={15} /> Nộp bài ({progressPercent}%)
          </Button>
        </div>
      </header>

      {/* Main Body */}
      <main className={styles.examBody}>
        {/* Left: Question Stage Card */}
        {currentQuestion && (
          <div className={styles.questionStage}>
            <div className={styles.stageHeader}>
              <div className={styles.stageHeaderLeft}>
                <span className={styles.questionBadge}>
                  Câu {currentQuestionIndex + 1} / {questions.length}
                </span>

                <span className={styles.pointsBadge}>
                  <Sparkles size={13} className="text-amber-500" />
                  {currentQuestion.points || 10} Điểm
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

              {/* Flag for Review Toggle */}
              <button
                type="button"
                className={`${styles.flagBtn} ${isCurrentFlagged ? styles.flagBtnActive : ''}`}
                onClick={() => handleToggleFlag(currentQuestion.id)}
                title="Đánh dấu để rà soát lại trước khi nộp bài (Phím tắt: F)"
              >
                <Flag size={14} />
                {isCurrentFlagged ? 'Đã gắn cờ xem lại' : 'Gắn cờ xem lại'}
              </button>
            </div>

            {/* Question Text */}
            <div className={styles.questionPromptBox}>
              <span className={styles.questionPromptLabel}>Nội dung câu hỏi:</span>
              <h2 className={styles.questionText}>{currentQuestion.questionText}</h2>
            </div>

            {/* Options List */}
            <div className={styles.optionsList}>
              {currentQuestion.options.map((opt: QuizTakingOptionResponse, optIdx: number) => {
                const isSelected = currentAnswers.includes(opt.id);
                const isMultiple = currentQuestion.questionType === 'MULTIPLE_CHOICE';
                const shortcutChar = String.fromCharCode(65 + optIdx); // A, B, C, D...

                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`${styles.optionCard} ${
                      isSelected ? styles.optionCardSelected : ''
                    }`}
                    onClick={() => handleToggleOption(currentQuestion.id, opt.id, isMultiple)}
                  >
                    <div className={styles.optionLetter}>
                      {shortcutChar}
                    </div>

                    <span className={styles.optionText}>
                      {opt.optionText}
                    </span>

                    <div
                      className={`${styles.optionIndicator} ${
                        isMultiple ? styles.optionIndicatorSquare : ''
                      } ${isSelected ? styles.optionIndicatorSelected : ''}`}
                    >
                      {isSelected && <Check size={14} />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Keyboard shortcut hint bar */}
            <div className={styles.keyboardHintBar}>
              <span>💡 Phím tắt nhanh:</span>
              <span>Bấm <kbd>1</kbd>-<kbd>4</kbd> hoặc <kbd>A</kbd>-<kbd>D</kbd> để chọn</span>
              <span>•</span>
              <span><kbd>←</kbd> <kbd>→</kbd> chuyển câu</span>
              <span>•</span>
              <span><kbd>F</kbd> gắn cờ xem lại</span>
            </div>

            {/* Stage Footer Navigation */}
            <div className={styles.stageFooter}>
              <div className={styles.footerLeftControls}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft size={16} /> Câu trước
                </Button>

                {currentAnswers.length > 0 && (
                  <button
                    type="button"
                    className={styles.clearBtn}
                    onClick={() => handleClearAnswer(currentQuestion.id)}
                    title="Xóa lựa chọn cho câu này"
                  >
                    <RotateCcw size={13} className="inline mr-1" />
                    Xóa lựa chọn
                  </button>
                )}
              </div>

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

        {/* Right: Question Palette / Dock */}
        <aside className={styles.dockCard}>
          <div className={styles.dockHeader}>
            <h3 className={styles.dockTitle}>Bảng Câu Hỏi</h3>
            <span className={styles.dockProgressPill}>
              {answeredCount}/{questions.length} câu
            </span>
          </div>

          {/* Quick Filter tabs */}
          <div className={styles.dockFilterBar}>
            <button
              type="button"
              className={`${styles.dockFilterTab} ${paletteFilter === 'ALL' ? styles.dockFilterTabActive : ''}`}
              onClick={() => setPaletteFilter('ALL')}
            >
              Tất cả ({questions.length})
            </button>
            <button
              type="button"
              className={`${styles.dockFilterTab} ${paletteFilter === 'UNANSWERED' ? styles.dockFilterTabActive : ''}`}
              onClick={() => setPaletteFilter('UNANSWERED')}
            >
              Chưa làm ({unansweredCount})
            </button>
            <button
              type="button"
              className={`${styles.dockFilterTab} ${paletteFilter === 'FLAGGED' ? styles.dockFilterTabActive : ''}`}
              onClick={() => setPaletteFilter('FLAGGED')}
            >
              Gắn cờ ({flaggedCount})
            </button>
          </div>

          {/* Question Grid */}
          <div className={styles.dockGrid}>
            {filteredQuestionIndices.map(({ q, idx }) => {
              const isAnswered = (selectedAnswers[q.id] || []).length > 0;
              const isCurrent = idx === currentQuestionIndex;
              const isFlagged = !!flaggedQuestions[q.id];

              return (
                <button
                  key={q.id}
                  type="button"
                  className={`${styles.dockBtn} ${
                    isAnswered ? styles.dockBtnAnswered : ''
                  } ${isCurrent ? styles.dockBtnCurrent : ''} ${
                    isFlagged ? styles.dockBtnFlagged : ''
                  }`}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  title={`Câu ${idx + 1}: ${
                    isAnswered ? 'Đã chọn đáp án' : 'Chưa làm'
                  }${isFlagged ? ' (Đang gắn cờ xem lại)' : ''}`}
                >
                  {idx + 1}
                  {isFlagged && <div className={styles.dockBtnFlagBadge} />}
                </button>
              );
            })}
          </div>

          {/* Legend Items */}
          <div className={styles.dockLegend}>
            <div className={styles.legendItem}>
              <div className={`${styles.legendDot} ${styles.legendCurrent}`} />
              <span>Câu đang làm</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendDot} ${styles.legendAnswered}`} />
              <span>Đã trả lời ({answeredCount})</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendDot} ${styles.legendFlagged}`} />
              <span>Gắn cờ xem lại ({flaggedCount})</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendDot} ${styles.legendUnanswered}`} />
              <span>Chưa làm ({unansweredCount})</span>
            </div>
          </div>

          {/* Submit Action Box */}
          <div className={styles.dockSubmitBox}>
            <Button
              variant="primary"
              className={styles.dockSubmitBtn}
              onClick={() => setIsSubmitModalOpen(true)}
              disabled={isSubmitting}
            >
              <Send size={15} />
              Nộp bài thi ngay
            </Button>
            <span className={styles.dockAutoSaveNote}>
              <ShieldCheck size={13} className="text-emerald-500" />
              Tự động sao lưu đáp án tức thì
            </span>
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
        flaggedCount={flaggedCount}
        timeLeftFormatted={timeLeftFormatted}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default InternQuizTakingPage;
