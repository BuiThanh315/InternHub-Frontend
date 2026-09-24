import React, { useState, useEffect } from 'react';
import { User, X, FileText, Eye, Download, Edit3, Upload } from 'lucide-react';
import type { InternProfile, DocumentResponse } from '../../../types';
import { Modal, Button } from '../../../components/common';
import { documentService } from '../../../services/documentService';
import { internService } from '../../../services/internService';
import { formatFileSize, formatDateTime } from '../../../utils/formatters';

interface DetailInternModalProps {
  intern: InternProfile | null;
  documents: DocumentResponse[];
  onClose: () => void;
  onOpenEdit: (intern: InternProfile) => void;
  onOpenUpload: (intern: InternProfile) => void;
  onOpenApprove?: (intern: InternProfile) => void;
  onOpenReject?: (intern: InternProfile) => void;
  onUpdateIntern?: (updated: InternProfile) => void;
}

export const DetailInternModal: React.FC<DetailInternModalProps> = ({
  intern,
  documents,
  onClose,
  onOpenEdit,
  onOpenUpload,
  onOpenApprove,
  onOpenReject,
  onUpdateIntern,
}) => {
  if (!intern) return null;

  const [currentEmailStatus, setCurrentEmailStatus] = useState<'PENDING' | 'SENT' | 'FAILED' | null | undefined>(
    intern.emailStatus
  );
  const [currentSentAt, setCurrentSentAt] = useState<string | null | undefined>(intern.emailSentAt);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    setCurrentEmailStatus(intern.emailStatus);
    setCurrentSentAt(intern.emailSentAt);
  }, [intern]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResendEmail = async () => {
    if (isResending || cooldown > 0) return;
    setIsResending(true);
    try {
      const updated = await internService.resendDecisionEmail(intern.id);
      setCurrentEmailStatus(updated.emailStatus || 'PENDING');
      setCurrentSentAt(updated.emailSentAt);
      setCooldown(45); // Cooldown đếm ngược 45 giây
      if (onUpdateIntern) onUpdateIntern(updated);
    } catch (err: any) {
      if (err?.response?.status === 429) {
        const retryAfter = err.response.data?.data?.retryAfter || 45;
        setCooldown(retryAfter);
      }
    } finally {
      setIsResending(false);
    }
  };

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

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
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

            {/* Email Notification Status Meta-Info (TM-12) */}
            {(intern.status === 'APPROVED' || intern.status === 'REJECTED') && (
              <div
                style={{
                  fontSize: '0.72rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color:
                    currentEmailStatus === 'FAILED'
                      ? 'var(--danger, #ef4444)'
                      : 'var(--text-muted, #64748b)',
                  fontWeight: 500,
                }}
              >
                {currentEmailStatus === 'SENT' && (
                  <span>
                    ✓ Đã gửi email thông báo
                    {currentSentAt ? ` · ${formatDateTime(currentSentAt)}` : ''}
                  </span>
                )}

                {currentEmailStatus === 'PENDING' && (
                  <span>⏳ Đang gửi email...</span>
                )}

                {currentEmailStatus === 'FAILED' && (
                  <>
                    <span>✗ Gửi email thất bại</span>
                    {cooldown > 0 ? (
                      <span style={{ color: 'var(--text-muted, #94a3b8)', fontStyle: 'italic' }}>
                        (Gửi lại sau {cooldown}s)
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendEmail}
                        disabled={isResending}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary, #3b82f6)',
                          textDecoration: 'underline',
                          cursor: isResending ? 'not-allowed' : 'pointer',
                          padding: 0,
                          fontSize: '0.72rem',
                          fontWeight: 600,
                        }}
                      >
                        {isResending ? 'Đang gửi...' : 'Gửi lại'}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
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
          <div>Niên khóa: <strong>{intern.academicYear || '-'}</strong></div>
          <div>Ngày bắt đầu: <strong>{intern.startDate || '-'}</strong></div>
          <div>Ngày kết thúc: <strong>{intern.endDate || '-'}</strong></div>
          <div>Giới tính: <strong>{intern.gender || '-'}</strong></div>
          <div>Địa chỉ: <strong>{intern.address || '-'}</strong></div>
          {intern.reviewedBy && (
            <div>
              Người xét duyệt: <strong style={{ color: 'var(--primary)' }}>{intern.reviewedBy}</strong>
            </div>
          )}
          {intern.reviewedAt && (
            <div>
              Thời điểm duyệt: <strong>{new Date(intern.reviewedAt).toLocaleString('vi-VN')}</strong>
            </div>
          )}
          {intern.rejectionReason && (
            <div style={{ gridColumn: '1 / -1', color: 'var(--danger)', backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
              <strong>Lý do từ chối:</strong> {intern.rejectionReason}
            </div>
          )}
          <div style={{ gridColumn: '1 / -1' }}>
            Ghi chú: <em>{intern.notes || 'Không có'}</em>
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
          {intern.status === 'PENDING' && onOpenApprove && onOpenReject && (
            <>
              <button
                type="button"
                onClick={() => onOpenApprove(intern)}
                className="btn btn-primary"
                style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}
              >
                Tiếp Nhận Hồ Sơ
              </button>
              <button
                type="button"
                onClick={() => onOpenReject(intern)}
                className="btn btn-danger"
              >
                Từ Chối Hồ Sơ
              </button>
            </>
          )}
          {intern.status === 'APPROVED' && onOpenReject && (
            <button
              type="button"
              onClick={() => onOpenReject(intern)}
              className="btn btn-danger"
            >
              Hủy Tiếp Nhận
            </button>
          )}
          <button
            type="button"
            onClick={() => onOpenEdit(intern)}
            className="btn btn-secondary"
          >
            <Edit3 size={15} /> Chỉnh Sửa
          </button>
          <button
            type="button"
            onClick={() => onOpenUpload(intern)}
            className="btn btn-secondary"
          >
            <Upload size={15} /> Tải Lên Tệp
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DetailInternModal;
