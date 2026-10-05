import React from 'react';
import { Users, Award, BookOpen, ChevronRight, Activity, Edit2 } from 'lucide-react';
import type { DepartmentCapacityItem } from '../../../../types';
import { Button } from '../../../../components/common/Button/Button';
import styles from './DepartmentBentoCard.module.css';

interface DepartmentBentoCardProps {
  department: DepartmentCapacityItem;
  onViewInterns: (deptId: number) => void;
  onEditQuota: (dept: DepartmentCapacityItem) => void;
}

export const DepartmentBentoCard: React.FC<DepartmentBentoCardProps> = ({
  department,
  onViewInterns,
  onEditQuota,
}) => {
  const {
    departmentId,
    departmentCode,
    departmentName,
    description,
    leadMentorName,
    plannedCapacityQuota,
    activeInternCount,
    activeMentorCount,
    utilizationRate,
    qualityScoreAvg,
    activeProgramsCount,
    mentors,
  } = department;

  // Trạng thái lấp đầy
  const getStatusBadge = () => {
    if (utilizationRate >= 100) {
      return <span className={`${styles.statusBadge} ${styles.statusFull}`}>Đã đạt trần kế hoạch</span>;
    }
    if (utilizationRate >= 75) {
      return <span className={`${styles.statusBadge} ${styles.statusWarning}`}>Gần đầy chỉ tiêu</span>;
    }
    return <span className={`${styles.statusBadge} ${styles.statusNormal}`}>Sẵn sàng nhận thêm</span>;
  };

  const getFillClass = () => {
    if (utilizationRate >= 100) return styles.fillFull;
    if (utilizationRate >= 75) return styles.fillWarning;
    return styles.fillNormal;
  };

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.titleArea}>
          <span className={styles.deptCode}>{departmentCode}</span>
          <h3 className={styles.deptName}>{departmentName}</h3>
          {description && <p className={styles.deptDesc}>{description}</p>}
        </div>
        {getStatusBadge()}
      </div>

      {/* Capacity Gauge */}
      <div className={styles.gaugeSection}>
        <div className={styles.gaugeLabels}>
          <span className={styles.gaugeTitle}>
            <Activity size={15} style={{ color: 'var(--primary)' }} />
            Năng lực tiếp nhận kế hoạch
          </span>
          <span className={styles.gaugeValue}>
            {activeInternCount} / {plannedCapacityQuota} TTS ({utilizationRate}%)
          </span>
        </div>
        <div className={styles.progressBarTrack}>
          <div
            className={`${styles.progressBarFill} ${getFillClass()}`}
            style={{ width: `${Math.min(utilizationRate, 100)}%` }}
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricBox}>
          <span className={styles.metricBoxLabel}>Chương trình</span>
          <span className={styles.metricBoxValue}>
            <BookOpen size={16} style={{ color: 'var(--info)' }} />
            {activeProgramsCount}
          </span>
        </div>
        <div className={styles.metricBox}>
          <span className={styles.metricBoxLabel}>Mentor</span>
          <span className={styles.metricBoxValue}>
            <Users size={16} style={{ color: 'var(--primary)' }} />
            {activeMentorCount}
          </span>
        </div>
        <div className={styles.metricBox}>
          <span className={styles.metricBoxLabel}>Chất lượng</span>
          <span className={styles.metricBoxValue}>
            <Award size={16} style={{ color: '#d97706' }} />
            {qualityScoreAvg > 0 ? `${qualityScoreAvg.toFixed(1)}/5` : 'N/A'}
          </span>
        </div>
      </div>

      {/* Mentor Roster */}
      <div className={styles.mentorSection}>
        <div className={styles.mentorSectionTitle}>
          <span>Đội ngũ Mentor ({activeMentorCount})</span>
          {leadMentorName && <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>Lead: {leadMentorName}</span>}
        </div>
        <div className={styles.avatarStack}>
          {mentors.slice(0, 5).map((m) => (
            <div
              key={m.mentorId}
              className={styles.avatarCircle}
              title={`${m.mentorName} (Đang kèm ${m.activeInternCount} TTS)`}
            >
              {m.mentorName.charAt(0).toUpperCase()}
            </div>
          ))}
          {mentors.length > 5 && (
            <div className={`${styles.avatarCircle} ${styles.moreAvatar}`}>
              +{mentors.length - 5}
            </div>
          )}
          {mentors.length === 0 && (
            <span className="text-xs text-slate-500 italic">Chưa có Mentor được phân vào phòng ban này</span>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className={styles.cardFooter}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEditQuota(department)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
        >
          <Edit2 size={13} />
          Sửa chỉ tiêu
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onViewInterns(departmentId)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
        >
          Xem {activeInternCount} TTS
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
};
