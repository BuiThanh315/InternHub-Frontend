import React from 'react';
import {
  ArrowLeft,
  Calendar,
  Building2,
  Users,
  UserPlus,
  Edit3,
  RefreshCw,
  Power,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ProgramStatusBadge } from '../../components/ProgramStatusBadge';
import type { ProgramWorkspaceHeaderProps } from '../types/ProgramWorkspace.types';
import styles from '../styles/ProgramWorkspace.module.css';

export const ProgramWorkspaceHeader: React.FC<ProgramWorkspaceHeaderProps> = ({
  program,
  pendingCount,
  internsCount,
  mentorsCount,
  onBack,
  onOpenEnroll,
  onOpenEdit,
  onOpenStatus,
  onToggleRecruitment,
  isTogglingRecruitment = false,
}) => {
  const currentCount = Number(program.currentInterns || internsCount || 0);
  const maxCount = Number(program.maxInterns || 0);
  const percentage = maxCount > 0 ? Math.min(100, Math.round((currentCount / maxCount) * 100)) : 0;
  const isFull = maxCount > 0 && currentCount >= maxCount;

  const getProgressColor = () => {
    if (isFull) return 'var(--danger)';
    if (percentage > 70) return 'var(--warning)';
    return 'var(--primary)';
  };

  return (
    <div>
      {/* Breadcrumbs Navigation */}
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <button
          type="button"
          onClick={onBack}
          className={styles.breadcrumbLink}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Danh sách chương trình</span>
        </button>
        <span aria-hidden="true">/</span>
        <span className={styles.breadcrumbCurrent}>{program.name}</span>
      </nav>

      {/* Hero Header Card */}
      <div className={styles.headerCard}>
        <div className={styles.headerTopRow}>
          {/* Main Info */}
          <div className={styles.headerMainInfo}>
            <div className={styles.badgesRow}>
              <span className={styles.codeBadge}>
                {program.programCode || `PRG-${program.id}`}
              </span>
              <ProgramStatusBadge status={program.status} />
              {program.isRecruitmentOpen ? (
                <span className={styles.recruitmentBadgeOpen}>
                  <Sparkles size={12} aria-hidden="true" />
                  Đang mở cổng tuyển
                </span>
              ) : (
                <span className={styles.recruitmentBadgeClosed}>
                  Cổng nhận hồ sơ đã đóng
                </span>
              )}
            </div>

            <div className={styles.titleArea}>
              <h1 className={styles.programTitle}>{program.name}</h1>
              <div className={styles.departmentText}>
                <Building2 size={16} aria-hidden="true" />
                <span>
                  Phòng ban: <strong>{program.departmentName || 'Chung'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className={styles.headerActions}>
            <button
              type="button"
              className={`${styles.btnAction} ${styles.btnActionPrimary}`}
              onClick={onOpenEnroll}
              title="Tiếp nhận ứng viên vào kỳ thực tập"
            >
              <UserPlus size={16} aria-hidden="true" />
              <span>Tiếp Nhận Ứng Viên</span>
            </button>

            <button
              type="button"
              className={styles.btnAction}
              onClick={onOpenEdit}
              title="Chỉnh sửa thông tin kỳ thực tập"
            >
              <Edit3 size={15} aria-hidden="true" />
              <span>Chỉnh Sửa</span>
            </button>

            <button
              type="button"
              className={styles.btnAction}
              onClick={onOpenStatus}
              title="Chuyển trạng thái vòng đời kỳ thực tập"
            >
              <RefreshCw size={15} aria-hidden="true" />
              <span>Đổi Trạng Thái</span>
            </button>

            <button
              type="button"
              className={styles.btnAction}
              onClick={onToggleRecruitment}
              disabled={isTogglingRecruitment || program.status === 'COMPLETED' || program.status === 'CANCELLED'}
              title={program.isRecruitmentOpen ? 'Đóng cổng tiếp nhận hồ sơ' : 'Mở cổng tiếp nhận hồ sơ'}
            >
              <Power size={15} aria-hidden="true" />
              <span>{program.isRecruitmentOpen ? 'Đóng Cổng Tuyển' : 'Mở Cổng Tuyển'}</span>
            </button>
          </div>
        </div>

        {/* Meta Stats Grid */}
        <div className={styles.headerMetaGrid}>
          {/* Thời lượng */}
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>
              <Calendar size={14} aria-hidden="true" />
              Thời gian đào tạo
            </span>
            <span className={`${styles.metaValue} font-tabular`}>
              {program.startDate || 'Chưa định'} → {program.endDate || 'Chưa định'}
              {program.durationWeeks ? ` (${program.durationWeeks} tuần)` : ''}
            </span>
          </div>

          {/* Chỉ tiêu & Tiến độ */}
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>
              <Users size={14} aria-hidden="true" />
              Chỉ tiêu tiếp nhận
            </span>
            <div className={styles.quotaProgressWrapper}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-tabular">
                  {currentCount} / {maxCount} TTS ({percentage}%)
                </span>
                <span className={`font-semibold font-tabular ${isFull ? 'text-red-500' : 'text-emerald-600'}`}>
                  {isFull ? 'Đã hết chỉ tiêu' : `Còn ${Math.max(0, maxCount - currentCount)} slot`}
                </span>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: getProgressColor(),
                  }}
                />
              </div>
            </div>
          </div>

          {/* Đơn chờ duyệt */}
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>
              <Clock size={14} aria-hidden="true" />
              Đơn nộp chờ duyệt
            </span>
            <span className={`${styles.metaValue} font-tabular flex items-center gap-2`}>
              <strong>{pendingCount}</strong> đơn chờ xử lý
              {pendingCount > 0 && (
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </span>
          </div>

          {/* Mentor phụ trách */}
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>
              <Users size={14} aria-hidden="true" />
              Đội ngũ Mentor
            </span>
            <span className={`${styles.metaValue} font-tabular`}>
              <strong>{mentorsCount}</strong> Mentor được phân công
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
