import React, { useState, useEffect, useRef } from 'react';
import { Eye, Edit3, Upload, SearchX, FileSignature, MoreVertical, Play, CheckCircle2, Ban, RotateCcw, UserMinus } from 'lucide-react';
import type { InternProfile, InternStatus } from '../../../types';
import { Skeleton, Pagination } from '../../../components/common';
import { useAuth } from '../../../contexts/AuthContext';
import { getInternStatusLabel, formatPhoneNumber } from '../../../utils/formatters';
import styles from './HrInternTable.module.css';

interface HrInternTableProps {
  interns: InternProfile[];
  loading: boolean;
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (newPage: number) => void;
  onViewDetail: (intern: InternProfile, tab?: 'profile' | 'history') => void;
  onOpenEdit: (intern: InternProfile) => void;
  onOpenUpload: (intern: InternProfile) => void;
  onOpenApprove: (intern: InternProfile) => void;
  onOpenReject: (intern: InternProfile) => void;
  onOpenContract: (intern: InternProfile) => void;
  onStatusChange: (internId: number, nextStatus: InternStatus) => void;
  onOpenAssignMentor?: (intern: InternProfile) => void;
  onOpenRevokeMentor?: (intern: InternProfile) => void;
  onOpenRemoveProgram?: (intern: InternProfile) => void;
}

export const HrInternTable: React.FC<HrInternTableProps> = ({
  interns,
  loading,
  page,
  totalPages,
  totalItems,
  onPageChange,
  onViewDetail,
  onOpenEdit,
  onOpenUpload,
  onOpenApprove,
  onOpenReject,
  onOpenContract,
  onStatusChange,
  onOpenAssignMentor,
  onOpenRevokeMentor,
  onOpenRemoveProgram,
}) => {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { hasPermission } = useAuth();
  const canEdit = hasPermission('INTERN_EDIT');
  const canApprove = hasPermission('INTERN_APPROVE');
  const canAssignMentor = hasPermission('INTERN_ASSIGN_MENTOR');
  const canContract = hasPermission('CONTRACT_VIEW') || hasPermission('CONTRACT_MANAGE');

  const getBadgeClass = (status: InternStatus) => {
    switch (status) {
      case 'INTERNING':
        return 'badge-success';
      case 'APPROVED':
        return 'badge-sky';
      case 'ON_HOLD':
      case 'COMPLETED':
        return 'badge-neutral';
      case 'REJECTED':
        return 'badge-slate';
      case 'TERMINATED':
        return 'badge-danger';
      default:
        return 'badge-warning';
    }
  };

  const getDotClass = (status: InternStatus) => {
    switch (status) {
      case 'INTERNING':
        return 'status-dot-success';
      case 'APPROVED':
        return 'status-dot-info';
      case 'ON_HOLD':
      case 'COMPLETED':
        return 'status-dot-neutral';
      case 'REJECTED':
      case 'TERMINATED':
        return 'status-dot-danger';
      default:
        return 'status-dot-warning';
    }
  };

  return (
    <>
      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th className={styles.colCode}>Mã TTS</th>
              <th className={styles.colInfo}>Họ và tên / Liên hệ</th>
              <th className={styles.colEdu}>Trường & chuyên ngành</th>
              <th className={styles.colPosition}>Vị trí & chương trình</th>
              <th className={styles.colStatus}>Trạng thái</th>
              <th className={styles.colMentor}>Mentor phụ trách</th>
              <th className={styles.colActions}>Thao tác hồ sơ</th>
              <th className={styles.colCoordination}>Điều phối</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  <td className={styles.colCode}><Skeleton width="90px" height="18px" /></td>
                  <td className={styles.colInfo}>
                    <Skeleton width="140px" height="18px" style={{ marginBottom: '4px' }} />
                    <Skeleton width="180px" height="14px" />
                  </td>
                  <td className={styles.colEdu}>
                    <Skeleton width="130px" height="18px" style={{ marginBottom: '4px' }} />
                    <Skeleton width="110px" height="14px" />
                  </td>
                  <td className={styles.colPosition}><Skeleton width="120px" height="18px" /></td>
                  <td className={styles.colStatus}><Skeleton width="80px" height="24px" style={{ borderRadius: '12px' }} /></td>
                  <td className={styles.colMentor}><Skeleton width="110px" height="24px" /></td>
                  <td className={styles.colActions}><Skeleton width="150px" height="30px" /></td>
                  <td className={styles.colCoordination}><Skeleton width="130px" height="30px" /></td>
                </tr>
              ))
            ) : interns.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.emptyCell}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '2rem' }}>
                    <SearchX size={36} color="var(--text-muted)" />
                    <h4 style={{ margin: 0, fontWeight: 700 }}>Không tìm thấy hồ sơ thực tập sinh</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Không có kết quả phù hợp với từ khóa hoặc bộ lọc tìm kiếm hiện tại.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              interns.map((intern) => (
                <tr key={intern.id}>
                  <td className={styles.colCode} style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    <button
                      type="button"
                      onClick={() => onViewDetail(intern)}
                      className={styles.codeButton}
                      title="Bấm để xem chi tiết hồ sơ"
                    >
                      {intern.internCode}
                    </button>
                  </td>
                  <td className={styles.colInfo}>
                    <div className={styles.nameText}>{intern.fullName}</div>
                    <span className={styles.subText}>
                      {intern.email} • {formatPhoneNumber(intern.phone)}
                    </span>
                  </td>
                  <td className={styles.colEdu}>
                    <div>{intern.university}</div>
                    <span className={styles.subText}>{intern.major}</span>
                  </td>
                  <td className={styles.colPosition}>
                    <div className={styles.positionText}>
                      {intern.appliedPosition || 'Chưa xếp vị trí'}
                    </div>
                    {intern.programName ? (
                      <div className={styles.programChip} title={`Chương trình: ${intern.programName}`}>
                        <span className={styles.programDot} />
                        <span className={styles.programNameText}>{intern.programName}</span>
                      </div>
                    ) : (
                      <span className={styles.noProgramBadge}>Chưa có chương trình</span>
                    )}
                    <div className={styles.startDateText}>
                      Bắt đầu: {intern.startDate || 'Chưa định ngày'}
                    </div>
                  </td>
                  <td className={styles.colStatus}>
                    <span className={`badge ${getBadgeClass(intern.status)}`}>
                      <span className={`status-dot ${getDotClass(intern.status)}`} style={{ marginRight: '6px' }} />
                      {getInternStatusLabel(intern.status)}
                    </span>
                  </td>
                  <td className={styles.colMentor}>
                    {intern.mentorName ? (
                      <div className={styles.mentorCellWrap}>
                        <button
                          type="button"
                          onClick={() => onViewDetail(intern, 'history')}
                          className={styles.mentorNameBtn}
                          title="Bấm để xem dòng thời gian và lịch sử phân công Mentor"
                        >
                          {intern.mentorName}
                        </button>
                        {intern.needsMentorReassignment ? (
                          <div className={styles.mentorActionRow}>
                            <span className="badge badge-danger" style={{ fontSize: '10px', padding: '1px 6px' }}>
                              Cần đổi Mentor
                            </span>
                            <button
                              type="button"
                              onClick={() => onViewDetail(intern, 'history')}
                              className={styles.mentorSubLink}
                              title="Xem lịch sử điều chuyển"
                            >
                              Lịch sử
                            </button>
                          </div>
                        ) : (
                          <div className={styles.mentorActionRow}>
                            <button
                              type="button"
                              onClick={() => onViewDetail(intern, 'history')}
                              className={styles.mentorSubLink}
                              title="Xem lịch sử phân công"
                            >
                              Lịch sử
                            </button>
                            {canAssignMentor && onOpenAssignMentor && (
                              <>
                                <span style={{ color: 'var(--border-default)' }}>•</span>
                                <button
                                  type="button"
                                  onClick={() => onOpenAssignMentor(intern)}
                                  className={styles.mentorActionLink}
                                  title="Đổi Mentor hướng dẫn"
                                >
                                  Đổi
                                </button>
                              </>
                            )}
                            {canAssignMentor && onOpenRevokeMentor && (
                              <>
                                <span style={{ color: 'var(--border-default)' }}>•</span>
                                <button
                                  type="button"
                                  onClick={() => onOpenRevokeMentor(intern)}
                                  className={styles.mentorDangerLink}
                                  title="Thu hồi Mentor"
                                >
                                  Thu hồi
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ) : !intern.programId || intern.needsReassignment ? (
                      /* Khi chưa có chương trình hoặc đang chờ điều phối lại: Cấm hiện Gán Mentor! */
                      <div className={styles.mentorCellWrap}>
                        <span
                          className="badge badge-slate"
                          style={{ fontSize: '10px', padding: '1px 6px' }}
                          title="Thực tập sinh cần được tiếp nhận / xếp vào chương trình trước khi có thể phân công Mentor"
                        >
                          Chưa xếp chương trình
                        </span>
                        {canApprove && intern.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => onOpenApprove(intern)}
                            className={styles.mentorActionLink}
                            title="Tiếp nhận và xếp vào chương trình thực tập"
                          >
                            Xếp chương trình
                          </button>
                        )}
                      </div>
                    ) : (
                      /* Đã có chương trình nhưng chưa có mentor: Mới cho phép Gán Mentor */
                      <div className={styles.mentorCellWrap}>
                        <span className="badge badge-warning" style={{ fontSize: '10px', padding: '1px 6px' }}>
                          Chưa có Mentor
                        </span>
                        {canAssignMentor && onOpenAssignMentor && (intern.status === 'APPROVED' || intern.status === 'INTERNING') && (
                          <button
                            type="button"
                            onClick={() => onOpenAssignMentor(intern)}
                            className={styles.mentorActionLink}
                          >
                            Gán Mentor
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className={styles.colActions}>
                    <div className={styles.actionCellWrapper}>
                      <button
                        type="button"
                        onClick={() => onViewDetail(intern)}
                        className={`btn btn-sm btn-secondary ${styles.actionBtn}`}
                        title="Xem chi tiết & tài liệu"
                      >
                        <Eye size={13} /> Chi tiết
                      </button>

                      {/* Dropdown Menu gom các tác vụ phụ */}
                      <div className={styles.actionMenuContainer} ref={openMenuId === intern.id ? menuRef : null}>
                        <button
                          type="button"
                          className={styles.moreBtn}
                          onClick={() => setOpenMenuId(openMenuId === intern.id ? null : intern.id)}
                          title="Tác vụ khác (Sửa, Nộp tệp, Hợp đồng)"
                          aria-label="Tác vụ khác"
                        >
                          <MoreVertical size={14} />
                        </button>

                        {openMenuId === intern.id && (
                          <div className={styles.actionDropdownMenu}>
                            {canEdit && (
                              <button
                                type="button"
                                className={styles.actionMenuItem}
                                onClick={() => {
                                  setOpenMenuId(null);
                                  onOpenEdit(intern);
                                }}
                                title="Chỉnh sửa thông tin hồ sơ (Đặc quyền: INTERN_EDIT)"
                              >
                                <Edit3 size={13} /> Sửa thông tin
                              </button>
                            )}
                            <button
                              type="button"
                              className={styles.actionMenuItem}
                              onClick={() => {
                                setOpenMenuId(null);
                                onOpenUpload(intern);
                              }}
                            >
                              <Upload size={13} /> Nộp tệp tin
                            </button>
                            {canContract && (
                              <button
                                type="button"
                                className={styles.actionMenuItem}
                                onClick={() => {
                                  setOpenMenuId(null);
                                  onOpenContract(intern);
                                }}
                                disabled={intern.status !== 'APPROVED' && intern.status !== 'INTERNING'}
                                title={
                                  intern.status === 'APPROVED' || intern.status === 'INTERNING'
                                    ? 'Tải lên & quản lý hợp đồng thực tập'
                                    : 'Cần phê duyệt tiếp nhận hồ sơ trước khi tạo hợp đồng'
                                }
                              >
                                <FileSignature size={13} /> Hợp đồng thực tập
                              </button>
                            )}
                            {canApprove && intern.programId && onOpenRemoveProgram && (
                              <button
                                type="button"
                                className={`${styles.actionMenuItem} ${styles.actionMenuItemDanger}`}
                                onClick={() => {
                                  setOpenMenuId(null);
                                  onOpenRemoveProgram(intern);
                                }}
                                title="Gỡ thực tập sinh khỏi chương trình (Dành cho trường hợp xếp nhầm)"
                              >
                                <UserMinus size={13} /> Gỡ khỏi chương trình
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={styles.colCoordination}>
                    <div className={styles.actionButtonsGroup}>
                      {canApprove && intern.status === 'PENDING' && (
                        <>
                          <button
                            type="button"
                            onClick={() => onOpenApprove(intern)}
                            className="btn btn-sm btn-primary"
                            title="Phê duyệt tiếp nhận hồ sơ (Đặc quyền: INTERN_APPROVE)"
                          >
                            Tiếp nhận
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenReject(intern)}
                            className="btn btn-sm btn-danger"
                            title="Từ chối hồ sơ ứng viên (Đặc quyền: INTERN_APPROVE)"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                      {intern.status === 'APPROVED' && (
                        <>
                          <button
                            type="button"
                            onClick={() => onStatusChange(intern.id, 'INTERNING')}
                            className="btn btn-sm btn-success"
                            title="Chuyển sang trạng thái đang thực tập"
                          >
                            <Play size={11} /> Bắt đầu TT
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenReject(intern)}
                            className="btn btn-sm btn-secondary"
                            title="Hủy tiếp nhận / Từ chối hồ sơ"
                          >
                            Hủy
                          </button>
                        </>
                      )}
                      {intern.status === 'INTERNING' && (
                        <>
                          <button
                            type="button"
                            onClick={() => onStatusChange(intern.id, 'COMPLETED')}
                            className="btn btn-sm btn-primary"
                            title="Hoàn thành kỳ thực tập"
                          >
                            <CheckCircle2 size={11} /> Hoàn thành
                          </button>
                          <button
                            type="button"
                            onClick={() => onStatusChange(intern.id, 'REJECTED')}
                            className="btn btn-sm btn-danger"
                            title="Đình chỉ thực tập"
                          >
                            <Ban size={11} /> Đình chỉ
                          </button>
                        </>
                      )}
                      {intern.status === 'REJECTED' && (
                        <button
                          type="button"
                          onClick={() => onStatusChange(intern.id, 'PENDING')}
                          className="btn btn-sm btn-secondary"
                          title="Mở lại xem xét hồ sơ"
                        >
                          <RotateCcw size={11} /> Mở lại
                        </button>
                      )}
                      {intern.status === 'COMPLETED' && (
                        <span className={styles.graduatedText}>
                          ✓ Đã hoàn thành
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && totalItems > 10 && (
        <div style={{ marginTop: '1rem' }}>
          <Pagination
            currentPage={page + 1}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={10}
            onPageChange={(newPage) => onPageChange(newPage - 1)}
          />
        </div>
      )}
    </>
  );
};

export default HrInternTable;
