import React, { useState } from 'react';
import { Users, User, Kanban, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Modal, Button, Input, Select } from '../../../../../../../../../components/common';
import { quizService } from '../../../../../../../../../services/quizService';
import type { AssignmentTargetType } from '../../../../../../../../../types/quiz.types';
import type { AssignQuizModalProps } from './AssignQuizModal.types';
import styles from './AssignQuizModal.module.css';

interface FormState {
  targetType: AssignmentTargetType;
  targetId: string;
  dueDate: string;
  maxAttempts: number;
  createKanbanTask: boolean;
}

const getDefaultDueDate = () =>
  new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

export const AssignQuizModal: React.FC<AssignQuizModalProps> = ({
  isOpen,
  onClose,
  quiz,
  groups,
  programInterns,
  onAssigned,
}) => {
  const [form, setForm] = useState<FormState>(() => ({
    targetType: 'GROUP',
    targetId: groups[0]?.id ? String(groups[0].id) : '',
    dueDate: getDefaultDueDate(),
    maxAttempts: quiz?.maxAttempts || 2,
    createKanbanTask: true,
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!quiz) return null;

  const groupOptions = [
    { value: '', label: '-- Chọn nhóm thực tập sinh --' },
    ...groups.map((g) => ({
      value: String(g.id),
      label: `${g.name}`,
    })),
  ];

  const internOptions = [
    { value: '', label: '-- Chọn học viên cụ thể --' },
    ...programInterns.map((i) => ({
      value: String(i.id),
      label: `${i.fullName} (${i.internCode})`,
    })),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.targetId) {
      toast.error('Vui lòng chọn đối tượng được giao bài (Nhóm hoặc Học viên)');
      return;
    }

    if (!form.dueDate) {
      toast.error('Vui lòng chọn hạn chót nộp bài');
      return;
    }

    try {
      setIsSubmitting(true);
      await quizService.assignQuiz(quiz.id, {
        targetType: form.targetType,
        targetId: Number(form.targetId),
        dueDate: form.dueDate,
        maxAttempts: Number(form.maxAttempts),
        createKanbanTask: form.createKanbanTask,
      });

      toast.success('Phân công bài Quiz thành công! Đã tạo thẻ nhiệm vụ trên Kanban.');
      onAssigned();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi giao bài Quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isSubmitting) onClose();
      }}
      title="Giao Bài Kiểm Tra Quiz & Đồng Bộ Kanban"
      size="md"
      footer={
        <div className={styles.footer}>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !form.targetId}
          >
            <Send size={16} />
            {isSubmitting ? 'Đang phân công...' : 'Xác nhận giao bài'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className={styles.container}>
        <div className={styles.quizInfoCard}>
          <h4 className={styles.quizTitle}>{quiz.title}</h4>
          <span className={styles.quizMeta}>
            Thời gian: {quiz.timeLimitMinutes} phút · Điểm đạt: {quiz.passingScore} điểm
          </span>
        </div>

        {/* Lựa chọn phân công cho cả Nhóm hay 1 Học viên */}
        <div className={styles.targetSelector}>
          <div
            className={`${styles.targetCard} ${form.targetType === 'GROUP' ? styles.targetCardActive : ''}`}
            onClick={() => {
              setForm((prev) => ({
                ...prev,
                targetType: 'GROUP',
                targetId: groups[0]?.id ? String(groups[0].id) : '',
              }));
            }}
          >
            <Users size={24} className={styles.targetIcon} />
            <div className={styles.targetInfo}>
              <span className={styles.targetTitle}>Giao Cho Cả Nhóm</span>
              <span className={styles.targetDesc}>Toàn bộ TTS trong nhóm đều nhận bài</span>
            </div>
          </div>

          <div
            className={`${styles.targetCard} ${form.targetType === 'INDIVIDUAL' ? styles.targetCardActive : ''}`}
            onClick={() => {
              setForm((prev) => ({
                ...prev,
                targetType: 'INDIVIDUAL',
                targetId: programInterns[0]?.id ? String(programInterns[0].id) : '',
              }));
            }}
          >
            <User size={24} className={styles.targetIcon} />
            <div className={styles.targetInfo}>
              <span className={styles.targetTitle}>Giao Cho 1 TTS</span>
              <span className={styles.targetDesc}>Chỉ định riêng 1 thực tập sinh</span>
            </div>
          </div>
        </div>

        {/* Dropdown đối tượng tương ứng */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            {form.targetType === 'GROUP' ? 'Chọn nhóm nhận bài thi:' : 'Chọn học viên nhận bài thi:'}
          </label>
          {form.targetType === 'GROUP' ? (
            <Select
              options={groupOptions}
              value={form.targetId}
              onChange={(e) => setForm((prev) => ({ ...prev, targetId: e.target.value }))}
            />
          ) : (
            <Select
              options={internOptions}
              value={form.targetId}
              onChange={(e) => setForm((prev) => ({ ...prev, targetId: e.target.value }))}
            />
          )}
        </div>

        {/* Cấu hình đợt thi */}
        <div className={styles.formRow}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Hạn chót nộp bài (Deadline)</label>
            <Input
              type="date"
              value={form.dueDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Số lượt làm lại tối đa</label>
            <Input
              type="number"
              min={1}
              max={10}
              value={form.maxAttempts}
              onChange={(e) => setForm((prev) => ({ ...prev, maxAttempts: Number(e.target.value) }))}
            />
          </div>
        </div>

        {/* Switch đồng bộ thẻ Kanban */}
        <div className={styles.kanbanToggleRow}>
          <div className={styles.kanbanToggleInfo}>
            <span className={styles.kanbanToggleTitle}>
              <Kanban size={16} style={{ color: 'var(--primary)' }} />
              Tự động tạo thẻ nhiệm vụ trên Kanban
            </span>
            <span className={styles.kanbanToggleDesc}>
              Tạo thẻ `[Quiz]` trên Kanban board giúp TTS dễ dàng thấy hạn deadline và bấm vào làm bài.
            </span>
          </div>

          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={form.createKanbanTask}
              onChange={(e) => setForm((prev) => ({ ...prev, createKanbanTask: e.target.checked }))}
            />
            <span className={styles.slider} />
          </label>
        </div>
      </form>
    </Modal>
  );
};
