import React, { useEffect, useCallback } from 'react';
import {
  FileText,
  X,
  ExternalLink,
  Download,
  Calendar,
  Building2,
  BadgeDollarSign,
  CheckCircle2,
  AlertOctagon,
  Clock,
  FileSignature,
} from 'lucide-react';

import { contractService } from '../../../../services/contractService';
import type { ViewContractDetailModalProps } from './ViewContractDetailModal.types';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatFileSize,
  getContractStatusLabel,
} from '../../../../utils/formatters';

import styles from './ViewContractDetailModal.module.css';

export const ViewContractDetailModal: React.FC<ViewContractDetailModalProps> = ({
  contract,
  isOpen,
  onClose,
  onSignContract,
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !contract) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getStatusBadge = () => {
    switch (contract.status) {
      case 'SIGNED':
        return (
          <span className={`${styles.badge} ${styles.statusSigned}`}>
            <CheckCircle2 size={13} />
            {getContractStatusLabel(contract.status)}
          </span>
        );
      case 'PENDING_SIGNATURE':
        return (
          <span className={`${styles.badge} ${styles.statusPending}`}>
            <Clock size={13} />
            {getContractStatusLabel(contract.status)}
          </span>
        );
      case 'REJECTED_BY_INTERN':
        return (
          <span className={`${styles.badge} ${styles.statusRejected}`}>
            <AlertOctagon size={13} />
            {getContractStatusLabel(contract.status)}
          </span>
        );
      case 'EXPIRED':
        return (
          <span className={`${styles.badge} ${styles.statusExpired}`}>
            <Clock size={13} />
            {getContractStatusLabel(contract.status)}
          </span>
        );
      default:
        return (
          <span className={`${styles.badge} ${styles.statusPending}`}>
            {getContractStatusLabel(contract.status)}
          </span>
        );
    }
  };

  return (
    <div className={styles.overlay} onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitleWrapper}>
            <div className={styles.iconWrapper}>
              <FileText size={22} />
            </div>
            <div>
              <h2 className={styles.title}>Chi Tiết Hợp Đồng Thực Tập</h2>
              <p className={styles.subtitle}>
                Số hiệu: <strong>{contract.contractNumber || 'Hệ thống tự cấp'}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Đóng modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Trạng thái hợp đồng */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Trạng thái văn bản:</span>
            {getStatusBadge()}
          </div>

          {/* Tóm tắt thông tin hợp đồng */}
          <div className={styles.infoCard}>
            <div className={styles.grid}>
              <div className={styles.item} style={{ gridColumn: '1 / -1' }}>
                <span className={styles.label}>Tên hợp đồng</span>
                <span className={styles.value}>{contract.contractTitle}</span>
              </div>
              <div className={styles.item}>
                <span className={styles.label}>
                  <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  Thời hạn thực tập
                </span>
                <span className={styles.value}>
                  {formatDate(contract.startDate)} — {formatDate(contract.endDate)}
                </span>
              </div>
              <div className={styles.item}>
                <span className={styles.label}>
                  <BadgeDollarSign size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  Mức phụ cấp hàng tháng
                </span>
                <span className={styles.value} style={{ color: 'var(--success)' }}>
                  {contract.allowanceAmount ? formatCurrency(contract.allowanceAmount) : 'Không có phụ cấp'}
                </span>
              </div>
              <div className={styles.item}>
                <span className={styles.label}>
                  <Building2 size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  Phát hành bởi
                </span>
                <span className={styles.value}>{contract.uploadedBy || 'HR Team'}</span>
              </div>
              <div className={styles.item}>
                <span className={styles.label}>Ngày ban hành</span>
                <span className={styles.value}>{formatDateTime(contract.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Nhật ký ký kết điện tử nếu đã ký */}
          {contract.status === 'SIGNED' && (
            <div className={styles.signatureBox}>
              <div className={styles.signatureHeader}>
                <CheckCircle2 size={18} />
                <span>Nhật Ký Xác Nhận Ký Điện Tử Hợp Lệ</span>
              </div>
              <div className={styles.signatureDetails}>
                <div>
                  Người ký cam kết: <strong>{contract.signerFullName || contract.internFullName || 'Thực tập sinh'}</strong>
                </div>
                <div>
                  Thời điểm ký: <strong>{formatDateTime(contract.signedAt)}</strong>
                </div>
              </div>
              {contract.internConfirmationNote && (
                <div className={styles.noteText}>
                  "{contract.internConfirmationNote}"
                </div>
              )}
            </div>
          )}

          {/* Nhật ký từ chối nếu bị từ chối */}
          {contract.status === 'REJECTED_BY_INTERN' && contract.rejectionReason && (
            <div className={styles.rejectionBox}>
              <div className={styles.rejectionHeader}>
                <AlertOctagon size={18} />
                <span>Phản Hồi Từ Chối Tiếp Nhận</span>
              </div>
              <div className={styles.rejectionText}>
                "{contract.rejectionReason}"
              </div>
            </div>
          )}

          {/* File văn bản */}
          <div className={styles.fileCard}>
            <div className={styles.fileInfo}>
              <FileText size={24} className={styles.fileIcon} />
              <div className={styles.fileDetails}>
                <span className={styles.fileName}>{contract.originalFileName}</span>
                <span className={styles.fileSize}>{formatFileSize(contract.fileSize)}</span>
              </div>
            </div>
            <div className={styles.fileActions}>
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => contractService.previewContractFile(contract.id)}
                title="Mở xem văn bản hợp đồng trong tab mới"
              >
                <ExternalLink size={14} />
                <span>Xem Trước</span>
              </button>
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => contractService.downloadContractFile(contract.id, contract.originalFileName)}
                title="Tải văn bản hợp đồng về máy tính"
              >
                <Download size={14} />
                <span>Tải Xuống</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            Đóng
          </button>
          {contract.status === 'PENDING_SIGNATURE' && onSignContract && (
            <button
              type="button"
              className={styles.signNowBtn}
              onClick={() => {
                onClose();
                onSignContract(contract);
              }}
            >
              <FileSignature size={16} />
              <span>Xác Nhận Ký Hợp Đồng Ngay</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewContractDetailModal;
