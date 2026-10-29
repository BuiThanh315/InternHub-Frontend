import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  Calculator,
  CheckCheck,
  FileSpreadsheet,
  Unlock,
  History,
  Edit3,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  allowanceService,
  type AllowanceRecord,
  type AllowanceAuditLog,
} from '../../../services/allowanceService';
import { formatCurrency, getAllowanceStatusLabel } from '../../../utils/formatters';
import { Skeleton } from '../../../components/common/Skeleton';
import styles from './HrAllowancePage.module.css';

export const HrAllowancePage: React.FC = () => {
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [records, setRecords] = useState<AllowanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modal adjust
  const [adjustTarget, setAdjustTarget] = useState<AllowanceRecord | null>(null);
  const [bonusInput, setBonusInput] = useState<number>(0);
  const [penaltyInput, setPenaltyInput] = useState<number>(0);
  const [noteInput, setNoteInput] = useState<string>('');

  // Modal unlock
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [unlockReason, setUnlockReason] = useState('');

  // Modal logs
  const [viewLogTarget, setViewLogTarget] = useState<AllowanceRecord | null>(null);
  const [auditLogs, setAuditLogs] = useState<AllowanceAuditLog[]>([]);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await allowanceService.getRecords({ month: selectedMonth });
      setRecords(Array.isArray(data) ? data : []);
      setSelectedIds([]);
    } catch (err: any) {
      toast.error('Không thể tải bảng phụ cấp: ' + (err.message || 'Lỗi server'));
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Handle calculate month preview
  const handleCalculate = async () => {
    try {
      setLoading(true);
      const res = await allowanceService.calculateMonthly(selectedMonth);
      setRecords(res);
      toast.success(`Đã tính toán xong bảng phụ cấp tháng ${selectedMonth}`);
    } catch (err: any) {
      toast.error('Lỗi tính phụ cấp: ' + (err.message || 'Lỗi hệ thống'));
    } finally {
      setLoading(false);
    }
  };

  // Handle batch approve
  const handleBatchApprove = async () => {
    if (selectedIds.length === 0) {
      toast.warning('Vui lòng chọn ít nhất 1 bản ghi để duyệt');
      return;
    }
    try {
      setLoading(true);
      const res = await allowanceService.batchApprove({
        recordIds: selectedIds,
        note: 'Duyệt bảng phụ cấp qua giao diện HR',
      });
      if (res.failedCount === 0) {
        toast.success(`Duyệt thành công tất cả ${res.successCount} bản ghi!`);
      } else {
        toast.warning(
          `Duyệt thành công ${res.successCount}/${res.totalRequested} bản ghi. Có ${res.failedCount} bản ghi bị từ chối.`
        );
      }
      fetchRecords();
    } catch (err: any) {
      toast.error('Duyệt thất bại: ' + (err.message || 'Lỗi hệ thống'));
    } finally {
      setLoading(false);
    }
  };

  // Handle export Excel
  const handleExportExcel = async () => {
    try {
      const blob = await allowanceService.exportExcel(selectedMonth);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bang_Phu_Cap_${selectedMonth}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Đã tải xuống file Excel phụ cấp thành công!');
    } catch (err: any) {
      toast.error('Lỗi xuất Excel: ' + (err.message || 'Chưa có bản ghi hợp lệ'));
    }
  };

  // Open adjust modal
  const openAdjustModal = (rec: AllowanceRecord) => {
    setAdjustTarget(rec);
    setBonusInput(rec.bonusAmount || 0);
    setPenaltyInput(rec.deductionAmount || 0);
    setNoteInput(rec.notes || '');
  };

  const handleSaveAdjust = async () => {
    if (!adjustTarget) return;
    if (!noteInput.trim()) {
      toast.warning('Bắt buộc phải nhập lý do điều chỉnh');
      return;
    }
    try {
      await allowanceService.adjustRecord(adjustTarget.id, {
        actualWorkingDays: adjustTarget.actualWorkingDays || 0,
        paidLeaveDays: adjustTarget.paidLeaveDays || 0,
        bonusAmount: bonusInput,
        deductionAmount: penaltyInput,
        adjustmentReason: noteInput,
        notes: noteInput,
      });
      toast.success('Điều chỉnh phụ cấp thành công!');
      setAdjustTarget(null);
      fetchRecords();
    } catch (err: any) {
      toast.error('Lỗi điều chỉnh: ' + (err.message || 'Không thể cập nhật'));
    }
  };

  // Handle unlock period
  const handleUnlockPeriod = async () => {
    if (!unlockReason.trim()) {
      toast.warning('Bắt buộc phải nhập lý do mở khóa');
      return;
    }
    try {
      await allowanceService.unlockPeriod(selectedMonth, { reason: unlockReason });
      toast.success(`Đã mở khóa kỳ ${selectedMonth} về DRAFT để chỉnh sửa!`);
      setIsUnlockModalOpen(false);
      setUnlockReason('');
      fetchRecords();
    } catch (err: any) {
      toast.error('Không thể mở khóa: ' + (err.message || 'Lỗi phân quyền hoặc trạng thái'));
    }
  };

  // Open audit logs
  const openAuditLogs = async (rec: AllowanceRecord) => {
    setViewLogTarget(rec);
    try {
      const logs = await allowanceService.getAuditLogs(rec.id);
      setAuditLogs(logs);
    } catch (err: any) {
      toast.error('Lỗi lấy lịch sử audit: ' + err.message);
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(records.filter((r) => r.status === 'DRAFT').map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectId = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Summary totals
  const totalGross = records.reduce((sum, r) => sum + (r.baseAllowance || 0), 0);
  const totalNet = records.reduce((sum, r) => sum + (r.actualAmount !== undefined ? r.actualAmount : (r.autoCalculatedAmount || 0)), 0);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.titleIconWrapper}>
            <DollarSign size={26} />
          </div>
          <div>
            <h1 className={styles.title}>Quản Lý Phụ Cấp Thực Tập Sinh</h1>
            <p className={styles.subtitle}>
              Tính toán ngày công hợp chuẩn, điều chỉnh và duyệt chi theo nguyên tắc Maker-Checker
            </p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className={styles.monthPicker}
          />
          <button
            onClick={handleCalculate}
            disabled={loading}
            className={styles.primaryBtn}
            title="Tính toán tự động theo ngày công"
          >
            <Calculator size={16} />
            <span>Tính phụ cấp</span>
          </button>
          <button
            onClick={handleBatchApprove}
            disabled={loading || selectedIds.length === 0}
            className={styles.secondaryBtn}
            title="Duyệt hàng loạt các bản ghi đã chọn"
          >
            <CheckCheck size={16} />
            <span>Duyệt đã chọn ({selectedIds.length})</span>
          </button>
          <button
            onClick={() => setIsUnlockModalOpen(true)}
            className={styles.secondaryBtn}
            title="Mở khóa kỳ APPROVED về DRAFT"
          >
            <Unlock size={16} />
            <span>Mở khóa kỳ</span>
          </button>
          <button
            onClick={handleExportExcel}
            className={styles.secondaryBtn}
            title="Xuất bảng phụ cấp Excel"
          >
            <FileSpreadsheet size={16} />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Tổng số TTS trong kỳ</span>
          <span className={styles.cardValue}>{records.length}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Tổng phụ cấp cơ bản (Gross)</span>
          <span className={styles.cardValue}>{formatCurrency(totalGross)}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Tổng thực lĩnh (Net Amount)</span>
          <span className={`${styles.cardValue} ${styles.cardValueGreen}`}>
            {formatCurrency(totalNet)}
          </span>
        </div>
      </div>

      {/* Table Records */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  checked={
                    selectedIds.length > 0 &&
                    selectedIds.length === records.filter((r) => r.status === 'DRAFT').length
                  }
                  aria-label="Chọn tất cả bản ghi phụ cấp nháp để phê duyệt"
                />
              </th>
              <th>Mã / Tên TTS</th>
              <th>Hợp đồng</th>
              <th>Công chuẩn / Thực tế</th>
              <th>Tiến độ Báo cáo Tuần</th>
              <th>Mức trợ cấp gốc</th>
              <th>Công tính toán</th>
              <th>Thưởng / Khấu trừ</th>
              <th>Truy lĩnh/thu</th>
              <th>Thực lĩnh</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3, 4, 5].map((idx) => (
                <tr key={`allowance-skel-${idx}`}>
                  <td><Skeleton width="18px" height="18px" style={{ borderRadius: '4px' }} /></td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <Skeleton width="130px" height="16px" />
                      <Skeleton width="160px" height="12px" />
                    </div>
                  </td>
                  <td><Skeleton width="80px" height="22px" style={{ borderRadius: '12px' }} /></td>
                  <td><Skeleton width="100px" height="16px" /></td>
                  <td><Skeleton width="100px" height="16px" /></td>
                  <td><Skeleton width="90px" height="16px" /></td>
                  <td><Skeleton width="80px" height="16px" /></td>
                  <td><Skeleton width="80px" height="16px" /></td>
                  <td><Skeleton width="95px" height="18px" /></td>
                  <td><Skeleton width="85px" height="22px" style={{ borderRadius: '12px' }} /></td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                      <Skeleton width="30px" height="30px" style={{ borderRadius: '6px' }} />
                      <Skeleton width="30px" height="30px" style={{ borderRadius: '6px' }} />
                    </div>
                  </td>
                </tr>
              ))
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '2rem' }}>
                  Chưa có dữ liệu phụ cấp cho tháng {selectedMonth}. Hãy bấm "Tính phụ cấp" để khởi tạo.
                </td>
              </tr>
            ) : (
              records.map((rec) => (
                <tr key={rec.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(rec.id)}
                      disabled={rec.status !== 'DRAFT'}
                      onChange={() => toggleSelectId(rec.id)}
                      aria-label={`Chọn phụ cấp của ${rec.internFullName || rec.internEmail || rec.internUserId}`}
                    />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{rec.internFullName || `TTS #${rec.internUserId}`}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{rec.internEmail || `ID: ${rec.internUserId}`}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>
                        {rec.contractNumber || (rec.contractId ? `HĐ #${rec.contractId}` : '-')}
                      </span>
                      {rec.contractStatus && rec.contractStatus !== 'SIGNED' && rec.contractStatus !== 'ACTIVE' ? (
                        <span 
                          style={{ 
                            fontSize: '0.7rem', 
                            padding: '1px 6px', 
                            borderRadius: '4px', 
                            backgroundColor: '#fef3c7', 
                            color: '#92400e', 
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            width: 'fit-content'
                          }}
                          title="Hợp đồng chưa hoàn tất ký số, mức phụ cấp được tạm tính từ hợp đồng dự thảo thực tế"
                        >
                          📋 HĐ chưa ký ({rec.contractStatus})
                        </span>
                      ) : rec.contractStatus === 'SIGNED' || rec.contractStatus === 'ACTIVE' ? (
                        <span 
                          style={{ 
                            fontSize: '0.7rem', 
                            padding: '1px 6px', 
                            borderRadius: '4px', 
                            backgroundColor: '#dcfce7', 
                            color: '#166534', 
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            width: 'fit-content'
                          }}
                        >
                          ✓ Đã ký
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    {rec.actualWorkingDays} / {rec.standardWorkingDays} công
                    {rec.paidLeaveDays ? ` (+${rec.paidLeaveDays} phép)` : ''}
                  </td>
                  <td>
                    {/* Báo cáo tuần liên kết: Kiểm tra tỷ lệ ngày công vs báo cáo */}
                    {rec.actualWorkingDays >= (rec.standardWorkingDays * 0.75) ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800" title="Đã nộp đủ báo cáo tuần theo kỳ">
                        ✓ Đủ điều kiện
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800" title="Cần lưu ý: Số ngày công hoặc tiến độ báo cáo thấp, HR cần kiểm tra trước khi duyệt">
                        ⚠️ Cần rà soát
                      </span>
                    )}
                  </td>
                  <td>{formatCurrency(rec.baseAllowance)}</td>
                  <td>{formatCurrency(rec.autoCalculatedAmount || 0)}</td>
                  <td>
                    <span style={{ color: '#059669' }}>+{formatCurrency(rec.bonusAmount || 0)}</span> /{' '}
                    <span style={{ color: '#dc2626' }}>-{formatCurrency(rec.deductionAmount || 0)}</span>
                  </td>
                  <td>
                    {rec.retroAdjustmentAmount ? (
                      <span style={{ fontWeight: 600, color: rec.retroAdjustmentAmount > 0 ? '#059669' : '#dc2626' }}>
                        {formatCurrency(rec.retroAdjustmentAmount)}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{formatCurrency(rec.actualAmount || 0)}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        rec.status === 'DRAFT'
                          ? styles.badgeDraft
                          : rec.status === 'APPROVED'
                          ? styles.badgeApproved
                          : styles.badgePaid
                      }`}
                    >
                      {getAllowanceStatusLabel(rec.status)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {rec.status === 'DRAFT' && (
                        <button
                          className={styles.actionBtn}
                          onClick={() => openAdjustModal(rec)}
                          title="Điều chỉnh thưởng/phạt"
                          aria-label={`Điều chỉnh thưởng phạt cho ${rec.internFullName || rec.internUserId}`}
                        >
                          <Edit3 size={14} />
                        </button>
                      )}
                      <button
                        className={styles.actionBtn}
                        onClick={() => openAuditLogs(rec)}
                        title="Xem lịch sử thay đổi"
                        aria-label={`Xem lịch sử thay đổi phụ cấp của ${rec.internFullName || rec.internUserId}`}
                      >
                        <History size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Adjust Modal */}
      {adjustTarget && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                Điều chỉnh phụ cấp: {adjustTarget.internFullName || `TTS #${adjustTarget.internUserId}`}
              </h3>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Khoản thưởng thêm (VNĐ)</label>
              <input
                type="number"
                value={bonusInput}
                onChange={(e) => setBonusInput(Number(e.target.value))}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Khoản phạt / trừ (VNĐ)</label>
              <input
                type="number"
                value={penaltyInput}
                onChange={(e) => setPenaltyInput(Number(e.target.value))}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Lý do điều chỉnh (ghi log kiểm toán)</label>
              <input
                type="text"
                placeholder="Nhập lý do thưởng hoặc trừ..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.secondaryBtn} onClick={() => setAdjustTarget(null)}>
                Hủy
              </button>
              <button className={styles.primaryBtn} onClick={handleSaveAdjust}>
                Lưu điều chỉnh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unlock Period Modal */}
      {isUnlockModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Mở khóa kỳ phụ cấp {selectedMonth}</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
              Kỳ ở trạng thái APPROVED sẽ được chuyển về DRAFT để tính toán lại. Bắt buộc nhập lý do mở khóa để ghi vết Audit Log.
            </p>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Lý do mở khóa kỳ (*)</label>
              <textarea
                rows={3}
                placeholder="Ví dụ: Bổ sung ngày công sau phúc khảo đơn xin nghỉ của TTS..."
                value={unlockReason}
                onChange={(e) => setUnlockReason(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.secondaryBtn} onClick={() => setIsUnlockModalOpen(false)}>
                Hủy
              </button>
              <button className={styles.primaryBtn} onClick={handleUnlockPeriod}>
                Xác nhận mở khóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Modal */}
      {viewLogTarget && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: '680px' }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                Lịch sử kiểm toán: TTS #{viewLogTarget.internUserId} ({viewLogTarget.periodMonth})
              </h3>
            </div>
            <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {auditLogs.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b' }}>Chưa có thay đổi nào được ghi nhận</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{log.action}</span>
                      <span>{new Date(log.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      Thực hiện bởi: <b>{log.actorUsername}</b>
                    </div>
                    {log.reason && (
                      <div style={{ fontSize: '0.825rem', color: '#475569', marginTop: '0.2rem' }}>
                        Lý do: <i>{log.reason}</i>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.secondaryBtn} onClick={() => setViewLogTarget(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
