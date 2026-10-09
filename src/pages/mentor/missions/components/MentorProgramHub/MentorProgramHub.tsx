import React, { useState, useMemo } from 'react';
import { Compass, FolderX, RefreshCw } from 'lucide-react';
import { SearchBar, Select, Skeleton, Button } from '../../../../../components/common';
import { ProgramBentoCard } from './ProgramBentoCard';
import type { MentorProgramHubProps } from './MentorProgramHub.types';
import styles from './MentorProgramHub.module.css';

export const MentorProgramHub: React.FC<MentorProgramHubProps> = ({
  programs,
  isLoading,
  onSelectProgram,
  onRefresh,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Thống kê tổng hợp
  const totalPrograms = programs.length;
  const totalInterns = useMemo(() => {
    return programs.reduce((acc, p) => acc + (p.totalInterns ?? p.activeInterns ?? 0), 0);
  }, [programs]);

  const totalGroups = useMemo(() => {
    return programs.reduce((acc, p) => acc + (p.groupCount ?? 0), 0);
  }, [programs]);

  const ongoingCount = useMemo(() => {
    return programs.filter((p) => {
      const s = (p.status || '').toUpperCase();
      return s === 'ONGOING' || s === 'ACTIVE';
    }).length;
  }, [programs]);

  // Lọc chương trình
  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.programCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.departmentName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const rawStatus = (p.status || '').toUpperCase();
      let matchesStatus = true;
      if (statusFilter === 'ONGOING') {
        matchesStatus = rawStatus === 'ONGOING' || rawStatus === 'ACTIVE';
      } else if (statusFilter === 'UPCOMING') {
        matchesStatus = rawStatus === 'UPCOMING' || rawStatus === 'PLANNING';
      } else if (statusFilter === 'COMPLETED') {
        matchesStatus = rawStatus === 'COMPLETED';
      }

      return matchesSearch && matchesStatus;
    });
  }, [programs, searchQuery, statusFilter]);

  const statusOptions = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    { value: 'ONGOING', label: 'Đang diễn ra' },
    { value: 'UPCOMING', label: 'Sắp diễn ra' },
    { value: 'COMPLETED', label: 'Đã kết thúc' },
  ];

  const emptyTitle = programs.length === 0
    ? 'Bạn Chưa Được Phân Công Chương Trình Nào'
    : 'Không Tìm Thấy Chương Trình Phù Hợp';

  const emptyDescription = programs.length === 0
    ? 'Tài khoản Mentor của bạn hiện chưa được gán vào kỳ thực tập nào. Vui lòng liên hệ bộ phận Quản lý Tuyển dụng (HR) để được phân công.'
    : 'Hãy thử thay đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc trạng thái để xem thêm các chương trình khác.';

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={styles.skeletonGrid}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeletonCard}>
              <Skeleton height="24px" width="40%" />
              <Skeleton height="32px" width="80%" />
              <Skeleton height="60px" />
              <Skeleton height="40px" />
            </div>
          ))}
        </div>
      );
    }

    if (filteredPrograms.length === 0) {
      return (
        <div className={styles.emptyCard}>
          <div className={styles.emptyIconWrapper}>
            <FolderX size={28} />
          </div>
          <h3 className={styles.emptyTitle}>{emptyTitle}</h3>
          <p className={styles.emptyDescription}>{emptyDescription}</p>
          {programs.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
            >
              Đặt lại bộ lọc
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className={styles.grid}>
        {filteredPrograms.map((program) => (
          <ProgramBentoCard
            key={program.programId ?? program.id}
            program={program}
            onEnterWorkspace={onSelectProgram}
            groupCount={program.groupCount ?? 0}
            taskCompletedCount={program.completedTaskCount ?? 0}
            taskTotalCount={program.totalTaskCount ?? 0}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`${styles.hubContainer} ${className}`}>
      {/* Hero Stats Banner */}
      <div className={styles.heroBanner}>
        <div className={styles.heroHeader}>
          <div className={styles.heroTitleGroup}>
            <div className={styles.heroIconWrapper}>
              <Compass size={22} />
            </div>
            <div>
              <h2 className={styles.heroTitle}>Trung Tâm Điều Phối Kỳ Thực Tập</h2>
              <p className={styles.heroSubtitle}>
                Bao quát toàn bộ các chương trình bạn đang hướng dẫn, quản lý nhóm và giao việc cho học viên
              </p>
            </div>
          </div>

          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw size={14} /> Làm mới
            </Button>
          )}
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{totalPrograms}</span>
            <span className={styles.statLabel}>Chương trình phụ trách</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{ongoingCount}</span>
            <span className={styles.statLabel}>Kỳ đang diễn ra</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{totalInterns}</span>
            <span className={styles.statLabel}>Tổng số thực tập sinh</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{totalGroups}</span>
            <span className={styles.statLabel}>Nhóm dự án phụ trách</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchArea}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Tìm theo tên kỳ, mã chương trình hoặc phòng ban..."
          />
        </div>

        <div className={styles.filterArea}>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content Area */}
      {renderContent()}
    </div>
  );
};

export default MentorProgramHub;
