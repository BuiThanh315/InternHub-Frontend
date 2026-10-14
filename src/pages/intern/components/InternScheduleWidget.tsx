import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, CheckCircle2, Circle, AlertCircle, Users, Award, BookOpen, Briefcase } from 'lucide-react';
import type { InternProfile } from '../../../types';
import { formatDate } from '../../../utils/formatters';
import { useInternScheduleTimeline } from '../hooks/useInternScheduleTimeline';
import { meetingService } from '../../../services/meetingService';
import type { MeetingSchedule } from '../../../types/meeting.types';
import styles from './InternScheduleWidget.module.css';

interface InternScheduleWidgetProps {
  profile: InternProfile;
}

export const InternScheduleWidget: React.FC<InternScheduleWidgetProps> = React.memo(({ profile }) => {
  const { startDate, endDate, programName, mentorName, mentorEmail, status } = profile;

  const [meetings, setMeetings] = useState<MeetingSchedule[]>([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(false);

  const fetchMeetings = useCallback(async () => {
    setIsLoadingMeetings(true);
    try {
      let data = await meetingService.getMyMeetings();
      // Nếu data trống và có userId của profile, thử fallback getMeetingsByIntern
      if ((!data || data.length === 0) && profile.userId) {
        data = await meetingService.getMeetingsByIntern(profile.userId);
      }
      setMeetings(data || []);
    } catch (err) {
      console.warn('Lỗi tải danh sách lịch họp:', err);
    } finally {
      setIsLoadingMeetings(false);
    }
  }, [profile.userId]);

  useEffect(() => {
    fetchMeetings();

    const handleNewNotification = () => {
      fetchMeetings();
    };

    window.addEventListener('internhub:new-notification', handleNewNotification);
    return () => {
      window.removeEventListener('internhub:new-notification', handleNewNotification);
    };
  }, [fetchMeetings]);

  // Sử dụng custom hook tách biệt hoàn toàn thuật toán ngày tháng và chuẩn hóa múi giờ
  const timeline = useInternScheduleTimeline(startDate, endDate, status);

  // Hiển thị thông báo khi Ban Nhân sự chưa kích hoạt thời gian thực tập
  if (!timeline.isConfigured || !startDate || !endDate) {
    return (
      <section className={styles.scheduleCard} aria-labelledby="schedule-empty-heading">
        <div className={styles.titleArea}>
          <div className={styles.iconWrapper} aria-hidden="true">
            <Calendar size={22} />
          </div>
          <div>
            <h3 id="schedule-empty-heading" className={styles.title}>Kế Hoạch & Lịch Thực Tập Cá Nhân</h3>
            <p className={styles.subtitle}>Khung thời gian và tiến độ đào tạo</p>
          </div>
        </div>
        <div className={styles.emptyNotice} role="status">
          <AlertCircle size={20} className={styles.emptyNoticeIcon} aria-hidden="true" />
          <span>
            Kế hoạch thực tập của bạn đang được Ban Nhân sự sắp xếp khung thời gian cụ thể. Lịch trình chi tiết sẽ tự động hiển thị ngay khi được kích hoạt.
          </span>
        </div>
      </section>
    );
  }

  const {
    totalDays,
    totalWeeks,
    remainingDays,
    progressPercent,
    currentWeek,
    statusBadge,
    badgeClass,
    milestones,
  } = timeline;

  return (
    <section className={styles.scheduleCard} aria-labelledby="schedule-heading">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.iconWrapper} aria-hidden="true">
            <Calendar size={22} />
          </div>
          <div>
            <h3 id="schedule-heading" className={styles.title}>Kế Hoạch & Lịch Thực Tập Cá Nhân</h3>
            <p className={styles.subtitle}>
              {programName ? `Chương trình: ${programName}` : 'Lộ trình và thời khóa biểu đào tạo'}
            </p>
          </div>
        </div>

        <span className={`badge ${badgeClass}`} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
          {statusBadge}
        </span>
      </div>

      {/* Progress Section */}
      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>Tiến độ thời gian thực tập</span>
          <span className={styles.progressValue}>
            {progressPercent}% hoàn thành {currentWeek > 0 && `(Tuần ${currentWeek}/${totalWeeks})`}
          </span>
        </div>

        {/* Thanh tiến độ đạt chuẩn Trợ năng ARIA */}
        <div
          className={styles.progressBarTrack}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Tiến độ thời gian thực tập: ${progressPercent}%`}
        >
          <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
        </div>

        <div className={styles.dateStatsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Ngày bắt đầu</span>
            <span className={styles.statValue}>{formatDate(startDate)}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Ngày kết thúc</span>
            <span className={styles.statValue}>{formatDate(endDate)}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Tổng thời lượng</span>
            <span className={styles.statValue}>
              {totalWeeks} tuần ({totalDays} ngày)
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Thời gian còn lại</span>
            <span className={styles.statValue} style={{ color: remainingDays > 0 ? '#3b82f6' : '#10b981' }}>
              {remainingDays > 0 ? `${remainingDays} ngày` : 'Đã kết thúc'}
            </span>
          </div>
        </div>
      </div>

      {/* 2 Columns: Weekly Schedule & Roadmap */}
      <div className={styles.detailsGrid}>
        {/* Left Column: Weekly Schedule */}
        <div className={styles.sectionBox}>
          <h4 className={styles.sectionTitle}>
            <Clock size={17} color="#3b82f6" aria-hidden="true" />
            <span>Lịch Làm Việc & Hướng Dẫn Trong Tuần</span>
          </h4>

          <div className={styles.scheduleList}>
            <div className={styles.scheduleItem}>
              <Briefcase size={16} className={styles.scheduleIcon} aria-hidden="true" />
              <div>
                <strong>Thời gian làm việc tiêu chuẩn:</strong>
                <div>Thứ Hai – Thứ Sáu (08:30 – 17:30, nghỉ trưa 12:00 – 13:30)</div>
              </div>
            </div>

            <div className={styles.scheduleItem}>
              <Users size={16} className={styles.scheduleIcon} aria-hidden="true" />
              <div>
                <strong>Lịch Review tiến độ tuần (1:1 với Mentor):</strong>
                <div>Chiều Thứ Sáu hàng tuần (16:00 – 17:00) tại văn phòng hoặc trực tuyến</div>
              </div>
            </div>

            <div className={styles.scheduleItem}>
              <Award size={16} className={styles.scheduleIcon} aria-hidden="true" />
              <div>
                <strong>Người hướng dẫn phụ trách:</strong>
                <div>
                  {mentorName ? (
                    <span>
                      <strong>{mentorName}</strong> {mentorEmail && `(${mentorEmail})`}
                    </span>
                  ) : (
                    <em style={{ color: 'var(--text-muted)' }}>Đang chờ Ban Nhân sự phân công Mentor</em>
                  )}
                </div>
              </div>
            </div>

            {/* Meetings Box for Intern */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-default)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Lịch họp & Trao đổi định kỳ:
                </span>
                {isLoadingMeetings && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Đang tải...</span>}
              </div>

              {meetings.length === 0 ? (
                <div style={{ padding: '12px 16px', background: 'var(--border-subtle, #f8fafc)', borderRadius: '10px', fontSize: '0.825rem', color: 'var(--text-muted)', border: '1px dashed var(--border-default)' }}>
                  Hiện tại bạn chưa có lịch hẹn cuộc họp nào mới từ Mentor hoặc HR.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {meetings.map((m) => {
                    const isOnline = m.meetingType === 'ONLINE';
                    const isCancelled = m.status === 'CANCELLED';
                    const isCompleted = m.status === 'COMPLETED';
                    const meetingEndTime = m.endTime ? new Date(m.endTime) : (m.startTime ? new Date(new Date(m.startTime).getTime() + 2 * 60 * 60 * 1000) : null);
                    const isExpired = isCompleted || (meetingEndTime ? meetingEndTime.getTime() < Date.now() : false);

                    return (
                      <div
                        key={m.id}
                        style={{
                          padding: '12px 16px',
                          background: isCancelled ? '#fef2f2' : isExpired ? 'var(--bg-muted, #f8fafc)' : 'var(--border-subtle, #f8fafc)',
                          borderRadius: '10px',
                          border: `1px solid ${isCancelled ? '#fecaca' : isExpired ? 'var(--border-subtle, #e2e8f0)' : 'var(--border-default)'}`,
                          opacity: isExpired && !isCancelled ? 0.75 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '0.9rem', color: isCancelled ? '#dc2626' : isExpired ? 'var(--text-muted)' : 'var(--text-main)' }}>
                              {m.title}
                            </strong>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '999px',
                                background: isCancelled ? '#fee2e2' : isExpired ? '#f1f5f9' : '#e0e7ff',
                                color: isCancelled ? '#b91c1c' : isExpired ? '#64748b' : '#4338ca',
                              }}
                            >
                              {isCancelled ? 'ĐÃ HỦY' : isExpired ? 'ĐÃ KẾT THÚC' : (m.status === 'UPDATED' ? 'ĐÃ DỜI LỊCH' : isOnline ? 'ONLINE' : 'OFFLINE')}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            ⏰ {new Date(m.startTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                            {m.provider && (
                              <span style={{ marginLeft: '8px', padding: '1px 6px', borderRadius: '4px', background: '#f3f4f6', fontSize: '0.725rem', color: '#374151' }}>
                                {m.provider === 'GOOGLE_MEET' ? '🟢 Google Meet' : m.provider === 'JITSI' ? '🟣 Jitsi Meet' : '🔗 Link tùy chỉnh'}
                              </span>
                            )}
                            {(m.joinUrl || m.locationOrUrl) && ` • 📍 ${m.joinUrl || m.locationOrUrl}`}
                          </div>
                        </div>

                        {!isCancelled && !isExpired && isOnline && (m.joinUrl || (m.locationOrUrl && m.locationOrUrl.startsWith('http'))) && (
                          <a
                            href={m.joinUrl || m.locationOrUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '6px 14px',
                              borderRadius: '8px',
                              background: '#4f46e5',
                              color: '#ffffff',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              textDecoration: 'none',
                              whiteSpace: 'nowrap',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>Vào phòng họp</span>
                            <span aria-hidden="true">→</span>
                          </a>
                        )}
                        {isExpired && !isCancelled && (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                            Cuộc họp đã kết thúc
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Roadmap Milestones */}
        <div className={styles.sectionBox}>
          <h4 className={styles.sectionTitle}>
            <BookOpen size={17} color="#3b82f6" aria-hidden="true" />
            <span>Cột Mốc Lộ Trình Đào Tạo</span>
          </h4>

          <div className={styles.roadmapList} role="list">
            {milestones.map((m) => (
              <div key={m.step} className={styles.milestoneItem} role="listitem">
                <div
                  className={`${styles.milestoneBullet} ${
                    m.isDone ? styles.bulletPast : m.isCurrent ? styles.bulletCurrent : styles.bulletFuture
                  }`}
                  aria-hidden="true"
                >
                  {m.isDone ? <CheckCircle2 size={15} /> : m.isCurrent ? m.step : <Circle size={10} />}
                </div>

                <div className={styles.milestoneContent}>
                  <div
                    className={styles.milestoneTitle}
                    style={{
                      color: m.isCurrent ? '#3b82f6' : m.isDone ? '#10b981' : 'inherit',
                      fontWeight: m.isCurrent ? 700 : 600,
                    }}
                  >
                    {m.title}
                  </div>
                  <div className={styles.milestoneDesc}>{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});
