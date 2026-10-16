import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { Select, SearchBar, Button } from '../../../../../components/common';

import { programService } from '../../../../../services/programService';
import { internService } from '../../../../../services/internService';
import type { AttendanceReportFilterBarProps } from './AttendanceReportFilterBar.types';
import type {
  DepartmentResponse,
  ProgramSummaryResponse,
  MentorOption,
} from '../../../../../types';
import styles from './AttendanceReportFilterBar.module.css';

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `Tháng ${i + 1}`,
}));

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [
  { value: CURRENT_YEAR - 2, label: `${CURRENT_YEAR - 2}` },
  { value: CURRENT_YEAR - 1, label: `${CURRENT_YEAR - 1}` },
  { value: CURRENT_YEAR, label: `${CURRENT_YEAR}` },
  { value: CURRENT_YEAR + 1, label: `${CURRENT_YEAR + 1}` },
];

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tất cả mức độ' },
  { value: 'EXCELLENT', label: 'Xuất sắc (>= 95%)' },
  { value: 'GOOD', label: 'Tốt (>= 85%)' },
  { value: 'WARNING', label: 'Cảnh báo (70% - 85%)' },
  { value: 'CRITICAL', label: 'Báo động (< 70%)' },
];

export const AttendanceReportFilterBar: React.FC<AttendanceReportFilterBarProps> = ({
  month,
  year,
  departmentId,
  programId,
  mentorId,
  diligenceStatus = 'ALL',
  keyword,
  isMentorRole = false,
  onFilterChange,
  onResetFilters,
  isLoading = false,
}) => {
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [programs, setPrograms] = useState<ProgramSummaryResponse[]>([]);
  const [mentors, setMentors] = useState<MentorOption[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchMetadata = async () => {
      try {
        const [depts, progs, mnts] = await Promise.all([
          programService.getDepartments(),
          programService.getOpenPrograms(),
          !isMentorRole ? internService.getAvailableMentors() : Promise.resolve([]),
        ]);
        if (isMounted) {
          setDepartments(depts);
          setPrograms(progs);
          setMentors(mnts || []);
        }
      } catch {
        // Fallback im lặng nếu metadata chưa tải được
      }
    };
    fetchMetadata();
    return () => {
      isMounted = false;
    };
  }, [isMentorRole]);

  const departmentOptions = [
    { value: '', label: 'Tất cả phòng ban' },
    ...departments.map((d) => ({ value: d.id, label: d.name })),
  ];

  const programOptions = [
    { value: '', label: 'Tất cả chương trình' },
    ...programs.map((p) => ({ value: p.id, label: p.name })),
  ];

  const mentorOptions = [
    { value: '', label: 'Tất cả Mentor' },
    ...mentors.map((m) => ({ value: m.id, label: m.fullName })),
  ];


  return (
    <div className={styles.filterBar}>
      <div className={styles.topRow}>
        <div className={styles.controlsGroup}>
          {/* Chọn Tháng */}
          <div className={styles.selectMonth}>
            <Select
              options={MONTH_OPTIONS}
              value={month}
              onChange={(e) => onFilterChange({ month: Number(e.target.value) })}
              disabled={isLoading}
            />
          </div>

          {/* Chọn Năm */}
          <div className={styles.selectYear}>
            <Select
              options={YEAR_OPTIONS}
              value={year}
              onChange={(e) => onFilterChange({ year: Number(e.target.value) })}
              disabled={isLoading}
            />
          </div>

          {/* Chọn Phòng ban */}
          <div className={styles.selectDepartment}>
            <Select
              options={departmentOptions}
              value={departmentId !== undefined ? departmentId : ''}
              onChange={(e) =>
                onFilterChange({
                  departmentId: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              disabled={isLoading}
            />
          </div>

          {/* Chọn Chương trình */}
          <div className={styles.selectProgram}>
            <Select
              options={programOptions}
              value={programId !== undefined ? programId : ''}
              onChange={(e) =>
                onFilterChange({
                  programId: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              disabled={isLoading}
            />
          </div>

          {/* Chọn Người hướng dẫn (Mentor) */}
          {!isMentorRole && (
            <div className={styles.selectMentor}>
              <Select
                options={mentorOptions}
                value={mentorId !== undefined ? mentorId : ''}
                onChange={(e) =>
                  onFilterChange({
                    mentorId: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                disabled={isLoading}
              />
            </div>
          )}

          {/* Chọn Mức kỷ luật */}
          <div className={styles.selectStatus}>
            <Select
              options={STATUS_OPTIONS}
              value={diligenceStatus}
              onChange={(e) =>
                onFilterChange({
                  diligenceStatus: e.target.value as any,
                })
              }
              disabled={isLoading}
            />
          </div>


          {/* Ô Tìm Kiếm TTS */}
          <div className={styles.searchWrapper}>
            <SearchBar
              value={keyword}
              onChange={(val) => onFilterChange({ keyword: val })}
              placeholder="Tìm theo tên hoặc mã TTS..."
            />
          </div>
        </div>

        {/* Nút Đặt Lại */}
        <div className={styles.actionsGroup}>
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            disabled={isLoading}
            leftIcon={<RotateCcw size={14} />}
            className={styles.resetBtn}
          >
            Đặt lại
          </Button>
        </div>
      </div>
    </div>
  );
};
