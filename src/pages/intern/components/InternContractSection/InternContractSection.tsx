import React, { useState, useEffect, useCallback } from 'react';
import {
  FileSignature,
  FileText,
  ExternalLink,
  Download,
  RotateCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Eye,
  HelpCircle,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { Skeleton } from '../../../../components/common';
import { contractService, dynamicContractService } from '../../../../services/contractService';
import type { ContractResponse } from '../../../../types';
import type { InternContractSectionProps } from './InternContractSection.types';
import { ConfirmContractModal } from '../ConfirmContractModal';
import { RejectContractModal } from '../RejectContractModal';
import { ViewContractDetailModal } from '../ViewContractDetailModal';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getContractStatusLabel,
} from '../../../../utils/formatters';
import { ContractInquiryModal } from '../ContractInquiryModal/ContractInquiryModal';
import { ROUTES } from '../../../../constants/routes';

import styles from './InternContractSection.module.css';

interface ModalState {
  type: 'SIGN' | 'REJECT' | 'DETAIL' | 'INQUIRY' | null;
  contract: ContractResponse | null;
}

export const InternContractSection: React.FC<InternContractSectionProps> = ({
  onContractUpdated,
  internName = '',
}) => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<ContractResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>({ type: null, contract: null });

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      // Bước 1: Gọi song song cả hợp đồng file truyền thống và hợp đồng động mới (Studio)
      const [legacyResult, dynamicResult] = await Promise.allSettled([
        contractService.getMyContracts(),
        dynamicContractService.getMyContract(),
      ]);

      const legacyContracts: ContractResponse[] =
        legacyResult.status === 'fulfilled' ? legacyResult.value || [] : [];

      let mergedContracts = [...legacyContracts];

      if (dynamicResult.status === 'fulfilled' && dynamicResult.value) {
        const dc = dynamicResult.value;

        // Map trạng thái hợp đồng động sang ContractStatus hiển thị phía Intern
        // SENT, INTERN_CONFIRMED, READY_TO_SEND -> PENDING_SIGNATURE (để TTS thấy nút Ký Ngay)
        // SIGNED, ACTIVE, WAITING_EFFECTIVE_DATE -> SIGNED
        let mappedStatus: any = 'PENDING_SIGNATURE';
        const dynamicStatus = dc.status as string;
        if (dynamicStatus === 'SIGNED' || dynamicStatus === 'ACTIVE' || dynamicStatus === 'WAITING_EFFECTIVE_DATE') {
          mappedStatus = 'SIGNED';
        } else if (dynamicStatus === 'EXPIRED') {
          mappedStatus = 'EXPIRED';
        } else if (dynamicStatus === 'WITHDRAWN') {
          mappedStatus = 'TERMINATED';
        } else {
          mappedStatus = 'PENDING_SIGNATURE';
        }

        const startDate =
          dc.effectiveFrom ||
          dc.currentRevision?.variablesPayload?.startDate ||
          new Date().toISOString().split('T')[0];

        const endDate =
          dc.effectiveTo ||
          dc.currentRevision?.variablesPayload?.endDate ||
          new Date().toISOString().split('T')[0];

        const allowanceAmount =
          dc.allowanceAmount ??
          dc.currentRevision?.variablesPayload?.allowanceAmount ??
          3000000;

        const dynamicMapped: ContractResponse = {
          id: dc.id,
          contractNumber: dc.contractNumber,
          contractTitle: 'Hợp Đồng Tiếp Nhận Thực Tập Sinh',
          internCode: dc.internCode || `INTERN-${dc.internId}`,
          internFullName: dc.internFullName,
          startDate,
          endDate,
          allowanceAmount,
          status: mappedStatus,
          originalFileName: `${dc.contractNumber}.html`,
          fileSize: 1024,
          uploadedBy: dc.createdBy || 'Phòng Nhân Sự (HR)',
          createdAt: dc.createdAt || new Date().toISOString(),
          updatedAt: dc.updatedAt,
        };

        // Loại bỏ trùng số hợp đồng nếu có, ưu tiên hợp đồng động mới lên đầu danh sách
        mergedContracts = mergedContracts.filter((c) => c.contractNumber !== dc.contractNumber);
        mergedContracts.unshift(dynamicMapped);
      }

      setContracts(mergedContracts);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách hợp đồng cá nhân:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Không thể tải danh sách hợp đồng thực tập.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // Tìm hợp đồng đầu tiên đang ở trạng thái PENDING_SIGNATURE
  const pendingContract = contracts.find((c) => c.status === 'PENDING_SIGNATURE');

  const handleOpenSign = (contract: ContractResponse) => {
    // Bước 2: Nút "Ký Ngay" hành động thông minh:
    // Nếu là hợp đồng động mới (HTML snapshot / Studio): chuyển thẳng đến InternContractSigningHub (/intern/contract-signing)
    if (contract.originalFileName?.endsWith('.html') || contract.contractNumber.startsWith('HDTT-1')) {
      navigate(ROUTES.INTERN.CONTRACT_SIGNING);
      return;
    }
    // Hợp đồng scan/file truyền thống: mở ConfirmContractModal cũ
    setModalState({ type: 'SIGN', contract });
  };

  const handleOpenReject = (contract: ContractResponse) => {
    setModalState({ type: 'REJECT', contract });
  };

  const handleOpenDetail = (contract: ContractResponse) => {
    setModalState({ type: 'DETAIL', contract });
  };

  const handleOpenInquiry = (contract: ContractResponse) => {
    setModalState({ type: 'INQUIRY', contract });
  };

  const handleCloseModal = () => {
    setModalState({ type: null, contract: null });
  };

  const handleContractSuccess = (updatedContract: ContractResponse) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === updatedContract.id ? updatedContract : c))
    );
    if (onContractUpdated) {
      onContractUpdated();
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'SIGNED':
        return (
          <span className={`${styles.badge} ${styles.badgeSigned}`}>
            <CheckCircle2 size={12} />
            {getContractStatusLabel(status)}
          </span>
        );
      case 'PENDING_SIGNATURE':
        return (
          <span className={`${styles.badge} ${styles.badgePending}`}>
            <Clock size={12} />
            {getContractStatusLabel(status)}
          </span>
        );
      case 'REJECTED_BY_INTERN':
        return (
          <span className={`${styles.badge} ${styles.badgeRejected}`}>
            <AlertOctagon size={12} />
            {getContractStatusLabel(status)}
          </span>
        );
      case 'EXPIRED':
        return (
          <span className={`${styles.badge} ${styles.badgeExpired}`}>
            <Clock size={12} />
            {getContractStatusLabel(status)}
          </span>
        );
      default:
        return (
          <span className={`${styles.badge} ${styles.badgePending}`}>
            {getContractStatusLabel(status)}
          </span>
        );
    }
  };

  return (
    <div className={styles.container}>
      {/* 1. Hero Callout Banner khi có hợp đồng chờ ký */}
      {pendingContract && !loading && (
        <div className={styles.heroBanner}>
          <div className={styles.heroContent}>
            <div className={styles.heroIconWrapper}>
              <FileSignature size={26} />
            </div>
            <div className={styles.heroText}>
              <h3 className={styles.heroTitle}>
                <span>Hợp Đồng Tiếp Nhận Thực Tập Đang Chờ Ký</span>
                <span className={styles.pendingPill}>Cần xử lý</span>
              </h3>
              <p className={styles.heroDesc}>
                Phòng Nhân sự đã phát hành hợp đồng <strong>{pendingContract.contractNumber}</strong> (Thời hạn:{' '}
                {formatDate(pendingContract.startDate)} — {formatDate(pendingContract.endDate)}). Vui lòng
                kiểm tra điều khoản và hoàn tất ký điện tử để chính thức bắt đầu kỳ thực tập.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => handleOpenInquiry(pendingContract)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 0.9rem',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#475569',
                fontWeight: 500,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
              title="Có thắc mắc về điều khoản hoặc bản scan mờ? Liên hệ HR ngay"
            >
              <HelpCircle size={16} />
              <span>Có thắc mắc, liên hệ HR</span>
            </button>
            <button
              type="button"
              className={styles.heroCtaBtn}
              onClick={() => handleOpenSign(pendingContract)}
            >
              <FileSignature size={18} />
              <span>Xem & Ký Hợp Đồng Ngay</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Card danh sách hợp đồng */}
      <div className={styles.mainCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerTitleWrapper}>
            <FileText size={20} style={{ color: 'var(--primary)' }} />
            <h3 className={styles.cardTitle}>Hợp Đồng Thực Tập & Ký Kết Pháp Lý</h3>
            <span className={styles.cardCount}>{contracts.length} văn bản</span>
          </div>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={fetchContracts}
            disabled={loading}
            title="Làm mới danh sách hợp đồng"
          >
            <RotateCw size={14} className={loading ? styles.spinner : ''} />
            <span>Làm mới</span>
          </button>
        </div>

        {/* Loading Shimmer */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem 0' }}>
            <Skeleton variant="rectangular" height="48px" />
            <Skeleton variant="rectangular" height="48px" />
          </div>
        ) : errorMessage ? (
          /* Error State kèm Retry Action */
          <div className={styles.errorState}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
            <button type="button" className={styles.retryBtn} onClick={fetchContracts}>
              Thử lại
            </button>
          </div>
        ) : contracts.length === 0 ? (
          /* Empty State có hướng dẫn rõ ràng */
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrapper}>
              <FileSignature size={28} />
            </div>
            <h4 className={styles.emptyTitle}>Chưa Có Hợp Đồng Thực Tập Nào</h4>
            <p className={styles.emptyDesc}>
              Sau khi hồ sơ ứng tuyển của bạn được phòng Nhân sự phê duyệt, văn bản hợp đồng tiếp nhận
              sẽ được ban hành tại đây để bạn xem trước và ký xác nhận điện tử.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Số HĐ & Tiêu Đề</th>
                    <th className={styles.th}>Thời Gian Thực Tập</th>
                    <th className={styles.th}>Mức Phụ Cấp</th>
                    <th className={styles.th}>Trạng Thái</th>
                    <th className={styles.th}>Ngày Phát Hành</th>
                    <th className={styles.th} style={{ textAlign: 'center' }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((contract) => (
                    <tr key={contract.id} className={styles.tr}>
                      <td className={styles.td}>
                        <div className={styles.contractMeta}>
                          <span className={styles.contractNumber}>
                            {contract.contractNumber || 'Hệ thống tự cấp'}
                          </span>
                          <span className={styles.contractTitle}>{contract.contractTitle}</span>
                        </div>
                      </td>
                      <td className={styles.td}>
                        <span className={styles.dateRange}>
                          {formatDate(contract.startDate)} — {formatDate(contract.endDate)}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <span className={styles.allowance}>
                          {contract.allowanceAmount
                            ? formatCurrency(contract.allowanceAmount)
                            : 'Không có phụ cấp'}
                        </span>
                      </td>
                      <td className={styles.td}>{renderStatusBadge(contract.status)}</td>
                      <td className={styles.td}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {formatDateTime(contract.createdAt)}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <div className={styles.actionGroup} style={{ justifyContent: 'center' }}>
                          <button
                            type="button"
                            className={styles.iconBtn}
                            onClick={() => {
                              if (contract.originalFileName?.endsWith('.html')) {
                                navigate(ROUTES.INTERN.CONTRACT_SIGNING);
                              } else {
                                contractService.previewContractFile(contract.id);
                              }
                            }}
                            title="Xem trước văn bản hợp đồng"
                          >
                            <ExternalLink size={15} />
                          </button>
                          <button
                            type="button"
                            className={styles.iconBtn}
                            onClick={() => {
                              if (contract.originalFileName?.endsWith('.html')) {
                                navigate(ROUTES.INTERN.CONTRACT_SIGNING);
                              } else {
                                contractService.downloadContractFile(
                                  contract.id,
                                  contract.originalFileName
                                );
                              }
                            }}
                            title="Tải văn bản hợp đồng về máy"
                          >
                            <Download size={15} />
                          </button>
                          <button
                            type="button"
                            className={styles.iconBtn}
                            onClick={() => handleOpenDetail(contract)}
                            title="Xem chi tiết & lịch sử ký kết"
                          >
                            <Eye size={15} />
                          </button>
                          {contract.status === 'PENDING_SIGNATURE' && (
                            <>
                              <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={() => handleOpenInquiry(contract)}
                                title="Có thắc mắc hoặc bản scan mờ? Gửi phản hồi tới HR"
                                style={{ color: '#d97706' }}
                              >
                                <HelpCircle size={15} />
                              </button>
                              <button
                                type="button"
                                className={styles.signActionBtn}
                                onClick={() => handleOpenSign(contract)}
                                title="Ký xác nhận hợp đồng này ngay"
                              >
                                <FileSignature size={14} />
                                <span>Ký Ngay</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className={styles.mobileCardList}>
              {contracts.map((contract) => (
                <div key={contract.id} className={styles.mobileCard}>
                  <div className={styles.mobileCardHeader}>
                    <div className={styles.contractMeta}>
                      <span className={styles.contractNumber}>{contract.contractNumber}</span>
                      <strong className={styles.contractTitle}>{contract.contractTitle}</strong>
                    </div>
                    {renderStatusBadge(contract.status)}
                  </div>
                  <div className={styles.mobileCardBody}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Thời gian: </span>
                      {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Phụ cấp: </span>
                      <strong style={{ color: 'var(--success)' }}>
                        {contract.allowanceAmount
                          ? formatCurrency(contract.allowanceAmount)
                          : '0 ₫'}
                      </strong>
                    </div>
                  </div>
                  <div className={styles.mobileCardActions}>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => {
                        if (contract.originalFileName?.endsWith('.html')) {
                          navigate(ROUTES.INTERN.CONTRACT_SIGNING);
                        } else {
                          contractService.previewContractFile(contract.id);
                        }
                      }}
                      title="Xem trước file"
                    >
                      <ExternalLink size={15} />
                      <span style={{ fontSize: '0.8rem', marginLeft: '4px' }}>Xem</span>
                    </button>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => {
                        if (contract.originalFileName?.endsWith('.html')) {
                          navigate(ROUTES.INTERN.CONTRACT_SIGNING);
                        } else {
                          contractService.downloadContractFile(
                            contract.id,
                            contract.originalFileName
                          );
                        }
                      }}
                      title="Tải file"
                    >
                      <Download size={15} />
                      <span style={{ fontSize: '0.8rem', marginLeft: '4px' }}>Tải</span>
                    </button>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => handleOpenDetail(contract)}
                      title="Xem chi tiết"
                    >
                      <Eye size={15} />
                      <span style={{ fontSize: '0.8rem', marginLeft: '4px' }}>Chi tiết</span>
                    </button>
                    {contract.status === 'PENDING_SIGNATURE' && (
                      <>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => handleOpenInquiry(contract)}
                          title="Gửi thắc mắc tới HR"
                          style={{ color: '#d97706' }}
                        >
                          <HelpCircle size={15} />
                          <span style={{ fontSize: '0.8rem', marginLeft: '4px' }}>Thắc mắc</span>
                        </button>
                        <button
                          type="button"
                          className={styles.signActionBtn}
                          onClick={() => handleOpenSign(contract)}
                          style={{ marginLeft: 'auto' }}
                        >
                          <FileSignature size={14} />
                          <span>Ký Ngay</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal 1: Xác nhận ký hợp đồng */}
      <ConfirmContractModal
        contract={modalState.type === 'SIGN' ? modalState.contract : null}
        isOpen={modalState.type === 'SIGN'}
        onClose={handleCloseModal}
        onSuccess={handleContractSuccess}
        onOpenReject={handleOpenReject}
        defaultSignerName={internName}
      />

      {/* Modal 2: Từ chối hợp đồng nguy hiểm */}
      <RejectContractModal
        contract={modalState.type === 'REJECT' ? modalState.contract : null}
        isOpen={modalState.type === 'REJECT'}
        onClose={handleCloseModal}
        onSuccess={handleContractSuccess}
      />

      {/* Modal 3: Xem chi tiết hợp đồng */}
      <ViewContractDetailModal
        contract={modalState.type === 'DETAIL' ? modalState.contract : null}
        isOpen={modalState.type === 'DETAIL'}
        onClose={handleCloseModal}
        onSignContract={handleOpenSign}
      />

      {/* Modal 4: Gửi thắc mắc phản hồi tới HR */}
      {modalState.contract && (
        <ContractInquiryModal
          contract={modalState.contract}
          isOpen={modalState.type === 'INQUIRY'}
          onClose={handleCloseModal}
          onSuccess={handleContractSuccess}
        />
      )}
    </div>
  );
};

export default InternContractSection;
