import React from 'react';
import { Eye, Edit3, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import type { InternProfile, InternStatus } from '../../../types';
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
              <th>Điều Phối Trạng Thái (TM-2)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className={styles.emptyCell}>
                  Đang tải danh sách thực tập sinh qua API Backend...
                </td>
              </tr>
            ) : interns.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyCell}>
                  Không tìm thấy hồ sơ thực tập sinh phù hợp trong cơ sở dữ liệu
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
                      {intern.email} • {intern.phone}
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
                      {intern.status}
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
                        title="Chỉnh sửa thông tin hồ sơ (PUT)"
                      >
                        <Edit3 size={12} /> Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenUpload(intern)}
                        className={`btn btn-sm btn-secondary ${styles.actionBtn}`}
                        title="Nộp tệp tin cho TTS này (POST)"
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
                            onClick={() => onStatusChange(intern.id, 'APPROVED')}
                            className="btn btn-sm btn-primary"
                            title="Phê duyệt hồ sơ"
                          >
                            Tiếp Nhận
                          </button>
                          <button
                            type="button"
                            onClick={() => onStatusChange(intern.id, 'REJECTED')}
                            className="btn btn-sm btn-danger"
                            title="Từ chối hồ sơ"
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
                            onClick={() => onStatusChange(intern.id, 'REJECTED')}
                            className="btn btn-sm btn-secondary"
                            title="Từ chối/hủy"
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

      <div className={styles.paginationContainer}>
        <div>
          Trang {page + 1} / {totalPages || 1} • Tổng số {totalItems} hồ sơ
        </div>
        <div className={styles.paginationButtons}>
          <button
            type="button"
            disabled={page === 0}
            onClick={() => onPageChange(Math.max(0, page - 1))}
            className="btn btn-sm btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <ChevronLeft size={14} /> Trước
          </button>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
            className="btn btn-sm btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            Sau <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </>
  );
};
