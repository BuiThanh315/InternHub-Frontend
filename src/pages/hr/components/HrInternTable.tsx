import React from 'react';
import { Eye, Edit3, Upload, SearchX } from 'lucide-react';
import type { InternProfile, InternStatus } from '../../../types';
import { Skeleton, Pagination } from '../../../components/common';
import { getInternStatusLabel, formatPhoneNumber } from '../../../utils/formatters';
import styles from './HrInternTable.module.css';

interface HrInternTableProps {
  interns: InternProfile[];
  loading: boolean;
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (newPage: number) => void;
  onViewDetail: (intern: InternProfile) => void;
  onOpenEdit: (intern: InternProfile) => void;
  onOpenUpload: (intern: InternProfile) => void;
  onOpenApprove: (intern: InternProfile) => void;
  onOpenReject: (intern: InternProfile) => void;
  onStatusChange: (internId: number, nextStatus: InternStatus) => void;
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
  onStatusChange,
}) => {
  const getBadgeClass = (status: InternStatus) => {
    switch (status) {
      case 'INTERNING':
        return 'badge-success';
      case 'APPROVED':
        return 'badge-info';
      case 'COMPLETED':
        return 'badge-neutral';
      case 'REJECTED':
        return 'badge-danger';
      default:
        return 'badge-warning';
    }
  };

  return (
    <>
      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Mã TTS</th>
              <th>Họ và Tên / Liên Hệ</th>
              <th>Trường & Chuyên Ngành</th>
              <th>Vị Trí Ứng Tuyển</th>
              <th>Trạng Thái</th>
              <th>Thao Tác Hồ Sơ</th>
              <th>Điều Phối Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  <td><Skeleton width="90px" height="18px" /></td>
                  <td>
                    <Skeleton width="140px" height="18px" style={{ marginBottom: '4px' }} />
                    <Skeleton width="180px" height="14px" />
                  </td>
                  <td>
                    <Skeleton width="130px" height="18px" style={{ marginBottom: '4px' }} />
                    <Skeleton width="110px" height="14px" />
                  </td>
                  <td><Skeleton width="120px" height="18px" /></td>
                  <td><Skeleton width="80px" height="24px" style={{ borderRadius: '12px' }} /></td>
                  <td><Skeleton width="150px" height="30px" /></td>
                  <td><Skeleton width="130px" height="30px" /></td>
                </tr>
              ))
            ) : interns.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyCell}>
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
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    <button
                      type="button"
                      onClick={() => onViewDetail(intern)}
                      className={styles.codeButton}
                      title="Bấm để xem chi tiết hồ sơ"
                    >
                      {intern.internCode}
                    </button>
                  </td>
                  <td>
                    <div className={styles.nameText}>{intern.fullName}</div>
                    <span className={styles.subText}>
                      {intern.email} • {formatPhoneNumber(intern.phone)}
                    </span>
                  </td>
                  <td>
                    <div>{intern.university}</div>
                    <span className={styles.subText}>{intern.major}</span>
                  </td>
                  <td>
                    <span className={styles.positionText}>
                      {intern.appliedPosition || 'Chưa xếp vị trí'}
                    </span>
                    <div className={styles.startDateText}>
                      Bắt đầu: {intern.startDate || '-'}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getBadgeClass(intern.status)}`}>
                      {getInternStatusLabel(intern.status)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtonsGroup}>
                      <button
                        type="button"
                        onClick={() => onViewDetail(intern)}
                        className={`btn btn-sm btn-secondary ${styles.actionBtn}`}
                        title="Xem chi tiết & tài liệu"
                      >
                        <Eye size={12} /> Chi Tiết
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenEdit(intern)}
                        className={`btn btn-sm btn-secondary ${styles.actionBtn}`}
                        title="Chỉnh sửa thông tin hồ sơ"
                      >
                        <Edit3 size={12} /> Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenUpload(intern)}
                        className={`btn btn-sm btn-secondary ${styles.actionBtn}`}
                        title="Nộp tệp tin cho TTS này"
                      >
                        <Upload size={12} /> Tải Tệp
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className={styles.actionButtonsGroup}>
                      {intern.status === 'PENDING' && (
                        <>
                          <button
                            type="button"
                            onClick={() => onOpenApprove(intern)}
                            className="btn btn-sm btn-primary"
                            title="Phê duyệt tiếp nhận hồ sơ"
                          >
                            Tiếp Nhận
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenReject(intern)}
                            className="btn btn-sm btn-danger"
                            title="Từ chối hồ sơ ứng viên"
                          >
                            Từ Chối
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
                            Bắt Đầu TT
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenReject(intern)}
                            className="btn btn-sm btn-secondary"
                            title="Hủy tiếp nhận / Từ chối hồ sơ"
                          >
                            Hủy Tiếp Nhận
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
                            Hoàn Thành
                          </button>
                          <button
                            type="button"
                            onClick={() => onStatusChange(intern.id, 'REJECTED')}
                            className="btn btn-sm btn-danger"
                            title="Đình chỉ thực tập"
                          >
                            Đình Chỉ
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
                          Mở Lại
                        </button>
                      )}
                      {intern.status === 'COMPLETED' && (
                        <span className={styles.graduatedText}>
                          ✓ Đã Tốt Nghiệp
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

      <div style={{ marginTop: '1rem' }}>
        <Pagination
          currentPage={page + 1}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={10}
          onPageChange={(newPage) => onPageChange(newPage - 1)}
        />
      </div>
    </>
  );
};

export default HrInternTable;
