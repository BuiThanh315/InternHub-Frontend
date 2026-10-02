import React, { useState } from 'react';
import { Kanban, FolderX, Plus } from 'lucide-react';
import { Header } from '../../../components/layout/Header';
import { Alert, Button, Skeleton } from '../../../components/common';
import { useMentorMissions } from '../../../hooks/useMentorMissions';
import {
  MissionBoardHeader,
  MissionKanbanBoard,
  MissionBoardModal,
  MissionItemModal,
  DeleteConfirmModal,
} from './components';
import type { MissionBoardFormData } from './components/MissionBoardModal/MissionBoardModal.types';
import type {
  MissionItemResponse,
  CreateMissionItemRequest,
} from '../../../types';
import styles from './MentorMissionPage.module.css';

export const MentorMissionPage: React.FC = () => {
  const {
    programs,
    selectedProgramId,
    setSelectedProgramId,
    programInterns,
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

  // Gom State Object quản lý Modals theo Quy tắc 14 (<= 3-4 states)
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
  }>({
    isOpen: false,
    editingItem: null,
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

  // Render vùng board 3 cột
  const renderBoardSection = () => {
    if (isLoadingBoard) {
      return (
        <div className={styles.skeletonContainer}>
          <div className={styles.skeletonColumn}>
            <Skeleton height="28px" width="50%" />
            <Skeleton height="90px" />
            <Skeleton height="90px" />
          </div>
          <div className={styles.skeletonColumn}>
            <Skeleton height="28px" width="50%" />
            <Skeleton height="90px" />
          </div>
          <div className={styles.skeletonColumn}>
            <Skeleton height="28px" width="50%" />
            <Skeleton height="90px" />
            <Skeleton height="90px" />
          </div>
        </div>
      );
    }

    if (boards.length === 0) {
      return (
        <div className={styles.emptyStateCard}>
          <div className={styles.emptyIconWrapper}>
            <Kanban size={32} />
          </div>
          <h3 className={styles.emptyTitle}>Chưa Có Bảng Nhiệm Vụ Nào</h3>
          <p className={styles.emptyDescription}>
            Chương trình thực tập này hiện chưa có Bảng nhiệm vụ nào được tạo.
            Hãy tạo bảng nhiệm vụ đầu tiên để bắt đầu giao việc cho các thực tập sinh.
          </p>
          <Button
            variant="primary"
            onClick={() => setBoardModal({ isOpen: true, isEditing: false })}
          >
            <Plus size={16} /> Tạo Bảng Nhiệm Vụ Đầu Tiên
          </Button>
        </div>
      );
    }

    return (
      <MissionKanbanBoard
        todoItems={todoItems}
        inProgressItems={inProgressItems}
        completedItems={completedItems}
        onAddNewItem={() => setItemModal({ isOpen: true, editingItem: null })}
        onEditItem={(item) => setItemModal({ isOpen: true, editingItem: item })}
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
      />
    );
  };

  // Render nội dung chính
  const renderMainContent = () => {
    if (isLoadingPrograms) {
      return (
        <div className={styles.skeletonContainer}>
          <div className={styles.skeletonColumn}>
            <Skeleton height="32px" width="60%" />
            <Skeleton height="80px" />
            <Skeleton height="80px" />
          </div>
          <div className={styles.skeletonColumn}>
            <Skeleton height="32px" width="60%" />
            <Skeleton height="80px" />
            <Skeleton height="80px" />
          </div>
          <div className={styles.skeletonColumn}>
            <Skeleton height="32px" width="60%" />
            <Skeleton height="80px" />
            <Skeleton height="80px" />
          </div>
        </div>
      );
    }

    if (programs.length === 0) {
      return (
        <div className={styles.emptyStateCard}>
          <div className={styles.emptyIconWrapper}>
            <FolderX size={32} />
          </div>
          <h3 className={styles.emptyTitle}>Chưa Được Phân Công Chương Trình</h3>
          <p className={styles.emptyDescription}>
            Tài khoản Mentor của bạn hiện chưa được liên kết với Chương trình thực tập nào.
            Vui lòng liên hệ Bộ phận HR để được gán vào chương trình phụ trách.
          </p>
        </div>
      );
    }

    return (
      <>
        <MissionBoardHeader
          programs={programs}
          selectedProgramId={selectedProgramId}
          onSelectProgram={setSelectedProgramId}
          boards={boards}
          activeBoardId={activeBoardId}
          onSelectBoard={setActiveBoardId}
          completionPercentage={completionPercentage}
          totalItems={activeBoardDetail?.items?.length || 0}
          completedItems={completedItems.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          programInterns={programInterns}
          selectedAssigneeId={selectedAssigneeId}
          onSelectAssignee={setSelectedAssigneeId}
          selectedPriority={selectedPriority}
          onSelectPriority={setSelectedPriority}
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
          onCreateItem={() => setItemModal({ isOpen: true, editingItem: null })}
        />

        {renderBoardSection()}
      </>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <Header
        title="Quản Lý Nhiệm Vụ & Giao Việc (Mentor)"
        subtitle="Thiết lập Bảng nhiệm vụ, phân công công việc chi tiết và theo dõi tiến độ thực tập sinh theo 3 trạng thái"
      />

      {error && (
        <Alert type="error" message={error}>
          <Button variant="outline" size="sm" onClick={() => void refreshAll()}>
            Thử lại
          </Button>
        </Alert>
      )}

      {renderMainContent()}

      <MissionBoardModal
        isOpen={boardModal.isOpen}
        onClose={() => setBoardModal((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={handleBoardSubmit}
        editingBoard={boardModal.isEditing ? activeBoardDetail : null}
        isLoading={isMutating}
      />

      <MissionItemModal
        isOpen={itemModal.isOpen}
        onClose={() => setItemModal((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={handleItemSubmit}
        programInterns={programInterns}
        editingItem={itemModal.editingItem}
        isLoading={isMutating}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleDeleteConfirm}
        title={deleteModal.type === 'board' ? 'Xác Nhận Xóa Bảng Nhiệm Vụ' : 'Xác Nhận Xóa Công Việc'}
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
