import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Modal, Button } from '../../../../../../../components/common';
import { quizService } from '../../../../../../../services/quizService';
import type { QuizDetailResponse } from '../../../../../../../types/quiz.types';
import type { AiQuizQuickModalProps, QuizQuickConfig } from './AiQuizQuickModal.types';
import styles from './AiQuizQuickModal.module.css';

export const AiQuizQuickModal: React.FC<AiQuizQuickModalProps> = ({
  isOpen,
  onClose,
  programId,
  initialTopic = '',
  onQuizAttached,
}) => {
  const [config, setConfig] = useState<QuizQuickConfig>({
    topic: '',
    questionCount: 3,
    difficulty: 'MEDIUM',
    passScore: 70,
    timeLimitMinutes: 15,
  });

  const [step, setStep] = useState<'CONFIG' | 'GENERATING' | 'REVIEW'>('CONFIG');
  const [generatedQuiz, setGeneratedQuiz] = useState<QuizDetailResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig({
        topic: initialTopic || '',
        questionCount: 3,
        difficulty: 'MEDIUM',
        passScore: 70,
        timeLimitMinutes: 15,
      });
      setStep('CONFIG');
      setGeneratedQuiz(null);
      setErrorMessage(null);
    }
  }, [isOpen, initialTopic]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.topic.trim()) {
      setErrorMessage('Vui lòng nhập chủ đề ôn tập');
      return;
    }
    if (config.topic.trim().length < 3) {
      setErrorMessage('Chủ đề ôn tập cần ít nhất 3 ký tự');
      return;
    }

    try {
      setStep('GENERATING');
      setErrorMessage(null);

      // Call API sinh bài Quiz bằng AI
      const result = await quizService.generateAiQuiz({
        programId: programId || 1,
        topic: config.topic.trim(),
        questionCount: config.questionCount,
        difficulty: config.difficulty,
      });

      setGeneratedQuiz(result);
      setStep('REVIEW');
      toast.success('AI đã hoàn thành tạo bộ câu hỏi ôn tập!');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể tạo bài kiểm tra bằng AI. Vui lòng thử lại.';
      setErrorMessage(msg);
      toast.error(msg);
      setStep('CONFIG');
    }
  };

  const handleConfirmAttach = () => {
    if (generatedQuiz) {
      onQuizAttached(generatedQuiz);
      toast.success(`Đã đính kèm bài kiểm tra "${generatedQuiz.title}" vào công việc!`);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (step !== 'GENERATING') {
          onClose();
        }
      }}
      title={step === 'REVIEW' ? 'Xem Trước Bộ Câu Hỏi AI' : 'Tạo Bài Kiểm Tra Ôn Tập AI'}
      size={step === 'REVIEW' ? 'lg' : 'md'}
      footer={
        <div className={styles.footer}>
          {step === 'CONFIG' && (
            <>
              <Button variant="outline" onClick={onClose}>
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                onClick={handleGenerate}
                className={styles.btnPrimary}
              >
                <Sparkles size={16} /> Bắt đầu tạo câu hỏi
              </Button>
            </>
          )}

          {step === 'REVIEW' && (
            <>
              <Button
                variant="outline"
                onClick={() => setStep('CONFIG')}
              >
                <RotateCcw size={14} /> Thay đổi cấu hình
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmAttach}
                className={styles.btnPrimary}
              >
                <CheckCircle2 size={16} /> Đính kèm vào công việc
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className={styles.container}>
        {step === 'CONFIG' && (
          <>
            <div className={styles.headerSummary}>
              <Sparkles size={20} className={styles.headerIcon} />
              <div className={styles.headerText}>
                <span className={styles.headerTitle}>Hỗ trợ tạo câu hỏi ôn tập tự động</span>
                <span className={styles.headerSubtitle}>
                  Gemini AI sẽ dựa trên chủ đề công việc để biên soạn các câu hỏi trắc nghiệm kiểm tra độ hiểu biết của thực tập sinh.
                </span>
              </div>
            </div>

            {errorMessage && (
              <div style={{ color: 'var(--danger)', fontSize: '0.8125rem', padding: '0.5rem', background: 'var(--danger-bg)', borderRadius: 'var(--radius-sm)' }}>
                {errorMessage}
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span>Chủ đề ôn tập</span>
                <span className={styles.labelHint}>Trọng tâm kiến thức</span>
              </label>
              <input
                type="text"
                className={styles.input}
                value={config.topic}
                onChange={(e) => setConfig((prev) => ({ ...prev, topic: e.target.value }))}
                placeholder="VD: Cấu trúc Spring Boot, RESTful API, Docker, v.v..."
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span>Mức độ khó</span>
                <span className={styles.labelHint}>Độ sâu câu hỏi</span>
              </label>
              <div className={styles.segmentedGrid}>
                <button
                  type="button"
                  className={`${styles.segmentCard} ${config.difficulty === 'EASY' ? styles.segmentCardActive : ''}`}
                  onClick={() => setConfig((prev) => ({ ...prev, difficulty: 'EASY' }))}
                >
                  <span className={styles.segmentTitle}>Cơ bản</span>
                  <span className={styles.segmentDesc}>Cú pháp & khái niệm</span>
                </button>
                <button
                  type="button"
                  className={`${styles.segmentCard} ${config.difficulty === 'MEDIUM' ? styles.segmentCardActive : ''}`}
                  onClick={() => setConfig((prev) => ({ ...prev, difficulty: 'MEDIUM' }))}
                >
                  <span className={styles.segmentTitle}>Vận dụng</span>
                  <span className={styles.segmentDesc}>Xử lý tình huống</span>
                </button>
                <button
                  type="button"
                  className={`${styles.segmentCard} ${config.difficulty === 'HARD' ? styles.segmentCardActive : ''}`}
                  onClick={() => setConfig((prev) => ({ ...prev, difficulty: 'HARD' }))}
                >
                  <span className={styles.segmentTitle}>Nâng cao</span>
                  <span className={styles.segmentDesc}>Tối ưu & chuyên sâu</span>
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span>Số lượng câu hỏi</span>
                <span className={styles.labelHint}>Độ dài bài test</span>
              </label>
              <div className={styles.pillsRow}>
                {[
                  { count: 3, label: '3 câu', sub: 'Ôn tập nhanh' },
                  { count: 5, label: '5 câu', sub: 'Tiêu chuẩn' },
                  { count: 10, label: '10 câu', sub: 'Toàn diện' },
                ].map((item) => (
                  <button
                    key={item.count}
                    type="button"
                    className={`${styles.pillBtn} ${config.questionCount === item.count ? styles.pillBtnActive : ''}`}
                    onClick={() => setConfig((prev) => ({ ...prev, questionCount: item.count }))}
                  >
                    <span>{item.label}</span>
                    <span className={styles.pillSub}>{item.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.twoColRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Điểm đạt yêu cầu</label>
                <select
                  className={styles.select}
                  value={config.passScore}
                  onChange={(e) => setConfig((prev) => ({ ...prev, passScore: Number(e.target.value) }))}
                >
                  <option value={60}>60% (Cơ bản)</option>
                  <option value={70}>70% (Mặc định)</option>
                  <option value={80}>80% (Khá - Giỏi)</option>
                  <option value={90}>90% (Xuất sắc)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Thời gian làm bài</label>
                <select
                  className={styles.select}
                  value={config.timeLimitMinutes}
                  onChange={(e) => setConfig((prev) => ({ ...prev, timeLimitMinutes: Number(e.target.value) }))}
                >
                  <option value={10}>10 phút</option>
                  <option value={15}>15 phút (Mặc định)</option>
                  <option value={20}>20 phút</option>
                  <option value={30}>30 phút</option>
                </select>
              </div>
            </div>
          </>
        )}

        {step === 'GENERATING' && (
          <div className={styles.generatingBox}>
            <div className={styles.spinnerOrb} />
            <h4 className={styles.generatingTitle}>AI đang soạn câu hỏi trắc nghiệm</h4>
            <p className={styles.generatingDesc}>
              Đang phân tích chủ đề &quot;{config.topic}&quot;, thiết kế các phương án trả lời và giải thích chi tiết đáp án...
            </p>
          </div>
        )}

        {step === 'REVIEW' && generatedQuiz && (
          <>
            <div className={styles.reviewHeader}>
              <div>
                <h4 className={styles.reviewQuizTitle}>{generatedQuiz.title}</h4>
                <div className={styles.reviewMetaRow}>
                  <span className={`${styles.badge} ${styles.badgePrimary}`}>
                    {generatedQuiz.totalQuestions} câu hỏi
                  </span>
                  <span className={styles.badge}>
                    {generatedQuiz.difficulty === 'HARD'
                      ? 'Nâng cao'
                      : generatedQuiz.difficulty === 'EASY'
                      ? 'Cơ bản'
                      : 'Vận dụng'}
                  </span>
                  <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                    Điểm đạt: {config.passScore}%
                  </span>
                  <span className={styles.badge}>
                    {config.timeLimitMinutes} phút
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.questionsList}>
              {generatedQuiz.questions?.map((q, idx) => (
                <div key={q.id || idx} className={styles.questionCard}>
                  <div className={styles.questionNumber}>Câu {idx + 1}:</div>
                  <div className={styles.questionText}>{q.questionText}</div>
                  <div className={styles.optionsGrid}>
                    {q.options?.map((opt, oIdx) => (
                      <div
                        key={opt.id || oIdx}
                        className={`${styles.optionItem} ${opt.isCorrect ? styles.optionCorrect : ''}`}
                      >
                        <strong>{opt.optionLabel}.</strong> {opt.optionText}
                        {opt.isCorrect && ' ✓'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
