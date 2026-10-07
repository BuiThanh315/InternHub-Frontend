import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Info, CalendarOff } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { ROUTES } from '../../constants/routes';
import { useAttendanceHistory } from './hooks/useAttendanceHistory';
import {
  AttendanceSummaryCards,
  AttendanceHistoryTable,
} from './components/Attendance';
import styles from './InternAttendancePage.module.css';

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const YEARS = [2024, 2025, 2026, 2027];

export const InternAttendancePage: React.FC = () => {
  const {
    month,
    year,
    summaryData,
    loading,
    error,
    setMonth,
    setYear,
    goToCurrentMonth,
    refetch,
  } = useAttendanceHistory();

  return (
    <div className="animate-fade-in">
      <Header
        title="Lịch Sử Chấm Công & Điểm Danh Cá Nhân"
        subtitle="Theo dõi chi tiết ngày công thực tế, thời gian vào/ra và các chỉ số chuyên cần hàng tháng"
      />

      <div className={styles.pageContainer}>
        {/* Banner tóm tắt quy định thời gian làm việc */}
        <div className={styles.policyNote}>
          <Info size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <div>
            Khung giờ làm việc tiêu chuẩn:{' '}
            <span className={styles.policyHighlight}>08:00 - 17:30</span>. Cho phép
            vào ca đúng giờ đến <span className={styles.policyHighlight}>08:15</span>.
            Sau 08:15 tính là <span className={styles.policyHighlight}>Đi muộn</span>.
            Check-out trước 17:30 tính là <span className={styles.policyHighlight}>Về sớm</span>.
            Bán kính chấm công hợp lệ:{' '}
            <span className={styles.policyHighlight}>25.0 mét</span> quanh trụ sở.
          </div>
        </div>

        {/* Thanh lọc Tháng / Năm */}
        <div className={styles.filterCard}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              <Calendar size={15} />
              <span>Kỳ chấm công:</span>
            </label>

            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className={styles.selectControl}
              aria-label="Chọn tháng"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className={styles.selectControl}
              aria-label="Chọn năm"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  Năm {y}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <button
              type="button"
              onClick={goToCurrentMonth}
              className={styles.currentMonthBtn}
            >
              Về tháng hiện tại
            </button>

            <Link
              to={ROUTES.INTERN.LEAVE_REQUESTS}
              className={styles.leaveRequestBtn}
              title="Quản lý và nộp đơn xin nghỉ phép"
            >
              <CalendarOff size={14} />
              <span>Xin Nghỉ Phép</span>
            </Link>
          </div>
        </div>

        {/* 4 Thẻ KPI Chỉ Số Chuyên Cần */}
        <AttendanceSummaryCards summary={summaryData} loading={loading} />

        {/* Bảng Chi Tiết Lịch Sử Ngày Công */}
        <AttendanceHistoryTable
          attendances={summaryData?.attendances || []}
          loading={loading}
          error={error}
          onRetry={refetch}
          onGoToCurrentMonth={goToCurrentMonth}
        />
      </div>
    </div>
  );
};

export default InternAttendancePage;
