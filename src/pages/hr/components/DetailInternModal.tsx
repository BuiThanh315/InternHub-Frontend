import React, { useState, useEffect } from 'react';
import { User, X, FileText, Eye, Download, Edit3, Upload, CheckCircle, XCircle, History, Clock, UserCheck } from 'lucide-react';
import type { InternProfile, DocumentResponse, MentorAssignmentResponse } from '../../../types';
import { User, X, FileText, Eye, Download, Edit3, Upload, CheckCircle, XCircle, FileSignature, Plus } from 'lucide-react';
import type { InternProfile, DocumentResponse, ContractResponse } from '../../../types';
import { Modal, Button } from '../../../components/common';
import { documentService } from '../../../services/documentService';
import { internService } from '../../../services/internService';
import { contractService } from '../../../services/contractService';
import { formatFileSize, formatDateTime, formatPhoneNumber, formatDate, formatCurrency, getContractStatusLabel } from '../../../utils/formatters';

interface DetailInternModalProps {
  intern: InternProfile | null;
  documents: DocumentResponse[];
  initialTab?: 'profile' | 'history';
  onClose: () => void;
  onOpenEdit: (intern: InternProfile) => void;
  onOpenUpload: (intern: InternProfile) => void;
  onOpenApprove?: (intern: InternProfile) => void;
  onOpenReject?: (intern: InternProfile) => void;
  onOpenContract?: (intern: InternProfile) => void;
  onUpdateIntern?: (updated: InternProfile) => void;
}

interface EmailState {
  status: 'PENDING' | 'SENT' | 'FAILED' | null | undefined;
  sentAt: string | null | undefined;
  isResending: boolean;
  cooldown: number;
}

interface ContractState {
  list: ContractResponse[];
  loading: boolean;
}

export const DetailInternModal: React.FC<DetailInternModalProps> = ({
  intern,
  documents,
  initialTab = 'profile',
  onClose,
  onOpenEdit,
  onOpenUpload,
  onOpenApprove,
  onOpenReject,
  onOpenContract,
  onUpdateIntern,
}) => {
  // State 1: Email notification state gom nhóm
  const [emailState, setEmailState] = useState<EmailState>({
    status: intern?.emailStatus,
    sentAt: intern?.emailSentAt,
    isResending: false,
    cooldown: 0,
  });

  const [activeTab, setActiveTab] = useState<'profile' | 'history'>(initialTab);
  const [mentorHistory, setMentorHistory] = useState<MentorAssignmentResponse[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [currentEmailStatus, setCurrentEmailStatus] = useState<'PENDING' | 'SENT' | 'FAILED' | null | undefined>(
    intern.emailStatus
  );
  const [currentSentAt, setCurrentSentAt] = useState<string | null | undefined>(intern.emailSentAt);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    setActiveTab(initialTab || 'profile');
    setMentorHistory([]);
    setHistoryError(null);
    setCurrentEmailStatus(intern.emailStatus);
    setCurrentSentAt(intern.emailSentAt);
  }, [intern, initialTab]);

  useEffect(() => {
    let isCancelled = false;

    if (activeTab === 'history' && intern?.id) {
      setLoadingHistory(true);
      setHistoryError(null);
      internService
        .getMentorHistory(intern.id)
        .then((data) => {
          if (!isCancelled) {
            setMentorHistory(data);
          }
        })
        .catch((err: any) => {
          if (!isCancelled) {
            setHistoryError(err?.response?.data?.message || 'Không thể tải lịch sử phân công người hướng dẫn');
          }
        })
        .finally(() => {
          if (!isCancelled) {
            setLoadingHistory(false);
          }
        });
    }

    return () => {
      isCancelled = true;
    };
  }, [activeTab, intern?.id]);
  // State 2: Contract state gom nhóm
  const [contractState, setContractState] = useState<ContractState>({
    list: [],
    loading: false,
  });

  useEffect(() => {
    if (intern) {
      setEmailState({
        status: intern.emailStatus,
        sentAt: intern.emailSentAt,
        isResending: false,
        cooldown: 0,
      });

      if (intern.internCode) {
        setContractState((prev) => ({ ...prev, loading: true }));
        contractService
          .getContractsByInternCode(intern.internCode)
          .then((data) => setContractState({ list: data, loading: false }))
          .catch(() => setContractState({ list: [], loading: false }));
      }
    }
  }, [intern]);

  useEffect(() => {
    if (emailState.cooldown <= 0) return;
    const timer = setInterval(() => {
      setEmailState((prev) => ({
        ...prev,
        cooldown: prev.cooldown > 1 ? prev.cooldown - 1 : 0,
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, [emailState.cooldown]);

  if (!intern) return null;

  const handleResendEmail = async () => {
    if (emailState.isResending || emailState.cooldown > 0) return;
    setEmailState((prev) => ({ ...prev, isResending: true }));
    try {
      const updated = await internService.resendDecisionEmail(intern.id);
      setEmailState((prev) => ({
        ...prev,
        status: updated.emailStatus || 'PENDING',
        sentAt: updated.emailSentAt,
        cooldown: 45,
      }));
      if (onUpdateIntern) onUpdateIntern(updated);
    } catch (err: any) {
      if (err?.response?.status === 429) {
        const retryAfter = err.response.data?.data?.retryAfter || 45;
        setEmailState((prev) => ({ ...prev, cooldown: retryAfter }));
      }
    } finally {
      setEmailState((prev) => ({ ...prev, isResending: false }));
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
          {(intern.status === 'APPROVED' || intern.status === 'INTERNING') && onOpenContract && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenContract(intern)}
              leftIcon={<FileSignature size={15} />}
            >
              Tạo Hợp Đồng
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
                    emailState.status === 'FAILED'
                      ? 'var(--danger, #ef4444)'
                      : 'var(--text-muted, #64748b)',
                  fontWeight: 500,
                }}
              >
                {emailState.status === 'SENT' && (
                  <span>
                    ✓ Đã gửi email thông báo
                    {emailState.sentAt ? ` · ${formatDateTime(emailState.sentAt)}` : ''}
                  </span>
                )}

                {emailState.status === 'PENDING' && (
                  <span>⏳ Đang gửi email...</span>
                )}

                {emailState.status === 'FAILED' && (
                  <>
                    <span>✗ Gửi email thất bại</span>
                    {emailState.cooldown > 0 ? (
                      <span style={{ color: 'var(--text-muted, #94a3b8)', fontStyle: 'italic' }}>
                        (Gửi lại sau {emailState.cooldown}s)
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendEmail}
                        disabled={emailState.isResending}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary, #3b82f6)',
                          textDecoration: 'underline',
                          cursor: emailState.isResending ? 'not-allowed' : 'pointer',
                          padding: 0,
                          fontSize: '0.72rem',
                          fontWeight: 600,
                        }}
                      >
                        {emailState.isResending ? 'Đang gửi...' : 'Gửi lại'}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid var(--border-default)',
            marginBottom: '1.25rem',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '0.6rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'profile' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <User size={15} />
            <span>Thông Tin Hồ Sơ & Tài Liệu ({internDocs.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            style={{
              padding: '0.6rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'history' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <History size={15} />
            <span>Lịch Sử Phân Công Mentor</span>
          </button>
        </div>

        {activeTab === 'profile' ? (
          <>
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
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Chương trình:</span>{' '}
                <strong>{intern.programName || 'Chưa tham gia'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Mentor hướng dẫn:</span>{' '}
                <strong style={{ color: intern.mentorName ? 'var(--primary)' : 'var(--warning)' }}>
                  {intern.mentorName ? `${intern.mentorName} (${intern.mentorEmail || 'N/A'})` : 'Chưa phân công'}
                </strong>
              </div>
              {intern.needsMentorReassignment && (
                <div style={{ gridColumn: '1 / -1', color: 'var(--danger)', backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                  <strong>Yêu cầu đổi Mentor:</strong> {intern.mentorReassignmentReason || 'Cần gán mentor mới cho thực tập sinh này'}
                </div>
              )}
              {intern.needsReassignment && (
                <div style={{ gridColumn: '1 / -1', color: 'var(--warning)', backgroundColor: 'rgba(245, 158, 11, 0.08)', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                  <strong>Yêu cầu đổi Chương trình:</strong> {intern.reassignmentReason || 'Cần điều phối chương trình thực tập'}
                </div>
              )}
              {intern.reviewedBy && (
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Người xét duyệt:</span>{' '}
                  <strong style={{ color: 'var(--primary)' }}>{intern.reviewedBy}</strong>
                </div>
              )}
              {intern.reviewedAt && (
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Thời điểm duyệt:</span>{' '}
                  <strong>{formatDateTime(intern.reviewedAt)}</strong>
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
          </>
        ) : (
          /* Tab: Lịch Sử Phân Công Mentor */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loadingHistory ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Clock size={20} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
                <span>Đang tải lịch sử phân công...</span>
              </div>
            ) : historyError ? (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--danger)',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                }}
              >
                {historyError}
              </div>
            ) : mentorHistory.length === 0 ? (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--border-subtle)',
                  borderRadius: '8px',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                }}
              >
                Chưa có lịch sử phân công người hướng dẫn cho thực tập sinh này.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {mentorHistory.map((item, index) => {
                  const isActive = item.status === 'ACTIVE';
                  const isReplaced = item.status === 'REPLACED';

                  return (
                    <div
                      key={item.id || index}
                      style={{
                        padding: '1rem',
                        borderRadius: '10px',
                        border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-default)'}`,
                        backgroundColor: isActive ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-card)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <UserCheck size={18} color={isActive ? '#10b981' : '#64748b'} />
                          <div>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                              {item.mentorName}
                            </strong>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                              ({item.mentorEmail})
                            </span>
                          </div>
                        </div>

                        <span
                          className={`badge ${
                            isActive
                              ? 'badge-success'
                              : isReplaced
                              ? 'badge-info'
                              : 'badge-danger'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          {isActive ? 'ĐANG PHỤ TRÁCH' : isReplaced ? 'ĐÃ THAY THẾ' : 'ĐÃ THU HỒI'}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Người điều phối:</span>{' '}
                          <strong>{item.assignedBy || 'Hệ thống'}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Thời điểm phân công:</span>{' '}
                          <strong>{formatDateTime(item.assignedAt)}</strong>
                        </div>
                        {item.revokedAt && (
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Thời điểm kết thúc:</span>{' '}
                            <strong>{formatDateTime(item.revokedAt)}</strong>
                          </div>
                        )}
                      </div>

                      {item.revocationReason && (
                        <div
                          style={{
                            marginTop: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            backgroundColor: 'rgba(239, 68, 68, 0.06)',
                            borderLeft: '3px solid #ef4444',
                            borderRadius: '4px',
                            fontSize: '0.78rem',
                            color: '#b91c1c',
                          }}
                        >
                          <strong>Lý do thay đổi/thu hồi:</strong> {item.revocationReason}
                        </div>
                      )}

                      {item.notes && (
                        <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          <em>Ghi chú: {item.notes}</em>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Contract Section (TM-13) */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h5
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <FileSignature size={16} color="var(--primary)" />
              <span>Hợp Đồng Thực Tập & Văn Bản Pháp Lý ({contractState.list.length})</span>
            </h5>
            {(intern.status === 'APPROVED' || intern.status === 'INTERNING') && onOpenContract && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onOpenContract(intern)}
                leftIcon={<Plus size={13} />}
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
              >
                Tải Lên Hợp Đồng Mới
              </Button>
            )}
          </div>

          {contractState.loading ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Đang tải danh sách hợp đồng...
            </div>
          ) : contractState.list.length === 0 ? (
            <div
              style={{
                padding: '1.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--border-subtle)',
                borderRadius: '8px',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <div>Thực tập sinh này chưa có hợp đồng nào được lưu trữ trên hệ thống.</div>
              {(intern.status === 'APPROVED' || intern.status === 'INTERNING') && onOpenContract && (
                <button
                  type="button"
                  onClick={() => onOpenContract(intern)}
                  className="btn btn-sm btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', marginTop: '0.25rem' }}
                >
                  <FileSignature size={13} />
                  <span>Tải Lên Hợp Đồng Đầu Tiên</span>
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {contractState.list.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem',
                    border: '1px solid var(--border-default)',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-card)',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '220px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--primary-soft)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <FileSignature size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                        {c.contractTitle}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.15rem' }}>
                        <span>Mã HĐ: <strong style={{ color: 'var(--primary)' }}>{c.contractNumber}</strong></span>
                        <span>•</span>
                        <span>Thời hạn: {formatDate(c.startDate)} - {formatDate(c.endDate)}</span>
                        {c.allowanceAmount !== undefined && c.allowanceAmount !== null && (
                          <>
                            <span>•</span>
                            <span>Phụ cấp: <strong>{formatCurrency(c.allowanceAmount)}</strong></span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span
                      className={`badge ${
                        c.status === 'SIGNED'
                          ? 'badge-success'
                          : c.status === 'PENDING_SIGNATURE'
                          ? 'badge-warning'
                          : c.status === 'TERMINATED'
                          ? 'badge-danger'
                          : 'badge-neutral'
                      }`}
                      style={{ fontSize: '0.75rem' }}
                    >
                      {getContractStatusLabel(c.status)}
                    </span>
                    <button
                      type="button"
                      onClick={() => contractService.previewContractFile(c.id)}
                      className="btn btn-sm btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      title="Xem trước hợp đồng trong tab mới"
                    >
                      <Eye size={12} /> Xem
                    </button>
                    <button
                      type="button"
                      onClick={() => contractService.downloadContractFile(c.id, c.originalFileName)}
                      className="btn btn-sm btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      title="Tải văn bản hợp đồng về máy"
                    >
                      <Download size={12} /> Tải
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DetailInternModal;
