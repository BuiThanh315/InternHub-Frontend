import React from 'react';
import { Building2, Users, FolderKanban, Calendar, ArrowUpRight } from 'lucide-react';
import { formatDate } from '../../../../../utils/formatters';
import type { ProgramBentoCardProps } from './ProgramBentoCard.types';
import styles from './ProgramBentoCard.module.css';

export const ProgramBentoCard: React.FC<ProgramBentoCardProps> = ({
  program,
  onEnterWorkspace,
  groupCount = 0,
  taskCompletedCount = 0,
  taskTotalCount = 0,
  className = '',
}) => {
  const programId = program.programId ?? program.id ?? 0;

  // Tính phần trăm tiến độ
  const progressPercent = taskTotalCount > 0
    ? Math.round((taskCompletedCount / taskTotalCount) * 100)
    : 0;

  // Badge trạng thái
  const renderStatusBadge = () => {
    const rawStatus = (program.status || '').toUpperCase();
    if (rawStatus === 'ONGOING' || rawStatus === 'ACTIVE') {
      return <span className={`${styles.statusBadge} ${styles.statusOngoing}`}>Đang diễn ra</span>;
    }
    if (rawStatus === 'UPCOMING' || rawStatus === 'PLANNING') {
      return <span className={`${styles.statusBadge} ${styles.statusUpcoming}`}>Sắp diễn ra</span>;
    }
    return <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>Hoàn thành</span>;
  };

  return (
    <div className={`${styles.card} ${className}`}>
      {/* Header: Dept & Status */}
      <div className={styles.cardHeader}>
        <div className={styles.badgeGroup}>
          {program.departmentName && (
            <span className={styles.deptBadge}>
              <Building2 size={12} />
              {program.departmentName}
            </span>
          )}
          {renderStatusBadge()}
        </div>
      </div>

      {/* Title & Program Code */}
      <div className={styles.titleArea}>
        <h3 className={styles.programTitle}>{program.name}</h3>
        <span className={styles.programCode}>{program.programCode}</span>
      </div>

      {/* Quick Metrics Grid */}
      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <Users size={15} />
          <span>
            Học viên: <strong className={styles.metaValue}>{program.totalInterns ?? program.activeInterns ?? 0}</strong>
          </span>
        </div>
        <div className={styles.metaItem}>
          <FolderKanban size={15} />
          <span>
            Nhóm dự án: <strong className={styles.metaValue}>{groupCount}</strong>
          </span>
        </div>
      </div>

      {/* Progress Section */}
      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <span>Tiến độ đào tạo ({taskCompletedCount}/{taskTotalCount} task)</span>
          <span className={styles.progressPercentage}>{progressPercent}%</span>
        </div>
        <div className={styles.progressBarTrack} title={`Đạt ${progressPercent}%`}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Footer: Date range & Enter workspace CTA */}
      <div className={styles.cardFooter}>
        <div className={styles.dateRange}>
          <Calendar size={13} />
          <span>
            {formatDate(program.startDate)} - {formatDate(program.endDate)}
          </span>
        </div>

        <button
          type="button"
          className={styles.actionButton}
          onClick={() => onEnterWorkspace(programId)}
          title={`Vào không gian làm việc của ${program.name}`}
        >
          <span>Vào không gian làm việc</span>
          <ArrowUpRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default ProgramBentoCard;
