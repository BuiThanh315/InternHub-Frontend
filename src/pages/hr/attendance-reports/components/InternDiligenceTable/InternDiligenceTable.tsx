import React from 'react';
import { Eye, AlertCircle, Users, RotateCcw } from 'lucide-react';
import { Button, Pagination, Skeleton } from '../../../../../components/common';

import type { InternDiligenceTableProps } from './InternDiligenceTable.types';
import type { DiligenceStatus } from '../../../../../types';
import styles from './InternDiligenceTable.module.css';

const getStatusBadgeClass = (status: DiligenceStatus): string => {
  switch (status) {
    case 'EXCELLENT':
      return styles.statusExcellent;
    case 'GOOD':
      return styles.statusGood;
    case 'WARNING':
      return styles.statusWarning;
    case 'CRITICAL':
      return styles.statusCritical;
    default:
      return '';
  }
};

const getRateClass = (rate: number): string => {
  if (rate >= 90) return styles.rateHigh;
  if (rate >= 75) return styles.rateMedium;
  return styles.rateLow;
};

export const InternDiligenceTable: React.FC<InternDiligenceTableProps> = ({
  data,
  isLoading = false,
  error = null,
  onPageChange,
  onViewDetail,
  onRetry,
  onResetFilters,
}) => {
  // 1. Loading State (Skeleton Shimmer - Rule 32)
  if (isLoading) {
    return (
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={`${styles.th} ${styles.stickyLeft}`}>Mã TTS</th>
                <th className={styles.th}>Họ và tên</th>
                <th className={`${styles.th} ${styles.colDept}`}>Phòng ban & chương trình</th>
                <th className={styles.th}>Ngày công</th>
                <th className={styles.th}>Đi muộn / về sớm</th>
                <th className={styles.th}>Nghỉ phép</th>
                <th className={styles.th}>Vắng không phép</th>
                <th className={styles.th}>Tỷ lệ</th>
                <th className={`${styles.th} ${styles.colStatus}`}>Xếp loại</th>
                <th className={`${styles.th} ${styles.stickyRight}`}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, idx) => (
                <tr key={idx} className={styles.tr}>
                  <td className={`${styles.td} ${styles.stickyLeft}`}>
                    <Skeleton width="90px" height="24px" style={{ borderRadius: '6px' }} />
                  </td>
                  <td className={styles.td}>
                    <Skeleton width="130px" height="16px" />
                    <Skeleton width="100px" height="12px" style={{ marginTop: '4px' }} />
                  </td>
                  <td className={styles.td}>
                    <Skeleton width="150px" height="16px" />
                    <Skeleton width="110px" height="12px" style={{ marginTop: '4px' }} />
                  </td>
                  <td className={styles.td}>
                    <Skeleton width="70px" height="18px" />
                  </td>
                  <td className={styles.td}>
                    <Skeleton width="60px" height="18px" />
                  </td>
                  <td className={styles.td}>
                    <Skeleton width="60px" height="18px" />
                  </td>
                  <td className={styles.td}>
                    <Skeleton width="60px" height="18px" />
                  </td>
                  <td className={styles.td}>
                    <Skeleton width="50px" height="18px" />
                  </td>
                  <td className={styles.td}>
                    <Skeleton width="80px" height="24px" style={{ borderRadius: '9999px' }} />
                  </td>
                  <td className={`${styles.td} ${styles.stickyRight}`}>
                    <Skeleton width="70px" height="32px" style={{ borderRadius: '6px' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 2. Error State (Rule 32)
  if (error) {
    return (
      <div className={styles.tableCard}>
        <div className={styles.stateContainer}>
          <div className={styles.stateIcon} style={{ color: 'var(--danger)' }}>
            <AlertCircle size={32} />
          </div>
          <div className={styles.stateTitle}>Không thể tải dữ liệu báo cáo</div>
          <div className={styles.stateDescription}>{error}</div>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} leftIcon={<RotateCcw size={14} />}>
              Thử lại
            </Button>
          )}
        </div>
      </div>
    );
  }

  const items = data?.items || data?.content || [];
  const totalElements = data?.totalItems ?? data?.totalElements ?? items.length;
  const totalPages = data?.totalPages ?? 1;
  const currentPageZeroIndexed = data?.currentPage ?? data?.pageNumber ?? 0;
  const currentPageOneIndexed = currentPageZeroIndexed + 1;

  // 3. Empty State (Rule 32)
  if (items.length === 0) {
    return (
      <div className={styles.tableCard}>
        <div className={styles.stateContainer}>
          <div className={styles.stateIcon}>
            <Users size={32} />
          </div>
          <div className={styles.stateTitle}>Không tìm thấy thực tập sinh phù hợp</div>
          <div className={styles.stateDescription}>
            Không có dữ liệu chuyên cần nào khớp với các tiêu chí bộ lọc đã chọn. Hãy thử thay đổi bộ lọc hoặc tìm kiếm lại.
          </div>
          {onResetFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              leftIcon={<RotateCcw size={14} />}
            >
              Đặt lại bộ lọc
            </Button>
          )}
        </div>
      </div>
    );
  }

  // 4. Success State (Bảng Dữ Liệu)
  return (
    <div className={styles.tableCard}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={`${styles.th} ${styles.stickyLeft}`}>Mã TTS</th>
              <th className={styles.th}>Họ và tên</th>
              <th className={`${styles.th} ${styles.colDept}`}>Phòng ban & chương trình</th>
              <th className={styles.th}>Ngày công</th>
              <th className={styles.th}>Đi muộn / về sớm</th>
              <th className={styles.th}>Nghỉ phép</th>
              <th className={styles.th}>Vắng không phép</th>
              <th className={styles.th}>Tỷ lệ</th>
              <th className={`${styles.th} ${styles.colStatus}`}>Xếp loại</th>
              <th className={`${styles.th} ${styles.stickyRight}`}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.internId} className={styles.tr}>
                {/* Cột 1: Mã TTS (Sticky Left) */}
                <td className={`${styles.td} ${styles.stickyLeft}`}>
                  <span className={`${styles.codeBadge} font-tabular`}>{item.internCode}</span>
                </td>

                {/* Cột 2: Họ và Tên */}
                <td className={styles.td}>
                  <div className={styles.userCell}>
                    <span className={styles.userName}>{item.fullName}</span>
                    <span className={styles.userEmail}>{item.email}</span>
                  </div>
                </td>

                {/* Cột 3: Phòng ban • Chương trình • Mentor */}
                <td className={`${styles.td} ${styles.colDept}`}>
                  <div className={styles.deptCell}>
                    <span className={styles.deptName}>{item.departmentName || '—'}</span>
                    <span className={styles.progTitle} title={item.programTitle || ''}>
                      {item.programTitle || '—'}
                    </span>
                    {item.mentorName && (
                      <span className={styles.mentorTag}>
                        Mentor: {item.mentorName}
                      </span>
                    )}
                  </div>
                </td>

                {/* Cột 4: Ngày công */}
                <td className={styles.td}>
                  <div className={styles.workDaysCell}>
                    <span className={`${styles.actualDays} font-tabular`}>{item.actualWorkDays.toFixed(1)}</span>
                    <span className={`${styles.expectedDays} font-tabular`}>/ {item.expectedWorkDays}</span>
                  </div>
                </td>

                {/* Cột 5: Đi muộn / Về sớm */}
                <td className={styles.td}>
                  <span>
                    <span className="font-tabular">{item.lateCount}</span> muộn • <span className="font-tabular">{item.earlyLeaveCount}</span> sớm
                  </span>
                </td>

                {/* Cột 6: Nghỉ phép */}
                <td className={styles.td}>
                  <span className="font-tabular">{item.approvedLeaveDays.toFixed(1)} ngày</span>
                </td>

                {/* Cột 7: Vắng K.phép */}
                <td className={styles.td}>
                  <span className="font-tabular" style={{ color: item.unexcusedAbsenceDays > 0 ? 'var(--danger)' : 'inherit', fontWeight: item.unexcusedAbsenceDays > 0 ? 600 : 400 }}>
                    {item.unexcusedAbsenceDays.toFixed(1)} ngày
                  </span>
                </td>

                {/* Cột 8: Tỷ lệ chuyên cần */}
                <td className={styles.td}>
                  <span className={`${styles.rateCell} ${getRateClass(item.diligenceRate)} font-tabular`}>
                    {item.diligenceRate.toFixed(1)}%
                  </span>
                </td>

                {/* Cột 9: Xếp loại kỷ luật & Diễn giải cảnh báo */}
                <td className={`${styles.td} ${styles.colStatus}`}>
                  <div className={styles.statusCell}>
                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(item.diligenceStatus)}`}>
                      {item.diligenceStatusTitle || item.diligenceStatus}
                    </span>
                    {item.warningNotes && (
                      <span className={styles.warningNotesText} title={item.warningNotes}>
                        {item.warningNotes}
                      </span>
                    )}
                  </div>
                </td>

                {/* Cột 10: Thao tác (Sticky Right) */}
                <td className={`${styles.td} ${styles.stickyRight}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Eye size={14} />}
                    onClick={() => onViewDetail(item.internId)}
                  >
                    Xem
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Thanh Phân Trang - Tự ẩn khi <= 10 bản ghi (Rule 31) */}
      <Pagination
        currentPage={currentPageOneIndexed}
        totalPages={totalPages}
        totalItems={totalElements}
        pageSize={10}
        onPageChange={onPageChange}
      />
    </div>
  );
};
