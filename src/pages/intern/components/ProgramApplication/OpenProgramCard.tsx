import React from 'react';
import {
  Clock,
  Calendar,
  Users,
  ArrowRight,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { formatDate } from '../../../../utils/formatters';
import type { OpenProgramCardProps } from './OpenProgramCard.types';
import styles from './OpenProgramCard.module.css';

export const OpenProgramCard: React.FC<OpenProgramCardProps> = ({
  program,
  onApply,
  isApplied = false,
}) => {
  const formattedStartDate = program.startDate ? formatDate(program.startDate) : 'Chưa định';
  const formattedEndDate = program.endDate ? formatDate(program.endDate) : 'Chưa định';
  const durationText = program.durationWeeks ? `${program.durationWeeks} tuần` : 'Linh hoạt';
  const maxSlots = program.maxInterns ?? 10;

  return (
    <article className={styles.card} aria-label={`Chương trình ${program.name}`}>
      <div>
        <div className={styles.header}>
          <span className={styles.departmentBadge}>
            <Building2 size={13} />
            <span>{program.departmentName || 'Chung'}</span>
          </span>

          <span className={styles.statusBadge}>
            <span className={styles.statusDot} />
            <span>Đang nhận hồ sơ</span>
          </span>
        </div>

        <div className={styles.titleArea}>
          <div className={styles.programCode}>{program.programCode}</div>
          <h3 className={styles.title}>{program.name}</h3>
        </div>

        <p className={styles.description}>
          {program.description || 'Chương trình thực tập chuyên nghiệp đào tạo thực chiến cùng các chuyên gia hàng đầu tại doanh nghiệp.'}
        </p>

        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <Clock size={15} className={styles.metaIcon} />
            <span className={styles.metaText}>
              Thời lượng: <strong>{durationText}</strong>
            </span>
          </div>

          <div className={styles.metaItem}>
            <Users size={15} className={styles.metaIcon} />
            <span className={styles.metaText}>
              Chỉ tiêu: <strong>{maxSlots} TTS</strong>
            </span>
          </div>

          <div className={styles.metaItem} style={{ gridColumn: 'span 2' }}>
            <Calendar size={15} className={styles.metaIcon} />
            <span className={styles.metaText}>
              Dự kiến: <strong>{formattedStartDate}</strong> - <strong>{formattedEndDate}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        {isApplied ? (
          <div className={styles.appliedBadge}>
            <CheckCircle2 size={16} />
            <span>Đã nộp hồ sơ</span>
          </div>
        ) : (
          <button
            type="button"
            className={styles.applyButton}
            onClick={() => onApply(program)}
          >
            <span>Ứng Tuyển Chương Trình Này</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </article>
  );
};
