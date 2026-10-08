import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Users,
  Shuffle,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Save,
  GripVertical,
} from 'lucide-react';
import type { InternProfile } from '../../../../types/intern.types';
import type { InternGroup, BatchGroupItem } from '../../../../types/group.types';
import styles from './ProgramGroupModal.module.css';

interface ProgramGroupModalProps {
  programId: number;
  programName: string;
  isOpen: boolean;
  onClose: () => void;
  interns: InternProfile[]; // Danh sách toàn bộ TTS của program
  existingGroups: InternGroup[];
  onBatchApply: (groups: BatchGroupItem[]) => Promise<void>;
  onDisbandGroup: (groupId: number) => Promise<void>;
  isLoading: boolean;
}

interface LocalGroup {
  id: string; // temp id hoặc db id
  dbId?: number;
  name: string;
  maxMembers: number;
  memberIds: number[];
}

export const ProgramGroupModal: React.FC<ProgramGroupModalProps> = ({
  programId,
  programName,
  isOpen,
  onClose,
  interns,
  existingGroups,
  onBatchApply,
  onDisbandGroup,
  isLoading,
}) => {
  // Chỉ lấy những intern thuộc chương trình này
  const programInterns = useMemo(
    () => interns.filter((i) => i.programId === programId),
    [interns, programId]
  );

  // Tạo map id -> intern profile
  const internMap = useMemo(() => {
    const map = new Map<number, InternProfile>();
    programInterns.forEach((i) => map.set(i.id, i));
    return map;
  }, [programInterns]);

  // Cấu hình chia nhóm
  const [splitMode, setSplitMode] = useState<'byMembers' | 'byGroups'>('byMembers');
  const [numPerGroup, setNumPerGroup] = useState<number>(4);
  const [numGroups, setNumGroups] = useState<number>(3);
  const [namePrefix] = useState<string>('Nhóm ');

  // State các nhóm trên Kanban Preview
  const [groups, setGroups] = useState<LocalGroup[]>(() => {
    return existingGroups.map((g) => ({
      id: `existing-${g.id}`,
      dbId: g.id,
      name: g.name,
      maxMembers: g.maxMembers,
      memberIds: g.members.map((m) => m.id),
    }));
  });

  // Tự động đồng bộ lại state mỗi khi Modal mở ra hoặc danh sách nhóm hiện có thay đổi
  useEffect(() => {
    if (isOpen) {
      setGroups(
        existingGroups.map((g) => ({
          id: `existing-${g.id}`,
          dbId: g.id,
          name: g.name,
          maxMembers: g.maxMembers,
          memberIds: g.members.map((m) => m.id),
        }))
      );
    }
  }, [isOpen, existingGroups]);

  // InternIds đã được xếp vào nhóm nào đó trong local state
  const assignedInternIds = useMemo(() => {
    const set = new Set<number>();
    groups.forEach((g) => g.memberIds.forEach((id) => set.add(id)));
    return set;
  }, [groups]);

  // Ungrouped pool: Các intern chưa có trong nhóm nào
  const ungroupedInterns = useMemo(() => {
    return programInterns.filter((i) => !assignedInternIds.has(i.id));
  }, [programInterns, assignedInternIds]);

  // Drag & drop state
  const [draggedInternId, setDraggedInternId] = useState<number | null>(null);

  if (!isOpen) return null;

  // Thuật toán Round-Robin CHỈ chia cho danh sách ungroupedInterns (BR-1)
  const handleAutoSplit = () => {
    if (ungroupedInterns.length === 0) {
      alert('Tất cả thực tập sinh trong chương trình này đã được xếp nhóm.');
      return;
    }

    const available = [...ungroupedInterns];
    let targetGroupCount = 1;
    let targetCapacity = 4;

    if (splitMode === 'byMembers') {
      targetCapacity = Math.max(1, numPerGroup);
      targetGroupCount = Math.max(1, Math.ceil(available.length / targetCapacity));
    } else {
      targetGroupCount = Math.max(1, numGroups);
      targetCapacity = Math.max(1, Math.ceil(available.length / targetGroupCount));
    }

    // Tạo các nhóm mới
    const newCreatedGroups: LocalGroup[] = [];
    const startIndex = groups.length + 1;
    for (let i = 0; i < targetGroupCount; i++) {
      newCreatedGroups.push({
        id: `auto-${Date.now()}-${i}`,
        name: `${namePrefix}${startIndex + i}`,
        maxMembers: targetCapacity,
        memberIds: [],
      });
    }

    // Phân bổ Round-Robin
    available.forEach((intern, idx) => {
      const gIdx = idx % targetGroupCount;
      newCreatedGroups[gIdx].memberIds.push(intern.id);
    });

    setGroups((prev) => [...prev, ...newCreatedGroups]);
  };

  const handleAddEmptyGroup = () => {
    const nextIdx = groups.length + 1;
    setGroups((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        name: `${namePrefix}${nextIdx}`,
        maxMembers: 4,
        memberIds: [],
      },
    ]);
  };

  const handleRemoveGroup = async (group: LocalGroup) => {
    if (group.dbId) {
      if (window.confirm(`Giải tán "${group.name}"? Tất cả thành viên sẽ trở về trạng thái chưa có nhóm.`)) {
        await onDisbandGroup(group.dbId);
        setGroups((prev) => prev.filter((g) => g.id !== group.id));
      }
    } else {
      // Nhóm mới tạo ở local state
      setGroups((prev) => prev.filter((g) => g.id !== group.id));
    }
  };

  const handleRemoveMemberFromGroup = (groupId: string, memberId: number) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, memberIds: g.memberIds.filter((id) => id !== memberId) }
          : g
      )
    );
  };

  // Drag and drop handlers
  const handleDragStart = (internId: number) => {
    setDraggedInternId(internId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropToGroup = (targetGroupId: string) => {
    if (draggedInternId === null) return;

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === targetGroupId) {
          if (!g.memberIds.includes(draggedInternId)) {
            return { ...g, memberIds: [...g.memberIds, draggedInternId] };
          }
          return g;
        }
        // Xóa khỏi nhóm cũ nếu có
        return {
          ...g,
          memberIds: g.memberIds.filter((id) => id !== draggedInternId),
        };
      })
    );
    setDraggedInternId(null);
  };

  const handleDropToUngrouped = () => {
    if (draggedInternId === null) return;
    // Gỡ khỏi mọi nhóm
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        memberIds: g.memberIds.filter((id) => id !== draggedInternId),
      }))
    );
    setDraggedInternId(null);
  };

  const handleSaveAndApply = async () => {
    // Chỉ gửi các nhóm mới tạo cần apply
    const newGroupsToApply = groups.filter((g) => !g.dbId);
    if (newGroupsToApply.length === 0) {
      alert('Không có nhóm mới nào cần lưu.');
      return;
    }

    const payload: BatchGroupItem[] = newGroupsToApply.map((g) => ({
      name: g.name.trim(),
      maxMembers: g.maxMembers,
      internIds: g.memberIds,
    }));

    await onBatchApply(payload);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Quản Lý & Chia Nhóm Thực Tập</h2>
            <p className={styles.subtitle}>
              Chương trình: <strong>{programName}</strong> (Sĩ số: {programInterns.length} TTS)
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} disabled={isLoading}>
            <X size={20} />
          </button>
        </div>

        {/* Action / Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolConfigGroup}>
            <label className={styles.label}>Cách chia:</label>
            <select
              className={styles.select}
              value={splitMode}
              onChange={(e) => setSplitMode(e.target.value as any)}
            >
              <option value="byMembers">Theo số người/nhóm</option>
              <option value="byGroups">Theo số lượng nhóm</option>
            </select>

            {splitMode === 'byMembers' ? (
              <div className={styles.inputWrapper}>
                <span className={styles.label}>Người/nhóm:</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  className={styles.numInput}
                  value={numPerGroup}
                  onChange={(e) => setNumPerGroup(Number(e.target.value))}
                />
              </div>
            ) : (
              <div className={styles.inputWrapper}>
                <span className={styles.label}>Số nhóm:</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  className={styles.numInput}
                  value={numGroups}
                  onChange={(e) => setNumGroups(Number(e.target.value))}
                />
              </div>
            )}

            <button
              type="button"
              className="btn btn-primary btn-sm flex items-center gap-1"
              onClick={handleAutoSplit}
              disabled={isLoading || ungroupedInterns.length === 0}
              title="Chia đều các thực tập sinh chưa có nhóm theo thuật toán Round-Robin"
            >
              <Shuffle size={14} /> Chia Tự Động ({ungroupedInterns.length})
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm flex items-center gap-1"
              onClick={handleAddEmptyGroup}
              disabled={isLoading}
            >
              <Plus size={14} /> Thêm Nhóm Trống
            </button>
          </div>

          <div className={styles.statBadges}>
            <span className={styles.statBadge}>
              Chưa nhóm: <strong>{ungroupedInterns.length}</strong>
            </span>
            <span className={styles.statBadge}>
              Đã vào nhóm: <strong>{assignedInternIds.size}</strong>
            </span>
          </div>
        </div>

        {/* Kanban Board Board */}
        <div className={styles.kanbanContainer}>
          {/* Cột Ungrouped Pool */}
          <div
            className={styles.ungroupedColumn}
            onDragOver={handleDragOver}
            onDrop={handleDropToUngrouped}
          >
            <div className={styles.columnHeader}>
              <div className="flex items-center gap-1.5">
                <Users size={16} />
                <span className={styles.columnTitle}>Chưa Gán Nhóm</span>
              </div>
              <span className={styles.counterBadge}>{ungroupedInterns.length}</span>
            </div>

            <div className={styles.cardList}>
              {ungroupedInterns.map((intern) => (
                <div
                  key={intern.id}
                  className={styles.internCard}
                  draggable
                  onDragStart={() => handleDragStart(intern.id)}
                >
                  <div className="flex items-center gap-1.5">
                    <GripVertical size={13} className={styles.gripIcon} />
                    <div>
                      <div className={styles.cardName}>{intern.fullName}</div>
                      <div className={styles.cardCode}>
                        {intern.internCode} • {intern.appliedPosition || 'TTS'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {ungroupedInterns.length === 0 && (
                <div className={styles.emptyNotice}>Tất cả TTS đã được xếp nhóm</div>
              )}
            </div>
          </div>

          {/* Các Cột Nhóm */}
          <div className={styles.groupsScrollArea}>
            {groups.map((group) => {
              const currentCount = group.memberIds.length;
              const isOver = currentCount > group.maxMembers;
              const isFull = currentCount === group.maxMembers;

              return (
                <div
                  key={group.id}
                  className={styles.groupColumn}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDropToGroup(group.id)}
                >
                  <div className={styles.columnHeader}>
                    <div>
                      <input
                        type="text"
                        className={styles.groupNameInput}
                        value={group.name}
                        onChange={(e) =>
                          setGroups((prev) =>
                            prev.map((g) =>
                              g.id === group.id ? { ...g, name: e.target.value } : g
                            )
                          )
                        }
                      />
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={`${styles.statusBadge} ${
                            isOver
                              ? styles.statusOver
                              : isFull
                              ? styles.statusFull
                              : styles.statusUnder
                          }`}
                        >
                          {isOver && <AlertTriangle size={11} />}
                          {isFull && <CheckCircle size={11} />}
                          {currentCount}/{group.maxMembers} thành viên
                          {isOver && ' (Vượt chỉ tiêu)'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={styles.disbandBtn}
                      onClick={() => handleRemoveGroup(group)}
                      title="Giải tán nhóm này"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className={styles.cardList}>
                    {group.memberIds.map((mId) => {
                      const intern = internMap.get(mId);
                      if (!intern) return null;

                      return (
                        <div
                          key={intern.id}
                          className={styles.internCard}
                          draggable
                          onDragStart={() => handleDragStart(intern.id)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-1.5">
                              <GripVertical size={13} className={styles.gripIcon} />
                              <div>
                                <div className={styles.cardName}>{intern.fullName}</div>
                                <div className={styles.cardCode}>
                                  {intern.internCode} • {intern.appliedPosition || 'TTS'}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              className={styles.removeMemberBtn}
                              onClick={() => handleRemoveMemberFromGroup(group.id, intern.id)}
                              title="Gỡ khỏi nhóm"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {group.memberIds.length === 0 && (
                      <div className={styles.emptyNotice}>Kéo thả thực tập sinh vào đây</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
            Đóng
          </button>
          <button
            type="button"
            className="btn btn-primary flex items-center gap-1.5"
            onClick={handleSaveAndApply}
            disabled={isLoading || groups.filter((g) => !g.dbId).length === 0}
          >
            <Save size={15} /> Lưu & Áp Dụng Nhóm Mới
          </button>
        </div>
      </div>
    </div>
  );
};
