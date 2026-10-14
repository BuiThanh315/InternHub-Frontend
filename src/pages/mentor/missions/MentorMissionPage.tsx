import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '../../../components/layout/Header';
import { Alert, Button } from '../../../components/common';
import { useMentorMissions } from '../../../hooks/useMentorMissions';
import { ProgramGroupModal } from '../../hr/components/ProgramGroupModal/ProgramGroupModal';
import {
  MentorProgramHub,
  MentorProgramWorkspace,
  MissionBoardModal,
  MissionItemModal,
  DeleteConfirmModal,
} from './components';
import type { MissionBoardFormData } from './components/MissionBoardModal/MissionBoardModal.types';
import type {
  MissionItemResponse,
  CreateMissionItemRequest,
  MissionItemStatus,
} from '../../../types';
import type { InternProfile } from '../../../types/intern.types';
import type { BatchGroupItem } from '../../../types/group.types';
import styles from './MentorMissionPage.module.css';

export const MentorMissionPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const programIdParam = searchParams.get('programId');

  const {
    programs,
    selectedProgramId,
    setSelectedProgramId,
    programInterns,
    groups,
    isLoadingGroups,
    batchApplyGroups,
    disbandGroup,
    internWorkloadMap,
    boards,
    activeBoardId,
    setActiveBoardId,
    activeBoardDetail,
    searchQuery,
    setSearchQuery,
    selectedAssigneeId,
    setSelectedAssigneeId,
    selectedPriority,
    setSelectedPriority,
    todoItems,
    inProgressItems,
    completedItems,
    completionPercentage,
    isLoadingPrograms,
    isLoadingBoard,
    isMutating,
    error,
    refreshAll,
    createBoard,
    updateBoard,
    deleteBoard,
    createItem,
    updateItem,
    updateItemStatus,
    deleteItem,
  } = useMentorMissions();

  // Đồng bộ URL query param -> selectedProgramId
  useEffect(() => {
    if (programIdParam) {
      const pId = Number(programIdParam);
      if (!Number.isNaN(pId) && selectedProgramId !== pId) {
        setSelectedProgramId(pId);
      }
    } else if (selectedProgramId !== null) {
      setSelectedProgramId(null);
    }
  }, [programIdParam, selectedProgramId, setSelectedProgramId]);

  // Gom State Modals theo Quy tắc 14 (<= 3-4 states)
  const [boardModal, setBoardModal] = useState<{
    isOpen: boolean;
    isEditing: boolean;
  }>({
    isOpen: false,
    isEditing: false,
  });

  const [itemModal, setItemModal] = useState<{
    isOpen: boolean;
    editingItem: MissionItemResponse | null;
    initialAssigneeId: number | null;
    initialTitle?: string;
  }>({
    isOpen: false,
    editingItem: null,
    initialAssigneeId: null,
    initialTitle: '',
  });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'board' | 'item';
    id: number;
    name: string;
  }>({
    isOpen: false,
    type: 'board',
    id: 0,
    name: '',
  });

  const [groupModalOpen, setGroupModalOpen] = useState(false);

  // Chọn chương trình từ Hub
  const handleSelectProgram = (pId: number) => {
    setSelectedProgramId(pId);
    setSearchParams({ programId: String(pId) });
  };

  // Quay lại danh sách chương trình
  const handleBackToHub = () => {
    setSelectedProgramId(null);
    setSearchParams({});
  };

  // Mở modal giao task với học viên được tick sẵn
  const handleAssignTaskToIntern = (internId: number) => {
    setItemModal({
      isOpen: true,
      editingItem: null,
      initialAssigneeId: internId,
      initialTitle: '',
    });
  };

  // Tạo nhanh ở chân cột nhiệm vụ: Mở modal giao việc với tiêu đề được điền sẵn
  const handleQuickAdd = (title: string): Promise<boolean> => {
    if (!title.trim()) return Promise.resolve(false);
    setItemModal({
      isOpen: true,
      editingItem: null,
      initialAssigneeId: null,
      initialTitle: title.trim(),
    });
    return Promise.resolve(true);
  };


  // Xử lý nộp form Board (Tạo hoặc Sửa)
  const handleBoardSubmit = async (data: MissionBoardFormData): Promise<boolean> => {
    if (boardModal.isEditing && activeBoardDetail) {
      return await updateBoard(activeBoardDetail.id, data);
    }
    return await createBoard(data);
  };

  // Xử lý nộp form Item (Tạo hoặc Sửa)
  const handleItemSubmit = async (data: CreateMissionItemRequest): Promise<boolean> => {
    if (itemModal.editingItem) {
      return await updateItem(itemModal.editingItem.id, data);
    }
    return await createItem(data);
  };

  // Xử lý xác nhận xóa
  const handleDeleteConfirm = async () => {
    if (deleteModal.type === 'board') {
      await deleteBoard(deleteModal.id);
    } else {
      await deleteItem(deleteModal.id);
    }
  };

  // Kéo thả thẻ Kanban
  const handleDropItem = (itemId: number, targetStatus: MissionItemStatus) => {
    void updateItemStatus(itemId, targetStatus);
  };

  // Tìm đối tượng chương trình đang chọn
  const selectedProgram = useMemo(() => {
    if (!selectedProgramId) return null;
    return programs.find((p) => (p.programId ?? p.id) === selectedProgramId) || null;
  }, [programs, selectedProgramId]);

  // Adapter chuyển programInterns (AssigneeResponse[]) sang InternProfile[] cho ProgramGroupModal
  const mappedInternProfiles: InternProfile[] = useMemo(() => {
    return programInterns.map((i) => ({
      id: i.id,
      internCode: i.internCode,
      fullName: i.fullName,
      email: i.email,
      phone: i.phone || '',
      university: '',
      major: '',
      appliedPosition: '',
      startDate: '',
      status: 'INTERNING',
      createdAt: '',
      updatedAt: '',
      programId: selectedProgramId,
    } as InternProfile));
  }, [programInterns, selectedProgramId]);

  // Handler lưu và giải tán nhóm cho ProgramGroupModal
  const handleBatchApplyGroups = async (batchGroups: BatchGroupItem[]) => {
    await batchApplyGroups(batchGroups);
  };

  const handleDisbandGroup = async (groupId: number) => {
    await disbandGroup(groupId);
  };

  return (
    <div className={styles.pageContainer}>
      <Header
        title="Phân Công & Giám Sát Nhiệm Vụ"
        subtitle="Quản lý các kỳ thực tập, chia nhóm dự án và điều phối nhiệm vụ đào tạo cho thực tập sinh"
      />

      {error && (
        <Alert type="error" message={error}>
          <Button variant="outline" size="sm" onClick={() => void refreshAll()}>
            Thử lại
          </Button>
        </Alert>
      )}

      {/* Điều phối hiển thị giữa Hub và Workspace */}
      {!selectedProgram ? (
        <MentorProgramHub
          programs={programs}
          isLoading={isLoadingPrograms}
          onSelectProgram={handleSelectProgram}
          onRefresh={() => void refreshAll()}
        />
      ) : (
        <MentorProgramWorkspace
          program={selectedProgram}
          onBackToHub={handleBackToHub}
          boards={boards}
          activeBoardId={activeBoardId}
          onSelectBoard={setActiveBoardId}
          onCreateBoard={() => setBoardModal({ isOpen: true, isEditing: false })}
          onEditBoard={() => setBoardModal({ isOpen: true, isEditing: true })}
          onDeleteBoard={() => {
            if (activeBoardDetail) {
              setDeleteModal({
                isOpen: true,
                type: 'board',
                id: activeBoardDetail.id,
                name: activeBoardDetail.title,
              });
            }
          }}
          todoItems={todoItems}
          inProgressItems={inProgressItems}
          completedItems={completedItems}
          onCreateItem={() =>
            setItemModal({ isOpen: true, editingItem: null, initialAssigneeId: null, initialTitle: '' })
          }
          onEditItem={(item) =>
            setItemModal({ isOpen: true, editingItem: item, initialAssigneeId: null, initialTitle: '' })
          }
          onDeleteItem={(item) =>
            setDeleteModal({
              isOpen: true,
              type: 'item',
              id: item.id,
              name: item.title,
            })
          }
          onStatusChange={(itemId, newStatus) => {
            void updateItemStatus(itemId, newStatus);
          }}
          onDropItem={handleDropItem}
          onQuickAdd={handleQuickAdd}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedAssigneeId={selectedAssigneeId}
          onSelectAssignee={setSelectedAssigneeId}
          selectedPriority={selectedPriority}
          onSelectPriority={setSelectedPriority}
          programInterns={programInterns}
          groups={groups}
          internWorkloadMap={internWorkloadMap}
          onOpenGroupModal={() => setGroupModalOpen(true)}
          onAssignTaskToIntern={handleAssignTaskToIntern}
          activeBoardDetail={activeBoardDetail}
          completionPercentage={completionPercentage}
          isLoadingBoard={isLoadingBoard}
        />
      )}

      {/* Modal Bảng Nhiệm Vụ */}
      <MissionBoardModal
        isOpen={boardModal.isOpen}
        onClose={() => setBoardModal((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={handleBoardSubmit}
        editingBoard={boardModal.isEditing ? activeBoardDetail : null}
        isLoading={isMutating}
      />

      {/* Modal Giao Việc Pro */}
      <MissionItemModal
        isOpen={itemModal.isOpen}
        onClose={() =>
          setItemModal((prev) => ({
            ...prev,
            isOpen: false,
            initialAssigneeId: null,
            initialTitle: '',
          }))
        }
        onSubmit={handleItemSubmit}
        programInterns={programInterns}
        groups={groups}
        internWorkloadMap={internWorkloadMap}
        initialAssigneeId={itemModal.initialAssigneeId}
        initialTitle={itemModal.initialTitle}
        editingItem={itemModal.editingItem}
        isLoading={isMutating}
      />

      {/* Modal Quản Lý Nhóm Tái Sử Dụng 100% Của HR */}
      {selectedProgram && (
        <ProgramGroupModal
          programId={selectedProgram.programId ?? selectedProgram.id ?? 0}
          programName={selectedProgram.name}
          isOpen={groupModalOpen}
          onClose={() => setGroupModalOpen(false)}
          interns={mappedInternProfiles}
          existingGroups={groups}
          onBatchApply={handleBatchApplyGroups}
          onDisbandGroup={handleDisbandGroup}
          isLoading={isLoadingGroups || isMutating}
        />
      )}

      {/* Modal Xác Nhận Xóa Nguy Hiểm Chuẩn Rule 33 */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleDeleteConfirm}
        title={
          deleteModal.type === 'board'
            ? 'Xác Nhận Xóa Bảng Nhiệm Vụ'
            : 'Xác Nhận Xóa Công Việc'
        }
        targetName={deleteModal.name}
        description={
          deleteModal.type === 'board'
            ? 'Hành động này sẽ xóa toàn bộ các mục công việc chi tiết bên trong bảng nhiệm vụ này và không thể hoàn tác.'
            : 'Mục công việc chi tiết này sẽ bị xóa khỏi bảng nhiệm vụ.'
        }
        isLoading={isMutating}
      />
    </div>
  );
};

export default MentorMissionPage;
