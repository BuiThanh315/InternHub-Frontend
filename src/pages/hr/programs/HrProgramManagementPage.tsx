import {
  AlertCircle,
  CheckCircle,
  Clock,
  FolderGit2,
  Layers,
  Plus,
  Users,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { ConfirmModal } from "../../../components/common";
import { Header } from "../../../components/layout/Header";
import { useAuth } from "../../../contexts/AuthContext";
import { groupService } from "../../../services/groupService";
import { internService } from "../../../services/internService";
import { programService } from "../../../services/programService";
import type {
  ChangeProgramStatusRequest,
  CreateProgramRequest,
  DepartmentResponse,
  ProgramDetailResponse,
  UpdateProgramRequest,
} from "../../../types";
import type { BatchGroupItem, InternGroup } from "../../../types/group.types";
import type { InternProfile } from "../../../types/intern.types";
import { ProgramGroupModal } from "../components/ProgramGroupModal";
import {
  AssignMentorToProgramModal,
  ChangeStatusModal,
  CreateProgramModal,
  EditProgramModal,
  EnrollInternModal,
  ProgramFilterBar,
  ProgramTable,
} from "./components";
import styles from "./styles/hrPrograms.module.css";

export const HrProgramManagementPage: React.FC = () => {
  const { role } = useAuth();

  // State danh sách & phân trang
  const [programs, setPrograms] = useState<ProgramDetailResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filter state
  const [keyword, setKeyword] = useState("");
  const [departmentId, setDepartmentId] = useState<number | "">("");
  const [status, setStatus] = useState<string>("");
  const [isHistorical, setIsHistorical] = useState<boolean | "">("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editProgram, setEditProgram] = useState<ProgramDetailResponse | null>(
    null,
  );
  const [statusProgram, setStatusProgram] =
    useState<ProgramDetailResponse | null>(null);
  const [enrollProgram, setEnrollProgram] =
    useState<ProgramDetailResponse | null>(null);
  const [assignMentorProgram, setAssignMentorProgram] =
    useState<ProgramDetailResponse | null>(null);
  const [deletingProgram, setDeletingProgram] =
    useState<ProgramDetailResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Số lượng đơn PENDING mong muốn tham gia từng chương trình
  const [pendingCountsMap, setPendingCountsMap] = useState<
    Record<number, number>
  >({});

  // Group Management Modal state
  const [manageGroupProgram, setManageGroupProgram] =
    useState<ProgramDetailResponse | null>(null);
  const [programInterns, setProgramInterns] = useState<InternProfile[]>([]);
  const [existingGroups, setExistingGroups] = useState<InternGroup[]>([]);
  const [isGroupLoading, setIsGroupLoading] = useState(false);

  const handleOpenManageGroups = async (program: ProgramDetailResponse) => {
    try {
      setIsGroupLoading(true);
      setManageGroupProgram(program);
      const [groupsData, internsData] = await Promise.all([
        groupService.getGroups(program.id),
        internService.getInterns({ programId: program.id, size: 200 }),
      ]);
      setExistingGroups(groupsData);
      setProgramInterns(internsData.items || []);
    } catch (err: any) {
      console.error("Lỗi nạp dữ liệu nhóm:", err);
      setErrorMessage(err.message || "Không thể tải danh sách nhóm thực tập");
    } finally {
      setIsGroupLoading(false);
    }
  };

  const handleBatchApplyGroups = async (batchGroups: BatchGroupItem[]) => {
    if (!manageGroupProgram) return;
    try {
      setIsGroupLoading(true);
      await groupService.batchApplyGroups(manageGroupProgram.id, {
        groups: batchGroups,
      });
      setSuccessToast("Đã lưu và áp dụng phân bổ nhóm thành công!");
      fetchPrograms();
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          err.message ||
          "Lỗi khi áp dụng chia nhóm",
      );
    } finally {
      setIsGroupLoading(false);
    }
  };

  const handleDisbandGroup = async (groupId: number) => {
    if (!manageGroupProgram) return;
    try {
      setIsGroupLoading(true);
      await groupService.disbandGroup(manageGroupProgram.id, groupId);
      setSuccessToast("Đã giải tán nhóm thành công");
      fetchPrograms();
    } catch (err: any) {
      alert(
        err.response?.data?.message || err.message || "Lỗi khi giải tán nhóm",
      );
    } finally {
      setIsGroupLoading(false);
    }
  };

  // Load danh mục phòng ban
  useEffect(() => {
    programService
      .getDepartments()
      .then((data) => setDepartments(data))
      .catch((err) => console.error("Failed to load departments:", err));
  }, []);

  // Fetch dữ liệu chương trình
  const fetchPrograms = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await programService.getPrograms({
        keyword: keyword || undefined,
        departmentId: departmentId === "" ? undefined : departmentId,
        status: status || undefined,
        isHistorical: isHistorical === "" ? undefined : isHistorical,
        page: currentPage,
        size: pageSize,
      });

      setPrograms(res.items || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err: any) {
      console.error("Failed to load programs:", err);
      setErrorMessage(
        err.response?.data?.message ||
          err.message ||
          "Không thể tải danh sách chương trình thực tập.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [keyword, departmentId, status, isHistorical, currentPage, pageSize]);

  // Tải số lượng đơn PENDING của tất cả các chương trình (1 network request duy nhất)
  const fetchPendingCounts = useCallback(async () => {
    try {
      const res = await internService.getInterns({
        status: "PENDING",
        size: 100,
      });
      const items = res.items || res.content || [];
      const counts: Record<number, number> = {};
      items.forEach((intern) => {
        if (intern.programId) {
          counts[intern.programId] = (counts[intern.programId] || 0) + 1;
        }
      });
      setPendingCountsMap(counts);
    } catch (err) {
      console.error("Không thể tải số lượng đơn chờ duyệt:", err);
    }
  }, []);

  useEffect(() => {
    void fetchPrograms();
    void fetchPendingCounts();
  }, [fetchPrograms, fetchPendingCounts]);

  // Xử lý tạo mới
  const handleCreateSubmit = async (formData: CreateProgramRequest) => {
    await programService.createProgram(formData);
    setSuccessToast(`Đã thiết lập thành công kỳ thực tập "${formData.name}"!`);
    setIsCreateOpen(false);
    void fetchPrograms();
    void fetchPendingCounts();
  };

  // Xử lý chỉnh sửa
  const handleEditSubmit = async (
    id: number,
    formData: UpdateProgramRequest,
  ) => {
    await programService.updateProgram(id, formData);
    setSuccessToast(`Đã cập nhật thông tin kỳ thực tập thành công!`);
    setEditProgram(null);
    void fetchPrograms();
    void fetchPendingCounts();
  };

  // Xử lý đổi trạng thái
  const handleChangeStatusSubmit = async (
    id: number,
    request: ChangeProgramStatusRequest,
  ) => {
    await programService.changeStatus(id, request);
    setSuccessToast(
      `Đã chuyển trạng thái kỳ thực tập sang "${request.targetStatus}" thành công!`,
    );
    setStatusProgram(null);
    void fetchPrograms();
    void fetchPendingCounts();
  };

  // Xử lý toggle nhận hồ sơ
  const handleToggleRecruitment = async (p: ProgramDetailResponse) => {
    try {
      const updated = await programService.toggleRecruitment(p.id);
      setSuccessToast(
        `Đã ${updated.isRecruitmentOpen ? "mở" : "đóng"} tiếp nhận hồ sơ cho chương trình "${p.name}".`,
      );
      void fetchPrograms();
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          err.message ||
          "Không thể thay đổi trạng thái nhận hồ sơ.",
      );
    }
  };

  // Xử lý mở xác nhận xóa chương trình
  const handleDeleteProgram = (p: ProgramDetailResponse) => {
    setDeletingProgram(p);
  };

  // Xác nhận xóa chương trình (Tuân thủ Rule 33)
  const handleConfirmDelete = async () => {
    if (!deletingProgram) return;

    try {
      setIsDeleting(true);
      await programService.deleteProgram(deletingProgram.id);
      setSuccessToast(
        `Đã xóa thành công chương trình "${deletingProgram.name}".`,
      );
      setDeletingProgram(null);
      fetchPrograms();
      fetchPendingCounts();
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          err.message ||
          "Không thể xóa chương trình.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilter = () => {
    setKeyword("");
    setDepartmentId("");
    setStatus("");
    setIsHistorical("");
    setCurrentPage(0);
  };

  // Metrics thống kê nhanh
  const totalPrograms = totalElements;
  const activeRecruitingPrograms = programs.filter(
    (p) => p.isRecruitmentOpen,
  ).length;
  const ongoingPrograms = programs.filter((p) => p.status === "ONGOING").length;
  const totalSlotsAssigned = programs.reduce(
    (acc, curr) => acc + (curr.currentInterns || 0),
    0,
  );

  return (
    <div className={styles.pageContainer}>
      <Header
        title="Quản Lý Chương Trình Thực Tập (TM-15, TM-18)"
        subtitle="Thiết lập các kỳ thực tập theo phòng ban, ấn định ngày bắt đầu/kết thúc và giám sát chỉ tiêu tiếp nhận"
      />

      <div style={{ marginTop: "1.75rem" }}>
        {/* Banner Action Header */}
        <div className={styles.bannerArea}>
          <div className={styles.bannerTitleWrapper}>
            <div className={styles.bannerIconWrapper}>
              <FolderGit2 size={24} />
            </div>
            <div>
              <h2 className={styles.bannerTitle}>Kỳ Thực Tập Doanh Nghiệp</h2>
              <p className={styles.bannerSubtitle}>
                Quản lý vòng đời và tuyển sinh cho từng phòng ban
              </p>
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
              <span className={`${styles.metricValue} font-tabular`}>
                {totalPrograms}
              </span>
              <span className={styles.metricSubtext}>
                Chương trình trên hệ thống
              </span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={`${styles.metricIcon} ${styles.metricIconSuccess}`}>
              <CheckCircle size={24} aria-hidden="true" />
            </div>
            <div className={styles.metricContent}>
              <span className={styles.metricLabel}>Đang Mở Tuyển</span>
              <span className={`${styles.metricValue} font-tabular`}>
                {activeRecruitingPrograms}
              </span>
              <span className={styles.metricSubtext}>
                Sẵn sàng tiếp nhận hồ sơ
              </span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={`${styles.metricIcon} ${styles.metricIconInfo}`}>
              <Clock size={24} aria-hidden="true" />
            </div>
            <div className={styles.metricContent}>
              <span className={styles.metricLabel}>Đang Diễn Ra</span>
              <span className={`${styles.metricValue} font-tabular`}>
                {ongoingPrograms}
              </span>
              <span className={styles.metricSubtext}>Kỳ thực tập ONGOING</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={`${styles.metricIcon} ${styles.metricIconWarning}`}>
              <Users size={24} aria-hidden="true" />
            </div>
            <div className={styles.metricContent}>
              <span className={styles.metricLabel}>TTS Tiếp Nhận</span>
              <span className={`${styles.metricValue} font-tabular`}>
                {totalSlotsAssigned}
              </span>
              <span className={styles.metricSubtext}>
                TTS trong các kỳ hiển thị
              </span>
            </div>
          </div>
        </div>

        {/* Toast thông báo thành công */}
        {successToast && (
          <div
            role="status"
            aria-live="polite"
            style={{
              backgroundColor: "var(--success-bg)",
              border: "1px solid var(--success-border)",
              borderRadius: "var(--radius-md)",
              padding: "0.85rem 1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
              color: "var(--success)",
              fontSize: "0.875rem",
              fontWeight: 600,
              marginBottom: "1.25rem",
            }}
          >
            <span>✓ {successToast}</span>
            <button
              type="button"
              onClick={() => setSuccessToast(null)}
              aria-label="Đóng thông báo thành công"
              style={{
                background: "none",
                border: "none",
                color: "var(--success)",
                cursor: "pointer",
                fontWeight: 700,
              }}
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
              backgroundColor: "var(--danger-bg)",
              border: "1px solid var(--danger-border)",
              borderRadius: "var(--radius-md)",
              padding: "0.85rem 1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              color: "var(--danger)",
              fontSize: "0.875rem",
              fontWeight: 600,
              marginBottom: "1.25rem",
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
          <div
            className="card"
            style={{
              padding: "3.5rem",
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            Đang tải dữ liệu chương trình thực tập...
          </div>
        ) : (
          <ProgramTable
            programs={programs}
            pendingCountsMap={pendingCountsMap}
            userRole={role || undefined}
            onEdit={(p) => setEditProgram(p)}
            onChangeStatus={(p) => setStatusProgram(p)}
            onToggleRecruitment={handleToggleRecruitment}
            onEnrollIntern={(p) => setEnrollProgram(p)}
            onAssignMentor={(p) => setAssignMentorProgram(p)}
            onDelete={handleDeleteProgram}
            onManageGroups={handleOpenManageGroups}
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

      {/* Modal Tiếp nhận Thực tập sinh vào Chương trình (Phương án 1) */}
      <EnrollInternModal
        isOpen={Boolean(enrollProgram)}
        program={enrollProgram}
        onClose={() => setEnrollProgram(null)}
        onSuccess={() => {
          void fetchPrograms();
          void fetchPendingCounts();
        }}
      />

      {/* Modal Phân công Mentor toàn kỳ */}
      <AssignMentorToProgramModal
        isOpen={Boolean(assignMentorProgram)}
        program={assignMentorProgram}
        onClose={() => setAssignMentorProgram(null)}
        onSuccess={(result) => {
          setAssignMentorProgram(null);
          setSuccessToast(
            `Đã phân công thành công Mentor ${result.mentorName} cho kỳ "${result.programName}" (${result.totalAssignedInterns} thực tập sinh)!`
          );
          void fetchPrograms();
        }}
      />

      {/* Modal Xác nhận Xóa chương trình (Rule 33 - Thay thế window.confirm) */}
      <ConfirmModal
        isOpen={Boolean(deletingProgram)}
        title="Xác nhận xóa chương trình"
        message={`Bạn có chắc chắn muốn xóa vĩnh viễn chương trình "${deletingProgram?.name}" (${deletingProgram?.programCode})? Thao tác này không thể hoàn tác!`}
        confirmText="Xóa vĩnh viễn"
        cancelText="Hủy bỏ"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingProgram(null)}
      />

      {/* Modal Quản lý & Chia nhóm thực tập */}
      {manageGroupProgram && (
        <ProgramGroupModal
          programId={manageGroupProgram.id}
          programName={manageGroupProgram.name}
          isOpen={Boolean(manageGroupProgram)}
          onClose={() => setManageGroupProgram(null)}
          interns={programInterns}
          existingGroups={existingGroups}
          onBatchApply={handleBatchApplyGroups}
          onDisbandGroup={handleDisbandGroup}
          isLoading={isGroupLoading}
        />
      )}
    </div>
  );
};

export default HrProgramManagementPage;
