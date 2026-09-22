import React from 'react';
import { BookOpen, FileText, Eye, Download, Sparkles } from 'lucide-react';

import { Button } from '../../../components/common/Button/Button';
import { documentService } from '../../../services/documentService';
import type { InternProfile, DocumentResponse } from '../../../types';
import styles from './MentorDetailPanel.module.css';

interface MentorDetailPanelProps {
  intern: InternProfile | null;
  documents: DocumentResponse[];
  noteText: string;
  onNoteChange: (text: string) => void;
  onSaveNote: () => void;
}

export const MentorDetailPanel: React.FC<MentorDetailPanelProps> = ({
  intern,
  documents,
  noteText,
  onNoteChange,
  onSaveNote,
}) => {
  if (!intern) {
    return (
      <div className={`card ${styles.emptyStateCard}`}>
        Chọn một thực tập sinh bên trái để xem chi tiết
      </div>
    );
  }

  const internDocs = documents.filter((d) => d.internCode === intern.internCode);

  return (
    <div className={styles.container}>
      {/* Documents Widget */}
      <div className="card">
        <h4 className={styles.widgetTitle}>
          <BookOpen size={18} color="var(--primary)" />
          <span>Tài Liệu & CV Của {intern.fullName}</span>
        </h4>

        {internDocs.length === 0 ? (
          <p className={styles.emptyText}>Thực tập sinh chưa nộp tài liệu nào.</p>
        ) : (
          <div className={styles.docList}>
            {internDocs.map((doc) => (
              <div key={doc.id} className={styles.docItem}>
                <div className={styles.docInfo}>
                  <FileText size={16} color="var(--primary)" />
                  <div>
                    <p className={styles.docName}>{doc.fileName}</p>
                    <span className={styles.docType}>{doc.documentType}</span>
                  </div>
                </div>
                <div className={styles.docActions}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => documentService.previewDocumentFile(doc.id)}
                    title="Xem tệp tin"
                  >
                    <Eye size={12} /> Xem
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => documentService.downloadDocumentFile(doc.id, doc.originalFileName)}
                    title="Tải tệp tin về máy"
                  >
                    <Download size={12} /> Tải
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mentorship Notes Widget */}
      <div className="card">
        <h4 className={styles.widgetTitle}>
          <Sparkles size={18} color="#f59e0b" />
          <span>Sổ Tay Hướng Dẫn & Đánh Giá</span>
        </h4>
        <div className="form-group">
          <textarea
            rows={4}
            className="form-textarea"
            placeholder="Ghi chú mục tiêu tuần, kết quả giao việc, điểm mạnh, điểm cần cải thiện..."
            value={noteText}
            onChange={(e) => onNoteChange(e.target.value)}
          />
        </div>
        <div className={styles.buttonRow}>
          <Button variant="primary" size="sm" onClick={onSaveNote}>
            Lưu Ghi Chú Tiến Độ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MentorDetailPanel;
