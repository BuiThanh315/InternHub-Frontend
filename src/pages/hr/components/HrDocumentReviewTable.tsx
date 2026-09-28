import React, { useState } from 'react';
import { FileCheck2, FileText, Eye, Download, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(true);

  const pendingDocuments = documents.filter(
    (d) => d.status === 'PENDING_REVIEW' || (d.status as any) === 'PENDING'
  );

  return (
    <div className={`card ${styles.reviewCard}`}>
      <div
        className={styles.headerRow}
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer', userSelect: 'none' }}
        title="Nhấn để thu gọn hoặc mở rộng danh sách hàng đợi thẩm định"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div className={styles.collapseToggleBtn}>
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          <div>
            <h3 className={styles.title}>
              <FileCheck2 size={20} color="var(--primary)" />
              <span>Hàng Đợi Thẩm Định CV & Tài Liệu Ứng Tuyển</span>
            </h3>
            <p className={styles.subtitle}>
              Xét duyệt các tài liệu nộp trực tuyến (Phê duyệt hoặc Từ chối có phản hồi lý do)
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className={`badge ${pendingDocuments.length > 0 ? 'badge-warning' : 'badge-slate'}`}>
            {pendingDocuments.length} tài liệu chờ duyệt
          </span>
        </div>
      </div>

      {isExpanded && (
        pendingDocuments.length === 0 ? (
          <div className={styles.emptyState}>
            🎉 Tất cả tài liệu ứng tuyển hiện tại đều đã được thẩm định!
          </div>
        ) : (
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '120px', whiteSpace: 'nowrap' }}>Mã TTS</th>
                  <th style={{ minWidth: '130px', whiteSpace: 'nowrap' }}>Loại Tài Liệu</th>
                  <th style={{ minWidth: '200px' }}>Tên Tệp Tin</th>
                  <th style={{ minWidth: '110px', whiteSpace: 'nowrap' }}>Dung Lượng</th>
                  <th style={{ minWidth: '120px', whiteSpace: 'nowrap' }}>Thời Gian Nộp</th>
                  <th style={{ minWidth: '250px', whiteSpace: 'nowrap' }}>Hành Động Xét Duyệt</th>
                </tr>
              </thead>
              <tbody>
                {pendingDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td className={styles.internCodeCell}>{doc.internCode}</td>
                    <td>
                      <span className="badge badge-sky">
                        {doc.documentType === 'CV' ? 'CV Ứng Tuyển' : 'Đơn Xin Thực Tập'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.fileCell}>
                        <FileText size={16} color="#64748b" style={{ flexShrink: 0 }} />
                        <span className={styles.fileName} title={doc.originalFileName || doc.fileName}>
                          {doc.originalFileName || doc.fileName}
                        </span>
                      </div>
                    </td>
                    <td className="font-tabular">{formatFileSize(doc.fileSize)}</td>
                    <td className="font-tabular">{formatDate(doc.createdAt)}</td>
                    <td>
                      <div className={styles.actionsGroup}>
                        <div className={styles.viewButtonGroup}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              documentService.previewDocumentFile(doc.id);
                            }}
                            className="btn btn-sm btn-secondary"
                            title="Xem trước tài liệu"
                          >
                            <Eye size={13} /> Xem
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              documentService.downloadDocumentFile(doc.id, doc.originalFileName);
                            }}
                            className="btn btn-sm btn-secondary"
                            title="Tải tệp tin về máy"
                          >
                            <Download size={13} /> Tải Về
                          </button>
                        </div>
                        <div className={styles.decisionButtonGroup}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onApprove(doc.id);
                            }}
                            className="btn btn-sm btn-success"
                            title="Phê duyệt tài liệu"
                          >
                            <Check size={13} /> Phê Duyệt
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenRejectModal(doc);
                            }}
                            className="btn btn-sm btn-danger"
                            title="Từ chối tài liệu và phản hồi"
                          >
                            <X size={13} /> Từ Chối
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};
