import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar } from 'lucide-react';

import type { ProgramDetailResponse } from '../../../../types';
import { ProgramStatusBadge } from './ProgramStatusBadge';
import styles from '../styles/ProgramTable.module.css';

interface ProgramTableProps {
  programs: ProgramDetailResponse[];
  pendingCountsMap?: Record<number, number>;
  userRole?: string;
  onEdit?: (program: ProgramDetailResponse) => void;
  onChangeStatus?: (program: ProgramDetailResponse) => void;
  onToggleRecruitment: (program: ProgramDetailResponse) => void;
  onEnrollIntern?: (program: ProgramDetailResponse) => void;
  onDelete?: (program: ProgramDetailResponse) => void;
  onManageGroups?: (program: ProgramDetailResponse) => void;
  onAssignMentor?: (program: ProgramDetailResponse) => void;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (newPage: number) => void;
}

export const ProgramTable: React.FC<ProgramTableProps> = ({
  programs,
  pendingCountsMap,
  onToggleRecruitment,
  onEnrollIntern,
  currentPage,
  totalPages,
  totalElements,
  onPageChange,
}) => {
  const navigate = useNavigate();

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={styles.thCell}>Mã & tên chương trình</th>
              <th className={styles.thCell}>Phòng ban</th>
              <th className={styles.thCell}>Thời lượng</th>
              <th className={styles.thCell}>Tiếp nhận & đơn chờ</th>
              <th className={styles.thCell}>Trạng thái</th>
              <th className={styles.thCell}>Cổng nhận hồ sơ</th>
              <th className={styles.thCell} style={{ textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {programs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={32} style={{ color: 'var(--text-muted)', opacity: 0.5 }} aria-hidden="true" />
                    <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Không tìm thấy chương trình thực tập nào</span>
                    <span style={{ fontSize: '0.8rem' }}>Hãy thử điều chỉnh bộ lọc hoặc tạo một chương trình mới</span>
                  </div>
                </td>
              </tr>
            ) : (
              programs.map((p) => {
                const percentage = p.maxInterns > 0 ? Math.min(100, Math.round((p.currentInterns / p.maxInterns) * 100)) : 0;
                const isFull = p.currentInterns >= p.maxInterns;
                const isRecruitmentDisabled = p.status === 'COMPLETED' || p.status === 'CANCELLED';

                return (
                  <tr key={p.id} className={styles.tableRow}>
                    {/* Cột 1: Mã & Tên */}
                    <td className={styles.tdCell}>
                      <div>
                        <span className={`${styles.codeTag} font-tabular`}>{p.programCode}</span>
                        {p.isHistorical && (
                          <span className={styles.historicalTag}>Lưu trữ cũ</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/hr/programs/${p.id}`)}
                        className={styles.programNameLink}
                        title={`Mở không gian làm việc Workspace cho kỳ "${p.name}"`}
                      >
                        {p.name}
                      </button>
                    </td>

                    {/* Cột 2: Phòng ban */}
                    <td className={styles.tdCell}>
                      <div className={styles.deptName}>{p.departmentName}</div>
                      <div className={`${styles.deptCode} font-tabular`}>{p.departmentCode}</div>
                    </td>

                    {/* Cột 3: Thời lượng */}
                    <td className={`${styles.tdCell} font-tabular`}>
                      <div className={styles.dateRange}>
                        <span>{p.startDate}</span>
                        <span style={{ color: 'var(--text-muted)' }}>–</span>
                        <span>{p.endDate}</span>
                      </div>
                      <div className={styles.durationBadge}>
                        <span>{p.durationWeeks} tuần đào tạo</span>
                      </div>
                    </td>

                    {/* Cột 4: Tiếp nhận & Đơn chờ */}
                    <td className={styles.tdCell}>
                      <button
                        type="button"
                        className={styles.slotButton}
                        onClick={() => navigate(`/hr/programs/${p.id}`)}
                        title={`Xem Workspace của chương trình ${p.name}`}
                        aria-label={`Xem Workspace của ${p.name}: hiện có ${p.currentInterns} trên ${p.maxInterns} chỉ tiêu`}
                      >

                        <div className={`${styles.slotInfo} font-tabular`}>
                          <span>{p.currentInterns} / {p.maxInterns} TTS</span>
                        </div>
                        <div className={styles.progressBarContainer} role="progressbar" aria-valuenow={p.currentInterns} aria-valuemin={0} aria-valuemax={p.maxInterns}>
                          <div
                            className={styles.progressBarFill}
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: isFull ? 'var(--danger)' : percentage > 70 ? 'var(--warning)' : 'var(--primary)',
                            }}
                          />
                        </div>
                        <span className={`${styles.availableText} font-tabular`}>
                          {isFull ? (
                            <strong style={{ color: 'var(--danger)' }}>Đã hết slot</strong>
                          ) : (
                            <>Còn <strong>{p.availableSlots}</strong> vị trí</>
                          )}
                        </span>
                      </button>

                      {/* Huy hiệu số đơn mong muốn tham gia */}
                      <div className={styles.pendingArea}>
                        {(() => {
                          const pendingCount = pendingCountsMap?.[p.id] ?? 0;
                          if (pendingCount > 0) {
                            return (
                              <button
                                type="button"
                                className={styles.pendingBadgeBtn}
                                onClick={() => {
                                  if (onEnrollIntern) {
                                    onEnrollIntern(p);
                                  } else {
                                    navigate(`/hr/programs/${p.id}`);
                                  }
                                }}
                                title={`Có ${pendingCount} đơn đang chờ tiếp nhận. Nhấp để duyệt ngay!`}
                                aria-label={`Có ${pendingCount} đơn chờ duyệt cho kỳ ${p.name}`}
                              >
                                <span className="status-dot status-dot-warning" aria-hidden="true" />
                                <span>{pendingCount} đơn chờ duyệt</span>
                              </button>
                            );
                          }
                          return (
                            <span className={styles.noPendingBadge}>
                              <span className="status-dot status-dot-neutral" aria-hidden="true" />
                              <span>0 đơn chờ</span>
                            </span>
                          );
                        })()}
                      </div>
                    </td>

                    {/* Cột 5: Trạng thái */}
                    <td className={styles.tdCell}>
                      <ProgramStatusBadge status={p.status} />
                    </td>

                    {/* Cột 6: Toggle Nhận hồ sơ */}
                    <td className={styles.tdCell}>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={p.isRecruitmentOpen}
                        disabled={isRecruitmentDisabled}
                        className={styles.toggleLabel}
                        onClick={() => {
                          if (!isRecruitmentDisabled) onToggleRecruitment(p);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          opacity: isRecruitmentDisabled ? 0.45 : 1,
                          cursor: isRecruitmentDisabled ? 'not-allowed' : 'pointer',
                        }}
                        title={isRecruitmentDisabled ? 'Chương trình đã đóng/hủy không thể mở tuyển' : `Nhấp để ${p.isRecruitmentOpen ? 'đóng' : 'mở'} nhận hồ sơ`}
                        aria-label={`Cổng nhận hồ sơ chương trình ${p.name}, hiện tại: ${p.isRecruitmentOpen ? 'Đang mở' : 'Đã đóng'}`}
                      >
                        <div className={`${styles.toggleSwitch} ${p.isRecruitmentOpen ? styles.toggleSwitchActive : ''}`}>
                          <div className={`${styles.toggleKnob} ${p.isRecruitmentOpen ? styles.toggleKnobActive : ''}`} />
                        </div>
                        <span
                          className={styles.toggleText}
                          style={{ color: p.isRecruitmentOpen ? 'var(--success)' : 'var(--text-muted)' }}
                        >
                          {p.isRecruitmentOpen ? 'Đang mở' : 'Đã đóng'}
                        </span>
                      </button>
                    </td>

                    {/* Cột 7: Thao tác - Mở Workspace */}
                    <td className={styles.tdCell} style={{ textAlign: 'center' }}>
                      <div className={styles.actionGroup}>
                        <button
                          type="button"
                          className={styles.btnOpenWorkspace}
                          onClick={() => navigate(`/hr/programs/${p.id}`)}
                          title={`Vào Không Gian Làm Việc (Workspace) của kỳ "${p.name}"`}
                          aria-label={`Vào Không Gian Làm Việc của kỳ ${p.name}`}
                        >
                          <LayoutDashboard size={14} aria-hidden="true" />
                          <span>Vào Workspace</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang tự động ẩn khi <= 10 dòng (Rule 32) */}
      {totalPages > 1 && totalElements > 10 && (
        <div className={styles.pagination}>
          <span className="font-tabular">
            Đang hiển thị <strong>{programs.length}</strong> / <strong>{totalElements}</strong> chương trình (Trang {currentPage + 1} / {Math.max(1, totalPages)})
          </span>
          <div className={styles.pageBtnGroup}>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={currentPage <= 0}
              onClick={() => onPageChange(currentPage - 1)}
              aria-label="Chuyển đến trang trước"
            >
              ← Trang Trước
            </button>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={currentPage >= totalPages - 1}
              onClick={() => onPageChange(currentPage + 1)}
              aria-label="Chuyển đến trang sau"
            >
              Trang Sau →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
