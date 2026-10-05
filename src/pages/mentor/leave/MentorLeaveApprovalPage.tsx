import React from 'react';
import {
  RotateCw,
  UserCheck,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { ErrorBoundary, Button, Pagination, Skeleton, Alert } from '../../../components/common';
import { useLeaveApproval } from './hooks/useLeaveApproval';
import { LeaveApprovalModal } from './components/LeaveApprovalModal';
import { formatDate } from '../../../utils/formatters';
import styles from './MentorLeaveApprovalPage.module.css';

export const MentorLeaveApprovalPage: React.FC = () => {
  const {
    pendingRequests,
    totalElements,
    totalPages,
    page,
    loading,
    error,
    selectedItem,
    isActionSubmitting,
    setPage,
    openApprovalModal,
    closeApprovalModal,
    handleApprove,
    handleReject,
    refetch,
  } = useLeaveApproval();

  return (
    <ErrorBoundary>
      <div className={styles.pageWrapper}>
        {/* Header */}
        <div className={styles.headerBar}>
          <div className={styles.titleGroup}>
            <h1 className={styles.pageTitle}>Xét Duyệt Đơn Xin Nghỉ Phép</h1>
            <p className={styles.pageSubtitle}>
              Danh sách các đơn xin nghỉ phép đang chờ xem xét từ các Thực tập sinh
              thuộc phạm vi hướng dẫn và quản lý.
            </p>
          </div>

          <div>
            <Button
              variant="outline"
              size="md"
              onClick={refetch}
              disabled={loading}
              title="Làm mới danh sách"
            >
              <RotateCw
                size={15}
                style={{ marginRight: 6 }}
                className={loading ? 'animate-spin' : ''}
              />
              Làm mới ({totalElements})
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert type="error" title="Không thể tải danh sách đơn chờ duyệt">
            {error}
          </Alert>
        )}

        {/* Content Table */}
        <div className={styles.tableContainer}>
          {loading ? (
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Thực Tập Sinh</th>
                    <th>Loại Nghỉ Phép</th>
                    <th>Khung Thời Gian</th>
                    <th>Thời Gian Nghỉ</th>
                    <th>Số Ngày</th>
                    <th>Lý Do</th>
                    <th className={styles.stickyRight}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i}>
                      <td><Skeleton variant="text" width="120px" height="20px" /></td>
                      <td><Skeleton variant="text" width="140px" height="20px" /></td>
                      <td><Skeleton variant="text" width="90px" height="20px" /></td>
                      <td><Skeleton variant="text" width="160px" height="20px" /></td>
                      <td><Skeleton variant="text" width="50px" height="20px" /></td>
                      <td><Skeleton variant="text" width="200px" height="20px" /></td>
                      <td className={styles.stickyRight}><Skeleton variant="text" width="90px" height="32px" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <CheckCircle size={28} />
              </div>
              <h3 className={styles.emptyTitle}>Tất cả đơn đã được xử lý!</h3>
              <p className={styles.emptyDesc}>
                Hiện tại không có đơn xin nghỉ phép nào đang chờ bạn xét duyệt.
                Mọi đơn mới nộp sẽ hiển thị tại đây theo thời gian thực.
              </p>
            </div>
          ) : (
            <>
              <div className={styles.tableResponsive}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>THỰC TẬP SINH</th>
                      <th>LOẠI NGHỈ PHÉP</th>
                      <th>KHUNG THỜI GIAN</th>
                      <th>THỜI GIAN NGHỈ</th>
                      <th>SỐ CÔNG</th>
                      <th>LÝ DO XIN NGHỈ</th>
                      <th className={styles.stickyRight} style={{ textAlign: 'right' }}>
                        THAO TÁC
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className={styles.internInfo}>
                            <span className={styles.internName}>{item.internName}</span>
                            <span className={styles.internCode}>{item.internCode}</span>
                          </div>
                        </td>
                        <td>
                          <strong>{item.leaveTypeDescription || item.leaveType}</strong>
                        </td>
                        <td>{item.durationTypeDescription || item.durationType}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <span>{formatDate(item.startDate)}</span>
                            <ArrowRight size={13} style={{ color: 'var(--text-muted)' }} />
                            <span>{formatDate(item.endDate)}</span>
                          </div>
                        </td>
                        <td>
                          <span className={styles.daysTag}>
                            {item.totalDays?.toFixed(1)} ngày
                          </span>
                        </td>
                        <td>
                          <div className={styles.reasonCell} title={item.reason}>
                            {item.reason}
                          </div>
                        </td>
                        <td className={styles.stickyRight}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => openApprovalModal(item)}
                            >
                              <UserCheck size={15} style={{ marginRight: 4 }} />
                              Xét Duyệt
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Phân trang tự ẩn khi <= 10 dòng (Rule 31) */}
              {totalElements > 10 && totalPages > 1 && (
                <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-default)' }}>
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={totalElements}
                    pageSize={10}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal xét duyệt */}
        <LeaveApprovalModal
          item={selectedItem}
          isOpen={selectedItem !== null}
          onClose={closeApprovalModal}
          onApprove={handleApprove}
          onReject={handleReject}
          isSubmitting={isActionSubmitting}
        />
      </div>
    </ErrorBoundary>
  );
};
