import React from 'react';
import { FileText, CheckCircle2, Clock, ShieldAlert, Eye, Download } from 'lucide-react';
import type { DocumentResponse } from '../../../types';
import { documentService } from '../../../services/documentService';
import { formatFileSize } from '../../../utils/formatters';
import styles from './InternDocumentList.module.css';

interface InternDocumentListProps {
  documents: DocumentResponse[];
}

export const InternDocumentList: React.FC<InternDocumentListProps> = ({ documents }) => {
  return (
    <div className="card">
      <h3 className={styles.title}>Danh Sách Hồ Sơ & Kết Quả Thẩm Định (TM-5)</h3>

      {documents.length === 0 ? (
        <p className={styles.emptyText}>Chưa có tài liệu nào được nộp cho mã thực tập sinh này.</p>
      ) : (
        <div className={styles.list}>
          {documents.map((doc) => {
            const isRejected = doc.status === 'REJECTED';
            return (
              <div
                key={doc.id}
                className={`${styles.docItem} ${isRejected ? styles.rejectedItem : ''}`}
              >
                <div className={styles.docHeader}>
                  <div className={styles.docInfo}>
                    <FileText size={18} color="var(--primary)" />
                    <div>
                      <p className={styles.fileName}>{doc.originalFileName || doc.fileName}</p>
                      <span className={styles.fileMeta}>
                        Loại: {doc.documentType === 'CV' ? 'CV Ứng Tuyển' : 'Đơn Xin Thực Tập'} •{' '}
                        {formatFileSize(doc.fileSize)}
                      </span>
                    </div>
                  </div>

                  <div>
                    {doc.status === 'APPROVED' && (
                      <span className="badge badge-success">
                        <CheckCircle2 size={12} /> Đã Duyệt
                      </span>
                    )}
                    {(doc.status === 'PENDING_REVIEW' || (doc.status as any) === 'PENDING') && (
                      <span className="badge badge-warning">
                        <Clock size={12} /> Chờ Duyệt
                      </span>
                    )}
                    {isRejected && (
                      <span className="badge badge-danger">
                        <ShieldAlert size={12} /> Bị Từ Chối
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.actions}>
                  <button
                    type="button"
                    onClick={() => documentService.previewDocumentFile(doc.id)}
                    className={`btn btn-sm btn-secondary ${styles.actionBtn}`}
                  >
                    <Eye size={12} /> Xem Tệp
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      documentService.downloadDocumentFile(doc.id, doc.originalFileName)
                    }
                    className={`btn btn-sm btn-secondary ${styles.actionBtn}`}
                  >
                    <Download size={12} /> Tải Về
                  </button>
                </div>

                {isRejected && doc.rejectionReason && (
                  <div className={styles.rejectionNotice}>
                    <strong>Lý do từ chối từ HR:</strong> {doc.rejectionReason}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
