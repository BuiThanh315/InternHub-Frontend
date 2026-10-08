import React, { useMemo } from 'react';
import {
  Users,
  Target,
  GraduationCap,
  Award,
  Clock,
  Info,
} from 'lucide-react';
import type { OverviewTabProps } from '../../types/ProgramWorkspace.types';
import styles from '../../styles/ProgramWorkspace.module.css';

export const OverviewTab: React.FC<OverviewTabProps> = ({
  program,
  interns,
  pendingCount,
}) => {
  const currentCount = Number(program.currentInterns || 0);
  const maxCount = Number(program.maxInterns || 0);
  const capacityPercent = maxCount > 0 ? Math.min(100, Math.round((currentCount / maxCount) * 100)) : 0;

  const activeInternsCount = interns.filter((i) => i.status === 'INTERNING').length;
  const completedInternsCount = interns.filter((i) => i.status === 'COMPLETED').length;


  // Thống kê phân bố theo trường đại học
  const universityDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    interns.forEach((i) => {
      const uni = i.university?.trim() || 'Chưa xác định';
      map[uni] = (map[uni] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [interns]);

  return (
    <div className="space-y-6">
      {/* 4 Cards Thống Kê Tổng Quan */}
      <div className={styles.overviewStatsGrid}>
        <div className={styles.overviewCard}>
          <div className="flex items-center justify-between text-indigo-600">
            <span className={styles.overviewCardLabel}>Tỷ Lệ Tiếp Nhận</span>
            <Target size={20} aria-hidden="true" />
          </div>
          <div className={`${styles.overviewCardValue} font-tabular`}>
            {capacityPercent}%
          </div>
          <div className={styles.overviewCardDesc}>
            Đạt {currentCount} trên tổng số {maxCount} chỉ tiêu phê duyệt
          </div>
        </div>

        <div className={styles.overviewCard}>
          <div className="flex items-center justify-between text-blue-600">
            <span className={styles.overviewCardLabel}>Đang Thực Tập</span>
            <Users size={20} aria-hidden="true" />
          </div>
          <div className={`${styles.overviewCardValue} font-tabular`}>
            {activeInternsCount}
          </div>
          <div className={styles.overviewCardDesc}>
            TTS đang trong giai đoạn đào tạo (INTERNING)
          </div>
        </div>

        <div className={styles.overviewCard}>
          <div className="flex items-center justify-between text-emerald-600">
            <span className={styles.overviewCardLabel}>Đã Tốt Nghiệp Kỳ</span>
            <Award size={20} aria-hidden="true" />
          </div>
          <div className={`${styles.overviewCardValue} font-tabular`}>
            {completedInternsCount}
          </div>
          <div className={styles.overviewCardDesc}>
            Đã hoàn thành xuất sắc chương trình (COMPLETED)
          </div>
        </div>

        <div className={styles.overviewCard}>
          <div className="flex items-center justify-between text-amber-500">
            <span className={styles.overviewCardLabel}>Hồ Sơ Chờ Tuyển</span>
            <Clock size={20} aria-hidden="true" />
          </div>
          <div className={`${styles.overviewCardValue} font-tabular`}>
            {pendingCount}
          </div>
          <div className={styles.overviewCardDesc}>
            Đơn nộp mới đang chờ bộ phận HR duyệt vào kỳ
          </div>
        </div>
      </div>

      {/* Thông Tin Chi Tiết Chương Trình & Phân Bố */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box Chi tiết cấu hình */}
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
            <Info size={18} className="text-indigo-600" aria-hidden="true" />
            Thông Tin Thiết Lập Kỳ Thực Tập
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-500">Mã chương trình:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                {program.programCode || `PRG-${program.id}`}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-500">Phòng ban phụ trách:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {program.departmentName || 'Chung'} ({program.departmentCode || 'DEPT'})
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-500">Thời gian diễn ra:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-tabular">
                {program.startDate} → {program.endDate} ({program.durationWeeks} tuần)
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-500">Chỉ tiêu tối đa:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-tabular">
                {program.maxInterns} thực tập sinh
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-500">Cổng tiếp nhận hồ sơ:</span>
              <span className={`font-semibold ${program.isRecruitmentOpen ? 'text-emerald-600' : 'text-slate-500'}`}>
                {program.isRecruitmentOpen ? 'Đang mở trực tuyến' : 'Đã đóng tiếp nhận'}
              </span>
            </div>

            <div className="pt-2">
              <span className="text-slate-500 block mb-1">Mục tiêu & Mô tả chương trình:</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                {program.description || 'Chưa có thông tin mô tả chi tiết cho chương trình này.'}
              </p>
            </div>
          </div>
        </div>

        {/* Box Nguồn Trường Đại Học */}
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
            <GraduationCap size={18} className="text-indigo-600" aria-hidden="true" />
            Phân Bố Trường Đại Học Của Học Viên
          </h3>

          {universityDistribution.length === 0 ? (
            <p className="text-sm text-slate-500 italic py-6 text-center">
              Chưa có dữ liệu sinh viên trong kỳ để thống kê nguồn trường.
            </p>
          ) : (
            <div className="space-y-3">
              {universityDistribution.map((item) => {
                const uniPercent = interns.length > 0 ? Math.round((item.count / interns.length) * 100) : 0;
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 dark:text-slate-300 truncate max-w-65">
                        {item.name}
                      </span>
                      <span className="font-tabular text-slate-500">
                        {item.count} TTS ({uniPercent}%)
                      </span>
                    </div>

                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${uniPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
