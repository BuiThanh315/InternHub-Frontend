import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Circle,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  Copy,
  Settings,
  Clock,
  Award,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal, Button, Input } from '../../../../../../../../../components/common';
import { quizService } from '../../../../../../../../../services/quizService';
import type {
  QuizDetailResponse,
  QuizQuestionResponse,
  QuizOptionResponse,
  CreateQuestionDto,
  QuizDifficulty,
} from '../../../../../../../../../types/quiz.types';
import type { QuizEditorModalProps } from './QuizEditorModal.types';
import styles from './QuizEditorModal.module.css';

export const QuizEditorModal: React.FC<QuizEditorModalProps> = ({
  isOpen,
  onClose,
  quiz,
  onSaved,
  onProceedToAssign,
}) => {
  const [draft, setDraft] = useState<QuizDetailResponse | null>(quiz);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (quiz) {
      setDraft(JSON.parse(JSON.stringify(quiz)));
      setSelectedQuestionIndex(0);
      setShowSettings(false);
    }
  }, [quiz]);

  const questions = draft?.questions || [];
  const currentQuestion: QuizQuestionResponse | undefined = questions[selectedQuestionIndex];

  // Calculate live total points
  const totalCalculatedPoints = useMemo(() => {
    return questions.reduce((sum, q) => sum + (Number(q.points) || 10), 0);
  }, [questions]);

  // Check valid questions (has at least 1 correct option)
  const questionValidityMap = useMemo(() => {
    const map: Record<number, boolean> = {};
    questions.forEach((q, idx) => {
      const hasCorrect = q.options.some((opt) => Boolean(opt.isCorrect));
      const hasText = q.questionText.trim().length > 0;
      map[idx] = hasCorrect && hasText;
    });
    return map;
  }, [questions]);

  const validCount = useMemo(() => {
    return Object.values(questionValidityMap).filter(Boolean).length;
  }, [questionValidityMap]);

  if (!draft) return null;

  // --- Handlers for Quiz Level Settings ---
  const handleUpdateField = (field: keyof QuizDetailResponse, value: any) => {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  // --- Handlers for Current Question Editing ---
  const handleUpdateCurrentQuestion = (field: keyof QuizQuestionResponse, value: any) => {
    setDraft((prev) => {
      if (!prev) return null;
      const updated = [...prev.questions];
      updated[selectedQuestionIndex] = { ...updated[selectedQuestionIndex], [field]: value };
      return { ...prev, questions: updated };
    });
  };

  const handleToggleQuestionType = (newType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE') => {
    if (!currentQuestion) return;
    setDraft((prev) => {
      if (!prev) return null;
      const updated = [...prev.questions];
      const q = updated[selectedQuestionIndex];
      let newOptions = [...q.options];

      // If switching to SINGLE_CHOICE, keep at most 1 correct option
      if (newType === 'SINGLE_CHOICE') {
        let foundFirst = false;
        newOptions = newOptions.map((opt) => {
          if (opt.isCorrect && !foundFirst) {
            foundFirst = true;
            return opt;
          }
          return { ...opt, isCorrect: false };
        });
      }

      updated[selectedQuestionIndex] = {
        ...q,
        questionType: newType,
        options: newOptions,
      };
      return { ...prev, questions: updated };
    });
  };

  const handleToggleCorrectOption = (optIndex: number) => {
    if (!currentQuestion) return;
    setDraft((prev) => {
      if (!prev) return null;
      const updated = [...prev.questions];
      const q = updated[selectedQuestionIndex];
      const updatedOptions = [...q.options];

      if (q.questionType === 'SINGLE_CHOICE') {
        updatedOptions.forEach((opt, idx) => {
          opt.isCorrect = idx === optIndex;
        });
      } else {
        updatedOptions[optIndex] = {
          ...updatedOptions[optIndex],
          isCorrect: !updatedOptions[optIndex].isCorrect,
        };
      }

      updated[selectedQuestionIndex] = { ...q, options: updatedOptions };
      return { ...prev, questions: updated };
    });
  };

  const handleUpdateOptionText = (optIndex: number, text: string) => {
    setDraft((prev) => {
      if (!prev) return null;
      const updated = [...prev.questions];
      const q = updated[selectedQuestionIndex];
      const updatedOptions = [...q.options];
      updatedOptions[optIndex] = { ...updatedOptions[optIndex], optionText: text };
      updated[selectedQuestionIndex] = { ...q, options: updatedOptions };
      return { ...prev, questions: updated };
    });
  };

  const handleAddOption = () => {
    if (!currentQuestion) return;
    const nextLabel = String.fromCharCode(65 + currentQuestion.options.length);
    const newOption: QuizOptionResponse = {
      id: Date.now(),
      optionLabel: nextLabel,
      optionText: '',
      isCorrect: false,
      orderIndex: currentQuestion.options.length + 1,
    };
    handleUpdateCurrentQuestion('options', [...currentQuestion.options, newOption]);
  };

  const handleDeleteOption = (optIndex: number) => {
    if (!currentQuestion || currentQuestion.options.length <= 2) {
      toast.warning('Mỗi câu hỏi cần tối thiểu 2 phương án lựa chọn');
      return;
    }
    const filtered = currentQuestion.options.filter((_, idx) => idx !== optIndex);
    // Re-label A, B, C, D...
    const relabeled = filtered.map((opt, idx) => ({
      ...opt,
      optionLabel: String.fromCharCode(65 + idx),
      orderIndex: idx + 1,
    }));
    handleUpdateCurrentQuestion('options', relabeled);
  };

  // --- Handlers for Adding / Duplicating / Deleting Questions ---
  const handleAddQuestion = () => {
    setDraft((prev) => {
      if (!prev) return null;
      const newIndex = prev.questions.length + 1;
      const newQ: QuizQuestionResponse = {
        id: Date.now(),
        questionText: `Nội dung câu hỏi ${newIndex}...`,
        questionType: 'SINGLE_CHOICE',
        orderIndex: newIndex,
        points: 10,
        explanation: 'Giải thích chi tiết cho câu hỏi này...',
        options: [
          { id: Date.now() + 1, optionLabel: 'A', optionText: 'Phương án A', isCorrect: true, orderIndex: 1 },
          { id: Date.now() + 2, optionLabel: 'B', optionText: 'Phương án B', isCorrect: false, orderIndex: 2 },
          { id: Date.now() + 3, optionLabel: 'C', optionText: 'Phương án C', isCorrect: false, orderIndex: 3 },
          { id: Date.now() + 4, optionLabel: 'D', optionText: 'Phương án D', isCorrect: false, orderIndex: 4 },
        ],
      };
      return { ...prev, questions: [...prev.questions, newQ] };
    });
    setSelectedQuestionIndex(questions.length);
  };

  const handleDuplicateQuestion = () => {
    if (!currentQuestion) return;
    setDraft((prev) => {
      if (!prev) return null;
      const copy: QuizQuestionResponse = {
        ...JSON.parse(JSON.stringify(currentQuestion)),
        id: Date.now(),
        orderIndex: prev.questions.length + 1,
      };
      return { ...prev, questions: [...prev.questions, copy] };
    });
    setSelectedQuestionIndex(questions.length);
    toast.info('Đã nhân bản câu hỏi thành công');
  };

  const handleDeleteQuestion = (qIndex: number) => {
    if (questions.length <= 1) {
      toast.warning('Đề thi phải có ít nhất 1 câu hỏi');
      return;
    }
    setDraft((prev) => {
      if (!prev) return null;
      const updated = prev.questions.filter((_, idx) => idx !== qIndex);
      return { ...prev, questions: updated };
    });
    setSelectedQuestionIndex((prev) => Math.min(prev, questions.length - 2));
    toast.info('Đã xóa câu hỏi');
  };

  // --- Validate & Save ---
  const handleSave = async (proceedToAssign = false) => {
    if (!draft.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài Quiz');
      setShowSettings(true);
      return;
    }

    if (questions.length === 0) {
      toast.error('Bài Quiz cần có ít nhất 1 câu hỏi');
      return;
    }

    // Check if every question has at least 1 correct answer
    const invalidIndex = questions.findIndex(
      (q) => !q.options.some((opt) => Boolean(opt.isCorrect)) || !q.questionText.trim()
    );
    if (invalidIndex !== -1) {
      setSelectedQuestionIndex(invalidIndex);
      toast.error(`Câu hỏi ${invalidIndex + 1} chưa hoàn thiện (cần nội dung và ít nhất 1 đáp án đúng).`);
      return;
    }

    try {
      setIsSaving(true);
      const payloadQuestions: CreateQuestionDto[] = questions.map((q, idx) => ({
        questionText: q.questionText.trim(),
        questionType: q.questionType,
        orderIndex: idx + 1,
        points: Number(q.points) || 10,
        explanation: q.explanation?.trim() || '',
        options: q.options.map((opt, oIdx) => ({
          optionLabel: opt.optionLabel || String.fromCharCode(65 + oIdx),
          optionText: opt.optionText.trim(),
          isCorrect: Boolean(opt.isCorrect),
          orderIndex: oIdx + 1,
        })),
      }));

      const saved = await quizService.updateQuiz(draft.id, {
        title: draft.title.trim(),
        description: draft.description || '',
        topic: draft.topic || '',
        difficulty: draft.difficulty,
        timeLimitMinutes: Number(draft.timeLimitMinutes) || 15,
        passingScore: Number(draft.passingScore) || 70,
        maxAttempts: Number(draft.maxAttempts) || 1,
        questions: payloadQuestions,
      });

      toast.success('Đã lưu bài Quiz thành công!');
      onSaved(saved);

      if (proceedToAssign && onProceedToAssign) {
        onProceedToAssign(saved);
      } else {
        onClose();
      }
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi lưu bài Quiz');
    } finally {
      setIsSaving(false);
    }
  };

  const difficultyClass =
    draft.difficulty === 'HARD'
      ? styles.diffHard
      : draft.difficulty === 'EASY'
      ? styles.diffEasy
      : styles.diffMedium;

  const difficultyLabel =
    draft.difficulty === 'HARD'
      ? 'Nâng cao'
      : draft.difficulty === 'EASY'
      ? 'Cơ bản'
      : 'Vận dụng';

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isSaving) onClose();
      }}
      title={`Kiểm Duyệt & Biên Tập Đề Thi Quiz (${draft.status === 'DRAFT' ? 'Bản Nháp' : 'Đã Xuất Bản'})`}
      size="xl"
      footer={
        <div className={styles.modalFooter}>
          <div className={styles.footerStats}>
            <span>{questions.length} câu hỏi</span>
            <span> • </span>
            <span>Tổng {totalCalculatedPoints} điểm</span>
            <span> • </span>
            <span>Điểm đạt: {draft.passingScore}%</span>
          </div>

          <div className={styles.footerActions}>
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Đóng
            </Button>
            <Button variant="secondary" onClick={() => handleSave(false)} disabled={isSaving} leftIcon={<Save size={16} />}>
              Lưu đề thi
            </Button>
            <Button variant="primary" onClick={() => handleSave(true)} disabled={isSaving} leftIcon={<Send size={16} />}>
              Duyệt & Giao bài thi
            </Button>
          </div>
        </div>
      }
    >
      <div className={styles.modalContainer}>
        {/* Top Summary & KPI Bar */}
        <div className={styles.statsSummaryBar}>
          <div className={styles.kpiPillsGroup}>
            <div className={styles.kpiPill} title="Thời gian làm bài">
              <Clock size={14} className={styles.kpiIcon} />
              <span>{draft.timeLimitMinutes} phút</span>
            </div>

            <div className={styles.kpiPill} title="Điểm đạt yêu cầu">
              <Award size={14} className={styles.kpiIcon} />
              <span>Điểm đạt: {draft.passingScore}%</span>
            </div>

            <div className={styles.kpiPill} title="Tổng số câu và điểm số">
              <BookOpen size={14} className={styles.kpiIcon} />
              <span>{questions.length} câu ({totalCalculatedPoints}đ)</span>
            </div>

            <div className={`${styles.kpiBadgeDifficulty} ${difficultyClass}`} title="Mức độ khó">
              {difficultyLabel}
            </div>
          </div>

          <button
            type="button"
            className={`${styles.settingsToggleBtn} ${showSettings ? styles.settingsToggleBtnActive : ''}`}
            onClick={() => setShowSettings((prev) => !prev)}
            title="Mở cài đặt tổng quan đề thi"
          >
            <Settings size={15} />
            <span>{showSettings ? 'Đóng Cài Đặt' : 'Cài Đặt Đề Thi'}</span>
          </button>
        </div>

        {/* Collapsible General Settings Drawer */}
        {showSettings && (
          <div className={styles.settingsDrawer}>
            <div className={styles.drawerField}>
              <label className={styles.drawerLabel}>Tiêu đề bài Quiz *</label>
              <Input
                value={draft.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateField('title', e.target.value)}
                placeholder="VD: Kiểm tra kiến thức Java Spring Boot Tuần 2"
              />
            </div>

            <div className={styles.drawerField}>
              <label className={styles.drawerLabel}>Thời gian thi</label>
              <select
                className={styles.drawerSelect}
                value={draft.timeLimitMinutes}
                onChange={(e) => handleUpdateField('timeLimitMinutes', Number(e.target.value))}
              >
                <option value={10}>10 phút</option>
                <option value={15}>15 phút</option>
                <option value={20}>20 phút</option>
                <option value={30}>30 phút</option>
                <option value={45}>45 phút</option>
                <option value={60}>60 phút</option>
              </select>
            </div>

            <div className={styles.drawerField}>
              <label className={styles.drawerLabel}>Điểm đạt</label>
              <select
                className={styles.drawerSelect}
                value={draft.passingScore}
                onChange={(e) => handleUpdateField('passingScore', Number(e.target.value))}
              >
                <option value={60}>60% (Cơ bản)</option>
                <option value={70}>70% (Tiêu chuẩn)</option>
                <option value={80}>80% (Khá - Giỏi)</option>
                <option value={90}>90% (Xuất sắc)</option>
              </select>
            </div>

            <div className={styles.drawerField}>
              <label className={styles.drawerLabel}>Độ khó</label>
              <select
                className={styles.drawerSelect}
                value={draft.difficulty}
                onChange={(e) => handleUpdateField('difficulty', e.target.value as QuizDifficulty)}
              >
                <option value="EASY">Cơ bản</option>
                <option value="MEDIUM">Vận dụng</option>
                <option value="HARD">Nâng cao</option>
              </select>
            </div>
          </div>
        )}

        {/* Master-Detail Split Studio Layout */}
        <div className={styles.studioLayout}>
          {/* Left: Question Navigator Sidebar */}
          <aside className={styles.navigatorSidebar}>
            <div className={styles.sidebarHeader}>
              <div className={styles.sidebarTitle}>
                <span>Câu hỏi</span>
                <span className={styles.sidebarBadge}>{questions.length}</span>
              </div>
              <button
                type="button"
                className={styles.addBtnMini}
                onClick={handleAddQuestion}
                disabled={isSaving}
                title="Thêm câu hỏi mới"
              >
                <Plus size={13} /> Thêm
              </button>
            </div>

            <div className={styles.sidebarQuestionList}>
              {questions.map((q, idx) => {
                const isActive = selectedQuestionIndex === idx;
                const isValid = questionValidityMap[idx];

                return (
                  <button
                    key={q.id || idx}
                    type="button"
                    className={`${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : ''}`}
                    onClick={() => setSelectedQuestionIndex(idx)}
                  >
                    <div className={styles.itemNumBadge}>{idx + 1}</div>
                    <div className={styles.itemContent}>
                      <span className={styles.itemSnippet}>
                        {q.questionText.trim() || 'Chưa nhập nội dung...'}
                      </span>
                      <div className={styles.itemMetaRow}>
                        <span className={styles.itemTypeTag}>
                          {q.questionType === 'SINGLE_CHOICE' ? '1 đáp án' : 'Nhiều đáp án'} • {q.points || 10}đ
                        </span>
                        {isValid ? (
                          <span title="Đã có đáp án đúng" className="inline-flex items-center">
                            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                          </span>
                        ) : (
                          <span title="Chưa chọn đáp án đúng" className="inline-flex items-center">
                            <AlertCircle size={13} className="text-amber-500 shrink-0" />
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className={styles.sidebarFooter}>
              <span>Hoàn tất:</span>
              <strong style={{ color: validCount === questions.length ? 'var(--success)' : 'var(--warning)' }}>
                {validCount} / {questions.length} câu
              </strong>
            </div>
          </aside>

          {/* Right: Question Detail Canvas */}
          {currentQuestion && (
            <section className={styles.canvasCard}>
              {/* Canvas Header */}
              <div className={styles.canvasHeader}>
                <div className={styles.canvasHeaderLeft}>
                  <div className={styles.questionOrderBadge}>
                    Câu {selectedQuestionIndex + 1} / {questions.length}
                  </div>

                  {/* Segmented Type Toggle */}
                  <div className={styles.typeTogglePills}>
                    <button
                      type="button"
                      className={`${styles.typePill} ${currentQuestion.questionType === 'SINGLE_CHOICE' ? styles.typePillActive : ''}`}
                      onClick={() => handleToggleQuestionType('SINGLE_CHOICE')}
                      title="Chỉ 1 đáp án đúng (Radio)"
                    >
                      <Circle size={13} />
                      <span>1 Đáp án đúng</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.typePill} ${currentQuestion.questionType === 'MULTIPLE_CHOICE' ? styles.typePillActive : ''}`}
                      onClick={() => handleToggleQuestionType('MULTIPLE_CHOICE')}
                      title="Nhiều đáp án đúng (Checkbox)"
                    >
                      <CheckSquare size={13} />
                      <span>Nhiều đáp án</span>
                    </button>
                  </div>
                </div>

                <div className={styles.canvasHeaderRight}>
                  {/* Points Input */}
                  <div className={styles.pointsInputGroup} title="Điểm số câu hỏi">
                    <span className={styles.pointsLabel}>Điểm:</span>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      className={styles.pointsInput}
                      value={currentQuestion.points}
                      onChange={(e) => handleUpdateCurrentQuestion('points', Number(e.target.value) || 10)}
                    />
                  </div>

                  <button
                    type="button"
                    className={styles.actionIconBtn}
                    onClick={handleDuplicateQuestion}
                    title="Nhân bản câu hỏi này"
                  >
                    <Copy size={15} />
                  </button>

                  <button
                    type="button"
                    className={`${styles.actionIconBtn} ${styles.actionIconBtnDanger}`}
                    onClick={() => handleDeleteQuestion(selectedQuestionIndex)}
                    title="Xóa câu hỏi này"
                    disabled={questions.length <= 1}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Canvas Body */}
              <div className={styles.canvasBody}>
                {/* Question Prompt */}
                <div className={styles.promptSection}>
                  <label className={styles.sectionLabel}>
                    <span>Nội dung câu hỏi *</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                      {currentQuestion.questionText.length} ký tự
                    </span>
                  </label>
                  <textarea
                    className={styles.promptTextarea}
                    value={currentQuestion.questionText}
                    onChange={(e) => handleUpdateCurrentQuestion('questionText', e.target.value)}
                    placeholder="Nhập nội dung câu hỏi trắc nghiệm..."
                  />
                </div>

                {/* Options Section */}
                <div className={styles.optionsSection}>
                  <div className={styles.optionsHeader}>
                    <label className={styles.sectionLabel}>
                      <span>Các phương án trả lời ({currentQuestion.options.length})</span>
                      <span className={styles.optionsHelpText}>
                        Tick vào chữ cái để chọn đáp án đúng
                      </span>
                    </label>
                  </div>

                  <div className={styles.optionsGrid}>
                    {currentQuestion.options.map((opt, optIdx) => {
                      const isCorrect = Boolean(opt.isCorrect);
                      const isMultiple = currentQuestion.questionType === 'MULTIPLE_CHOICE';

                      return (
                        <div
                          key={opt.id || optIdx}
                          className={`${styles.optionCard} ${isCorrect ? styles.optionCardCorrect : ''}`}
                        >
                          {/* Option Toggle Button */}
                          <button
                            type="button"
                            className={styles.optionCheckBtn}
                            onClick={() => handleToggleCorrectOption(optIdx)}
                            title={isCorrect ? 'Đáp án đúng (click để đổi)' : 'Click để chọn làm đáp án đúng'}
                          >
                            <div className={styles.optionLetterBadge}>
                              {opt.optionLabel || String.fromCharCode(65 + optIdx)}
                            </div>
                            {isMultiple ? (
                              isCorrect ? (
                                <CheckSquare size={18} className="text-emerald-500" />
                              ) : (
                                <Square size={18} className="text-slate-400" />
                              )
                            ) : isCorrect ? (
                              <CheckCircle2 size={18} className="text-emerald-500" />
                            ) : (
                              <Circle size={18} className="text-slate-400" />
                            )}
                          </button>

                          {/* Option Input */}
                          <input
                            type="text"
                            className={styles.optionInput}
                            value={opt.optionText}
                            onChange={(e) => handleUpdateOptionText(optIdx, e.target.value)}
                            placeholder={`Nội dung lựa chọn ${opt.optionLabel}...`}
                          />

                          {isCorrect && (
                            <span className={styles.correctTag}>✓ Đáp án đúng</span>
                          )}

                          {currentQuestion.options.length > 2 && (
                            <button
                              type="button"
                              className={`${styles.actionIconBtn} ${styles.actionIconBtnDanger}`}
                              onClick={() => handleDeleteOption(optIdx)}
                              title="Xóa phương án này"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    className={styles.addOptionBtn}
                    onClick={handleAddOption}
                    title="Thêm phương án trả lời mới"
                  >
                    <Plus size={14} /> Thêm phương án lựa chọn
                  </button>
                </div>

                {/* Explanation Callout Box */}
                <div className={styles.explanationBox}>
                  <div className={styles.explanationHeader}>
                    <Sparkles size={15} />
                    <span>Lời giải thích chi tiết & Cơ sở lý thuyết của AI</span>
                  </div>
                  <textarea
                    className={styles.explanationTextarea}
                    value={currentQuestion.explanation || ''}
                    onChange={(e) => handleUpdateCurrentQuestion('explanation', e.target.value)}
                    placeholder="Giải thích vì sao phương án trên là chính xác (TTS sẽ đọc giải thích này sau khi hoàn thành bài nộp)..."
                  />
                </div>
              </div>

              {/* Canvas Footer Navigation */}
              <div className={styles.canvasFooter}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={selectedQuestionIndex === 0}
                  leftIcon={<ChevronLeft size={15} />}
                >
                  Câu trước
                </Button>

                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Câu {selectedQuestionIndex + 1} / {questions.length}
                </div>

                <Button
                  variant={selectedQuestionIndex < questions.length - 1 ? 'outline' : 'primary'}
                  size="sm"
                  onClick={() => {
                    if (selectedQuestionIndex < questions.length - 1) {
                      setSelectedQuestionIndex((prev) => prev + 1);
                    } else {
                      void handleSave(false);
                    }
                  }}
                  rightIcon={selectedQuestionIndex < questions.length - 1 ? <ChevronRight size={15} /> : undefined}
                >
                  {selectedQuestionIndex < questions.length - 1 ? 'Câu tiếp theo' : 'Lưu & Hoàn tất'}
                </Button>
              </div>
            </section>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default QuizEditorModal;
