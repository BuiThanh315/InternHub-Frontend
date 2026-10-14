import React from 'react';
import type { MentorAnalyticsTabProps } from './MentorAnalyticsTab.types';
import styles from './MentorAnalyticsTab.module.css';

export const MentorAnalyticsTab: React.FC<MentorAnalyticsTabProps> = ({
  boards,
  completionPercentage,
  totalTasks,
  completedTasks,
  className = '',
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      {/* 3 Thẻ Chỉ Số Cốt Lõi */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Tỷ lệ hoàn thành tổng thể</span>
          <span className={styles.statValue}>{completionPercentage}%</span>
          <span className={styles.statHint}>Tính trên tất cả các tuần đào tạo</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Nhiệm vụ đã nghiệm thu</span>
          <span className={styles.statValue}>{completedTasks}/{totalTasks}</span>
          <span className={styles.statHint}>Công việc ở cột Hoàn thiện</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Tổng số tuần / sprint</span>
          <span className={styles.statValue}>{boards.length}</span>
          <span className={styles.statHint}>Bảng nhiệm vụ đã thiết lập</span>
        </div>
      </div>

      {/* Tiến Độ Từng Tuần / Sprint */}
      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Tiến Độ Thực Hiện Theo Từng Tuần Đào Tạo</h3>

        {boards.length === 0 ? (
          <div className={styles.emptyNotice}>Chưa có tuần đào tạo nào được thiết lập</div>
        ) : (
          <div className={styles.boardsList}>
            {boards.map((board) => {
              const total = board.totalItems || 0;
              const completed = board.completedCount || 0;
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

              return (
                <div key={board.id} className={styles.boardItem}>
                  <div className={styles.boardItemHeader}>
                    <h4 className={styles.boardTitle}>{board.title}</h4>
                    <span className={styles.boardTaskRatio}>
                      {completed}/{total} task hoàn thành ({percent}%)
                    </span>
                  </div>

                  <div className={styles.progressBarTrack} title={`Đã xong ${percent}%`}>
                    <div
                      className={styles.progressBarFill}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorAnalyticsTab;
