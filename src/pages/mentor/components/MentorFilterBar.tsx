import React from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';
import styles from './MentorFilterBar.module.css';

export type TriageFilterMode = 'all' | 'needs-attention' | 'stable';

interface MentorFilterBarProps {
  keyword: string;
  onKeywordChange: (val: string) => void;
  filterMode: TriageFilterMode;
  onFilterModeChange: (mode: TriageFilterMode) => void;
  selectedProgram: string;
  programsList: string[];
  onProgramChange: (prog: string) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
}

export const MentorFilterBar: React.FC<MentorFilterBarProps> = ({
  keyword,
  onKeywordChange,
  filterMode,
  onFilterModeChange,
  selectedProgram,
  programsList,
  onProgramChange,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className={styles.filterBar}>
      {/* 1. Search Box */}
      <div className={styles.searchBox}>
        <Search size={16} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Tìm theo tên, mã TTS..."
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          aria-label="Tìm kiếm thực tập sinh"
        />
      </div>

      {/* 2. Filter Pills */}
      <div className={styles.pillGroup} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={filterMode === 'all'}
          className={`${styles.pillBtn} ${filterMode === 'all' ? styles.pillActive : ''}`}
          onClick={() => onFilterModeChange('all')}
        >
          Tất cả
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filterMode === 'needs-attention'}
          className={`${styles.pillBtn} ${filterMode === 'needs-attention' ? styles.pillActiveWarning : ''}`}
          onClick={() => onFilterModeChange('needs-attention')}
        >
          Cần chú ý
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filterMode === 'stable'}
          className={`${styles.pillBtn} ${filterMode === 'stable' ? styles.pillActive : ''}`}
          onClick={() => onFilterModeChange('stable')}
        >
          Ổn định
        </button>
      </div>

      <div className={styles.rightActions}>
        {/* 3. Program Select Dropdown */}
        <select
          className={styles.programSelect}
          value={selectedProgram}
          onChange={(e) => onProgramChange(e.target.value)}
          aria-label="Lọc theo chương trình thực tập"
        >
          <option value="">Tất cả chương trình</option>
          {programsList.map((prog) => (
            <option key={prog} value={prog}>
              {prog}
            </option>
          ))}
        </select>

        {/* 4. View Mode Toggle (Grid vs Table) */}
        <div className={styles.viewModeGroup}>
          <button
            type="button"
            className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
            onClick={() => onViewModeChange('grid')}
            title="Chế độ xem Thẻ Bento Grid"
            aria-label="Chế độ xem Thẻ Bento Grid"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            className={`${styles.viewBtn} ${viewMode === 'table' ? styles.viewBtnActive : ''}`}
            onClick={() => onViewModeChange('table')}
            title="Chế độ xem Bảng dữ liệu"
            aria-label="Chế độ xem Bảng dữ liệu"
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
