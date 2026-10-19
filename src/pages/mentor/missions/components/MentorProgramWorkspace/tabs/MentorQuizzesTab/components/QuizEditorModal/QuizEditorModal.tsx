import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp, Save, Send, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Modal, Button, Input } from '../../../../../../../../../components/common';
import { quizService } from '../../../../../../../../../services/quizService';
import type {
  QuizDetailResponse,
  QuizQuestionResponse,
  QuizOptionResponse,
  CreateQuestionDto,
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
  const [expandedIndex, setExpandedIndex] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (quiz) {
      setDraft(JSON.parse(JSON.stringify(quiz)));
      setExpandedIndex(0);
    }
  }, [quiz]);

  if (!draft) return null;

  const handleUpdateField = (field: keyof QuizDetailResponse, value: any) => {
    setDraft((prev: QuizDetailResponse | null) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleUpdateQuestion = (qIndex: number, field: string, value: any) => {
    setDraft((prev: QuizDetailResponse | null) => {
      if (!prev) return null;
      const updatedQuestions = [...prev.questions];
      updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], [field]: value };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleToggleCorrectOption = (qIndex: number, optIndex: number) => {
    setDraft((prev: QuizDetailResponse | null) => {
      if (!prev) return null;
      const updatedQuestions = [...prev.questions];
      const q = updatedQuestions[qIndex];
      const updatedOptions = [...q.options];

      if (q.questionType === 'SINGLE_CHOICE') {
        // Chỉ chọn 1 đáp án đúng
        updatedOptions.forEach((opt: QuizOptionResponse, idx: number) => {
          opt.isCorrect = idx === optIndex;
        });
      } else {
        // MULTIPLE_CHOICE: toggle
        updatedOptions[optIndex].isCorrect = !updatedOptions[optIndex].isCorrect;
      }

      updatedQuestions[qIndex] = { ...q, options: updatedOptions };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleUpdateOptionText = (qIndex: number, optIndex: number, text: string) => {
    setDraft((prev: QuizDetailResponse | null) => {
      if (!prev) return null;
      const updatedQuestions = [...prev.questions];
      const updatedOptions = [...updatedQuestions[qIndex].options];
      updatedOptions[optIndex] = { ...updatedOptions[optIndex], optionText: text };
      updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], options: updatedOptions };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleAddQuestion = () => {
    setDraft((prev: QuizDetailResponse | null) => {
      if (!prev) return null;
      const newQuestion: QuizQuestionResponse = {
        id: Date.now(),
        questionText: 'Nội dung câu hỏi mới...',
        questionType: 'SINGLE_CHOICE',
        orderIndex: prev.questions.length + 1,
        points: 10,
        explanation: 'Giải thích chi tiết cho câu hỏi này...',
        options: [
          { id: Date.now() + 1, optionLabel: 'A', optionText: 'Lựa chọn A', isCorrect: true, orderIndex: 1 },
          { id: Date.now() + 2, optionLabel: 'B', optionText: 'Lựa chọn B', isCorrect: false, orderIndex: 2 },
          { id: Date.now() + 3, optionLabel: 'C', optionText: 'Lựa chọn C', isCorrect: false, orderIndex: 3 },
          { id: Date.now() + 4, optionLabel: 'D', optionText: 'Lựa chọn D', isCorrect: false, orderIndex: 4 },
        ],
      };
      return { ...prev, questions: [...prev.questions, newQuestion] };
    });
    setExpandedIndex(draft.questions.length);
  };

  const handleDeleteQuestion = (qIndex: number) => {
    if (draft.questions.length <= 1) {
      toast.error('Bài Quiz bắt buộc phải có ít nhất 1 câu hỏi.');
      return;
    }
    setDraft((prev: QuizDetailResponse | null) => {
      if (!prev) return null;
      const updated = prev.questions.filter((_: QuizQuestionResponse, idx: number) => idx !== qIndex);
      return { ...prev, questions: updated };
    });
    setExpandedIndex((prev: number) => Math.max(0, prev - 1));
  };

  const handleSave = async (proceedToAssign = false) => {
    if (!draft) return;

    // Validate: mỗi câu hỏi phải có ít nhất 1 đáp án đúng
    for (let i = 0; i < draft.questions.length; i++) {
      const q = draft.questions[i];
      const hasCorrect = q.options.some((o: QuizOptionResponse) => o.isCorrect);
      if (!hasCorrect) {
        toast.error(`Câu hỏi ${i + 1} chưa được chọn đáp án đúng!`);
        setExpandedIndex(i);
        return;
      }
    }

    try {
      setIsSaving(true);
      const payloadQuestions: CreateQuestionDto[] = draft.questions.map((q: QuizQuestionResponse, idx: number) => ({
        questionText: q.questionText,
        questionType: q.questionType,
        orderIndex: idx + 1,
        points: q.points || 10,
        explanation: q.explanation,
        options: q.options.map((o: QuizOptionResponse, oIdx: number) => ({
          optionLabel: o.optionLabel || String.fromCharCode(65 + oIdx),
          optionText: o.optionText,
          isCorrect: Boolean(o.isCorrect),
          orderIndex: oIdx + 1,
        })),
      }));

      const saved = await quizService.updateQuiz(draft.id, {
        title: draft.title,
        description: draft.description,
        topic: draft.topic,
        difficulty: draft.difficulty,
        timeLimitMinutes: Number(draft.timeLimitMinutes),
        passingScore: Number(draft.passingScore),
        maxAttempts: Number(draft.maxAttempts),
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isSaving) onClose();
      }}
      title={`Kiểm Duyệt & Biên Tập Đề Thi Quiz (${draft.status === 'DRAFT' ? 'Bản Nháp' : 'Đã Xuất Bản'})`}
      size="xl"
      footer={
        <div className={styles.footer}>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Đóng
          </Button>
          <div className={styles.footerRight}>
            <Button variant="secondary" onClick={() => handleSave(false)} disabled={isSaving}>
              <Save size={16} /> Lưu đề thi
            </Button>
            <Button variant="primary" onClick={() => handleSave(true)} disabled={isSaving}>
              <Send size={16} /> Duyệt & Giao bài thi
            </Button>
          </div>
        </div>
      }
    >
      <div className={styles.container}>
        {/* Hàng cài đặt tổng quan bài Quiz */}
        <div className={styles.topSettingsRow}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Tiêu đề bài Quiz</label>
            <Input
              value={draft.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateField('title', e.target.value)}
              placeholder="VD: Kiểm tra kiến thức Java Spring Boot Tuần 2"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Thời gian thi (phút)</label>
            <Input
              type="number"
              min={1}
              max={180}
              value={draft.timeLimitMinutes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateField('timeLimitMinutes', Number(e.target.value))}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Điểm đạt (Passing Score)</label>
            <Input
              type="number"
              min={1}
              max={100}
              value={draft.passingScore}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateField('passingScore', Number(e.target.value))}
            />
          </div>
        </div>

        {/* Danh sách câu hỏi */}
        <div className={styles.questionsHeader}>
          <h4 className={styles.questionsTitle}>
            Danh Sách Câu Hỏi Trắc Nghiệm
            <span className={styles.questionsCountBadge}>{draft.questions.length} câu</span>
          </h4>
          <Button variant="outline" size="sm" onClick={handleAddQuestion} disabled={isSaving}>
            <Plus size={15} /> Thêm câu hỏi
          </Button>
        </div>

        <div className={styles.questionList}>
          {draft.questions.map((q: QuizQuestionResponse, qIdx: number) => {
            const isExpanded = expandedIndex === qIdx;
            return (
              <div key={q.id || qIdx} className={styles.questionCard}>
                <div
                  className={styles.questionHeader}
                  onClick={() => setExpandedIndex(isExpanded ? -1 : qIdx)}
                >
                  <div className={styles.questionHeaderLeft}>
                    <span>Câu {qIdx + 1}:</span>
                    <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>
                      {q.questionText.length > 60 ? `${q.questionText.slice(0, 60)}...` : q.questionText}
                    </span>
                    <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'var(--bg-hover)' }}>
                      {q.questionType === 'SINGLE_CHOICE' ? '1 đáp án' : 'Nhiều đáp án (All-or-Nothing)'}
                    </span>
                  </div>

                  <div className={styles.questionHeaderActions} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuestion(qIdx)}
                      title="Xóa câu hỏi này"
                    >
                      <Trash2 size={15} style={{ color: 'var(--danger)' }} />
                    </Button>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                      onClick={() => setExpandedIndex(isExpanded ? -1 : qIdx)}
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className={styles.questionBody}>
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', gap: '0.75rem' }}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Nội dung câu hỏi</label>
                        <Input
                          value={q.questionText}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateQuestion(qIdx, 'questionText', e.target.value)}
                        />
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Loại câu hỏi</label>
                        <select
                          className="input"
                          style={{ height: '38px', borderRadius: '6px', border: '1px solid var(--border-default)', padding: '0 0.5rem', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                          value={q.questionType}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleUpdateQuestion(qIdx, 'questionType', e.target.value)}
                        >
                          <option value="SINGLE_CHOICE">1 đáp án đúng</option>
                          <option value="MULTIPLE_CHOICE">Nhiều đáp án đúng</option>
                        </select>
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Điểm số</label>
                        <Input
                          type="number"
                          min={1}
                          max={50}
                          value={q.points}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateQuestion(qIdx, 'points', Number(e.target.value))}
                        />
                      </div>
                    </div>

                    {/* Các lựa chọn A, B, C, D */}
                    <div className={styles.optionsSection}>
                      <label className={styles.fieldLabel}>
                        Các phương án trả lời (Tick vào ô tròn/vuông để chọn đáp án đúng):
                      </label>
                      {q.options.map((opt: QuizOptionResponse, optIdx: number) => {
                        const isCorrect = Boolean(opt.isCorrect);
                        return (
                          <div
                            key={opt.id || optIdx}
                            className={`${styles.optionRow} ${isCorrect ? styles.optionRowCorrect : ''}`}
                          >
                            <div
                              className={`${styles.optionCheckbox} ${isCorrect ? styles.optionCheckboxChecked : ''}`}
                              onClick={() => handleToggleCorrectOption(qIdx, optIdx)}
                              title={isCorrect ? 'Đáp án đúng' : 'Click để chọn làm đáp án đúng'}
                            >
                              {isCorrect ? (
                                <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                              ) : (
                                <Circle size={18} style={{ color: 'var(--border-default)' }} />
                              )}
                              <span>{opt.optionLabel || String.fromCharCode(65 + optIdx)}.</span>
                            </div>

                            <Input
                              className={styles.optionInput}
                              value={opt.optionText}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateOptionText(qIdx, optIdx, e.target.value)}
                              placeholder={`Nội dung lựa chọn ${opt.optionLabel}...`}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Lời giải thích chi tiết */}
                    <div className={styles.explanationBox}>
                      <span className={styles.explanationLabel}>
                        <HelpCircle size={15} /> Lời giải thích chi tiết (Hiển thị cho TTS sau khi nộp bài):
                      </span>
                      <Input
                        value={q.explanation || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateQuestion(qIdx, 'explanation', e.target.value)}
                        placeholder="VD: Từ khóa final ngăn chặn việc gán lại giá trị cho biến..."
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export default QuizEditorModal;
