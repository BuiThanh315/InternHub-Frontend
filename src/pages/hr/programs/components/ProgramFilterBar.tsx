import React from 'react';
import { Search, RotateCcw, X, Layers } from 'lucide-react';
import type { DepartmentResponse } from '../../../../types';
import styles from '../styles/ProgramFilterBar.module.css';

interface ProgramFilterBarProps {
  keyword: string;
  departmentId: number | '';
  status: string;
  isHistorical: boolean | '';
  departments: DepartmentResponse[];
  onKeywordChange: (val: string) => void;
  onDepartmentChange: (val: number | '') => void;
  onStatusChange: (val: string) => void;
  onHistoricalChange: (val: boolean | '') => void;
  onReset: () => void;
}

export const ProgramFilterBar: React.FC<ProgramFilterBarProps> = ({
  keyword,
  departmentId,
  status,
  isHistorical,
  departments,
  onKeywordChange,
  onDepartmentChange,
  onStatusChange,
  onHistoricalChange,
  onReset,
}) => {
  // Đếm số lượng bộ lọc đang được kích hoạt
  const activeCount = [
    Boolean(keyword.trim()),
    departmentId !== '',
    Boolean(status),
    isHistorical !== '',
  ].filter(Boolean).length;

  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterHeaderRow}>
        <h4 className={styles.filterTitle}>
          <Layers size={17} className={styles.filterTitleIcon} />
          <span>Bộ Lọc & Tìm Kiếm Chương Trình</span>
          {activeCount > 0 && (
            <span className={styles.activeFiltersCount}>{activeCount} đang lọc</span>
          )}
        </h4>
        {activeCount > 0 && (
          <button
            type="button"
            className={styles.resetBtn}
            onClick={onReset}
            title="Xóa tất cả bộ lọc"
          >
            <RotateCcw size={14} />
            <span>Đặt lại bộ lọc</span>
          </button>
        )}
      </div>

      <div className={styles.filterInputsGrid}>
        {/* Tìm kiếm tên / mã */}
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} aria-hidden="true" />
          <input
            type="text"
            className={styles.filterInput}
            placeholder="Tìm theo tên hoặc mã chương trình…"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            aria-label="Tìm kiếm chương trình thực tập"
          />
          {keyword && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={() => onKeywordChange('')}
              title="Xóa tìm kiếm"
              aria-label="Xóa nội dung tìm kiếm"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Lọc theo Phòng ban */}
        <div>
          <select
            className={styles.filterSelect}
            value={departmentId}
            onChange={(e) => onDepartmentChange(e.target.value === '' ? '' : Number(e.target.value))}
            aria-label="Lọc theo phòng ban phụ trách"
          >
            <option value="">Tất cả phòng ban</option>
            {departments.length === 0 ? (
              <>
                <option value="1">Trung tâm Phát triển Phần mềm (IT-DEV)</option>
                <option value="2">Bộ phận Đảm bảo Chất lượng (QA)</option>
                <option value="3">Bộ phận An toàn & Bảo mật (SEC)</option>
                <option value="4">Phòng Nhân sự & Đào tạo (HR-TD)</option>
              </>
            ) : (
              departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Lọc theo Trạng thái */}
        <div>
          <select
            className={styles.filterSelect}
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PLANNING">Lên kế hoạch</option>
            <option value="OPEN">Mở nhận hồ sơ</option>
            <option value="ONGOING">Đang diễn ra</option>
            <option value="COMPLETED">Đã hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>

        {/* Lọc theo Loại chương trình */}
        <div>
          <select
            className={styles.filterSelect}
            value={isHistorical === '' ? '' : isHistorical ? 'true' : 'false'}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') onHistoricalChange('');
              else onHistoricalChange(val === 'true');
            }}
          >
            <option value="">Tất cả phân loại</option>
            <option value="false">Hiện hành</option>
            <option value="true">Lưu trữ lịch sử</option>
          </select>
        </div>

        {/* Reset button fallback */}
        {activeCount === 0 && (
          <button
            type="button"
            className={styles.resetBtn}
            onClick={onReset}
            title="Làm mới dữ liệu"
          >
            <RotateCcw size={14} />
            <span>Làm mới</span>
          </button>
        )}
      </div>
    </div>
  );
};
