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
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm shadow-inner">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm leading-tight">
                          {name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <Building size={13} className="text-slate-400" />
                          <span>{dept}</span>
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                      Mentor
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex items-center gap-2 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <Mail size={14} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate font-medium">{email}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-500">Đang kèm trong kỳ:</span>
                  <span className="font-tabular font-bold text-indigo-600 bg-indigo-50/80 px-2.5 py-0.5 rounded-full border border-indigo-100">
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
