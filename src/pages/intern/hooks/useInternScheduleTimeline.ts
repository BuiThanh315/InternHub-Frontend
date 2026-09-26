import { useMemo } from 'react';

export interface Milestone {
  step: number;
  title: string;
  desc: string;
  isDone: boolean;
  isCurrent: boolean;
}

export interface ScheduleTimeline {
  isConfigured: boolean;
  totalDays: number;
  totalWeeks: number;
  elapsedDays: number;
  remainingDays: number;
  progressPercent: number;
  currentWeek: number;
  statusBadge: string;
  badgeClass: 'badge-sky' | 'badge-warning' | 'badge-success' | 'badge-neutral';
  milestones: Milestone[];
}

/**
 * An toàn parse ngày dạng chuỗi ISO (YYYY-MM-DD) theo múi giờ cục bộ (Local Time)
 * Tránh lỗi lệch ngày của new Date("YYYY-MM-DD") vốn mặc định parse theo UTC.
 */
const parseLocalDate = (dateStr: string): Date => {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
};

export const useInternScheduleTimeline = (
  startDate?: string | null,
  endDate?: string | null,
  status?: string | null
): ScheduleTimeline => {
  return useMemo(() => {
    if (!startDate || !endDate) {
      return {
        isConfigured: false,
        totalDays: 0,
        totalWeeks: 0,
        elapsedDays: 0,
        remainingDays: 0,
        progressPercent: 0,
        currentWeek: 0,
        statusBadge: 'Chưa sắp xếp lịch',
        badgeClass: 'badge-neutral',
        milestones: [],
      };
    }

    const start = parseLocalDate(startDate);
    const end = parseLocalDate(endDate);
    const today = new Date();

    // Chuẩn hóa thời gian về 00:00:00 và 23:59:59 để so sánh ngày
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    today.setHours(12, 0, 0, 0);

    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / MS_PER_DAY));
    const totalWeeks = Math.max(1, Math.ceil(totalDays / 7));

    let elapsedDays = 0;
    let remainingDays = 0;
    let progressPercent = 0;
    let currentWeek = 1;
    let statusBadge = '';
    let badgeClass: 'badge-sky' | 'badge-warning' | 'badge-success' | 'badge-neutral' = 'badge-sky';

    if (today < start) {
      // Giai đoạn chưa bắt đầu
      const daysUntilStart = Math.ceil((start.getTime() - today.getTime()) / MS_PER_DAY);
      progressPercent = 0;
      currentWeek = 1;
      remainingDays = totalDays;
      statusBadge = `Sắp bắt đầu (Còn ${daysUntilStart} ngày)`;
      badgeClass = 'badge-warning';
    } else if (today > end || status === 'COMPLETED') {
      // Đã hoàn thành khóa thực tập
      progressPercent = 100;
      currentWeek = totalWeeks;
      remainingDays = 0;
      elapsedDays = totalDays;
      statusBadge = 'Đã hoàn thành khóa thực tập';
      badgeClass = 'badge-success';
    } else {
      // Đang trong thời gian thực tập
      elapsedDays = Math.max(1, Math.min(totalDays, Math.round((today.getTime() - start.getTime()) / MS_PER_DAY)));
      remainingDays = Math.max(0, totalDays - elapsedDays);
      progressPercent = Math.min(100, Math.max(1, Math.round((elapsedDays / totalDays) * 100)));
      currentWeek = Math.min(totalWeeks, Math.floor(elapsedDays / 7) + 1);
      statusBadge = `Đang diễn ra (Tuần ${currentWeek}/${totalWeeks})`;
      badgeClass = 'badge-sky';
    }

    // 4 Cột mốc lộ trình đào tạo chuẩn
    const milestones: Milestone[] = [
      {
        step: 1,
        title: 'Tuần 1: Onboarding & Hội nhập văn hóa doanh nghiệp',
        desc: 'Nhận tài khoản, làm quen quy trình nội bộ, bảo mật thông tin và tiếp nhận người hướng dẫn.',
        isDone: currentWeek > 1 || progressPercent === 100,
        isCurrent: currentWeek === 1 && progressPercent < 100 && today >= start,
      },
      {
        step: 2,
        title: 'Tuần 2 - 4: Đào tạo kỹ thuật & Nghiệp vụ chuyên môn',
        desc: 'Tìm hiểu kiến trúc hệ thống, hoàn thành các bài test kỹ năng và tiếp cận codebase dự án.',
        isDone: currentWeek > 4 || progressPercent === 100,
        isCurrent: currentWeek >= 2 && currentWeek <= 4 && progressPercent < 100,
      },
      {
        step: 3,
        title: 'Tuần 5 - 10: Tham gia dự án thực tế & Giao nhận Task',
        desc: 'Trực tiếp thực hiện các tính năng, tham gia daily meeting và nhận feedback code review.',
        isDone: currentWeek > 10 || progressPercent === 100,
        isCurrent: currentWeek >= 5 && currentWeek <= 10 && progressPercent < 100,
      },
      {
        step: 4,
        title: `Tuần 11 - ${totalWeeks}: Đánh giá cuối kỳ & Nghiệm thu kết quả`,
        desc: 'Báo cáo tổng kết thực tập, đánh giá năng lực từ Mentor và xét cơ hội trở thành nhân viên chính thức.',
        isDone: progressPercent === 100,
        isCurrent: currentWeek >= 11 && progressPercent < 100,
      },
    ];

    return {
      isConfigured: true,
      totalDays,
      totalWeeks,
      elapsedDays,
      remainingDays,
      progressPercent,
      currentWeek,
      statusBadge,
      badgeClass,
      milestones,
    };
  }, [startDate, endDate, status]);
};
