import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Modal, Button } from '../../../../../../../components/common';
import { useAiJob } from '../../../../../../../contexts/AiJobContext';
import type { AiQuizQuickModalProps, QuizQuickConfig } from './AiQuizQuickModal.types';
import styles from './AiQuizQuickModal.module.css';

export const AiQuizQuickModal: React.FC<AiQuizQuickModalProps> = ({
  isOpen,
  onClose,
  programId,
  initialTopic = '',
  onQuizAttached,
}) => {
  const { startQuizJob } = useAiJob();

  const [config, setConfig] = useState<QuizQuickConfig>({
    topic: '',
    questionCount: 3,
    difficulty: 'MEDIUM',
    passScore: 70,
    timeLimitMinutes: 15,
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig({
        topic: initialTopic || '',
        questionCount: 3,
        difficulty: 'MEDIUM',
        passScore: 70,
        timeLimitMinutes: 15,
      });
      setErrorMessage(null);
      setIsSubmitting(false);
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
      setIsSubmitting(true);
      setErrorMessage(null);

      // Khởi chạy tiến trình ngầm (non-blocking) qua AiJobContext
      await startQuizJob({
        programId: programId || 1,
        topic: config.topic.trim(),
        questionCount: config.questionCount,
        difficulty: config.difficulty,
        onCompleted: (quiz) => {
          // Callback khi quiz hoàn tất – tự động đính kèm vào MissionItemModal
          onQuizAttached(quiz);
        },
      });

      // Đóng modal ngay lập tức để không block người dùng
      onClose();
      toast.success('Đã khởi chạy tiến trình AI sinh câu hỏi ngầm!', {
        description: 'Bạn có thể tiếp tục thao tác giao việc. Xem tiến độ tại widget góc dưới bên phải.',
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể tạo bài kiểm tra bằng AI. Vui lòng thử lại.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo Bài Kiểm Tra Ôn Tập AI"
      size="md"
      footer={
        <div className={styles.footer}>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            onClick={handleGenerate}
            className={styles.btnPrimary}
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            <Sparkles size={16} /> Bắt đầu tạo câu hỏi
          </Button>
        </div>
      }
    >
      <div className={styles.container}>
        <div className={styles.headerSummary}>
          <Sparkles size={20} className={styles.headerIcon} />
          <div className={styles.headerText}>
            <span className={styles.headerTitle}>Hỗ trợ tạo câu hỏi ôn tập tự động</span>
            <span className={styles.headerSubtitle}>
              Gemini AI sẽ dựa trên chủ đề công việc để biên soạn các câu hỏi trắc nghiệm kiểm tra độ hiểu biết của thực tập sinh.
              Tiến trình chạy ngầm, bạn có thể tiếp tục thao tác giao việc.
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
      </div>
    </Modal>
  );
};
