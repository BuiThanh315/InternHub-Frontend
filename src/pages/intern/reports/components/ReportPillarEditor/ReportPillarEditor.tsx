import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  Kanban,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../../../../components/common';
import type { ReportPillarEditorProps } from './ReportPillarEditor.types';
import styles from './ReportPillarEditor.module.css';

export const ReportPillarEditor: React.FC<ReportPillarEditorProps> = ({
  formValues,
  onChangeField,
  isEditable,
  onOpenKanbanModal,
  tasks = [],
}) => {
  const completedTasks = tasks.filter((t) => t.taskStatus === 'COMPLETED');
  const unfinishedTasks = tasks.filter((t) => t.taskStatus !== 'COMPLETED');

  return (
    <div className={styles.editorContainer}>
      {/* TRỤ CỘT 1: NHIỆM VỤ ĐÃ HOÀN THÀNH */}
      <section className={styles.pillarCard}>
        <div className={styles.pillarHeader}>
          <div className={styles.pillarTitleGroup}>
            <div className={`${styles.pillarIconWrapper} ${styles.iconCompleted}`}>
              <CheckCircle2 size={18} />
            </div>
            <h2 className={styles.pillarTitle}>1. Nhiệm Vụ Đã Hoàn Thành</h2>
          </div>

          {isEditable && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenKanbanModal}
              title="Nhập tự động các đầu việc từ bảng Kanban của tuần này"
            >
              <Kanban size={14} />
              <span>Gợi ý từ Kanban TM-20</span>
            </Button>
          )}
        </div>

        <p className={styles.pillarPrompt}>
          Nêu rõ các mục công việc, chức năng hoặc nhiệm vụ bạn đã hoàn tất trong tuần. Hãy giải thích ngắn gọn sản phẩm đạt được.
        </p>

        <div className={styles.textareaWrapper}>
          <textarea
            className={styles.pillarTextarea}
            value={formValues.completedTasksSummary}
            onChange={(e) => onChangeField('completedTasksSummary', e.target.value)}
            placeholder="Ví dụ:&#10;• Hoàn thành thiết kế bảng Kanban cho Thực tập sinh (Task #12)&#10;• Tối ưu truy vấn SQL chống N+1 query trên module Profile"
            readOnly={!isEditable}
            aria-label="Nhiệm vụ đã hoàn thành"
          />
          <span className={styles.charCount}>
            {formValues.completedTasksSummary.length} ký tự
          </span>
        </div>

        {completedTasks.length > 0 && (
          <div className={styles.snapshotTasksContainer}>
            <span className={styles.snapshotTasksTitle}>
              Nhiệm vụ gắn kèm ({completedTasks.length})
            </span>
            <div className={styles.taskChipsList}>
              {completedTasks.map((task) => (
                <div
                  key={task.missionItemId}
                  className={`${styles.taskChip} ${styles.taskChipCompleted}`}
                >
                  <CheckCircle2 size={12} />
                  <span>{task.taskTitle}</span>
                  {task.submissionUrl && (
                    <a
                      href={task.submissionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Mở liên kết nộp bài"
                      style={{ color: 'inherit', display: 'inline-flex' }}
                    >
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* TRỤ CỘT 2: NHIỆM VỤ CHƯA HOÀN THÀNH & LÝ DO */}
      <section className={styles.pillarCard}>
        <div className={styles.pillarHeader}>
          <div className={styles.pillarTitleGroup}>
            <div className={`${styles.pillarIconWrapper} ${styles.iconUnfinished}`}>
              <Clock size={18} />
            </div>
            <h2 className={styles.pillarTitle}>2. Nhiệm Vụ Chưa Hoàn Thành & Lý Do Chậm Tiến Độ</h2>
          </div>
        </div>

        <p className={styles.pillarPrompt}>
          Liệt kê các đầu việc đang dở dang (IN_PROGRESS hoặc TODO) và nêu rõ nguyên nhân (vướng mắc kỹ thuật, thiếu tài liệu, thay đổi yêu cầu...).
        </p>

        <div className={styles.textareaWrapper}>
          <textarea
            className={styles.pillarTextarea}
            value={formValues.unfinishedTasksSummary}
            onChange={(e) => onChangeField('unfinishedTasksSummary', e.target.value)}
            placeholder="Ví dụ:&#10;• Viết tài liệu hướng dẫn API chưa xong do ưu tiên xử lý lỗi bảo mật đột xuất&#10;• Module xuất báo cáo Excel đang hoàn thành 70%, dự kiến xong vào thứ Ba tuần tới"
            readOnly={!isEditable}
            aria-label="Nhiệm vụ chưa hoàn thành và lý do"
          />
          <span className={styles.charCount}>
            {formValues.unfinishedTasksSummary.length} ký tự
          </span>
        </div>

        {unfinishedTasks.length > 0 && (
          <div className={styles.snapshotTasksContainer}>
            <span className={styles.snapshotTasksTitle}>
              Nhiệm vụ dở dang gắn kèm ({unfinishedTasks.length})
            </span>
            <div className={styles.taskChipsList}>
              {unfinishedTasks.map((task) => (
                <div
                  key={task.missionItemId}
                  className={`${styles.taskChip} ${styles.taskChipUnfinished}`}
                >
                  <Clock size={12} />
                  <span>{task.taskTitle} ({task.taskStatus})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* TRỤ CỘT 3: KHÓ KHĂN & VƯỚNG MẮC */}
      <section className={styles.pillarCard}>
        <div className={styles.pillarHeader}>
          <div className={styles.pillarTitleGroup}>
            <div className={`${styles.pillarIconWrapper} ${styles.iconDifficulties}`}>
              <AlertTriangle size={18} />
            </div>
            <h2 className={styles.pillarTitle}>3. Khó Khăn, Vướng Mắc Cần Mentor Hỗ Trợ</h2>
          </div>
        </div>

        <p className={styles.pillarPrompt}>
          Các rào cản về công nghệ, môi trường, phân quyền hay quy trình mà bạn đang gặp phải. Đây là cơ sở để Mentor định hướng và giải cứu kịp thời.
        </p>

        <div className={styles.textareaWrapper}>
          <textarea
            className={styles.pillarTextarea}
            value={formValues.difficultiesAndChallenges}
            onChange={(e) => onChangeField('difficultiesAndChallenges', e.target.value)}
            placeholder="Ví dụ:&#10;• Gặp khó khăn khi cấu hình Redis Pub/Sub trên môi trường Docker cục bộ&#10;• Cần Mentor hướng dẫn thêm về cách tổ chức Domain Events trong Spring Boot"
            readOnly={!isEditable}
            aria-label="Khó khăn vướng mắc cần hỗ trợ"
          />
          <span className={styles.charCount}>
            {formValues.difficultiesAndChallenges.length} ký tự
          </span>
        </div>
      </section>

      {/* TRỤ CỘT 4: KIẾN THỨC & BÀI HỌC MỚI */}
      <section className={styles.pillarCard}>
        <div className={styles.pillarHeader}>
          <div className={styles.pillarTitleGroup}>
            <div className={`${styles.pillarIconWrapper} ${styles.iconLearnings}`}>
              <Sparkles size={18} />
            </div>
            <h2 className={styles.pillarTitle}>4. Kiến Thức & Bài Học Mới Thu Nạp</h2>
          </div>
        </div>

        <p className={styles.pillarPrompt}>
          Ghi lại những kiến thức chuyên môn, kỹ năng giải quyết vấn đề (troubleshooting) hoặc tư duy kiến trúc bạn đã học hỏi và đúc kết được trong tuần.
        </p>

        <div className={styles.textareaWrapper}>
          <textarea
            className={styles.pillarTextarea}
            value={formValues.learningsAndKnowledge}
            onChange={(e) => onChangeField('learningsAndKnowledge', e.target.value)}
            placeholder="Ví dụ:&#10;• Học được cách dùng Left Join Fetch để xử lý triệt để lỗi N+1 Query trong Spring Data JPA&#10;• Hiểu sâu hơn về kiến trúc WebSocket STOMP và cơ chế Token Rotation chống Replay Attack"
            readOnly={!isEditable}
            aria-label="Kiến thức bài học mới"
          />
          <span className={styles.charCount}>
            {formValues.learningsAndKnowledge.length} ký tự
          </span>
        </div>
      </section>
    </div>
  );
};
