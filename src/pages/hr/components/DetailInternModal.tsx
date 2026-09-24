import React from 'react';
import { User, FileText, Eye, Download, Edit3, Upload, CheckCircle, XCircle } from 'lucide-react';
import type { InternProfile, DocumentResponse } from '../../../types';
import { Modal, Button } from '../../../components/common';
import { documentService } from '../../../services/documentService';
import { formatFileSize, formatPhoneNumber, getInternStatusLabel } from '../../../utils/formatters';

interface DetailInternModalProps {
  intern: InternProfile | null;
  documents: DocumentResponse[];
  onClose: () => void;
  onOpenEdit: (intern: InternProfile) => void;
  onOpenUpload: (intern: InternProfile) => void;
  onOpenApprove?: (intern: InternProfile) => void;
  onOpenReject?: (intern: InternProfile) => void;
}

export const DetailInternModal: React.FC<DetailInternModalProps> = ({
  intern,
  documents,
  onClose,
  onOpenEdit,
  onOpenUpload,
  onOpenApprove,
  onOpenReject,
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
    <Modal
      isOpen={!!intern}
      onClose={onClose}
      title={`Chi Tiết Hồ Sơ: ${intern.fullName} (${intern.internCode})`}
      size="lg"
      footer={
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%', flexWrap: 'wrap' }}>
          {intern.status === 'PENDING' && onOpenApprove && onOpenReject && (
            <>
              <Button
                type="button"
                variant="success"
                onClick={() => onOpenApprove(intern)}
                leftIcon={<CheckCircle size={15} />}
              >
                Tiếp Nhận Hồ Sơ
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => onOpenReject(intern)}
                leftIcon={<XCircle size={15} />}
              >
                Từ Chối Hồ Sơ
              </Button>
            </>
          )}
          {intern.status === 'APPROVED' && onOpenReject && (
            <Button
              type="button"
              variant="danger"
              onClick={() => onOpenReject(intern)}
              leftIcon={<XCircle size={15} />}
            >
              Hủy Tiếp Nhận
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenEdit(intern)}
            leftIcon={<Edit3 size={15} />}
          >
            Chỉnh Sửa Hồ Sơ
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenUpload(intern)}
            leftIcon={<Upload size={15} />}
          >
            Tải Lên Tệp
          </Button>
          <Button type="button" variant="primary" onClick={onClose}>
            Đóng
          </Button>
        </div>
      }
    >
      <div>
        {/* Header Profile Summary */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
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
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                Mã TTS: {intern.internCode}
              </span>
            </div>
          </div>

          <span className={`badge ${getBadgeClass(intern.status)}`}>
            {getInternStatusLabel(intern.status)}
          </span>
        </div>

        {/* Profile Info Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: 'var(--border-subtle)',
            borderRadius: '10px',
            fontSize: '0.85rem',
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Email:</span>{' '}
            <strong>{intern.email}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Điện thoại:</span>{' '}
            <strong>{formatPhoneNumber(intern.phone)}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Trường ĐH:</span>{' '}
            <strong>{intern.university}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Chuyên ngành:</span>{' '}
            <strong>{intern.major}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Vị trí ứng tuyển:</span>{' '}
            <strong>{intern.appliedPosition || 'Chưa phân bổ'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Niên khóa:</span>{' '}
            <strong>{intern.academicYear || 'Chưa có'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Giới tính:</span>{' '}
            <strong>{intern.gender === 'MALE' ? 'Nam' : intern.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Địa chỉ:</span>{' '}
            <strong>{intern.address || 'Chưa có'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Ngày bắt đầu:</span>{' '}
            <strong>{intern.startDate || 'Chưa thiết lập'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Ngày kết thúc:</span>{' '}
            <strong>{intern.endDate || 'Chưa thiết lập'}</strong>
          </div>
          {intern.reviewedBy && (
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Người xét duyệt:</span>{' '}
              <strong style={{ color: 'var(--primary)' }}>{intern.reviewedBy}</strong>
            </div>
          )}
          {intern.reviewedAt && (
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Thời điểm duyệt:</span>{' '}
              <strong>{new Date(intern.reviewedAt).toLocaleString('vi-VN')}</strong>
            </div>
          )}
          {intern.rejectionReason && (
            <div style={{ gridColumn: '1 / -1', color: 'var(--danger)', backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
              <strong>Lý do từ chối:</strong> {intern.rejectionReason}
            </div>
          )}
          <div style={{ gridColumn: '1 / -1' }}>
            <span style={{ color: 'var(--text-muted)' }}>Ghi chú:</span>{' '}
            <em>{intern.notes || 'Không có'}</em>
          </div>
        </div>

        {/* Document Section */}
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
          <span>Danh Sách Hồ Sơ & Tài Liệu Đã Nộp ({internDocs.length})</span>
        </h5>

        {internDocs.length === 0 ? (
          <div
            style={{
              padding: '1.5rem',
              textAlign: 'center',
              backgroundColor: 'var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
            }}
          >
            Thực tập sinh này chưa nộp tài liệu nào lên hệ thống.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {internDocs.map((doc) => (
              <div
                key={doc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-card)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <FileText size={18} color="var(--primary)" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      {doc.originalFileName || doc.fileName}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {doc.documentType} • {formatFileSize(doc.fileSize)} • Trạng thái: {doc.status}
                    </span>
                  </div>
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

      </div>
    </Modal>
  );
};

export default DetailInternModal;
