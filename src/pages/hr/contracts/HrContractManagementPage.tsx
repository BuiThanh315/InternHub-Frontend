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
import { contractService, dynamicContractService } from '../../../services/contractService';
import { internService } from '../../../services/internService';
import type { ContractResponse, DynamicContractResponse, InternProfile } from '../../../types';
import { formatCurrency, formatDate, getContractStatusLabel } from '../../../utils/formatters';
import { ContractExtensionModal } from './components/ContractExtensionModal/ContractExtensionModal';
import { TerminateContractModal } from './components/TerminateContractModal/TerminateContractModal';
import { ContractBuilderModal } from './components/ContractBuilderModal/ContractBuilderModal';
import { ContractDocumentViewer } from '../../../components/contract/ContractDocumentViewer';
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

  // Studio Modal state
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedInternForContract, setSelectedInternForContract] = useState<InternProfile | null>(null);
  const [approvedInterns, setApprovedInterns] = useState<InternProfile[]>([]);
  const [previewHtmlTarget, setPreviewHtmlTarget] = useState<{ title: string; contractNumber?: string; html: string } | null>(null);

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      // Gọi song song cả API contracts động mới và hợp đồng upload file S3 cũ
      const [oldDataRes, dynamicDataRes] = await Promise.allSettled([
        contractService.getAllContracts(),
        dynamicContractService.getAllContracts(),
      ]);

      const oldList: ContractResponse[] = oldDataRes.status === 'fulfilled' ? oldDataRes.value : [];
      const dynamicList: DynamicContractResponse[] = dynamicDataRes.status === 'fulfilled' ? dynamicDataRes.value : [];

      // Chuyển đổi DynamicContractResponse sang ContractResponse để hợp nhất bảng hiển thị
      const mappedDynamicList: ContractResponse[] = dynamicList.map((dc) => {
        let mappedStatus: any = 'PENDING_SIGNATURE';
        if (dc.status === 'DRAFT') mappedStatus = 'PENDING_SIGNATURE';
        else if (dc.status === 'SENT' || dc.status === 'READY_TO_SEND') mappedStatus = 'PENDING_SIGNATURE';
        else if (dc.status === 'CHANGES_REQUESTED' || dc.status === 'HR_REVISING') mappedStatus = 'PENDING_INTERN_FEEDBACK';
        else if (dc.status === 'INTERN_CONFIRMED' || dc.status === 'SIGNED' || dc.status === 'ACTIVE') mappedStatus = 'ACTIVE';
        else if (dc.status === 'WITHDRAWN') mappedStatus = 'TERMINATED';
        else if (dc.status === 'EXPIRED') mappedStatus = 'EXPIRED';

        return {
          id: dc.id,
          contractNumber: dc.contractNumber,
          contractTitle: `Hợp đồng thực tập điện tử - ${dc.internFullName}`,
          internCode: dc.internCode || `INT-${dc.internId}`,
          internFullName: dc.internFullName,
          internEmail: dc.internEmail || '',
          startDate: dc.effectiveFrom ? String(dc.effectiveFrom) : '',
          endDate: dc.effectiveTo ? String(dc.effectiveTo) : '',
          allowanceAmount: dc.allowanceAmount !== undefined && dc.allowanceAmount !== null ? Number(dc.allowanceAmount) : null,
          status: mappedStatus,
          originalFileName: `${dc.contractNumber}.html`,
          fileSize: 0,
          uploadedBy: dc.createdBy || 'HR System',
          createdAt: dc.createdAt ? String(dc.createdAt) : new Date().toISOString(),
          notes: dc.snapshotHash ? `SHA-256: ${dc.snapshotHash.slice(0, 16)}...` : undefined,
        };
      });

      // Lọc trùng theo mã hợp đồng contractNumber
      const dynamicNumbers = new Set(mappedDynamicList.map((d) => d.contractNumber));
      const combined = [
        ...mappedDynamicList,
        ...oldList.filter((o) => !dynamicNumbers.has(o.contractNumber)),
      ];

      setContracts(combined);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách hợp đồng HR:', err);
      toast.error(err.response?.data?.message || err.message || 'Không thể tải danh sách hợp đồng.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải danh sách thực tập sinh đủ điều kiện tạo HĐ
  useEffect(() => {
    const loadInterns = async () => {
      try {
        const res = await internService.getInterns({ size: 100 });
        const valid = (res.items || []).filter(
          (i) => i.status === 'APPROVED' || i.status === 'INTERNING'
        );
        setApprovedInterns(valid);
      } catch (err) {
        console.warn('Không thể tải danh sách ứng viên tạo HĐ:', err);
      }
    };
    loadInterns();
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
        <div className={styles.headerRight}>
          <button
            type="button"
            className={styles.createContractBtn}
            onClick={() => {
              if (approvedInterns.length === 0) {
                toast.error('Không tìm thấy thực tập sinh nào đủ điều kiện (APPROVED hoặc INTERNING) để tạo hợp đồng.');
                return;
              }
              setSelectedInternForContract(approvedInterns[0]);
              setIsBuilderOpen(true);
            }}
            title="Soạn thảo hợp đồng điện tử mới cho thực tập sinh"
          >
            <PlusCircle size={16} />
            <span>Tạo Hợp Đồng Mới</span>
          </button>
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
                        {/* Xem trước văn bản (Hỗ trợ cả Dynamic HTML Preview lẫn S3 PDF) */}
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={async () => {
                            if (contract.originalFileName?.endsWith('.html')) {
                              try {
                                const previewData = await dynamicContractService.previewDraft(contract.id);
                                if (previewData?.canonicalHtml) {
                                  setPreviewHtmlTarget({
                                    title: contract.contractTitle || `Hợp đồng thực tập - ${contract.internFullName}`,
                                    contractNumber: contract.contractNumber,
                                    html: previewData.canonicalHtml,
                                  });
                                  return;
                                }
                              } catch (e) {
                                console.warn('Không thể tải preview dynamic HTML:', e);
                              }
                            }
                            contractService.previewContractFile(contract.id);
                          }}
                          title="Xem trước văn bản hợp đồng"
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

      {/* Modal Soạn thảo Hợp đồng Điện tử Động */}
      {isBuilderOpen && selectedInternForContract && (
        <ContractBuilderModal
          isOpen={isBuilderOpen}
          intern={selectedInternForContract}
          onClose={() => {
            setIsBuilderOpen(false);
            setSelectedInternForContract(null);
          }}
          onSuccess={() => {
            setIsBuilderOpen(false);
            setSelectedInternForContract(null);
            fetchContracts();
            toast.success('Hợp đồng điện tử đã được tạo và lưu thành công!');
          }}
        />
      )}

      {/* Modal Xem trước Văn bản HTML Canonical của Hợp đồng Động */}
      {previewHtmlTarget && (
        <div
          className={styles.feedbackDrawerOverlay}
          onClick={() => setPreviewHtmlTarget(null)}
          style={{ zIndex: 1200 }}
        >
          <div
            className={styles.feedbackDrawer}
            onClick={(e) => e.stopPropagation()}
            style={{ width: '850px', maxWidth: '95vw' }}
          >
            <div className={styles.drawerHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileSignature size={18} className={styles.feedbackIcon} />
                <h3 className={styles.drawerTitle}>{previewHtmlTarget.title}</h3>
              </div>
              <button
                type="button"
                className={styles.closeDrawerBtn}
                onClick={() => setPreviewHtmlTarget(null)}
              >
                ×
              </button>
            </div>
            <div className={styles.drawerBody} style={{ padding: '1rem', overflowY: 'auto' }}>
              <ContractDocumentViewer
                canonicalHtml={previewHtmlTarget.html}
                status="ACTIVE"
                contractNumber={previewHtmlTarget.contractNumber || previewHtmlTarget.title}
                revisionNumber={1}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HrContractManagementPage;
