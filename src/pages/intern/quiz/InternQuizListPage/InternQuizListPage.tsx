import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Award,
  CheckCircle2,
  Calendar,
  Play,
  RotateCcw,
  RefreshCw,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { Button, SearchBar, Skeleton } from '../../../../components/common';
import { formatDate } from '../../../../utils/formatters';
import { useInternQuiz } from '../../../../hooks/useInternQuiz';
import { QUIZ_ROUTES } from '../../../../constants/routes/quiz.routes';
import type { QuizAssignmentResponse, AssignmentStatus } from '../../../../types/quiz.types';
import styles from './InternQuizListPage.module.css';

export const InternQuizListPage: React.FC = () => {
  const navigate = useNavigate();
  const { assignments, loading, error, fetchAssignments } = useInternQuiz();

  // Search and filter state (Rule 15)
  const [filterState, setFilterState] = useState<{
    search: string;
    status: AssignmentStatus | 'ALL';
  }>({
    search: '',
    status: 'ALL',
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = assignments.length;
    const completed = assignments.filter(
      (a: QuizAssignmentResponse) => (a.attemptsUsed ?? a.attemptsTaken ?? 0) > 0
    ).length;
    const completedWithScores = assignments.filter(
      (a: QuizAssignmentResponse) => a.highestScore !== undefined && a.highestScore !== null
    );
    const avgScore = completedWithScores.length > 0
      ? Math.round(
          completedWithScores.reduce((acc, cur) => acc + (cur.highestScore || 0), 0) / completedWithScores.length
        )
      : 0;

    return { total, completed, avgScore };
  }, [assignments]);

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a: QuizAssignmentResponse) => {
      const matchSearch =
        a.quizTitle.toLowerCase().includes(filterState.search.toLowerCase()) ||
        (a.topic && a.topic.toLowerCase().includes(filterState.search.toLowerCase())) ||
        (a.description && a.description.toLowerCase().includes(filterState.search.toLowerCase()));

      const matchStatus = filterState.status === 'ALL' || a.status === filterState.status;

      return matchSearch && matchStatus;
    });
  }, [assignments, filterState]);

  // Navigate to take quiz
  const handleTakeQuiz = (assignmentId: number) => {
    navigate(QUIZ_ROUTES.TAKE(assignmentId));
  };

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <div className={styles.titleWithIcon}>
            <div className={styles.iconWrapper}>
              <BookOpen size={24} />
            </div>
            <h1 className={styles.pageTitle}>Bài Kiểm Tra & Ôn Tập AI</h1>
          </div>
          <p className={styles.pageSubtitle}>
            Hệ thống bài kiểm tra thông minh do Mentor và AI biên soạn từ nội dung báo cáo thực tập hàng tuần.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchAssignments}
          disabled={loading}
          title="Làm mới danh sách"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
        </Button>
      </div>

      {/* Metrics Row */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={`${styles.metricIcon} ${styles.metricTotal}`}>
            <BookOpen size={22} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricValue}>{metrics.total}</span>
            <span className={styles.metricLabel}>Tổng số bài được giao</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIcon} ${styles.metricCompleted}`}>
            <CheckCircle2 size={22} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricValue}>{metrics.completed}</span>
            <span className={styles.metricLabel}>Bài thi đã thực hiện</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIcon} ${styles.metricScore}`}>
            <Award size={22} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricValue}>{metrics.avgScore}%</span>
            <span className={styles.metricLabel}>Điểm trung bình cao nhất</span>
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div className={styles.filterCard}>
        <div className={styles.searchBox}>
          <SearchBar
            value={filterState.search}
            onChange={(val: string) => setFilterState((prev) => ({ ...prev, search: val }))}
            placeholder="Tìm theo tiêu đề bài quiz, chủ đề..."
          />
        </div>

        <div className={styles.filterTabs}>
          {(['ALL', 'ACTIVE', 'CLOSED', 'CANCELLED'] as const).map((st) => (
            <button
              key={st}
              type="button"
              className={`${styles.filterTabBtn} ${filterState.status === st ? styles.filterTabActive : ''}`}
              onClick={() => setFilterState((prev) => ({ ...prev, status: st }))}
            >
              {st === 'ALL' && 'Tất cả'}
              {st === 'ACTIVE' && 'Đang mở'}
              {st === 'CLOSED' && 'Đã đóng'}
              {st === 'CANCELLED' && 'Đã hủy'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className={styles.skeletonGrid}>
          {[1, 2, 3].map((n) => (
            <div key={n} className={styles.skeletonCard}>
              <Skeleton height="20px" width="40%" />
              <Skeleton height="24px" width="80%" />
              <Skeleton height="36px" />
              <Skeleton height="60px" />
              <Skeleton height="36px" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className={styles.emptyCard}>
          <p style={{ color: 'var(--danger)' }}>{error}</p>
          <Button variant="outline" size="sm" onClick={fetchAssignments}>
            <RefreshCw size={14} /> Thử lại
          </Button>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className={styles.emptyCard}>
          <div className={styles.emptyIconCircle}>
            <Sparkles size={28} />
          </div>
          <h3 className={styles.emptyTitle}>
            {filterState.search || filterState.status !== 'ALL'
              ? 'Không có bài thi nào khớp với bộ lọc'
              : 'Hiện chưa có bài kiểm tra nào được giao'}
          </h3>
          <p className={styles.emptyDesc}>
            {filterState.search || filterState.status !== 'ALL'
              ? 'Hãy thử tìm kiếm với từ khóa khác hoặc chuyển sang xem tất cả các trạng thái.'
              : 'Sau khi Mentor duyệt báo cáo tuần của bạn, bài kiểm tra AI củng cố kiến thức sẽ được giao tại đây.'}
          </p>
        </div>
      ) : (
        <div className={styles.cardsGrid}>
          {filteredAssignments.map((a: QuizAssignmentResponse) => {
            const isActive = a.status === 'ACTIVE';
            const isClosed = a.status === 'CLOSED';
            const attemptsCount = a.attemptsUsed ?? a.attemptsTaken ?? 0;
            const canTake = isActive && attemptsCount < a.maxAttempts;
            const hasTaken = attemptsCount > 0;

            return (
              <div key={a.assignmentId} className={styles.quizCard}>
                <div className={styles.cardHeader}>
                  <span
                    className={`${styles.statusPill} ${
                      isActive
                        ? styles.statusAssigned
                        : isClosed
                        ? styles.statusCompleted
                        : styles.statusExpired
                    }`}
                  >
                    {isActive ? 'Đang mở' : isClosed ? 'Đã đóng' : 'Đã hủy'}
                  </span>

                  {a.topic && (
                    <span className={styles.programTag} title={a.topic}>
                      {a.topic}
                    </span>
                  )}
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.quizCardTitle}>{a.quizTitle}</h3>
                  {a.description && (
                    <p className={styles.quizCardDesc}>{a.description}</p>
                  )}

                  <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                      <Clock size={13} className={styles.detailIcon} />
                      <span>{a.timeLimitMinutes} phút</span>
                    </div>
                    <div className={styles.detailItem}>
                      <HelpCircle size={13} className={styles.detailIcon} />
                      <span>{a.totalQuestions} câu hỏi</span>
                    </div>
                    <div className={styles.detailItem}>
                      <Award size={13} className={styles.detailIcon} />
                      <span>Điểm qua: {a.passingScore}%</span>
                    </div>
                    <div className={styles.detailItem}>
                      <RotateCcw size={13} className={styles.detailIcon} />
                      <span>Lần làm: {attemptsCount}/{a.maxAttempts}</span>
                    </div>
                  </div>

                  {hasTaken && a.highestScore !== undefined && a.highestScore !== null && (
                    <div
                      className={styles.detailItem}
                      style={{
                        color: a.passed ? 'var(--success)' : 'var(--warning)',
                        fontWeight: 600,
                      }}
                    >
                      <CheckCircle2 size={13} />
                      <span>
                        Điểm cao nhất: {a.highestScore}% ({a.passed ? 'ĐẠT' : 'CHƯA ĐẠT'})
                      </span>
                    </div>
                  )}

                  {a.dueDate && (
                    <div className={styles.deadlineRow}>
                      <Calendar size={13} className={styles.deadlineIcon} />
                      <span>Hạn chót: {formatDate(a.dueDate)}</span>
                    </div>
                  )}
                </div>

                <div className={styles.cardActions}>
                  {canTake ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleTakeQuiz(a.assignmentId)}
                    >
                      <Play size={14} />
                      {hasTaken
                        ? `Làm lại (${a.maxAttempts - attemptsCount} lượt còn)`
                        : 'Bắt đầu làm bài'}
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      {isClosed ? 'Đã đóng bài thi' : 'Đã hết lượt thi'}
                    </Button>
                  )}

                  {hasTaken && a.latestSubmissionId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(QUIZ_ROUTES.RESULT(a.latestSubmissionId!))}
                    >
                      <Award size={14} /> Xem kết quả
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InternQuizListPage;
