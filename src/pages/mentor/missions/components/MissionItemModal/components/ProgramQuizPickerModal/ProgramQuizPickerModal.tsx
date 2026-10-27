import React, { useState, useEffect, useMemo } from 'react';
import { Search, BookOpen, Clock, Award, CheckCircle, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Modal, Button } from '../../../../../../../components/common';
import { quizService } from '../../../../../../../services/quizService';
import type { QuizSummaryResponse } from '../../../../../../../types/quiz.types';
import type { ProgramQuizPickerModalProps } from './ProgramQuizPickerModal.types';
import styles from './ProgramQuizPickerModal.module.css';

export const ProgramQuizPickerModal: React.FC<ProgramQuizPickerModalProps> = ({
  isOpen,
  onClose,
  programId,
  onSelectQuiz,
}) => {
  const [quizzes, setQuizzes] = useState<QuizSummaryResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectingQuizId, setSelectingQuizId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && programId) {
      setSearchQuery('');
      setLoadError(null);
      setIsLoading(true);

      quizService
        .getQuizzesByProgram(programId)
        .then((data) => {
          setQuizzes(data || []);
        })
        .catch((err) => {
          console.error('Lỗi khi tải danh sách đề thi của chương trình:', err);
          setLoadError('Không thể tải danh sách đề thi. Vui lòng thử lại sau.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, programId]);

  const filteredQuizzes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return quizzes;
    return quizzes.filter(
      (quiz) =>
        quiz.title.toLowerCase().includes(q) ||
        (quiz.topic && quiz.topic.toLowerCase().includes(q))
    );
  }, [quizzes, searchQuery]);

  const handleSelect = async (quizSummary: QuizSummaryResponse) => {
    try {
      setSelectingQuizId(quizSummary.id);
      const detail = await quizService.getQuizDetail(quizSummary.id);
      if (detail) {
        onSelectQuiz(detail);
        toast.success(`Đã đính kèm bài kiểm tra "${detail.title}"!`);
        onClose();
      } else {
        toast.error('Không tìm thấy nội dung chi tiết bài kiểm tra này.');
      }
    } catch (err: any) {
      console.error('Lỗi khi tải chi tiết đề thi:', err);
      toast.error(err?.message || 'Không thể chọn đề thi này.');
    } finally {
      setSelectingQuizId(null);
    }
  };

  const renderDifficultyBadge = (difficulty?: string) => {
    if (difficulty === 'HARD') {
      return <span className={`${styles.difficultyBadge} ${styles.diffHard}`}>Nâng cao</span>;
    }
    if (difficulty === 'MEDIUM') {
      return <span className={`${styles.difficultyBadge} ${styles.diffMedium}`}>Vận dụng</span>;
    }
    return <span className={`${styles.difficultyBadge} ${styles.diffEasy}`}>Cơ bản</span>;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chọn Đề Thi Có Sẵn Của Chương Trình"
      size="md"
      footer={
        <Button variant="outline" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      <div className={styles.container}>
        {/* Search Header */}
        <div className={styles.searchHeader}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm theo tên bài kiểm tra, chủ đề kỹ thuật..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Tìm kiếm bài kiểm tra"
          />
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Loader2 size={24} className={styles.spinner} />
            <span>Đang nạp danh sách đề thi của chương trình...</span>
          </div>
        ) : loadError ? (
          <div className={styles.emptyState}>
            <AlertCircle size={32} className="text-rose-500" />
            <p className={styles.emptyText}>{loadError}</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className={styles.emptyState}>
            <BookOpen size={32} className={styles.emptyIcon} />
            <p className={styles.emptyText}>
              {quizzes.length === 0
                ? 'Chương trình chưa có bài kiểm tra trắc nghiệm nào'
                : 'Không tìm thấy bài kiểm tra phù hợp'}
            </p>
            <p className={styles.emptyHint}>
              Bạn có thể sử dụng nút "Tạo đề bằng AI" ở form giao việc để sinh đề mới.
            </p>
          </div>
        ) : (
          <div className={styles.quizList}>
            {filteredQuizzes.map((quiz) => (
              <div key={quiz.id} className={styles.quizCard}>
                <div className={styles.quizCardContent}>
                  <div className={styles.quizCardHeader}>
                    <h4 className={styles.quizTitle} title={quiz.title}>
                      {quiz.title}
                    </h4>
                    {quiz.topic && (
                      <span className={styles.quizTopicBadge}>
                        <Sparkles size={11} />
                        {quiz.topic}
                      </span>
                    )}
                    {renderDifficultyBadge(quiz.difficulty)}
                  </div>

                  <div className={styles.quizMetaRow}>
                    <span className={styles.metaItem}>
                      <BookOpen size={12} />
                      {quiz.totalQuestions} câu
                    </span>
                    <span className={styles.metaDot}>•</span>
                    <span className={styles.metaItem}>
                      <Clock size={12} />
                      {quiz.timeLimitMinutes} phút
                    </span>
                    <span className={styles.metaDot}>•</span>
                    <span className={styles.metaItem}>
                      <Award size={12} />
                      Đạt: {quiz.passingScore}%
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.selectBtn}
                  onClick={() => handleSelect(quiz)}
                  disabled={selectingQuizId === quiz.id}
                  title={`Chọn đính kèm đề thi: ${quiz.title}`}
                >
                  {selectingQuizId === quiz.id ? (
                    <>
                      <Loader2 size={13} className={styles.spinner} />
                      Đang chọn...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={13} />
                      Đính kèm
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProgramQuizPickerModal;
