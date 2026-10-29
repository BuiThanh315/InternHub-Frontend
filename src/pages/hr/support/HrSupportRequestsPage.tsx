import React, { useState, useEffect, useCallback } from 'react';
import {
  LifeBuoy,
  FileCheck,
  Download,
  UploadCloud,
  FileText,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  supportRequestService,
  type SupportRequestResponse,
  type SupportRequestType,
} from '../../../services/supportRequestService';
import { getSupportRequestStatusLabel } from '../../../utils/formatters';
import { Skeleton } from '../../../components/common/Skeleton';
import styles from './HrSupportRequestsPage.module.css';

const TYPE_LABELS: Record<SupportRequestType, string> = {
  INTERNSHIP_CONFIRMATION: 'Giấy xác nhận thực tập',
  COMPLETION_CERTIFICATE: 'Chứng nhận hoàn thành thực tập',
  RECOMMENDATION_LETTER: 'Thư giới thiệu',
  UNIVERSITY_CONFIRMATION: 'Xác nhận nộp Trường Đại học',
  ALLOWANCE_INQUIRY: 'Phúc khảo / Thắc mắc phụ cấp',
  OTHER: 'Yêu cầu khác',
};

export const HrSupportRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<SupportRequestResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');

  // Modal Respond
  const [respondTarget, setRespondTarget] = useState<SupportRequestResponse | null>(null);
  const [respondStatus, setRespondStatus] = useState<'RESOLVED' | 'REJECTED' | 'PROCESSING'>('RESOLVED');
  const [responseNote, setResponseNote] = useState('');
  const [responseFile, setResponseFile] = useState<File | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await supportRequestService.getAllRequests({
        status: filterStatus || undefined,
        requestType: filterType || undefined,
      });
      setRequests(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error('Không thể tải danh sách ticket: ' + (err.message || 'Lỗi server'));
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterType]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Handle download attachment from intern
  const handleDownloadAttachment = async (req: SupportRequestResponse) => {
    try {
      const blob = await supportRequestService.downloadAttachment(req.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = req.attachmentFilename || req.attachmentFileName || `yeu_cau_${req.id}_dinh_kem`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error('Không thể tải file đính kèm: ' + err.message);
    }
  };

  // Handle download response attachment from HR
  const handleDownloadResponseAttachment = async (req: SupportRequestResponse) => {
    try {
      const blob = await supportRequestService.downloadResponseAttachment(req.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = req.responseFilename || req.responseAttachmentFileName || `ket_qua_${req.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error('Không thể tải file kết quả: ' + err.message);
    }
  };

  // Submit response
  const handleSubmitResponse = async () => {
    if (!respondTarget) return;
    if (!responseNote.trim()) {
      toast.warning('Vui lòng nhập nội dung phản hồi');
      return;
    }
    try {
      await supportRequestService.respondRequest(
        respondTarget.id,
        {
          status: respondStatus,
          hrResponse: responseNote,
        },
        responseFile || undefined
      );
      toast.success('Đã gửi phản hồi và cập nhật trạng thái yêu cầu!');
      setRespondTarget(null);
      setResponseNote('');
      setResponseFile(null);
      fetchRequests();
    } catch (err: any) {
      toast.error('Lỗi phản hồi: ' + (err.message || 'Không thể lưu phản hồi'));
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.titleIconWrapper}>
            <LifeBuoy size={26} />
          </div>
          <div>
            <h1 className={styles.title}>Quản Lý Tiếp Nhận & Hỗ Trợ TTS</h1>
            <p className={styles.subtitle}>
              Tiếp nhận giấy tờ, chứng nhận hoàn thành thực tập, phúc khảo với SLA tối đa 3 ngày
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={styles.select}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xử lý (PENDING)</option>
          <option value="PROCESSING">Đang xử lý (PROCESSING)</option>
          <option value="COMPLETED">Đã giải quyết (COMPLETED)</option>
          <option value="REJECTED">Đã từ chối (REJECTED)</option>
          <option value="CANCELLED">TTS đã hủy (CANCELLED)</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={styles.select}
        >
          <option value="">Tất cả loại yêu cầu</option>
          {Object.entries(TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Thực tập sinh</th>
              <th>Loại yêu cầu</th>
              <th>Tiêu đề / Chi tiết</th>
              <th>File đính kèm</th>
              <th>Hạn xử lý (SLA)</th>
              <th>Trạng thái</th>
              <th>Người xử lý</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td><Skeleton variant="text" width="40px" height="18px" /></td>
                  <td>
                    <Skeleton variant="text" width="130px" height="18px" />
                    <div style={{ marginTop: '4px' }}><Skeleton variant="text" width="90px" height="13px" /></div>
                  </td>
                  <td><Skeleton variant="rectangular" width="110px" height="22px" /></td>
                  <td>
                    <Skeleton variant="text" width="150px" height="18px" />
                    <div style={{ marginTop: '4px' }}><Skeleton variant="text" width="200px" height="14px" /></div>
                  </td>
                  <td><Skeleton variant="text" width="100px" height="16px" /></td>
                  <td><Skeleton variant="text" width="100px" height="16px" /></td>
                  <td><Skeleton variant="rectangular" width="85px" height="24px" /></td>
                  <td><Skeleton variant="text" width="90px" height="16px" /></td>
                  <td><Skeleton variant="rectangular" width="80px" height="30px" /></td>
                </tr>
              ))
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>
                  Không có yêu cầu nào phù hợp bộ lọc.
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id}>
                  <td style={{ fontWeight: 600 }}>#{req.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{req.internFullName || req.internName || `TTS #${req.internUserId}`}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {req.internEmail || (req.internProfileId ? `Hồ sơ #${req.internProfileId}` : `ID: ${req.internUserId}`)}
                    </div>
                  </td>
                  <td>
                    <span className={styles.typeBadge}>{TYPE_LABELS[req.requestType] || req.requestType}</span>
                  </td>
                  <td style={{ maxWidth: '280px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{req.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {req.content}
                    </div>
                  </td>
                  <td>
                    {(req.attachmentFilename || req.attachmentFileName) ? (
                      <button
                        className={styles.fileLinkBtn}
                        onClick={() => handleDownloadAttachment(req)}
                        title="Tải file đính kèm của TTS"
                        aria-label={`Tải file đính kèm yêu cầu #${req.id} của ${req.internFullName || req.internName || req.internUserId}`}
                      >
                        <Download size={13} />
                        <span>Tải file</span>
                      </button>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Không có</span>
                    )}
                  </td>
                  <td>
                    {(req.isOverdueSla || req.isOverdue) ? (
                      <span className={styles.slaOverdue}>Quá hạn SLA</span>
                    ) : (
                      <span className={styles.slaNormal}>
                        {(req.slaDueDate || req.expectedResolutionDate)
                          ? new Date(req.slaDueDate || req.expectedResolutionDate!).toLocaleDateString('vi-VN')
                          : '-'}
                      </span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        req.status === 'PENDING'
                          ? styles.statusPending
                          : req.status === 'PROCESSING'
                          ? styles.statusProcessing
                          : req.status === 'RESOLVED'
                          ? styles.statusCompleted
                          : req.status === 'CANCELLED'
                          ? styles.statusCancelled
                          : styles.statusRejected
                      }`}
                    >
                      {getSupportRequestStatusLabel(req.status)}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: '#334155' }}>{req.handlerName || req.handledBy || '-'}</div>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {req.status !== 'RESOLVED' && req.status !== 'CANCELLED' && req.status !== 'REJECTED' && (
                        <button
                          className={styles.actionBtnPrimary}
                          onClick={() => {
                            setRespondTarget(req);
                            setRespondStatus('RESOLVED');
                            setResponseNote(req.hrResponse || req.responseNote || '');
                          }}
                          title="Xử lý và phản hồi yêu cầu"
                          aria-label={`Xử lý và phản hồi yêu cầu #${req.id} của ${req.internFullName || req.internName || req.internUserId}`}
                        >
                          Xử lý
                        </button>
                      )}
                      {(req.responseFilename || req.responseAttachmentFileName) && (
                        <button
                          className={styles.fileLinkBtn}
                          onClick={() => handleDownloadResponseAttachment(req)}
                          title="Tải file phản hồi đã cấp"
                          aria-label={`Tải file văn bản phản hồi đã cấp cho yêu cầu #${req.id}`}
                        >
                          <FileCheck size={13} />
                          <span>File cấp</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Respond Modal */}
      {respondTarget && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                Phản hồi yêu cầu #{respondTarget.id} - {TYPE_LABELS[respondTarget.requestType]}
              </h3>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Trạng thái xử lý (*)</label>
              <select
                value={respondStatus}
                onChange={(e) => setRespondStatus(e.target.value as any)}
                className={styles.select}
              >
                <option value="PROCESSING">Đang xử lý (PROCESSING)</option>
                <option value="RESOLVED">Đã giải quyết (RESOLVED)</option>
                <option value="REJECTED">Từ chối (REJECTED)</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Ghi chú phản hồi cho TTS (*)</label>
              <textarea
                rows={3}
                placeholder="Nhập hướng dẫn, kết quả hoặc lý do từ chối..."
                value={responseNote}
                onChange={(e) => setResponseNote(e.target.value)}
                className={styles.textarea}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>File kết quả đã ký/đóng dấu (PDF, ảnh scan tối đa 10MB)</label>
              {!responseFile ? (
                <label
                  htmlFor="hr-response-file-upload"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    border: '2px dashed #cbd5e1',
                    borderRadius: '0.75rem',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div
                    style={{
                      padding: '0.5rem',
                      background: '#ffffff',
                      borderRadius: '50%',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      border: '1px solid #e2e8f0',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <UploadCloud size={20} color="#2563eb" />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                    <span style={{ color: '#2563eb', textDecoration: 'underline' }}>Nhấn để chọn tệp kết quả</span> hoặc kéo thả
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    PDF, PNG, JPG, DOC, DOCX (Tối đa 10MB)
                  </span>
                  <input
                    id="hr-response-file-upload"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0];
                      if (selectedFile) {
                        if (selectedFile.size > 10 * 1024 * 1024) {
                          toast.error('File không được vượt quá 10MB');
                          return;
                        }
                        setResponseFile(selectedFile);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                </label>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                    <div
                      style={{
                        padding: '0.4rem',
                        background: '#2563eb',
                        color: '#ffffff',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FileText size={16} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: '#1e293b',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          maxWidth: '260px',
                        }}
                        title={responseFile.name}
                      >
                        {responseFile.name}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {(responseFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResponseFile(null)}
                    title="Gỡ bỏ tệp"
                    style={{
                      padding: '0.35rem',
                      color: '#94a3b8',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.secondaryBtn}
                onClick={() => {
                  setRespondTarget(null);
                  setResponseFile(null);
                }}
              >
                Đóng
              </button>
              <button className={styles.primaryBtn} onClick={handleSubmitResponse}>
                Lưu & Gửi phản hồi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
