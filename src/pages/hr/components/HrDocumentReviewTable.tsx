import React from 'react';
import { FileCheck2, FileText, Eye, Download } from 'lucide-react';
import type { DocumentResponse } from '../../../types';
import { documentService } from '../../../services/documentService';
import { formatFileSize, formatDate } from '../../../utils/formatters';
import styles from './HrDocumentReviewTable.module.css';

interface HrDocumentReviewTableProps {
  documents: DocumentResponse[];
  onApprove: (docId: number) => void;
  onOpenRejectModal: (doc: DocumentResponse) => void;
}

export const HrDocumentReviewTable: React.FC<HrDocumentReviewTableProps> = ({
  documents,
  onApprove,
  onOpenRejectModal,
}) => {
  const pendingDocuments = documents.filter(
    (d) => d.status === 'PENDING_REVIEW' || (d.status as any) === 'PENDING'
  );

  return (
    <div className={`card ${styles.reviewCard}`}>
      <div className={styles.headerRow}>
        <div>
          <h3 className={styles.title}>
            <FileCheck2 size={20} color="var(--primary)" />
            <span>Hàng Đợi Thẩm Định CV & Tài Liệu Ứng Tuyển (TM-5)</span>
          </h3>
          <p className={styles.subtitle}>
            Xét duyệt các tài liệu nộp trực tuyến kèm Bearer Token (Phê duyệt hoặc Từ chối có lý do)
          </p>
        </div>
        <span className="badge badge-warning">
          {pendingDocuments.length} tài liệu chờ duyệt
        </span>
      </div>

      {pendingDocuments.length === 0 ? (
        <div className={styles.emptyState}>
          🎉 Tất cả tài liệu ứng tuyển hiện tại đều đã được thẩm định!
        </div>
      ) : (
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Mã TTS</th>
                <th>Loại Tài Liệu</th>
                <th>Tên Tệp Tin</th>
                <th>Dung Lượng</th>
                <th>Thời Gian Nộp</th>
                <th>Hành Động Xét Duyệt</th>
              </tr>
            </thead>
            <tbody>
              {pendingDocuments.map((doc) => (
                <tr key={doc.id}>
                  <td className={styles.internCodeCell}>{doc.internCode}</td>
                  <td>
                    <span className="badge badge-primary">
                      {doc.documentType === 'CV' ? 'CV Ứng Tuyển' : 'Đơn Xin Thực Tập'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.fileCell}>
                      <FileText size={16} color="#64748b" />
                      <span className={styles.fileName}>{doc.originalFileName || doc.fileName}</span>
                    </div>
                  </td>
                  <td>{formatFileSize(doc.fileSize)}</td>
                  <td>{formatDate(doc.createdAt)}</td>
                  <td>
                    <div className={styles.actionsGroup}>
                      <button
                        type="button"
                        onClick={() => documentService.previewDocumentFile(doc.id)}
                        className="btn btn-sm btn-secondary"
                        title="Xem trước tài liệu"
                      >
                        <Eye size={13} /> Xem
                      </button>
                      <button
                        type="button"
                        onClick={() => documentService.downloadDocumentFile(doc.id, doc.originalFileName)}
                        className="btn btn-sm btn-secondary"
                        title="Tải tệp tin về máy"
                      >
                        <Download size={13} /> Tải Về
                      </button>
                      <button
                        type="button"
                        onClick={() => onApprove(doc.id)}
                        className="btn btn-sm btn-success"
                      >
                        Phê Duyệt
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenRejectModal(doc)}
                        className="btn btn-sm btn-danger"
                      >
                        Từ Chối
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
