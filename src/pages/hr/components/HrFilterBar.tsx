import React from 'react';
import { Search, Plus } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './HrFilterBar.module.css';

interface HrFilterBarProps {
  keyword: string;
  onKeywordChange: (val: string) => void;
  selectedUniversity: string;
  onUniversityChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  onOpenCreateModal: () => void;
}

export const HrFilterBar: React.FC<HrFilterBarProps> = ({
  keyword,
  onKeywordChange,
  selectedUniversity,
  onUniversityChange,
  selectedStatus,
  onStatusChange,
  onOpenCreateModal,
}) => {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('INTERN_CREATE');

  return (
    <>
      <div className={styles.filterHeader}>
        <div>
          <h3 className={styles.title}>Danh Sách Hồ Sơ Thực Tập Sinh</h3>
          <p className={styles.subtitle}>
            Tìm kiếm, lọc danh sách và điều phối trạng thái thực tập sinh
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="btn btn-primary"
            title="Thêm hồ sơ thực tập sinh mới (Đặc quyền: INTERN_CREATE)"
          >
            <Plus size={16} /> Thêm Hồ Sơ Mới
          </button>
        )}
      </div>

      <div className={styles.filterControls}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={`form-input ${styles.searchInput}`}
            placeholder="Tìm tên, mã TTS, email, SĐT..."
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
          />
        </div>

        <select
          className={`form-select ${styles.selectUniversity}`}
          value={selectedUniversity}
          onChange={(e) => onUniversityChange(e.target.value)}
        >
          <option value="">Tất Cả Trường ĐH</option>
          <option value="Đại Học Bách Khoa">ĐH Bách Khoa</option>
          <option value="Đại Học Quốc Gia">ĐH Quốc Gia</option>
          <option value="Đại Học FPT">ĐH FPT</option>
          <option value="Đại Học Kinh Tế Quốc Dân">ĐH Kinh Tế Quốc Dân</option>
          <option value="Học Viện Bưu Chính Viễn Thông">HV Bưu Chính Viễn Thông</option>
        </select>

        <select
          className={`form-select ${styles.selectStatus}`}
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">Tất Cả Trạng Thái</option>
          <option value="PENDING">Chờ Tiếp Nhận (PENDING)</option>
          <option value="APPROVED">Đã Duyệt (APPROVED)</option>
          <option value="INTERNING">Đang Thực Tập (INTERNING)</option>
          <option value="COMPLETED">Hoàn Thành (COMPLETED)</option>
          <option value="REJECTED">Đã Từ Chối (REJECTED)</option>
        </select>
      </div>
    </>
  );
};
