import React from 'react';
import { getAvatarUrl } from '../../../../../utils/avatar';
import type { AssigneeAvatarStackProps } from './AssigneeAvatarStack.types';
import styles from './AssigneeAvatarStack.module.css';

export const AssigneeAvatarStack: React.FC<AssigneeAvatarStackProps> = ({
  assignees,
  maxVisible = 3,
  size = 'md',
  className = '',
}) => {
  if (!assignees || assignees.length === 0) {
    return null;
  }

  const visibleAssignees = assignees.slice(0, maxVisible);
  const remainingCount = assignees.length - maxVisible;

  const sizeClass = size === 'sm' ? styles.avatarSm : styles.avatarMd;

  return (
    <div className={`${styles.stackContainer} ${className}`} aria-label={`Được gán cho ${assignees.length} thực tập sinh`}>
      {remainingCount > 0 && (
        <div
          className={`${styles.moreBadge} ${sizeClass}`}
          title={`và ${remainingCount} thực tập sinh khác`}
        >
          +{remainingCount}
        </div>
      )}

      {visibleAssignees.map((assignee) => {
        const avatarSrc = assignee.avatarUrl || getAvatarUrl({ avatarUrl: assignee.avatarUrl, id: assignee.id, username: assignee.fullName });
        const displayName = `${assignee.fullName} (${assignee.internCode})`;

        return (
          <div key={assignee.id} className={styles.avatarWrapper} title={displayName}>
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={assignee.fullName}
                className={`${styles.avatar} ${sizeClass}`}
                onError={(e) => {
                  // Fallback nếu ảnh không tải được
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className={`${styles.fallbackAvatar} ${sizeClass}`}>
                {assignee.fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AssigneeAvatarStack;
