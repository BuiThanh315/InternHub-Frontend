import React from 'react';
import styles from './ContractDocumentViewer.module.css';

interface ContractDocumentViewerProps {
  canonicalHtml: string;
  status?: string;
  revisionNumber?: number;
  contractNumber?: string;
  snapshotHash?: string;
}

export const ContractDocumentViewer: React.FC<ContractDocumentViewerProps> = ({
  canonicalHtml,
  status = 'DRAFT',
  revisionNumber = 1,
  contractNumber = 'DRAFT-HDTT',
  snapshotHash,
}) => {
  return (
    <div className={styles.viewerContainer}>
      {/* Header thanh công cụ văn bản */}
      <div className={styles.metaBar}>
        <div className={styles.metaInfo}>
          <span className={styles.contractBadge}>Số HĐ: {contractNumber}</span>
          <span className={styles.revisionBadge}>Phiên bản: Revision {revisionNumber}</span>
          <span className={`${styles.statusBadge} ${styles[status.toLowerCase()] || ''}`}>
            {status}
          </span>
        </div>
        {snapshotHash && (
          <div className={styles.hashInfo} title={`SHA-256 Checksum: ${snapshotHash}`}>
            SHA-256: {snapshotHash.substring(0, 16)}...
          </div>
        )}
      </div>

      {/* Tờ giấy văn bản khổ A4 */}
      <div className={styles.a4Page}>
        {status === 'DRAFT' && <div className={styles.watermark}>BẢN NHÁP - DRAFT</div>}
        {status === 'CHANGES_REQUESTED' && (
          <div className={styles.watermarkWarning}>YÊU CẦU ĐIỀU CHỈNH</div>
        )}

        <div
          className={styles.documentBody}
          dangerouslySetInnerHTML={{ __html: canonicalHtml }}
        />
      </div>
    </div>
  );
};
