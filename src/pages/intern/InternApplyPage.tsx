import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Search,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { toast } from 'sonner';

import { programService } from '../../services/programService';
import { ROUTES } from '../../constants/routes';
import type { ProgramSummaryResponse, DepartmentResponse } from '../../types';
import {
  OpenProgramCard,
  OpenProgramSkeleton,
  ApplyProgramModal,
} from './components/ProgramApplication';
import styles from './InternApplyPage.module.css';

export const InternApplyPage: React.FC = () => {
  const [programs, setPrograms] = useState<ProgramSummaryResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  // Modal State
  const [selectedProgram, setSelectedProgram] = useState<ProgramSummaryResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appliedProgramIds, setAppliedProgramIds] = useState<Set<number>>(() => new Set());

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [programsData, deptData] = await Promise.all([
        programService.getOpenPrograms(),
        programService.getDepartments().catch(() => []),
      ]);
      setPrograms(programsData);
      setDepartments(deptData);

      // Tự động mở Modal nộp hồ sơ nếu ứng viên được điều hướng từ Landing Page
      const intendedId = sessionStorage.getItem('intended_program_id');
      if (intendedId) {
        sessionStorage.removeItem('intended_program_id');
        const target = programsData.find((p) => p.id === Number(intendedId));
        if (target) {
          setSelectedProgram(target);
          setIsModalOpen(true);
        }
      }
    } catch (err: any) {
      console.error('Lỗi nạp chương trình mở tuyển:', err);
      toast.error('Không thể nạp danh sách chương trình thực tập.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      const matchesKeyword =
        !searchKeyword.trim() ||
        p.name.toLowerCase().includes(searchKeyword.toLowerCase().trim()) ||
        p.programCode.toLowerCase().includes(searchKeyword.toLowerCase().trim()) ||
        Boolean(p.description?.toLowerCase().includes(searchKeyword.toLowerCase().trim()));

      const matchesDept =
        selectedDept === 'ALL' ||
        p.departmentName?.toLowerCase() === selectedDept.toLowerCase();

      return matchesKeyword && matchesDept;
    });
  }, [programs, searchKeyword, selectedDept]);

  const isFiltering = Boolean(searchKeyword || selectedDept !== 'ALL');
  const emptyDescription = isFiltering
    ? 'Không tìm thấy chương trình nào khớp với bộ lọc tìm kiếm của bạn. Hãy thử thay đổi từ khóa.'
    : 'Hiện tại hệ thống đang trong quá trình cập nhật các đợt tuyển dụng mới. Vui lòng quay lại sau.';

  const handleOpenApply = (program: ProgramSummaryResponse) => {
    setSelectedProgram(program);
    setIsModalOpen(true);
  };

  const handleApplySuccess = (_internCode: string, program: ProgramSummaryResponse) => {
    setAppliedProgramIds((prev) => new Set(prev).add(program.id));
  };

  return (
    <div className={styles.pageContainer}>
      {/* Breadcrumb Navigation */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to={ROUTES.ROOT} className={styles.breadcrumbLink}>Trang Chủ</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <Link to={ROUTES.INTERN.DASHBOARD} className={styles.breadcrumbLink}>Cổng Thực Tập Sinh</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>Chương Trình Đang Tuyển</span>
      </nav>

      {/* Header */}
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <Sparkles className="text-indigo-500" size={28} />
          <span>Chương Trình Thực Tập Đang Mở Tuyển</span>
        </h1>
        <p className={styles.pageSubtitle}>
          Khám phá các chương trình thực tập công nghệ mới nhất. Bạn có thể chọn ứng tuyển vào nhiều chương trình khác nhau phù hợp với định hướng phát triển bản thân.
        </p>
      </header>

      {/* Toolbar / Search & Filter */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên chương trình, mã hoặc từ khóa..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className={styles.filterSelect}
          aria-label="Lọc theo phòng ban"
        >
          <option value="ALL">Tất cả phòng ban</option>
          {departments.map((d) => (
            <option key={d.id} value={d.name}>{d.name}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={loadData}
          className={styles.refreshBtn}
          title="Tải lại danh sách"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Program Grid or Empty State */}
      {(() => {
        if (loading) {
          return (
            <div className={styles.programGrid}>
              {[1, 2, 3].map((n) => (
                <OpenProgramSkeleton key={n} />
              ))}
            </div>
          );
        }

        if (filteredPrograms.length > 0) {
          return (
            <div className={styles.programGrid}>
              {filteredPrograms.map((program) => (
                <OpenProgramCard
                  key={program.id}
                  program={program}
                  onApply={handleOpenApply}
                  isApplied={appliedProgramIds.has(program.id)}
                />
              ))}
            </div>
          );
        }

        return (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrapper}>
              <FolderOpen size={32} />
            </div>
            <h3 className={styles.emptyTitle}>Chưa có chương trình thực tập phù hợp</h3>
            <p className={styles.emptyText}>{emptyDescription}</p>
            {isFiltering && (
              <button
                type="button"
                className={styles.refreshBtn}
                onClick={() => {
                  setSearchKeyword('');
                  setSelectedDept('ALL');
                }}
              >
                Xóa bộ lọc tìm kiếm
              </button>
            )}
          </div>
        );
      })()}

      {/* Modal Ứng Tuyển 3 Khối */}
      <ApplyProgramModal
        isOpen={isModalOpen}
        program={selectedProgram}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleApplySuccess}
      />
    </div>
  );
};

export default InternApplyPage;
