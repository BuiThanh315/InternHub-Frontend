import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

import { Modal } from '../../../components/common/Modal/Modal';
import { Button } from '../../../components/common/Button/Button';
import { formatDateTime } from '../../../utils/formatters';
import type { AuditLogDetail } from '../../../types';
import styles from './AdminAuditDetailModal.module.css';

interface AdminAuditDetailModalProps {
  logDetail: AuditLogDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminAuditDetailModal: React.FC<AdminAuditDetailModalProps> = ({
  logDetail,
  isOpen,
  onClose,
}) => {
  if (!logDetail) return null;

  const formattedPayload = (() => {
    if (!logDetail.requestPayload) return 'Không có dữ liệu payload cho yêu cầu này.';
    try {
      return JSON.stringify(JSON.parse(logDetail.requestPayload), null, 2);
    } catch {
      return logDetail.requestPayload;
    }
  })();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chi Tiết Nhật Ký Hoạt Động #${logDetail.id}`}
      size="lg"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      {/* Metadata Grid */}
      <div className={styles.metaGrid}>
        <div>
          <span className={styles.metaLabel}>Thời gian thực hiện:</span>
          <p className={styles.metaValue}>{formatDateTime(logDetail.createdAt)}</p>
        </div>
        <div>
          <span className={styles.metaLabel}>Người thực hiện:</span>
          <p className={styles.metaValue}>
            {logDetail.username} ({logDetail.userRole || 'UNKNOWN'})
          </p>
        </div>
        <div>
          <span className={styles.metaLabel}>Phân hệ & Hành động:</span>
          <p className={styles.metaValue}>
            [{logDetail.module}] {logDetail.action}
          </p>
        </div>
        <div>
          <span className={styles.metaLabel}>Trạng thái:</span>
          <p style={{ margin: '2px 0 0 0' }}>
            {logDetail.status === 'SUCCESS' ? (
              <span className="badge badge-success">
                <CheckCircle2 size={12} /> Thành Công
              </span>
            ) : (
              <span className="badge badge-danger">
                <AlertCircle size={12} /> Thất Bại
              </span>
            )}
          </p>
        </div>
        <div>
          <span className={styles.metaLabel}>Endpoint & Phương thức:</span>
          <p className={styles.monoValue}>
            {logDetail.httpMethod} {logDetail.endpoint}
          </p>
        </div>
        <div>
          <span className={styles.metaLabel}>Địa chỉ IP máy trạm:</span>
          <p className={styles.monoValue}>{logDetail.clientIp || '127.0.0.1'}</p>
        </div>
        <div>
          <span className={styles.metaLabel}>Thời gian xử lý:</span>
          <p style={{ margin: '2px 0 0 0' }}>{logDetail.executionTimeMs ?? 0} ms</p>
        </div>
      </div>

      {/* Description */}
      <div className={styles.sectionBlock}>
        <span className={styles.sectionLabel}>Mô tả hành vi:</span>
        <p className={styles.descText}>{logDetail.description}</p>
      </div>

      {/* User Agent */}
      {logDetail.userAgent && (
        <div className={styles.sectionBlock}>
          <span className={styles.sectionLabel}>Thiết bị / Trình duyệt:</span>
          <p className={styles.codeBox}>{logDetail.userAgent}</p>
        </div>
      )}

      {/* Error Message if failed */}
      {logDetail.errorMessage && (
        <div className={styles.sectionBlock}>
          <span className={styles.errorLabel}>Chi tiết lỗi:</span>
          <pre className={styles.errorBox}>{logDetail.errorMessage}</pre>
        </div>
      )}

      {/* Request Payload */}
      <div>
        <span className={styles.sectionLabel}>
          Dữ liệu yêu cầu (Request Payload - Đã che mật khẩu):
        </span>
        <pre className={styles.jsonBox}>{formattedPayload}</pre>
      </div>
    </Modal>
  );
};

export default AdminAuditDetailModal;
