import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, RefreshCw, Trash2, Users, Calendar, ArrowRight, UserPlus, Clock, LayoutDashboard } from 'lucide-react';

import type { ProgramDetailResponse } from '../../../../types';
import { ProgramStatusBadge } from './ProgramStatusBadge';
import styles from '../styles/ProgramTable.module.css';

interface ProgramTableProps {
  programs: ProgramDetailResponse[];
  pendingCountsMap?: Record<number, number>;
  userRole?: string;
  onEdit: (program: ProgramDetailResponse) => void;
  onChangeStatus: (program: ProgramDetailResponse) => void;
  onToggleRecruitment: (program: ProgramDetailResponse) => void;
  onEnrollIntern: (program: ProgramDetailResponse) => void;
  onDelete: (program: ProgramDetailResponse) => void;
  onManageGroups?: (program: ProgramDetailResponse) => void;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (newPage: number) => void;
}

export const ProgramTable: React.FC<ProgramTableProps> = ({
  programs,
  pendingCountsMap,
  userRole,
  onEdit,
  onChangeStatus,
  onToggleRecruitment,
  onEnrollIntern,
  onDelete,
  onManageGroups,
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
              <th className={styles.thCell}>Mã & Tên Chương Trình</th>
              <th className={styles.thCell}>Phòng Ban</th>
              <th className={styles.thCell}>Thời Lượng Kỳ Thực Tập</th>
              <th className={styles.thCell}>Tiếp Nhận & Đơn Chờ</th>
              <th className={styles.thCell}>Trạng Thái</th>
              <th className={styles.thCell}>Cổng Nhận Hồ Sơ</th>
              <th className={styles.thCell} style={{ textAlign: 'center' }}>Thao Tác</th>
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
                const canEdit = p.status !== 'CANCELLED';
                const canDelete = userRole === 'ADMIN' && p.status === 'PLANNING' && p.currentInterns === 0;
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
                        <Calendar size={14} style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
                        <span>{p.startDate}</span>
                        <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
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
                          <Users size={15} aria-hidden="true" />
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
                                onClick={() => onEnrollIntern(p)}
                                title={`Có ${pendingCount} đơn đang chờ tiếp nhận. Nhấp để duyệt ngay!`}
                                aria-label={`Có ${pendingCount} đơn chờ duyệt cho kỳ ${p.name}`}
                              >
                                <Clock size={12} aria-hidden="true" />
                                <span>{pendingCount} đơn chờ duyệt</span>
                                <ArrowRight size={11} aria-hidden="true" />
                              </button>
                            );
                          }
                          return (
                            <span className={styles.noPendingBadge}>
                              <Clock size={11} aria-hidden="true" />
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

                    {/* Cột 7: Thao tác */}
                    <td className={styles.tdCell} style={{ textAlign: 'center' }}>
                      <div className={styles.actionGroup}>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.actionBtnWorkspace}`}
                          onClick={() => navigate(`/hr/programs/${p.id}`)}
                          title="Vào Không Gian Làm Việc (Workspace) của kỳ"
                          aria-label={`Vào Workspace của chương trình ${p.name}`}
                        >
                          <LayoutDashboard size={15} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                          onClick={() => onEnrollIntern(p)}
                          title="Tiếp nhận & điều phối thực tập sinh vào kỳ này"
                          aria-label={`Tiếp nhận thực tập sinh vào chương trình ${p.name}`}
                        >
                          <UserPlus size={15} aria-hidden="true" />
                        </button>
                        {onManageGroups && (
                          <button
                            type="button"
                            className={styles.actionBtn}
                            onClick={() => onManageGroups(p)}
                            title="Quản lý & Chia nhóm thực tập"
                            aria-label={`Quản lý nhóm thực tập cho chương trình ${p.name}`}
                          >
                            <Users size={15} aria-hidden="true" />
                          </button>
                        )}
                        {canEdit && (
                          <button
                            type="button"
                            className={styles.actionBtn}
                            onClick={() => onEdit(p)}
                            title="Chỉnh sửa thông tin chương trình"
                            aria-label={`Chỉnh sửa chương trình ${p.name}`}
                          >
                            <Edit3 size={15} aria-hidden="true" />
                          </button>
                        )}
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => onChangeStatus(p)}
                          title="Chuyển đổi trạng thái kỳ thực tập"
                          aria-label={`Chuyển trạng thái chương trình ${p.name}`}
                        >
                          <RefreshCw size={15} aria-hidden="true" />
                        </button>
                        {canDelete && (
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                            onClick={() => onDelete(p)}
                            title="Xóa chương trình (chỉ dành cho Admin & chưa có ứng viên)"
                            aria-label={`Xóa chương trình ${p.name}`}
                          >
                            <Trash2 size={15} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
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
    </div>
  );
};
