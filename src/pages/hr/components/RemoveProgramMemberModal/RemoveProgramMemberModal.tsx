import React from 'react';
import { AlertTriangle, UserMinus, X } from 'lucide-react';
import type { InternProfile } from '../../../../types/intern.types';
import styles from './RemoveProgramMemberModal.module.css';

interface RemoveProgramMemberModalProps {
  intern: InternProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (intern: InternProfile) => Promise<void>;
  isLoading: boolean;
}

export const RemoveProgramMemberModal: React.FC<RemoveProgramMemberModalProps> = ({
  intern,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  if (!isOpen || !intern) return null;

  const hasGroup = Boolean(intern.groupId || intern.groupName);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-member-title"
      >
        <div className={styles.header}>
          <div className={styles.titleWrapper}>
            <div className={styles.iconCircle}>
              <UserMinus size={20} className={styles.icon} />
            </div>
            <h3 id="remove-member-title" className={styles.title}>
              Gỡ Khỏi Chương Trình Thực Tập
            </h3>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={isLoading}
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.mainPrompt}>
            Bạn có chắc chắn muốn gỡ thực tập sinh{' '}
            <strong className={styles.highlightText}>{intern.fullName}</strong> ({intern.internCode}) khỏi chương trình{' '}
            <strong className={styles.highlightText}>{intern.programName || 'hiện tại'}</strong>?
          </p>

          {hasGroup && (
            <div className={styles.warningBox}>
              <AlertTriangle size={20} className={styles.warningIcon} />
              <div className={styles.warningContent}>
                <span className={styles.warningTitle}>Cảnh báo vỡ sĩ số nhóm</span>
                <p className={styles.warningText}>
                  Thực tập sinh này đang thuộc <strong>{intern.groupName || 'Nhóm đã phân công'}</strong>. 
                  Hành động này sẽ <strong>đồng thời gỡ thành viên ra khỏi nhóm</strong> và làm thay đổi sĩ số của nhóm.
                </p>
              </div>
            </div>
          )}

          <div className={styles.policyNote}>
            <strong>Lưu ý nghiệp vụ:</strong> Hành động này chỉ áp dụng cho trường hợp tiếp nhận nhầm. Nếu thực tập sinh đã có Mentor hoặc dữ liệu đánh giá, hệ thống sẽ từ chối gỡ trực tiếp (vui lòng sử dụng tính năng <em>Chuyển chương trình</em> hoặc <em>Chấm dứt thực tập</em>).
          </div>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onConfirm(intern)}
            disabled={isLoading}
          >
            {isLoading ? 'Đang Xử Lý...' : 'Xác Nhận Gỡ'}
          </button>
        </div>
      </div>
    </div>
  );
};
