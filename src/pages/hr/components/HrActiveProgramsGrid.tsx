import React from 'react';
import {
  FolderGit2,
  ArrowRight,
  Building2,
  Calendar,
  LayoutDashboard,
  Inbox,
} from 'lucide-react';
import type { ProgramDetailResponse } from '../../../types';
import { ProgramStatusBadge } from '../programs/components/ProgramStatusBadge';
import styles from './HrActiveProgramsGrid.module.css';

interface HrActiveProgramsGridProps {
  programs: ProgramDetailResponse[];
  pendingCountsMap?: Record<number, number>;
  onViewAll: () => void;
  onEnterWorkspace: (program: ProgramDetailResponse) => void;
}

export const HrActiveProgramsGrid: React.FC<HrActiveProgramsGridProps> = ({
  programs,
  pendingCountsMap,
  onViewAll,
  onEnterWorkspace,
}) => {
  return (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleArea}>
          <div className={styles.iconWrapper} aria-hidden="true">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h2 className={styles.sectionTitle}>
              Không Gian Kỳ Thực Tập Trọng Tâm (Program Workspaces)
            </h2>
            <p className={styles.sectionSubtitle}>
              Truy cập trực tiếp vào Workspace của từng kỳ để tiếp nhận đơn, quản lý TTS và điều phối Mentor.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className={styles.btnViewAll}
        >
          <span>Xem tất cả chương trình</span>
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>

      {programs.length === 0 ? (
        <div className={styles.emptyCard}>
          <FolderGit2 size={32} className="mx-auto mb-2 opacity-40" aria-hidden="true" />
          <p className="text-sm font-medium">Chưa có chương trình thực tập nào đang mở hoặc diễn ra.</p>
        </div>
      ) : (
        <div className={styles.programsGrid}>
          {programs.map((program) => {
            const current = Number(program.currentInterns || 0);
            const max = Number(program.maxInterns || 0);
            const percentage = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
            const isFull = max > 0 && current >= max;

            const pendingCount = program.pendingApplicationsCount ?? pendingCountsMap?.[program.id] ?? 0;
            const calculateAppPercentage = () => {
              if (max > 0) {
                return Math.min(100, Math.round((pendingCount / max) * 100));
              }
              return pendingCount > 0 ? 100 : 0;
            };
            const appPercentage = calculateAppPercentage();


            const getProgressBarColor = () => {
              if (isFull) return 'var(--danger)';
              if (percentage > 70) return 'var(--warning)';
              return 'var(--primary)';
            };

            return (
              <div key={program.id} className={styles.programCard}>
                <div>
                  <div className={styles.cardTopRow}>
                    <span className={styles.programCode}>
                      {program.programCode || `PRG-${program.id}`}
                    </span>
                    <ProgramStatusBadge status={program.status} />
                  </div>

                  <h3 className={styles.programName}>{program.name}</h3>

                  <div className={styles.deptInfo}>
                    <Building2 size={13} aria-hidden="true" />
                    <span>{program.departmentName || 'Chung'}</span>
                    <span>•</span>
                    <Calendar size={13} aria-hidden="true" />
                    <span className="font-tabular">{program.durationWeeks} tuần</span>
                  </div>

                  {/* Thanh tiến độ 1: Tiến độ tiếp nhận */}
                  <div className={styles.progressSection}>
                    <div className={styles.progressLabelRow}>
                      <span className="text-slate-600 dark:text-slate-400">Tiến độ tiếp nhận</span>
                      <span className="font-tabular text-slate-800 dark:text-slate-200">
                        {current} / {max} TTS ({percentage}%)
                      </span>
                    </div>
                    <div className={styles.progressBarTrack}>
                      <div
                        className={styles.progressBarFill}
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: getProgressBarColor(),
                        }}
                      />
                    </div>
                  </div>

                  {/* Thanh tiến độ 2: Số lượng hồ sơ ứng tuyển */}
                  <div className={styles.applicationsSection}>
                    <div className={styles.applicationsLabelRow}>
                      <span className={styles.applicationsLabel}>
                        <Inbox size={13} aria-hidden="true" />
                        <span>Hồ sơ ứng tuyển</span>
                      </span>
                      <span className={`${styles.applicationsCountBadge} font-tabular`}>
                        {pendingCount} hồ sơ
                        {pendingCount > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        )}
                      </span>
                    </div>

                    <div
                      className={styles.applicationsBarTrack}
                      role="progressbar"
                      aria-valuenow={pendingCount}
                      aria-valuemin={0}
                      aria-valuemax={max}
                      aria-label={`Số lượng hồ sơ ứng tuyển vào ${program.name}: ${pendingCount} hồ sơ`}
                    >
                      <div
                        className={styles.applicationsBarFill}
                        style={{
                          width: `${Math.max(pendingCount > 0 ? 8 : 0, appPercentage)}%`,
                        }}
                      />
                    </div>

                    <div className={styles.applicationsSubRow}>
                      <span>
                        {pendingCount > 0
                          ? 'Đang chờ HR duyệt vào kỳ'
                          : 'Chưa có hồ sơ chờ mới'}
                      </span>
                      {max > 0 && (
                        <span className="font-tabular font-medium">
                          {appPercentage}% chỉ tiêu
                        </span>
                      )}
                    </div>
                  </div>
                </div>



                <button
                  type="button"
                  className={styles.btnEnterWorkspace}
                  onClick={() => onEnterWorkspace(program)}
                  title={`Vào Workspace của chương trình ${program.name}`}
                  aria-label={`Vào Workspace của chương trình ${program.name}`}
                >
                  <span>Vào Workspace Kỳ Này</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
