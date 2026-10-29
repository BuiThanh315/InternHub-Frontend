import React from 'react';
import { ArrowLeft, Briefcase } from 'lucide-react';
import type { InternProfile } from '../../../../types';
import { getInternStatusLabel } from '../../../../utils/formatters';
import styles from './Workspaces.module.css';

interface WorkspaceHeaderProps {
  activeProfile: InternProfile;
  allProfiles: InternProfile[];
  onBackToHub: () => void;
  onSwitchProgram: (programId: number) => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  activeProfile,
  allProfiles,
  onBackToHub,
  onSwitchProgram,
}) => {
  const currentProgramId = activeProfile.programId ?? activeProfile.id;
  const displayTitle =
    activeProfile.programName || `Chương trình thực tập #${activeProfile.programCode || currentProgramId}`;

  return (
    <div className={styles.workspaceHeader}>
      <div className={styles.leftControls}>
        <button className={styles.backBtn} onClick={onBackToHub} title="Quay lại danh sách kỳ thực tập">
          <ArrowLeft size={16} />
          <span>Tất cả kỳ thực tập</span>
        </button>

        <div className={styles.programIdentity}>
          <span className={styles.programCode}>
            <Briefcase size={12} style={{ display: 'inline', marginRight: 4 }} />
            {activeProfile.programCode || `ID-${currentProgramId}`}
          </span>
          <h2 className={styles.programTitle}>{displayTitle}</h2>
        </div>
      </div>

      <div className={styles.rightControls}>
        {allProfiles.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Chuyển kỳ:</span>
            <select
              className={styles.switcherSelect}
              value={currentProgramId}
              onChange={(e) => onSwitchProgram(Number(e.target.value))}
            >
              {allProfiles.map((p) => {
                const pid = p.programId ?? p.id;
                return (
                  <option key={p.id} value={pid}>
                    {p.programName || `Kỳ #${p.programCode || pid}`} ({getInternStatusLabel(p.status)})
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
