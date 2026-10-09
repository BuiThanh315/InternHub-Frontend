import React from 'react';
import {
  Users,
  Mail,
  Building,
  RefreshCw,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

import { Button, Skeleton } from '../../../../../../components/common';
import type { MentorsTabProps } from '../../types/ProgramWorkspace.types';
import styles from '../../styles/ProgramWorkspace.module.css';

export const MentorsTab: React.FC<MentorsTabProps> = ({
  program,
  mentors,
  isLoading,
  onRefresh,
  onAssignProgramMentor,
}) => {
  return (
    <div>
      {/* Section Header */}
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>
            <ShieldCheck size={20} className="text-emerald-600" aria-hidden="true" />
            Đội Ngũ Mentor Phụ Trách ({mentors.length})
          </h2>
          <p className={styles.sectionSubtitle}>
            Các chuyên gia hướng dẫn kỹ thuật và đánh giá hiệu suất cho kỳ thực tập này.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onAssignProgramMentor && (
            <Button
              variant="primary"
              size="sm"
              onClick={onAssignProgramMentor}
              className="flex items-center gap-1.5 shadow-sm"
            >
              <UserCheck size={14} aria-hidden="true" />
              Gán Mentor Cho Kỳ
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} aria-hidden="true" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
          <Skeleton height={120} />
          <Skeleton height={120} />
          <Skeleton height={120} />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && mentors.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconCircle}>
            <Users size={32} aria-hidden="true" />
          </div>
          <h3 className={styles.emptyTitle}>Chưa Có Mentor Nào Phụ Trách Kỳ Này</h3>
          <p className={styles.emptyDescription}>
            Kỳ thực tập "{program.name}" chưa được gán Mentor hướng dẫn nào.
            Bạn có thể gán nhanh một Mentor cho toàn bộ thực tập sinh của kỳ này bằng nút bấm bên dưới.
          </p>
          {onAssignProgramMentor && (
            <Button
              variant="primary"
              size="sm"
              onClick={onAssignProgramMentor}
              className="mt-4 flex items-center gap-1.5 mx-auto shadow-sm"
            >
              <UserCheck size={15} aria-hidden="true" />
              Gán Mentor Cho Kỳ Này
            </Button>
          )}
        </div>
      )}

      {/* Mentors Cards Grid */}
      {!isLoading && mentors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mentors.map((mentor: any, idx: number) => {
            const name = mentor.fullName || mentor.mentorName || mentor.name || 'Mentor';
            const email = mentor.email || 'mentor@internhub.com';
            const internCount = mentor.internCount ?? mentor.activeInternCount ?? 0;
            const dept = mentor.departmentName || program.departmentName || 'Kỹ thuật';

            return (
              <div
                key={mentor.id || idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-sm">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                          {name}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Building size={12} />
                          <span>{dept}</span>
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                      Mentor
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-2">
                    <Mail size={13} className="text-slate-400" />
                    <span className="truncate">{email}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-500">Đang kèm trong kỳ:</span>
                  <span className="font-tabular font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                    {internCount} TTS
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
