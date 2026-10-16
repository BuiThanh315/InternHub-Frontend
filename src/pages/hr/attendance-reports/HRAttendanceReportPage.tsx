// Tầng 1: Thư viện ngoài
import React from 'react';
import { RefreshCw, Download } from 'lucide-react';

// Tầng 2: Components
import { ErrorBoundary, Button } from '../../../components/common';

import {
  AttendanceReportKpiCards,
  AttendanceReportFilterBar,
  InternDiligenceTable,
  InternAttendanceDetailModal,
} from './components';

// Tầng 3: Hooks & Contexts
import { useHRAttendanceReport, useInternAttendanceDetail } from './hooks';

// Tầng 5: Styles
import styles from './HRAttendanceReportPage.module.css';

const HRAttendanceReportContent: React.FC = () => {
  const {
    filters,
    kpiData,
    pageData,
    isLoading,
    error,
    isExporting,
    canExport,
    isMentor,
    refetch,
    handlePageChange,
    handleFilterChange,
    handleResetFilters,
    handleExportCsv,
  } = useHRAttendanceReport();

  const {
    isOpen: isDetailOpen,
    detailData,
    isLoading: isDetailLoading,
    error: detailError,
    openDetail,
    closeDetail,
  } = useInternAttendanceDetail(filters.month, filters.year);

  return (
    <div className={styles.pageContainer}>
      {/* Lớp 1: Page Header & Action Bar */}
      <header className={styles.pageHeader}>
        <div className={styles.headerTextGroup}>
          <h1 className={styles.pageTitle}>Báo Cáo Chuyên Cần & Nghỉ Phép</h1>
          <p className={styles.pageSubtitle}>
            {isMentor
              ? 'Giám sát tỷ lệ chuyên cần, ngày công thực tế và tình hình nghỉ phép của các thực tập sinh bạn phụ trách.'
              : 'Giám sát tỷ lệ chuyên cần, ngày công thực tế, lượt đi muộn/về sớm và tình hình nghỉ phép của thực tập sinh.'}
          </p>
        </div>

        <div className={styles.headerActions}>
          <Button
            variant="outline"
            size="md"
            leftIcon={<RefreshCw size={15} />}
            onClick={refetch}
            disabled={isLoading}
          >
            Làm mới
          </Button>

          {canExport && (
            <Button
              variant="primary"
              size="md"
              leftIcon={<Download size={15} />}
              onClick={handleExportCsv}
              isLoading={isExporting}
              disabled={isLoading || isExporting}
            >
              Xuất Báo Cáo CSV
            </Button>
          )}
        </div>
      </header>

      {/* Lớp 2: Filter Toolbar & KPI Metrics Strip */}
      <section className={styles.filterAndKpiSection}>
        <AttendanceReportFilterBar
          month={filters.month}
          year={filters.year}
          departmentId={filters.departmentId}
          programId={filters.programId}
          mentorId={filters.mentorId}
          diligenceStatus={filters.diligenceStatus}
          keyword={filters.keyword}
          isMentorRole={isMentor}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          isLoading={isLoading}
        />

        <AttendanceReportKpiCards data={kpiData} isLoading={isLoading} />
      </section>


      {/* Lớp 3: Content Data Table */}
      <section className={styles.tableSection}>
        <InternDiligenceTable
          data={pageData}
          isLoading={isLoading}
          error={error}
          onPageChange={handlePageChange}
          onViewDetail={openDetail}
          onRetry={refetch}
          onResetFilters={handleResetFilters}
        />
      </section>

      {/* Lớp 4: Modals Layer (Modal-First UX) */}
      <InternAttendanceDetailModal
        isOpen={isDetailOpen}
        onClose={closeDetail}
        data={detailData}
        isLoading={isDetailLoading}
        error={detailError}
      />
    </div>
  );
};

export const HRAttendanceReportPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <HRAttendanceReportContent />
    </ErrorBoundary>
  );
};

export default HRAttendanceReportPage;
