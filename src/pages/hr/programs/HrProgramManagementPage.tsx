import React, { useState, useEffect, useCallback } from 'react';
import { Plus, FolderGit2, AlertCircle, Layers, Users, CheckCircle, Clock } from 'lucide-react';
import { Header } from '../../../components/layout/Header';
import { useAuth } from '../../../contexts/AuthContext';
import { programService } from '../../../services/programService';
import type {
  ProgramDetailResponse,
  DepartmentResponse,
  CreateProgramRequest,
  UpdateProgramRequest,
  ChangeProgramStatusRequest,
} from '../../../types';
import {
  ProgramFilterBar,
  ProgramTable,
  CreateProgramModal,
  EditProgramModal,
  ChangeStatusModal,
} from './components';
import styles from './styles/hrPrograms.module.css';

export const HrProgramManagementPage: React.FC = () => {
  const { role } = useAuth();

  // State danh sách & phân trang
  const [programs, setPrograms] = useState<ProgramDetailResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filter state
  const [keyword, setKeyword] = useState('');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [status, setStatus] = useState<string>('');
  const [isHistorical, setIsHistorical] = useState<boolean | ''>('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editProgram, setEditProgram] = useState<ProgramDetailResponse | null>(null);
  const [statusProgram, setStatusProgram] = useState<ProgramDetailResponse | null>(null);

  // Load danh mục phòng ban
  useEffect(() => {
    programService
      .getDepartments()
      .then((data) => setDepartments(data))
      .catch((err) => console.error('Failed to load departments:', err));
  }, []);

  // Fetch dữ liệu chương trình
  const fetchPrograms = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await programService.getPrograms({
        keyword: keyword || undefined,
        departmentId: departmentId === '' ? undefined : departmentId,
        status: status || undefined,
        isHistorical: isHistorical === '' ? undefined : isHistorical,
        page: currentPage,
        size: pageSize,
      });

      setPrograms(res.items || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err: any) {
      console.error('Failed to load programs:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Không thể tải danh sách chương trình thực tập.');
    } finally {
      setIsLoading(false);
    }
  }, [keyword, departmentId, status, isHistorical, currentPage, pageSize]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // Xử lý tạo mới
  const handleCreateSubmit = async (formData: CreateProgramRequest) => {
    await programService.createProgram(formData);
    setSuccessToast(`Đã thiết lập thành công kỳ thực tập "${formData.name}"!`);
    setIsCreateOpen(false);
    fetchPrograms();
  };

  // Xử lý chỉnh sửa
  const handleEditSubmit = async (id: number, formData: UpdateProgramRequest) => {
    await programService.updateProgram(id, formData);
    setSuccessToast(`Đã cập nhật thông tin kỳ thực tập thành công!`);
    setEditProgram(null);
    fetchPrograms();
  };

  // Xử lý đổi trạng thái
  const handleChangeStatusSubmit = async (id: number, request: ChangeProgramStatusRequest) => {
    await programService.changeStatus(id, request);
    setSuccessToast(`Đã chuyển trạng thái kỳ thực tập sang "${request.targetStatus}" thành công!`);
    setStatusProgram(null);
    fetchPrograms();
  };

  // Xử lý toggle nhận hồ sơ
  const handleToggleRecruitment = async (p: ProgramDetailResponse) => {
    try {
      const updated = await programService.toggleRecruitment(p.id);
      setSuccessToast(`Đã ${updated.isRecruitmentOpen ? 'mở' : 'đóng'} tiếp nhận hồ sơ cho chương trình "${p.name}".`);
      fetchPrograms();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Không thể thay đổi trạng thái nhận hồ sơ.');
    }
  };

  // Xử lý xóa chương trình
  const handleDeleteProgram = async (p: ProgramDetailResponse) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa vĩnh viễn chương trình "${p.name}" (${p.programCode})? Thao tác này không thể hoàn tác!`
    );
    if (!confirmed) return;

    try {
      await programService.deleteProgram(p.id);
      setSuccessToast(`Đã xóa thành công chương trình "${p.name}".`);
      fetchPrograms();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Không thể xóa chương trình.');
    }
  };

  const handleResetFilter = () => {
    setKeyword('');
    setDepartmentId('');
    setStatus('');
    setIsHistorical('');
    setCurrentPage(0);
  };

  // Metrics thống kê nhanh
  const totalPrograms = totalElements;
  const activeRecruitingPrograms = programs.filter((p) => p.isRecruitmentOpen).length;
  const ongoingPrograms = programs.filter((p) => p.status === 'ONGOING').length;
  const totalSlotsAssigned = programs.reduce((acc, curr) => acc + (curr.currentInterns || 0), 0);

  return (
    <div className={styles.pageContainer}>
      <Header
        title="Quản Lý Chương Trình Thực Tập (TM-15, TM-18)"
        subtitle="Thiết lập các kỳ thực tập theo phòng ban, ấn định ngày bắt đầu/kết thúc và giám sát chỉ tiêu tiếp nhận"
      />

      <div style={{ marginTop: '1.75rem' }}>
        {/* Banner Action Header */}
        <div className={styles.bannerArea}>
          <div className={styles.bannerTitleWrapper}>
            <div className={styles.bannerIconWrapper}>
              <FolderGit2 size={24} />
            </div>
            <div>
              <h2 className={styles.bannerTitle}>Kỳ Thực Tập Doanh Nghiệp</h2>
              <p className={styles.bannerSubtitle}>Quản lý vòng đời và tuyển sinh cho từng phòng ban</p>
            </div>
          </div>

          <button
            type="button"
            className={styles.btnCreate}
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus size={18} />
            <span>Tạo Chương Trình Mới</span>
          </button>
        </div>

        {/* Quick Metrics Grid */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={`${styles.metricIcon} ${styles.metricIconPrimary}`}>
              <Layers size={24} aria-hidden="true" />
            </div>
            <div className={styles.metricContent}>
              <span className={styles.metricLabel}>Tổng Số Kỳ</span>
              <span className={`${styles.metricValue} font-tabular`}>{totalPrograms}</span>
              <span className={styles.metricSubtext}>Chương trình trên hệ thống</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={`${styles.metricIcon} ${styles.metricIconSuccess}`}>
              <CheckCircle size={24} aria-hidden="true" />
            </div>
            <div className={styles.metricContent}>
              <span className={styles.metricLabel}>Đang Mở Tuyển</span>
              <span className={`${styles.metricValue} font-tabular`}>{activeRecruitingPrograms}</span>
              <span className={styles.metricSubtext}>Sẵn sàng tiếp nhận hồ sơ</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={`${styles.metricIcon} ${styles.metricIconInfo}`}>
              <Clock size={24} aria-hidden="true" />
            </div>
            <div className={styles.metricContent}>
              <span className={styles.metricLabel}>Đang Diễn Ra</span>
              <span className={`${styles.metricValue} font-tabular`}>{ongoingPrograms}</span>
              <span className={styles.metricSubtext}>Kỳ thực tập ONGOING</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={`${styles.metricIcon} ${styles.metricIconWarning}`}>
              <Users size={24} aria-hidden="true" />
            </div>
            <div className={styles.metricContent}>
              <span className={styles.metricLabel}>TTS Tiếp Nhận</span>
              <span className={`${styles.metricValue} font-tabular`}>{totalSlotsAssigned}</span>
              <span className={styles.metricSubtext}>TTS trong các kỳ hiển thị</span>
            </div>
          </div>
        </div>

        {/* Toast thông báo thành công */}
        {successToast && (
          <div
            role="status"
            aria-live="polite"
            style={{
              backgroundColor: 'var(--success-bg)',
              border: '1px solid var(--success-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              color: 'var(--success)',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '1.25rem',
            }}
          >
            <span>✓ {successToast}</span>
            <button
              type="button"
              onClick={() => setSuccessToast(null)}
              aria-label="Đóng thông báo thành công"
              style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Toast thông báo lỗi */}
        {errorMessage && (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              backgroundColor: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: 'var(--danger)',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={18} aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Bộ lọc hiện đại */}
        <ProgramFilterBar
          keyword={keyword}
          departmentId={departmentId}
          status={status}
          isHistorical={isHistorical}
          departments={departments}
          onKeywordChange={(val) => {
            setKeyword(val);
            setCurrentPage(0);
          }}
          onDepartmentChange={(val) => {
            setDepartmentId(val);
            setCurrentPage(0);
          }}
          onStatusChange={(val) => {
            setStatus(val);
            setCurrentPage(0);
          }}
          onHistoricalChange={(val) => {
            setIsHistorical(val);
            setCurrentPage(0);
          }}
          onReset={handleResetFilter}
        />

        {/* Bảng dữ liệu chương trình */}
        {isLoading ? (
          <div className="card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Đang tải dữ liệu chương trình thực tập...
          </div>
        ) : (
          <ProgramTable
            programs={programs}
            userRole={role || undefined}
            onEdit={(p) => setEditProgram(p)}
            onChangeStatus={(p) => setStatusProgram(p)}
            onToggleRecruitment={handleToggleRecruitment}
            onDelete={handleDeleteProgram}
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>

      {/* Modal Tạo mới */}
      <CreateProgramModal
        isOpen={isCreateOpen}
        departments={departments}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      {/* Modal Chỉnh sửa */}
      <EditProgramModal
        isOpen={Boolean(editProgram)}
        program={editProgram}
        departments={departments}
        onClose={() => setEditProgram(null)}
        onSubmit={handleEditSubmit}
      />

      {/* Modal Chuyển trạng thái */}
      <ChangeStatusModal
        isOpen={Boolean(statusProgram)}
        program={statusProgram}
        onClose={() => setStatusProgram(null)}
        onSubmit={handleChangeStatusSubmit}
      />
    </div>
  );
};

export default HrProgramManagementPage;
