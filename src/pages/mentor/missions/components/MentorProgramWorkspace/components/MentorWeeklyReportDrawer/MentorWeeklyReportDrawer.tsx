import React, { useEffect, useState, useCallback } from 'react';
import { X, Users, Mail } from 'lucide-react';
import type { WeeklyAssessment } from '../../../../../../../types';
import { assessmentService } from '../../../../../../../services/assessmentService';
import { MentorWeeklyEvaluationHub } from '../../../../../components/MentorWeeklyEvaluationHub';
import { getAvatarUrl } from '../../../../../../../utils/avatar';
import type { MentorWeeklyReportDrawerProps } from './MentorWeeklyReportDrawer.types';
import styles from './MentorWeeklyReportDrawer.module.css';

export const MentorWeeklyReportDrawer: React.FC<MentorWeeklyReportDrawerProps> = ({
  intern,
  isOpen,
  onClose,
  currentWeekNumber = 1,
  onAssessmentSaved,
}) => {
  const [historyAssessments, setHistoryAssessments] = useState<WeeklyAssessment[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  // Tải lịch sử đánh giá các tuần của TTS khi mở Drawer
  const loadAssessmentHistory = useCallback(async (code: string) => {
    try {
      setIsLoadingHistory(true);
      const data = await assessmentService.getWeeklyAssessments(code);
      setHistoryAssessments(data || []);
    } catch {
      // Đã có toast lỗi ở service nếu cần
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && intern?.internCode) {
      void loadAssessmentHistory(intern.internCode);
    } else {
      setHistoryAssessments([]);
    }
  }, [isOpen, intern?.internCode, loadAssessmentHistory]);

  // Lắng nghe phím ESC để đóng Drawer & Khóa scroll màn hình
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !intern) return null;

  const avatarSrc =
    intern.avatarUrl ||
    getAvatarUrl({
      avatarUrl: intern.avatarUrl,
      id: intern.id,
      username: intern.fullName,
    });

  const handleSaved = async () => {
    if (intern.internCode) {
      await loadAssessmentHistory(intern.internCode);
    }
    if (onAssessmentSaved) {
      onAssessmentSaved();
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="weekly-drawer-title"
      tabIndex={-1}
    >
      <div
        className={styles.drawer}
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        {/* Header Drawer */}
        <div className={styles.drawerHeader}>
          <div className={styles.headerInfo}>
            <div className={styles.avatar}>
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={intern.fullName}
                  className={styles.avatarImg}
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              ) : (
                intern.fullName.charAt(0).toUpperCase()
              )}
            </div>

            <div className={styles.nameGroup}>
              <h2 id="weekly-drawer-title" className={styles.title}>
                <span>{intern.fullName}</span>
                <span className={styles.codeBadge}>{intern.internCode}</span>
              </h2>

              <div className={styles.subtitle}>
                {intern.groupName && (
                  <>
                    <span className={styles.groupBadge}>
                      <Users size={12} />
                      {intern.groupName}
                    </span>
                    <span className={styles.metaDot}>•</span>
                  </>
                )}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Mail size={12} />
                  {intern.email}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng bảng đối soát báo cáo"
            title="Đóng (ESC)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body: Nhúng trực tiếp Dual-Pane Hub TM-22 */}
        <div className={styles.drawerBody}>
          <MentorWeeklyEvaluationHub
            key={`${intern.internCode}-week-${currentWeekNumber}`}
            internCode={intern.internCode}
            internName={intern.fullName}
            currentWeek={currentWeekNumber}
            historyAssessments={historyAssessments}
            onSaveAssessment={handleSaved}
            loading={isLoadingHistory}
          />
        </div>
      </div>
    </div>
  );
};

export default MentorWeeklyReportDrawer;
