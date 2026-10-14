import React, { useState } from 'react';
import { Sparkles, BrainCircuit, Info, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Modal, Button, Input, Select } from '../../../../../../../../../components/common';
import { quizService } from '../../../../../../../../../services/quizService';
import type { QuizDifficulty } from '../../../../../../../../../types/quiz.types';
import type { AiQuizGeneratorModalProps } from './AiQuizGeneratorModal.types';
import styles from './AiQuizGeneratorModal.module.css';

interface FormState {
  groupId: string;
  weekNumber: string;
  topic: string;
  questionCount: number;
  difficulty: QuizDifficulty;
}

const initialFormState: FormState = {
  groupId: '',
  weekNumber: '1',
  topic: '',
  questionCount: 10,
  difficulty: 'MEDIUM',
};

export const AiQuizGeneratorModal: React.FC<AiQuizGeneratorModalProps> = ({
  isOpen,
  onClose,
  programId,
  groups,
  onGenerated,
}) => {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const groupOptions = [
    { value: '', label: '-- Chọn nhóm thực tập sinh --' },
    ...groups.map((g) => ({
      value: String(g.id),
      label: g.name,
    })),
  ];

  const weekOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: `Tuần ${i + 1} của kỳ thực tập`,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.groupId) {
      setErrorMsg('Vui lòng chọn nhóm thực tập sinh để AI đọc báo cáo tuần.');
      return;
    }

    try {
      setIsGenerating(true);
      setErrorMsg(null);

      const generatedQuiz = await quizService.generateAiQuiz({
        programId,
        groupId: Number(form.groupId),
        weekNumber: Number(form.weekNumber),
        topic: form.topic.trim() || undefined,
        questionCount: form.questionCount,
        difficulty: form.difficulty,
      });

      toast.success('AI đã hoàn tất sinh câu hỏi bài Quiz nháp!');
      onGenerated(generatedQuiz);
      onClose();
      setForm(initialFormState);
    } catch (err: any) {
      const msg = err?.message || 'Không thể tạo bài Quiz bằng AI. Vui lòng thử lại.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isGenerating) {
          onClose();
          setErrorMsg(null);
        }
      }}
      title="Tạo Bài Quiz Bằng AI (Gemini Copilot)"
      size="md"
      footer={
        <div className={styles.footer}>
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isGenerating || !form.groupId}
          >
            <Sparkles size={16} />
            {isGenerating ? 'Đang phân tích & sinh đề...' : '✨ Bắt đầu sinh đề AI'}
          </Button>
        </div>
      }
    >
      <div className={styles.container}>
        {isGenerating ? (
          <div className={styles.shimmerCard}>
            <BrainCircuit size={48} className={styles.shimmerIcon} />
            <h4 className={styles.shimmerTitle}>AI Đang Soạn Thảo Đề Thi Trắc Nghiệm...</h4>
            <p className={styles.shimmerSubtitle}>
              Google Gemini đang tự động phân tích kiến thức đã học từ báo cáo tuần của nhóm, trích xuất các chủ đề trọng tâm và biên soạn câu hỏi kèm lời giải thích chi tiết.
            </p>
          </div>
        ) : (
          <>
            <div className={styles.introBox}>
              <Info size={18} className={styles.introIcon} />
              <div>
                Hệ thống sẽ tự động bóc tách <strong>kiến thức đã học</strong> và <strong>nội dung công việc</strong> từ báo cáo tuần của các bạn trong nhóm để sinh ra bộ câu hỏi ôn tập bám sát thực tế nhất.
              </div>
            </div>

            {errorMsg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', fontSize: '0.875rem' }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Nhóm thực tập sinh <span className={styles.fieldLabelRequired}>*</span>
                </label>
                <Select
                  options={groupOptions}
                  value={form.groupId}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, groupId: e.target.value }));
                    if (errorMsg) setErrorMsg(null);
                  }}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    Tuần báo cáo cần ôn tập <span className={styles.fieldLabelRequired}>*</span>
                  </label>
                  <Select
                    options={weekOptions}
                    value={form.weekNumber}
                    onChange={(e) => setForm((prev) => ({ ...prev, weekNumber: e.target.value }))}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Chủ đề trọng tâm (Tùy chọn)</label>
                  <Input
                    placeholder="VD: Spring Security, Collections..."
                    value={form.topic}
                    onChange={(e) => setForm((prev) => ({ ...prev, topic: e.target.value }))}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Số lượng câu hỏi</label>
                  <div className={styles.segmentedButtons}>
                    {[5, 10, 15].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        className={`${styles.segmentBtn} ${form.questionCount === cnt ? styles.segmentBtnActive : ''}`}
                        onClick={() => setForm((prev) => ({ ...prev, questionCount: cnt }))}
                      >
                        {cnt} câu {cnt === 10 ? '✨' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Độ khó bài thi</label>
                  <div className={styles.segmentedButtons}>
                    {(['EASY', 'MEDIUM', 'HARD'] as QuizDifficulty[]).map((diff) => {
                      const labels: Record<QuizDifficulty, string> = {
                        EASY: 'Cơ bản',
                        MEDIUM: 'Vừa sức',
                        HARD: 'Nâng cao',
                      };
                      return (
                        <button
                          key={diff}
                          type="button"
                          className={`${styles.segmentBtn} ${form.difficulty === diff ? styles.segmentBtnActive : ''}`}
                          onClick={() => setForm((prev) => ({ ...prev, difficulty: diff }))}
                        >
                          {labels[diff]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
};
