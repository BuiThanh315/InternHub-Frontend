import React from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  AlertCircle,
  FileQuestion,
  RotateCcw,
  Paperclip,
} from 'lucide-react';
import { Skeleton } from '../../../components/common/Skeleton';
import { formatDate, formatDateTime } from '../../../utils/formatters';
import type { MentorWeeklyReportInspectionViewProps } from './MentorWeeklyReportInspectionView.types';
import styles from './MentorWeeklyReportInspectionView.module.css';

const getTaskStatusBadgeClass = (status: string) => {
  if (status === 'COMPLETED') return styles.taskDone;
  if (status === 'IN_PROGRESS') return styles.taskInProgress;
  return styles.taskTodo;
};

const getTaskStatusLabel = (status: string) => {
  if (status === 'COMPLETED') return 'Hoàn thành';
  if (status === 'IN_PROGRESS') return 'Đang làm';
  return 'Cần làm';
};

export const MentorWeeklyReportInspectionView: React.FC<MentorWeeklyReportInspectionViewProps> = ({
  report,
  weekNumber,
  startDate,
  endDate,
  loading = false,
  onRequestRevisionClick,
}) => {
  if (loading) {
    return (
      <div className={styles.container}>
        <Skeleton variant="card" height="70px" />
        <Skeleton variant="card" height="110px" />
        <Skeleton variant="card" height="110px" />
        <Skeleton variant="card" height="110px" />
        <Skeleton variant="card" height="140px" />
      </div>
    );
  }

  // Trường hợp TTS chưa nộp báo cáo cho tuần này
  if (!report) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyCard}>
          <FileQuestion size={40} className={styles.emptyIcon} />
          <h4 className={styles.emptyTitle}>Chưa có báo cáo Tuần {weekNumber}</h4>
          <p className={styles.emptyDesc}>
            Thực tập sinh chưa nộp báo cáo tuần này. Bạn vẫn có thể chủ động đánh giá chuyên cần và giao mục tiêu tuần tới ở bảng bên phải.
          </p>
        </div>
      </div>
    );
  }

  const isSubmitted = report.status === 'SUBMITTED';
  const isRevisionRequested = report.status === 'REVISION_REQUESTED';
  const isReviewed = report.status === 'REVIEWED';

  return (
    <div className={styles.container}>
      {/* 1. Header Box */}
      <div className={styles.headerBox}>
        <div className={styles.headerInfo}>
          <h4 className={styles.weekTitle}>
            <FileText size={18} color="var(--primary)" />
            Báo Cáo Tiến Độ Tuần {weekNumber}
          </h4>
          {startDate && endDate && (
            <span className={styles.dateRange}>
              Kỳ báo cáo: {formatDate(startDate)} - {formatDate(endDate)}
            </span>
          )}
        </div>

        <div className={styles.headerStatus}>
          {isSubmitted && (
            <span className={styles.badgeSubmitted}>
              <Clock size={12} /> Đã nộp (Chờ duyệt)
            </span>
          )}
          {isRevisionRequested && (
            <span className={styles.badgeRevision}>
              <AlertTriangle size={12} /> Cần chỉnh sửa
            </span>
          )}
          {isReviewed && (
            <span className={styles.badgeReviewed}>
              <CheckCircle2 size={12} /> Đã hoàn tất đánh giá
            </span>
          )}
          {!isSubmitted && !isRevisionRequested && !isReviewed && (
            <span className={styles.badgeDraft}>
              {report.statusDisplayName || 'Bản nháp'}
            </span>
          )}

          {report.submittedAt && (
            <span className={styles.submittedTime}>
              Nộp lúc: {formatDateTime(report.submittedAt)}
            </span>
          )}
        </div>
      </div>

      {/* 2. Banner Cảnh Báo Nếu Đang Có Revision Note */}
      {isRevisionRequested && report.revisionNote && (
        <div className={styles.revisionAlert}>
          <AlertCircle size={18} className={styles.revisionAlertIcon} />
          <div className={styles.revisionAlertContent}>
            <div className={styles.revisionAlertTitle}>Lý do yêu cầu làm lại báo cáo:</div>
            <div>{report.revisionNote}</div>
          </div>
        </div>
      )}

      {/* 3. Khung 4 Trụ Cột Phản Tư */}
      <div className={styles.pillarsGrid}>
        {/* Trụ cột 1: Công việc hoàn thành */}
        <div className={styles.pillarCard}>
          <div className={styles.pillarHeader}>
            <CheckCircle2 size={16} className={styles.pillarIconSuccess} />
            <span>1. Nhiệm vụ & Công việc đã hoàn thành</span>
          </div>
          <div className={styles.pillarBody}>
            {report.completedTasksSummary || (
              <span className={styles.emptyPillar}>Chưa có thông tin ghi nhận</span>
            )}
          </div>
        </div>

        {/* Trụ cột 2: Công việc chưa hoàn thành */}
        <div className={styles.pillarCard}>
          <div className={styles.pillarHeader}>
            <Clock size={16} className={styles.pillarIconWarning} />
            <span>2. Nhiệm vụ chưa hoàn thành & Lý do</span>
          </div>
          <div className={styles.pillarBody}>
            {report.unfinishedTasksSummary || (
              <span className={styles.emptyPillar}>Không có nhiệm vụ chậm tiến độ</span>
            )}
          </div>
        </div>

        {/* Trụ cột 3: Khó khăn & Thách thức */}
        <div className={styles.pillarCard}>
          <div className={styles.pillarHeader}>
            <AlertTriangle size={16} className={styles.pillarIconDanger} />
            <span>3. Khó khăn, vướng mắc & Đề xuất hỗ trợ</span>
          </div>
          <div className={styles.pillarBody}>
            {report.difficultiesAndChallenges || (
              <span className={styles.emptyPillar}>Không có trở ngại nào phát sinh</span>
            )}
          </div>
        </div>

        {/* Trụ cột 4: Kiến thức mới thu nạp */}
        <div className={styles.pillarCard}>
          <div className={styles.pillarHeader}>
            <Sparkles size={16} className={styles.pillarIconPrimary} />
            <span>4. Kiến thức mới & Bài học chuyên môn</span>
          </div>
          <div className={styles.pillarBody}>
            {report.learningsAndKnowledge || (
              <span className={styles.emptyPillar}>Chưa ghi chú bài học thu nạp</span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Snapshot Tasks Từ Kanban (TM-20) */}
      {report.tasks && report.tasks.length > 0 && (
        <div className={styles.tasksSection}>
          <div className={styles.tasksHeader}>
            <span>Minh chứng công việc (Kanban Snapshot)</span>
            <span className={styles.tasksCount}>{report.tasks.length} tasks</span>
          </div>

          <div className={styles.taskList}>
            {report.tasks.map((task) => (
              <div key={task.id || task.missionItemId} className={styles.taskItem}>
                <div className={styles.taskMainRow}>
                  <div className={styles.taskTitleBox}>
                    <CheckCircle2
                      size={14}
                      color={task.isCompleted ? 'var(--success)' : 'var(--text-muted)'}
                    />
                    <span>{task.taskTitle}</span>
                  </div>
                  <span
                    className={`${styles.taskStatusBadge} ${getTaskStatusBadgeClass(task.taskStatus)}`}
                  >
                    {getTaskStatusLabel(task.taskStatus)}
                  </span>
                </div>

                {(task.submissionUrl || task.note) && (
                  <div className={styles.taskLinksRow}>
                    {task.submissionUrl && (
                      <a
                        href={task.submissionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.prLink}
                      >
                        <ExternalLink size={12} /> Xem PR / Sản phẩm
                      </a>
                    )}
                    {task.note && <span className={styles.taskNote}>Ghi chú: {task.note}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}


      {/* 5. Link Tài Liệu Đính Kèm (nếu có) */}
      {report.reportAttachmentUrl && (
        <div className={styles.attachmentBox}>
          <Paperclip size={14} color="var(--primary)" />
          <span>Tài liệu đính kèm: </span>
          <a
            href={report.reportAttachmentUrl}
            target="_blank"
            rel="noreferrer"
            className={styles.attachmentLink}
          >
            {report.reportAttachmentUrl}
          </a>
        </div>
      )}

      {/* 6. Action Bar Panel Trái: Yêu Cầu Chỉnh Sửa Lại (khi report đang SUBMITTED) */}
      {isSubmitted && (
        <div className={styles.inspectionActionBar}>
          <button
            type="button"
            className={styles.btnRevision}
            onClick={onRequestRevisionClick}
            title="Yêu cầu thực tập sinh sửa lại và nộp bổ sung minh chứng"
          >
            <RotateCcw size={14} /> Yêu Cầu Chỉnh Sửa Lại
          </button>
        </div>
      )}
    </div>
  );
};
