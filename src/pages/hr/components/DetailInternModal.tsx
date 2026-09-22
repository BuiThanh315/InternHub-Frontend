import React from 'react';
import { User, X, FileText, Eye, Download, Edit3, Upload } from 'lucide-react';
import type { InternProfile, DocumentResponse } from '../../../types';
import { documentService } from '../../../services/documentService';
import { formatFileSize } from '../../../utils/formatters';

interface DetailInternModalProps {
  intern: InternProfile | null;
  documents: DocumentResponse[];
  onClose: () => void;
  onOpenEdit: (intern: InternProfile) => void;
  onOpenUpload: (intern: InternProfile) => void;
}

export const DetailInternModal: React.FC<DetailInternModalProps> = ({
  intern,
  documents,
  onClose,
  onOpenEdit,
  onOpenUpload,
}) => {
  if (!intern) return null;

  const internDocs = documents.filter((d) => d.internCode === intern.internCode);

  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'INTERNING':
        return 'badge-success';
      case 'APPROVED':
        return 'badge-info';
      case 'COMPLETED':
        return 'badge-neutral';
      case 'REJECTED':
        return 'badge-danger';
      default:
        return 'badge-warning';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '640px',
          margin: '1rem',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              <User size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                {intern.fullName}
              </h4>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                }}
              >
                Mã TTS: {intern.internCode}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className={`badge ${getBadgeClass(intern.status)}`}>
              {intern.status}
            </span>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Profile Info Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.85rem',
            fontSize: '0.825rem',
            padding: '1rem',
            borderRadius: '8px',
            backgroundColor: 'var(--border-subtle)',
            marginBottom: '1.25rem',
          }}
        >
          <div>Email: <strong>{intern.email}</strong></div>
          <div>Số điện thoại: <strong>{intern.phone}</strong></div>
          <div>Trường Đại học: <strong>{intern.university}</strong></div>
          <div>Chuyên ngành: <strong>{intern.major}</strong></div>
          <div>
            Vị trí ứng tuyển:{' '}
            <strong style={{ color: '#3b82f6' }}>
              {intern.appliedPosition || '-'}
            </strong>
          </div>
          <div>Niên khóa: <strong>{intern.academicYear || '-'}</strong></div>
          <div>Ngày bắt đầu: <strong>{intern.startDate || '-'}</strong></div>
          <div>Ngày kết thúc: <strong>{intern.endDate || '-'}</strong></div>
          <div>Giới tính: <strong>{intern.gender || '-'}</strong></div>
          <div>Địa chỉ: <strong>{intern.address || '-'}</strong></div>
          <div style={{ gridColumn: '1 / -1' }}>
            Ghi chú: <em>{intern.notes || 'Không có'}</em>
          </div>
        </div>

        {/* Attached Documents for this Intern */}
        <h5
          style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <FileText size={16} color="var(--primary)" />
          <span>Tài Liệu Đính Kèm ({internDocs.length})</span>
        </h5>

        {internDocs.length === 0 ? (
          <p
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              marginBottom: '1.25rem',
            }}
          >
            Chưa có tài liệu hoặc CV nào được nộp cho thực tập sinh này.
          </p>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            {internDocs.map((doc) => (
              <div
                key={doc.id}
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <p style={{ fontSize: '0.825rem', fontWeight: 600, margin: 0 }}>
                    {doc.originalFileName || doc.fileName}
                  </p>
                  <span
                    style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}
                  >
                    {doc.documentType} • {formatFileSize(doc.fileSize)} •{' '}
                    {doc.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    type="button"
                    onClick={() => documentService.previewDocumentFile(doc.id)}
                    className="btn btn-sm btn-secondary"
                    style={{ padding: '0.2rem 0.45rem', fontSize: '0.75rem' }}
                  >
                    <Eye size={12} /> Xem
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      documentService.downloadDocumentFile(
                        doc.id,
                        doc.originalFileName
                      )
                    }
                    className="btn btn-sm btn-secondary"
                    style={{ padding: '0.2rem 0.45rem', fontSize: '0.75rem' }}
                  >
                    <Download size={12} /> Tải
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => onOpenEdit(intern)}
            className="btn btn-secondary"
          >
            <Edit3 size={15} /> Chỉnh Sửa Hồ Sơ (PUT)
          </button>
          <button
            type="button"
            onClick={() => onOpenUpload(intern)}
            className="btn btn-secondary"
          >
            <Upload size={15} /> Tải Lên Tệp (POST)
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
