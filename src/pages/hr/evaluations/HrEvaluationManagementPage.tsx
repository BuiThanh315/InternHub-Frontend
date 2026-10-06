import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  Search,
  Printer,
  CheckCircle,
  Clock,
  FileText,
  AlertCircle,
  Users
} from 'lucide-react';
import { assessmentService } from '../../../services/assessmentService';
import { programService } from '../../../services/programService';
import type { HrEvaluationSummaryItem } from '../../../types/assessment.types';
import type { ProgramDetailResponse } from '../../../types/program.types';
import { ApproveEvaluationModal } from './components/ApproveEvaluationModal';
import { InternshipTranscriptPrintView } from './components/InternshipTranscriptPrintView';
import styles from './HrEvaluationManagementPage.module.css';

type StatusFilterTab = 'ALL' | 'PENDING_HR' | 'APPROVED' | 'INCOMPLETE';

export const HrEvaluationManagementPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<HrEvaluationSummaryItem[]>([]);
  const [programs, setPrograms] = useState<ProgramDetailResponse[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [activeTab, setActiveTab] = useState<StatusFilterTab>('ALL');

  // Multi-select for Safe Bulk Export (Only APPROVED items)
  const [selectedApprovedIds, setSelectedApprovedIds] = useState<number[]>([]);

  // Modal State
  const [selectedInternForApprove, setSelectedInternForApprove] = useState<HrEvaluationSummaryItem | null>(null);
  const [isApproving, setIsApproving] = useState<boolean>(false);

  // Printing state
  const [printItems, setPrintItems] = useState<HrEvaluationSummaryItem[]>([]);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  // Load programs & evaluation data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [evalRes, progRes] = await Promise.all([
        assessmentService.getHrEvaluationSummary({
          programId: selectedProgramId ? Number(selectedProgramId) : undefined
        }),
        programService.getPrograms({ size: 100 })
      ]);

      setData(evalRes || []);
      setPrograms(progRes.items || []);
    } catch (err) {
      console.error('Failed to load HR evaluation summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setSelectedApprovedIds([]);
  }, [selectedProgramId]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = data.length;
    const pendingHr = data.filter((d) => d.evaluationStatus === 'SUBMITTED').length;
    const approved = data.filter((d) => d.evaluationStatus === 'APPROVED').length;
    const notReady = data.filter((d) => d.evaluationStatus === 'NOT_STARTED' || d.evaluationStatus === 'DRAFT').length;

    return { total, pendingHr, approved, notReady };
  }, [data]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return data.filter((item) => {
      // Keyword search
      const keyword = searchKeyword.toLowerCase().trim();
      const matchKeyword =
        !keyword ||
        item.internName.toLowerCase().includes(keyword) ||
        item.internCode.toLowerCase().includes(keyword) ||
        (item.university && item.university.toLowerCase().includes(keyword)) ||
        (item.mentorName && item.mentorName.toLowerCase().includes(keyword));

      // Tab filter
      let matchTab = true;
      if (activeTab === 'PENDING_HR') {
        matchTab = item.evaluationStatus === 'SUBMITTED';
      } else if (activeTab === 'APPROVED') {
        matchTab = item.evaluationStatus === 'APPROVED';
      } else if (activeTab === 'INCOMPLETE') {
        matchTab = item.evaluationStatus === 'NOT_STARTED' || item.evaluationStatus === 'DRAFT';
      }

      return matchKeyword && matchTab;
    });
  }, [data, searchKeyword, activeTab]);

  // Bulk Selection Handlers (Restricted to APPROVED items only)
  const approvedInFiltered = useMemo(() => {
    return filteredItems.filter((i) => i.evaluationStatus === 'APPROVED');
  }, [filteredItems]);

  const isAllApprovedSelected =
    approvedInFiltered.length > 0 &&
    approvedInFiltered.every((i) => selectedApprovedIds.includes(i.internId));

  const handleToggleSelectAll = () => {
    if (isAllApprovedSelected) {
      setSelectedApprovedIds([]);
    } else {
      setSelectedApprovedIds(approvedInFiltered.map((i) => i.internId));
    }
  };

  const handleToggleSelectItem = (internId: number) => {
    setSelectedApprovedIds((prev) =>
      prev.includes(internId) ? prev.filter((id) => id !== internId) : [...prev, internId]
    );
  };

  // Trigger Print View
  const handlePrintSingle = (item: HrEvaluationSummaryItem) => {
    setPrintItems([item]);
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 300);
  };

  const handlePrintBulk = () => {
    const selectedRecords = data.filter(
      (i) => selectedApprovedIds.includes(i.internId) && i.evaluationStatus === 'APPROVED'
    );
    if (selectedRecords.length === 0) return;

    setPrintItems(selectedRecords);
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 400);
  };

  // Handle HR Approve API Call
  const handleApproveEvaluation = async (
    internCode: string,
    payload: { hrComments: string; internshipResult: 'PASSED' | 'EXCELLENT' | 'FAILED' }
  ) => {
    try {
      setIsApproving(true);
      await assessmentService.hrApproveEvaluation(internCode, payload);
      setSelectedInternForApprove(null);
      await fetchData();
    } catch (error) {
      console.error('Lỗi khi phê duyệt đánh giá:', error);
      alert('Không thể phê duyệt đánh giá. Vui lòng kiểm tra kết nối mạng hoặc thử lại.');
    } finally {
      setIsApproving(false);
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className={`${styles.badge} ${styles.badgeApproved}`}>
            <CheckCircle size={13} /> Đã Phê Duyệt
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className={`${styles.badge} ${styles.badgeSubmitted}`}>
            <Clock size={13} /> Chờ HR Duyệt
          </span>
        );
      case 'DRAFT':
        return (
          <span className={`${styles.badge} ${styles.badgeDraft}`}>
            <FileText size={13} /> Mentor Đang Soạn
          </span>
        );
      default:
        return (
          <span className={`${styles.badge} ${styles.badgeNotStarted}`}>
            <AlertCircle size={13} /> Chưa Đánh Giá
          </span>
        );
    }
  };

  const renderScore = (score?: number) => {
    if (score == null) return <span style={{ color: '#9ca3af' }}>-</span>;
    let colorClass = styles.scoreLow;
    if (score >= 8.0) colorClass = styles.scoreHigh;
    else if (score >= 6.5) colorClass = styles.scoreMid;

    return <span className={`${styles.scorePill} ${colorClass}`}>{score.toFixed(1)}</span>;
  };

  return (
    <div className={styles.pageContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1>
            <Award className="text-primary" size={28} />
            Đánh Giá Cuối Kỳ &amp; Bảng Điểm Thực Tập
          </h1>
          <p>
            Phê duyệt đánh giá chính thức từng thực tập sinh và xuất phiếu bảng điểm (A4 Transcript) gửi Nhà trường
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => handlePrintBulk()}
            disabled={selectedApprovedIds.length === 0}
            title={
              selectedApprovedIds.length === 0
                ? 'Hãy tích chọn ít nhất 1 hồ sơ Đã Phê Duyệt để xuất PDF'
                : `Xuất PDF cho ${selectedApprovedIds.length} thực tập sinh đã chọn`
            }
          >
            <Printer size={15} />
            Xuất PDF Hàng Loạt ({selectedApprovedIds.length})
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Users size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Tổng Thực Tập Sinh</span>
            <span className={styles.statValue}>{stats.total}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <Clock size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Chờ HR Phê Duyệt</span>
            <span className={styles.statValue} style={{ color: '#0284c7' }}>
              {stats.pendingHr}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Đã Ký Duyệt &amp; Sẵn Sàng Xuất</span>
            <span className={styles.statValue} style={{ color: '#16a34a' }}>
              {stats.approved}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#fef3c7', color: '#d97706' }}>
            <FileText size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Mentor Chưa Hoàn Tất</span>
            <span className={styles.statValue} style={{ color: '#d97706' }}>
              {stats.notReady}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div className={styles.filterCard}>
        <div className={styles.filterRow}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên TTS, mã số, trường học, mentor..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <select
            value={selectedProgramId}
            onChange={(e) => setSelectedProgramId(e.target.value)}
            className={styles.selectInput}
          >
            <option value="">Tất cả chương trình thực tập</option>
            {programs.map((prog) => (
              <option key={prog.id} value={prog.id}>
                {prog.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Tabs */}
        <div className={styles.tabList}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'ALL' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('ALL')}
          >
            Tất cả <span className={styles.tabBadge}>{stats.total}</span>
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'PENDING_HR' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('PENDING_HR')}
          >
            Chờ HR Duyệt <span className={styles.tabBadge}>{stats.pendingHr}</span>
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'APPROVED' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('APPROVED')}
          >
            Đã Phê Duyệt <span className={styles.tabBadge}>{stats.approved}</span>
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'INCOMPLETE' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('INCOMPLETE')}
          >
            Chưa Hoàn Tất <span className={styles.tabBadge}>{stats.notReady}</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Toolbar if items selected */}
      {selectedApprovedIds.length > 0 && (
        <div className={styles.bulkActionBar}>
          <div className={styles.bulkInfo}>
            <CheckCircle size={16} />
            <span>Đã chọn <strong>{selectedApprovedIds.length}</strong> bảng điểm đã duyệt</span>
          </div>
          <div className={styles.bulkButtons}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => setSelectedApprovedIds([])}
            >
              Bỏ chọn
            </button>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handlePrintBulk}
            >
              <Printer size={15} /> Xuất PDF Đã Chọn ({selectedApprovedIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingSpinner}>
            <Clock size={28} className="animate-spin text-primary" />
            <span>Đang tải danh sách đánh giá thực tập...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className={styles.emptyState}>
            <FileText size={48} />
            <h3>Không tìm thấy thực tập sinh nào</h3>
            <p>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc chương trình.</p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isAllApprovedSelected}
                      onChange={handleToggleSelectAll}
                      disabled={approvedInFiltered.length === 0}
                      title="Chọn tất cả hồ sơ ĐÃ PHÊ DUYỆT"
                    />
                  </th>
                  <th>Thực tập sinh</th>
                  <th>Trường học</th>
                  <th>Chương trình / Phòng ban</th>
                  <th>Mentor</th>
                  <th style={{ textAlign: 'center' }}>Điểm CK</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const isApproved = item.evaluationStatus === 'APPROVED';
                  const isSubmitted = item.evaluationStatus === 'SUBMITTED';
                  const isChecked = selectedApprovedIds.includes(item.internId);

                  return (
                    <tr key={item.internId}>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectItem(item.internId)}
                          disabled={!isApproved}
                          title={
                            isApproved
                              ? 'Tích chọn để xuất PDF hàng loạt'
                              : 'Chỉ có thể chọn các hồ sơ ĐÃ PHÊ DUYỆT'
                          }
                        />
                      </td>

                      <td>
                        <div className={styles.internInfoCell}>
                          <span className={styles.internName}>{item.internName}</span>
                          <span className={styles.internCode}>
                            {item.internCode} &bull; {item.appliedPosition || 'Intern'}
                          </span>
                        </div>
                      </td>

                      <td>{item.university || '-'}</td>

                      <td>
                        <div>
                          <strong>{item.programName || '-'}</strong>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {item.departmentName || '-'}
                          </div>
                        </div>
                      </td>

                      <td>{item.mentorName || '-'}</td>

                      <td style={{ textAlign: 'center' }}>
                        {renderScore(item.finalScore)}
                      </td>

                      <td>
                        {renderStatusBadge(item.evaluationStatus)}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div className={styles.actionBtns} style={{ justifyContent: 'flex-end' }}>
                          {isSubmitted && (
                            <button
                              type="button"
                              className={styles.btnPrimary}
                              onClick={() => setSelectedInternForApprove(item)}
                            >
                              <Award size={14} /> Ký Duyệt
                            </button>
                          )}

                          {isApproved && (
                            <>
                              <button
                                type="button"
                                className={styles.btnSecondary}
                                onClick={() => setSelectedInternForApprove(item)}
                                title="Xem lại chi tiết phê duyệt"
                              >
                                Chi tiết
                              </button>
                              <button
                                type="button"
                                className={styles.btnPrimary}
                                style={{ background: '#059669' }}
                                onClick={() => handlePrintSingle(item)}
                                title="In hoặc lưu PDF Bảng điểm A4"
                              >
                                <Printer size={14} /> In Transcript
                              </button>
                            </>
                          )}

                          {!isSubmitted && !isApproved && (
                            <button
                              type="button"
                              className={styles.btnSecondary}
                              onClick={() => setSelectedInternForApprove(item)}
                              title="Xem tiến độ đánh giá"
                            >
                              Xem trước
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Approval & Review */}
      <ApproveEvaluationModal
        isOpen={selectedInternForApprove !== null}
        intern={selectedInternForApprove}
        onClose={() => setSelectedInternForApprove(null)}
        onApprove={handleApproveEvaluation}
        isApproving={isApproving}
      />

      {/* Hidden/Print View for Browser Print Engine */}
      <div className={isPrinting ? 'printableHost' : ''}>
        <InternshipTranscriptPrintView items={printItems} isPrintMode={true} />
      </div>
    </div>
  );
};
