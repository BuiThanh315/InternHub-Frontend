import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Link, Sparkles } from 'lucide-react';
import { Modal, Button, Skeleton } from '../../../../../components/common';
import type { SuggestedTasksModalProps } from './SuggestedTasksModal.types';
import type { SuggestedKanbanTaskItem } from '../../../../../types';
import styles from './SuggestedTasksModal.module.css';

export const SuggestedTasksModal: React.FC<SuggestedTasksModalProps> = ({
  isOpen,
  onClose,
  suggestedTasks,
  isLoading,
  onApply,
}) => {
  const [selectedCompletedIds, setSelectedCompletedIds] = useState<Set<number>>(new Set());
  const [selectedUnfinishedIds, setSelectedUnfinishedIds] = useState<Set<number>>(new Set());

  // Mặc định chọn tất cả nhiệm vụ khi modal mở ra
  useEffect(() => {
    if (suggestedTasks && isOpen) {
      setSelectedCompletedIds(
        new Set(suggestedTasks.completedTasks.map((t) => t.missionItemId))
      );
      setSelectedUnfinishedIds(
        new Set(suggestedTasks.unfinishedTasks.map((t) => t.missionItemId))
      );
    }
  }, [suggestedTasks, isOpen]);

  const toggleCompleted = (id: number) => {
    setSelectedCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleUnfinished = (id: number) => {
    setSelectedUnfinishedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    if (!suggestedTasks) return;

    const completedToApply = suggestedTasks.completedTasks.filter((t) =>
      selectedCompletedIds.has(t.missionItemId)
    );
    const unfinishedToApply = suggestedTasks.unfinishedTasks.filter((t) =>
      selectedUnfinishedIds.has(t.missionItemId)
    );

    onApply(completedToApply, unfinishedToApply);
    onClose();
  };

  const totalSelected = selectedCompletedIds.size + selectedUnfinishedIds.size;

  const renderTaskItem = (
    item: SuggestedKanbanTaskItem,
    isSelected: boolean,
    onToggle: () => void
  ) => (
    <label key={item.missionItemId} className={styles.taskItemRow}>
      <input
        type="checkbox"
        className={styles.checkboxInput}
        checked={isSelected}
        onChange={onToggle}
        aria-label={item.title}
      />
      <div className={styles.taskMeta}>
        <span className={styles.taskTitleText}>{item.title}</span>
        <div className={styles.tagsRow}>
          <span className={styles.typeBadge}>{item.statusDisplayName || item.status}</span>
          {item.submissionUrl && (
            <span className={styles.linkIndicator}>
              <Link size={11} /> Có link nộp
            </span>
          )}
        </div>
      </div>
    </label>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gợi Ý Nhiệm Vụ Từ Bảng Kanban (TM-20)"
      footer={
        <div className={styles.footerButtons}>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={totalSelected === 0 || isLoading}
          >
            <Sparkles size={14} />
            <span>Chèn vào báo cáo ({totalSelected})</span>
          </Button>
        </div>
      }
    >
      <div className={styles.modalContent}>
        <p className={styles.introText}>
          Hệ thống tự động lọc các công việc bạn đã cập nhật trên Bảng Kanban trong tuần này. Chọn các đầu việc bạn muốn đưa vào bản báo cáo:
        </p>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Skeleton variant="card" height="80px" />
            <Skeleton variant="card" height="80px" />
          </div>
        ) : (
          <>
            {/* NHÓM HOÀN THÀNH */}
            <div className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle} style={{ color: 'var(--success)' }}>
                <CheckCircle2 size={16} />
                <span>Nhiệm vụ đã hoàn thành ({suggestedTasks?.completedTasks.length || 0})</span>
              </h3>

              {suggestedTasks?.completedTasks && suggestedTasks.completedTasks.length > 0 ? (
                <div className={styles.taskList}>
                  {suggestedTasks.completedTasks.map((item) =>
                    renderTaskItem(
                      item,
                      selectedCompletedIds.has(item.missionItemId),
                      () => toggleCompleted(item.missionItemId)
                    )
                  )}
                </div>
              ) : (
                <span className={styles.emptySection}>
                  Không có công việc nào chuyển trạng thái Hoàn thành trong tuần này.
                </span>
              )}
            </div>

            {/* NHÓM CHƯA HOÀN THÀNH */}
            <div className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle} style={{ color: 'var(--warning)' }}>
                <Clock size={16} />
                <span>Nhiệm vụ chưa hoàn thành ({suggestedTasks?.unfinishedTasks.length || 0})</span>
              </h3>

              {suggestedTasks?.unfinishedTasks && suggestedTasks.unfinishedTasks.length > 0 ? (
                <div className={styles.taskList}>
                  {suggestedTasks.unfinishedTasks.map((item) =>
                    renderTaskItem(
                      item,
                      selectedUnfinishedIds.has(item.missionItemId),
                      () => toggleUnfinished(item.missionItemId)
                    )
                  )}
                </div>
              ) : (
                <span className={styles.emptySection}>
                  Không có công việc nào đang dở dang (TODO / IN_PROGRESS).
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
