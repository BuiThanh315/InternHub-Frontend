import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  BookOpen,
  Clock,
  Award,
  BarChart2,
  Edit3,
  Send,
  HelpCircle,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { Button, SearchBar, Skeleton } from '../../../../../../../components/common';
import { formatDate } from '../../../../../../../utils/formatters';
import { useMentorQuiz } from '../../../../../../../hooks/useMentorQuiz';
import type { QuizSummaryResponse, QuizDetailResponse, QuizStatus } from '../../../../../../../types/quiz.types';
import type { MentorQuizzesTabProps } from './MentorQuizzesTab.types';
import {
  AiQuizGeneratorModal,
  QuizEditorModal,
  AssignQuizModal,
  QuizReportModal,
} from './components';
import styles from './MentorQuizzesTab.module.css';

export const MentorQuizzesTab: React.FC<MentorQuizzesTabProps> = ({
  programId,
  programName,
  programInterns,
  groups,
  className = '',
}) => {
  const {
    quizzes,
    loading,
    error,
    actionLoading,
    fetchQuizzes,
    getQuizDetail,
  } = useMentorQuiz(programId);

  // States for search and status filtering (Rule 15: Single search + status state)
  const [filterState, setFilterState] = useState<{
    search: string;
    status: QuizStatus | 'ALL';
  }>({
    search: '',
    status: 'ALL',
  });

  // Modal states
  const [isAiGenModalOpen, setIsAiGenModalOpen] = useState(false);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [selectedQuizForEdit, setSelectedQuizForEdit] = useState<QuizDetailResponse | null>(null);
  const [selectedQuizForAssign, setSelectedQuizForAssign] = useState<QuizSummaryResponse | QuizDetailResponse | null>(null);
  const [selectedQuizIdForReport, setSelectedQuizIdForReport] = useState<number | null>(null);

  // Filtered quizzes
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((q: QuizSummaryResponse) => {
      const matchSearch =
        q.title.toLowerCase().includes(filterState.search.toLowerCase()) ||
        (q.topic && q.topic.toLowerCase().includes(filterState.search.toLowerCase()));

      const matchStatus = filterState.status === 'ALL' || q.status === filterState.status;

      return matchSearch && matchStatus;
    });
  }, [quizzes, filterState]);

  // Handle Edit / View Quiz Draft
  const handleOpenEditQuiz = async (quizSummary: QuizSummaryResponse) => {
    const detail = await getQuizDetail(quizSummary.id);
    if (detail) {
      setSelectedQuizForEdit(detail);
      setIsEditorModalOpen(true);
    }
  };

  // Handle Open Assign Modal
  const handleOpenAssignModal = (quiz: QuizSummaryResponse) => {
    setSelectedQuizForAssign(quiz);
    setIsAssignModalOpen(true);
  };

  // Handle Open Report Modal
  const handleOpenReportModal = (quizId: number) => {
    setSelectedQuizIdForReport(quizId);
    setIsReportModalOpen(true);
  };

  // After AI generates quiz draft
  const handleAiGenerated = (generatedQuiz: QuizDetailResponse) => {
    setSelectedQuizForEdit(generatedQuiz);
    setIsEditorModalOpen(true);
  };

  // Proceed to assign from editor
  const handleProceedToAssign = (savedQuiz: QuizDetailResponse) => {
    setSelectedQuizForAssign(savedQuiz);
    setIsAssignModalOpen(true);
  };

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Top Section Card */}
      <div className={styles.topSection}>
        <div className={styles.headerRow}>
          <div className={styles.titleArea}>
            <div className={styles.titleWithBadge}>
              <h2 className={styles.title}>
                <BookOpen size={20} /> Bài Kiểm Tra & Ôn Tập AI
              </h2>
              <span className={styles.countBadge}>{quizzes.length} bài thi</span>
            </div>
            <p className={styles.subTitle}>
              Tạo bài trắc nghiệm thông minh từ báo cáo tuần của TTS trong chương trình {programName}
            </p>
          </div>

          <div className={styles.actionArea}>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchQuizzes}
              disabled={loading || actionLoading}
              title="Làm mới danh sách"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
            </Button>
            <button
              type="button"
              className={`button ${styles.aiGenerateBtn}`}
              onClick={() => setIsAiGenModalOpen(true)}
            >
              <Sparkles size={16} /> Tạo Đề Với AI Copilot
            </button>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className={styles.toolbarRow}>
          <div className={styles.searchBox}>
            <SearchBar
              value={filterState.search}
              onChange={(val: string) => setFilterState((prev) => ({ ...prev, search: val }))}
              placeholder="Tìm kiếm bài quiz theo tiêu đề, chủ đề ôn tập..."
            />
          </div>

          <div className={styles.filterGroup}>
            {(['ALL', 'DRAFT', 'PUBLISHED', 'ARCHIVED'] as const).map((st) => (
              <button
                key={st}
                type="button"
                className={`${styles.filterPill} ${filterState.status === st ? styles.filterPillActive : ''}`}
                onClick={() => setFilterState((prev) => ({ ...prev, status: st }))}
              >
                {st === 'ALL' && 'Tất cả'}
                {st === 'DRAFT' && 'Bản nháp'}
                {st === 'PUBLISHED' && 'Đã xuất bản'}
                {st === 'ARCHIVED' && 'Lưu trữ'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className={styles.skeletonGrid}>
          {[1, 2, 3].map((n) => (
            <div key={n} className={styles.skeletonCard}>
              <Skeleton height="20px" width="40%" />
              <Skeleton height="24px" width="80%" />
              <Skeleton height="40px" />
              <Skeleton height="60px" />
              <Skeleton height="32px" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className={styles.emptyState}>
          <p style={{ color: 'var(--danger)' }}>{error}</p>
          <Button variant="outline" size="sm" onClick={fetchQuizzes}>
            <RefreshCw size={14} /> Thử lại
          </Button>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrapper}>
            <BookOpen size={28} />
          </div>
          <h3 className={styles.emptyTitle}>
            {filterState.search || filterState.status !== 'ALL'
              ? 'Không tìm thấy bài Quiz phù hợp'
              : 'Chưa có bài kiểm tra nào'}
          </h3>
          <p className={styles.emptyDesc}>
            {filterState.search || filterState.status !== 'ALL'
              ? 'Thử điều chỉnh lại từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc trạng thái.'
              : 'Sử dụng AI Copilot để tự động phân tích báo cáo tuần của học viên và sinh đề thi trắc nghiệm củng cố kiến thức chỉ trong vài giây!'}
          </p>
          {!filterState.search && filterState.status === 'ALL' && (
            <button
              type="button"
              className={`button ${styles.aiGenerateBtn}`}
              onClick={() => setIsAiGenModalOpen(true)}
            >
              <Sparkles size={16} /> Tạo Bài Quiz Đầu Tiên Với AI
            </button>
          )}
        </div>
      ) : (
        <div className={styles.quizzesGrid}>
          {filteredQuizzes.map((quiz: QuizSummaryResponse) => {
            const isDraft = quiz.status === 'DRAFT';
            const isPublished = quiz.status === 'PUBLISHED';

            return (
              <div key={quiz.id} className={styles.quizCard}>
                <div className={styles.cardTop}>
                  <div className={styles.badgeRow}>
                    <span
                      className={`${styles.statusBadge} ${
                        isDraft
                          ? styles.statusDraft
                          : isPublished
                          ? styles.statusAssigned
                          : styles.statusCompleted
                      }`}
                    >
                      {isDraft && 'Bản nháp'}
                      {isPublished && 'Đã xuất bản'}
                      {!isDraft && !isPublished && 'Đã lưu trữ'}
                    </span>

                    {quiz.topic && (
                      <span className={styles.targetBadge}>
                        <Sparkles size={13} />
                        {quiz.topic}
                      </span>
                    )}
                  </div>

                  <h3 className={styles.quizTitle} title={quiz.title}>
                    {quiz.title}
                  </h3>

                  <div className={styles.metaInfoGrid}>
                    <div className={styles.metaItem}>
                      <Clock size={13} className={styles.metaItemIcon} />
                      <span>{quiz.timeLimitMinutes} phút</span>
                    </div>
                    <div className={styles.metaItem}>
                      <HelpCircle size={13} className={styles.metaItemIcon} />
                      <span>{quiz.totalQuestions} câu hỏi</span>
                    </div>
                    <div className={styles.metaItem}>
                      <Award size={13} className={styles.metaItemIcon} />
                      <span>Điểm qua: {quiz.passingScore}%</span>
                    </div>
                    <div className={styles.metaItem}>
                      <CheckCircle2 size={13} className={styles.metaItemIcon} />
                      <span>Đã nộp: {quiz.completedCount || 0} bài</span>
                    </div>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.createdDate}>
                    {formatDate(quiz.createdAt)}
                  </span>

                  <div className={styles.footerActions}>
                    {isDraft ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditQuiz(quiz)}
                          title="Chỉnh sửa bộ đề nháp"
                        >
                          <Edit3 size={14} /> Sửa đề
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenAssignModal(quiz)}
                          title="Giao bài cho thực tập sinh"
                        >
                          <Send size={14} /> Giao bài
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditQuiz(quiz)}
                          title="Xem chi tiết bộ câu hỏi"
                        >
                          <Edit3 size={14} /> Xem đề
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenReportModal(quiz.id)}
                          title="Xem phổ điểm và kết quả của các TTS"
                        >
                          <BarChart2 size={14} /> Báo cáo
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4 Modals */}
      <AiQuizGeneratorModal
        isOpen={isAiGenModalOpen}
        onClose={() => setIsAiGenModalOpen(false)}
        programId={programId}
        groups={groups}
        onGenerated={handleAiGenerated}
      />

      <QuizEditorModal
        isOpen={isEditorModalOpen}
        onClose={() => {
          setIsEditorModalOpen(false);
          setSelectedQuizForEdit(null);
        }}
        quiz={selectedQuizForEdit}
        onSaved={() => fetchQuizzes()}
        onProceedToAssign={handleProceedToAssign}
      />

      <AssignQuizModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedQuizForAssign(null);
        }}
        quiz={selectedQuizForAssign}
        groups={groups}
        programInterns={programInterns}
        onAssigned={() => fetchQuizzes()}
      />

      <QuizReportModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setSelectedQuizIdForReport(null);
        }}
        quizId={selectedQuizIdForReport}
      />
    </div>
  );
};

export default MentorQuizzesTab;
