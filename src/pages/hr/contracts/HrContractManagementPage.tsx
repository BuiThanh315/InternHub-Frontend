import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FileSignature,
  Search,
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  Send,
  PlusCircle,
  Ban,
  MessageSquare,
  RefreshCw,
  FolderGit2,
} from 'lucide-react';
import { toast } from 'sonner';
import { contractService } from '../../../services/contractService';
import type { ContractResponse } from '../../../types';
import { formatCurrency, formatDate, getContractStatusLabel } from '../../../utils/formatters';
import { ContractExtensionModal } from './components/ContractExtensionModal/ContractExtensionModal';
import { TerminateContractModal } from './components/TerminateContractModal/TerminateContractModal';
import styles from './HrContractManagementPage.module.css';

type StatusTab = 'ALL' | 'PENDING' | 'ACTIVE' | 'EXPIRING' | 'FEEDBACK' | 'HISTORY';

export const HrContractManagementPage: React.FC = () => {
  const [contracts, setContracts] = useState<ContractResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<StatusTab>('ALL');

  // Modal states
  const [extensionTarget, setExtensionTarget] = useState<ContractResponse | null>(null);
  const [terminateTarget, setTerminateTarget] = useState<ContractResponse | null>(null);
  const [feedbackViewTarget, setFeedbackViewTarget] = useState<ContractResponse | null>(null);

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await contractService.getAllContracts();
      setContracts(data);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách hợp đồng HR:', err);
      toast.error(err.response?.data?.message || err.message || 'Không thể tải danh sách hợp đồng.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // Bộ lọc thông minh theo Tab và Tìm kiếm
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      // 1. Lọc theo search query (mã HĐ, tên TTS, mã TTS)
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        c.contractNumber?.toLowerCase().includes(query) ||
        c.internFullName?.toLowerCase().includes(query) ||
        c.internCode?.toLowerCase().includes(query) ||
        c.contractTitle?.toLowerCase().includes(query);

      if (!matchSearch) return false;

      // 2. Lọc theo Tab trạng thái
      switch (activeTab) {
        case 'PENDING':
          return c.status === 'PENDING_SIGNATURE';
        case 'FEEDBACK':
          return c.status === 'PENDING_INTERN_FEEDBACK';
        case 'ACTIVE':
          return c.status === 'ACTIVE' || c.status === 'SIGNED';
        case 'EXPIRING':
          return (
            (c.status === 'ACTIVE' || c.status === 'SIGNED') &&
            c.daysRemaining !== null &&
            c.daysRemaining !== undefined &&
            c.daysRemaining >= 0 &&
            c.daysRemaining <= 30
          );
        case 'HISTORY':
          return (
            c.status === 'EXPIRED' ||
            c.status === 'SUPERSEDED' ||
            c.status === 'TERMINATED' ||
            c.status === 'REJECTED_BY_INTERN'
          );
        case 'ALL':
        default:
          return true;
      }
    });
  }, [contracts, searchQuery, activeTab]);

  // Đếm số lượng badge cho các tab
  const counts = useMemo(() => {
    return {
      all: contracts.length,
      pending: contracts.filter((c) => c.status === 'PENDING_SIGNATURE').length,
      feedback: contracts.filter((c) => c.status === 'PENDING_INTERN_FEEDBACK').length,
      active: contracts.filter((c) => c.status === 'ACTIVE' || c.status === 'SIGNED').length,
      expiring: contracts.filter(
        (c) =>
          (c.status === 'ACTIVE' || c.status === 'SIGNED') &&
          c.daysRemaining !== null &&
          c.daysRemaining !== undefined &&
          c.daysRemaining >= 0 &&
          c.daysRemaining <= 30
      ).length,
      history: contracts.filter(
        (c) =>
          c.status === 'EXPIRED' ||
          c.status === 'SUPERSEDED' ||
          c.status === 'TERMINATED' ||
          c.status === 'REJECTED_BY_INTERN'
      ).length,
    };
  }, [contracts]);

  const handleSendReminder = async (contractId: number, internName?: string) => {
    try {
      await contractService.sendReminder(contractId);
      toast.success(`Đã gửi email nhắc nhở ký tới ${internName || 'ứng viên'}!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể gửi email nhắc nhở.');
    }
  };

  const handleContractUpdated = (updated: ContractResponse) => {
    setContracts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleContractCreated = () => {
    fetchContracts();
  };

  const renderStatusBadge = (contract: ContractResponse) => {
    const { status, daysRemaining } = contract;

    // Cảnh báo hết hạn đặc biệt nếu đang active
    if (
      (status === 'ACTIVE' || status === 'SIGNED') &&
      daysRemaining !== null &&
      daysRemaining !== undefined &&
      daysRemaining >= 0 &&
      daysRemaining <= 30
    ) {
      if (daysRemaining <= 15) {
        return (
          <span className={`${styles.badge} ${styles.badgeUrgent}`} title="Hợp đồng hết hạn dưới 15 ngày!">
            <AlertTriangle size={12} className={styles.pulseIcon} />
            Hết hạn sau {daysRemaining} ngày
          </span>
        );
      }
      return (
        <span className={`${styles.badge} ${styles.badgeExpiring}`} title="Hợp đồng sắp hết hạn trong 30 ngày">
          <Clock size={12} />
          Còn {daysRemaining} ngày
        </span>
      );
    }

    switch (status) {
      case 'ACTIVE':
      case 'SIGNED':
        return (
          <span className={`${styles.badge} ${styles.badgeActive}`}>
            <CheckCircle2 size={12} />
            {getContractStatusLabel(status)}
          </span>
        );
      case 'PENDING_SIGNATURE':
        return (
          <span className={`${styles.badge} ${styles.badgePending}`}>
            <Clock size={12} />
            Chờ TTS ký
          </span>
        );
      case 'PENDING_INTERN_FEEDBACK':
        return (
          <span className={`${styles.badge} ${styles.badgeFeedback}`}>
            <MessageSquare size={12} />
            TTS có thắc mắc
          </span>
        );
      case 'SUPERSEDED':
        return (
          <span className={`${styles.badge} ${styles.badgeSuperseded}`}>
            <FolderGit2 size={12} />
            Đã gia hạn
          </span>
        );
      case 'TERMINATED':
        return (
          <span className={`${styles.badge} ${styles.badgeTerminated}`}>
            <Ban size={12} />
            Đã chấm dứt
          </span>
        );
      case 'EXPIRED':
        return (
          <span className={`${styles.badge} ${styles.badgeExpired}`}>
            <Clock size={12} />
            Đã hết hạn
          </span>
        );
      case 'REJECTED_BY_INTERN':
        return (
          <span className={`${styles.badge} ${styles.badgeTerminated}`}>
            <AlertCircle size={12} />
            Từ chối tiếp nhận
          </span>
        );
      default:
        return <span className={styles.badge}>{getContractStatusLabel(status)}</span>;
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* 1. Header & Quick Metrics */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.titleIconWrapper}>
            <FileSignature size={24} />
          </div>
          <div>
            <h1 className={styles.pageTitle}>Quản Lý Hợp Đồng Thực Tập</h1>
            <p className={styles.pageSubtitle}>
              Trung tâm giám sát, lưu trữ S3, tự động hóa nhắc ký và gia hạn phụ lục hợp đồng toàn công ty.
            </p>
          </div>
        </div>
        <button
          type="button"
          className={styles.refreshBtn}
          onClick={fetchContracts}
          disabled={loading}
          title="Tải lại dữ liệu"
        >
          <RefreshCw size={16} className={loading ? styles.spinning : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* 2. Status Navigation Tabs */}
      <div className={styles.tabsWrapper}>
        <div className={styles.tabsList}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'ALL' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('ALL')}
          >
            Tất Cả <span className={styles.tabCount}>{counts.all}</span>
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'PENDING' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('PENDING')}
          >
            Chờ Ký <span className={`${styles.tabCount} ${counts.pending > 0 ? styles.countPending : ''}`}>{counts.pending}</span>
          </button>
          {counts.feedback > 0 && (
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'FEEDBACK' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('FEEDBACK')}
            >
              Thắc Mắc <span className={`${styles.tabCount} ${styles.countFeedback}`}>{counts.feedback}</span>
            </button>
          )}
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'ACTIVE' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('ACTIVE')}
          >
            Đang Hiệu Lực <span className={styles.tabCount}>{counts.active}</span>
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'EXPIRING' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('EXPIRING')}
          >
            Sắp Hết Hạn (&le;30d) <span className={`${styles.tabCount} ${counts.expiring > 0 ? styles.countExpiring : ''}`}>{counts.expiring}</span>
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'HISTORY' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('HISTORY')}
          >
            Lịch Sử & Phụ Lục <span className={styles.tabCount}>{counts.history}</span>
          </button>
        </div>
      </div>

      {/* 3. Search & Control Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm theo mã hợp đồng, tên thực tập sinh, mã intern..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className={styles.clearSearchBtn} onClick={() => setSearchQuery('')}>
              ×
            </button>
          )}
        </div>
      </div>

      {/* 4. Table / Content Area */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <RefreshCw size={28} className={styles.spinning} />
            <p>Đang tải danh sách hợp đồng từ Object Storage S3...</p>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className={styles.emptyContainer}>
            <FileSignature size={40} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>Không tìm thấy hợp đồng nào</p>
            <p className={styles.emptyDesc}>
              {searchQuery
                ? 'Thử điều chỉnh lại từ khóa tìm kiếm hoặc chọn tab trạng thái khác.'
                : 'Hiện tại chưa có dữ liệu hợp đồng cho bộ lọc này.'}
            </p>
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Số HĐ & Loại</th>
                  <th className={styles.th}>Thực Tập Sinh</th>
                  <th className={styles.th}>Thời Gian Thực Tập</th>
                  <th className={styles.th}>Phụ Cấp</th>
                  <th className={styles.th}>Trạng Thái</th>
                  <th className={styles.th} style={{ textAlign: 'center' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((contract) => (
                  <tr key={contract.id} className={styles.tr}>
                    <td className={styles.td}>
                      <div className={styles.contractCodeWrap}>
                        <span className={styles.contractNumber}>{contract.contractNumber}</span>
                        <div className={styles.typeBadgeRow}>
                          {contract.contractType === 'EXTENSION_APPENDIX' ? (
                            <span className={styles.appendixTag} title={`Phụ lục nối tiếp HĐ: ${contract.parentContractNumber || 'Gốc'}`}>
                              Phụ lục gia hạn
                            </span>
                          ) : (
                            <span className={styles.officialTag}>HĐ Chính thức</span>
                          )}
                        </div>
                        <span className={styles.contractTitle}>{contract.contractTitle}</span>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.internInfo}>
                        <strong className={styles.internName}>{contract.internFullName || 'Chưa cập nhật'}</strong>
                        <span className={styles.internCode}>Mã: {contract.internCode}</span>
                        {contract.internEmail && <span className={styles.internEmail}>{contract.internEmail}</span>}
                      </div>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.dateBlock}>
                        <span>{formatDate(contract.startDate)}</span>
                        <span className={styles.dateArrow}>&rarr;</span>
                        <span>{formatDate(contract.endDate)}</span>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.allowance}>
                        {contract.allowanceAmount ? formatCurrency(contract.allowanceAmount) : '—'}
                      </span>
                    </td>
                    <td className={styles.td}>
                      {renderStatusBadge(contract)}
                      {contract.status === 'PENDING_INTERN_FEEDBACK' && contract.feedbackNotes && (
                        <div
                          className={styles.feedbackSnippet}
                          onClick={() => setFeedbackViewTarget(contract)}
                          title="Bấm để xem đầy đủ phản hồi thắc mắc của TTS"
                        >
                          "{contract.feedbackNotes.slice(0, 45)}..."
                        </div>
                      )}
                    </td>
                    <td className={styles.td}>
                      <div className={styles.actions}>
                        {/* Xem trước trực tiếp trên S3 */}
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => contractService.previewContractFile(contract.id)}
                          title="Xem trước văn bản PDF (Direct S3 Presigned URL)"
                        >
                          <ExternalLink size={16} />
                        </button>

                        {/* Tải về máy */}
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => contractService.downloadContractFile(contract.id, contract.originalFileName)}
                          title="Tải tệp hợp đồng về máy"
                        >
                          <Download size={16} />
                        </button>

                        {/* Nhắc nhở ký qua email */}
                        {(contract.status === 'PENDING_SIGNATURE' || contract.status === 'PENDING_INTERN_FEEDBACK') && (
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.remindBtn}`}
                            onClick={() => handleSendReminder(contract.id, contract.internFullName)}
                            title="Gửi email nhắc nhở thực tập sinh ký hợp đồng"
                          >
                            <Send size={15} />
                          </button>
                        )}

                        {/* Gia hạn hợp đồng (Tạo phụ lục) */}
                        {(contract.status === 'ACTIVE' || contract.status === 'SIGNED' || contract.status === 'EXPIRED') && (
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.extendBtn}`}
                            onClick={() => setExtensionTarget(contract)}
                            title="Tạo phụ lục gia hạn thời gian thực tập"
                          >
                            <PlusCircle size={15} />
                          </button>
                        )}

                        {/* Chấm dứt trước hạn */}
                        {contract.status === 'ACTIVE' && (
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.terminateBtn}`}
                            onClick={() => setTerminateTarget(contract)}
                            title="Chấm dứt hợp đồng trước hạn (Bảo toàn lịch sử pháp lý)"
                          >
                            <Ban size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Gia hạn Hợp đồng */}
      <ContractExtensionModal
        parentContract={extensionTarget}
        isOpen={Boolean(extensionTarget)}
        onClose={() => setExtensionTarget(null)}
        onSuccess={handleContractCreated}
      />

      {/* Modal Chấm dứt Hợp đồng */}
      <TerminateContractModal
        contract={terminateTarget}
        isOpen={Boolean(terminateTarget)}
        onClose={() => setTerminateTarget(null)}
        onSuccess={handleContractUpdated}
      />

      {/* Drawer xem chi tiết phản hồi thắc mắc */}
      {feedbackViewTarget && (
        <div className={styles.feedbackDrawerOverlay} onClick={() => setFeedbackViewTarget(null)}>
          <div className={styles.feedbackDrawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={18} className={styles.feedbackIcon} />
                <h3 className={styles.drawerTitle}>Thắc Mắc Hợp Đồng Của Thực Tập Sinh</h3>
              </div>
              <button type="button" className={styles.closeDrawerBtn} onClick={() => setFeedbackViewTarget(null)}>
                ×
              </button>
            </div>
            <div className={styles.drawerBody}>
              <div className={styles.drawerMeta}>
                <p>Thực tập sinh: <strong>{feedbackViewTarget.internFullName}</strong> ({feedbackViewTarget.internCode})</p>
                <p>Hợp đồng: <strong>{feedbackViewTarget.contractNumber}</strong></p>
              </div>
              <div className={styles.drawerContentBox}>
                <label className={styles.contentLabel}>Nội dung phản hồi:</label>
                <p className={styles.feedbackContentText}>{feedbackViewTarget.feedbackNotes}</p>
              </div>
              <div className={styles.drawerActions}>
                <button
                  type="button"
                  className={styles.closeBtnSmall}
                  onClick={() => setFeedbackViewTarget(null)}
                >
                  Đóng
                </button>
                <button
                  type="button"
                  className={styles.previewBtnSmall}
                  onClick={() => {
                    contractService.previewContractFile(feedbackViewTarget.id);
                  }}
                >
                  <ExternalLink size={14} />
                  Xem Bản Scan Hiện Tại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HrContractManagementPage;
