import React, { useState, useRef, useCallback } from 'react';
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Users,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button, Skeleton } from '../../../../../../components/common';
import { programService } from '../../../../../../services/programService';
import { formatFileSize } from '../../../../../../utils/formatters';
import type { ExcelImportPreviewResponse } from '../../../../../../types';
import type { ExcelImportTabProps } from './ExcelImportTab.types';
import styles from './ExcelImportTab.module.css';

interface ImportState {
  file: File | null;
  preview: ExcelImportPreviewResponse | null;
  isDownloadingTemplate: boolean;
  isLoadingPreview: boolean;
  isSubmitting: boolean;
  status: 'APPROVED' | 'PENDING';
  isDragOver: boolean;
}

const INITIAL_STATE: ImportState = {
  file: null,
  preview: null,
  isDownloadingTemplate: false,
  isLoadingPreview: false,
  isSubmitting: false,
  status: 'APPROVED',
  isDragOver: false,
};

const FIELD_LABELS: Record<string, string> = {
  fullName: 'Họ và tên',
  email: 'Email',
  phone: 'Số điện thoại',
  gender: 'Giới tính',
  dateOfBirth: 'Ngày sinh',
  university: 'Trường đại học',
  major: 'Chuyên ngành',
  academicYear: 'Niên khóa',
  appliedPosition: 'Vị trí thực tập',
};

const getFieldLabel = (field: string): string => FIELD_LABELS[field] || field;

export const ExcelImportTab: React.FC<ExcelImportTabProps> = ({
  program,
  onSuccess,
}) => {
  const [state, setState] = useState<ImportState>(INITIAL_STATE);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Tải bảng tính mẫu .xlsx
  const handleDownloadTemplate = async () => {
    try {
      setState((prev) => ({ ...prev, isDownloadingTemplate: true }));
      const blob = await programService.downloadImportTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Mau_Nhap_Thuc_Tap_Sinh_${program.programCode || 'TEMPLATE'}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Đã tải xuống file Excel mẫu thành công.');
    } catch (err: any) {
      console.error('Lỗi tải file template:', err);
      toast.error(err.message || 'Không thể tải file mẫu. Vui lòng thử lại sau.');
    } finally {
      setState((prev) => ({ ...prev, isDownloadingTemplate: false }));
    }
  };

  // 2. Xử lý và tiền kiểm tra tệp tin Excel tải lên
  const processFile = useCallback(async (selectedFile: File) => {
    const validExtensions = ['.xlsx', '.xls'];
    const hasValidExt = validExtensions.some((ext) =>
      selectedFile.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExt) {
      toast.error('Chỉ hỗ trợ tệp tin định dạng Microsoft Excel (.xlsx, .xls).');
      return;
    }

    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > MAX_SIZE_BYTES) {
      toast.error('Dung lượng tệp vượt quá giới hạn tối đa cho phép (5MB).');
      return;
    }

    try {
      setState((prev) => ({
        ...prev,
        file: selectedFile,
        isLoadingPreview: true,
        preview: null,
      }));

      const previewData = await programService.previewImportExcel(
        program.id,
        selectedFile
      );

      setState((prev) => ({
        ...prev,
        preview: previewData,
      }));

      if (previewData.errors && previewData.errors.length > 0) {
        toast.warning(
          `Tìm thấy ${previewData.errors.length} lỗi dữ liệu trong file Excel. Vui lòng kiểm tra và sửa đổi.`
        );
      } else if (previewData.isQuotaExceeded) {
        toast.warning(
          `Số lượng thực tập sinh (${previewData.validRowsCount}) vượt quá chỉ tiêu còn trống (${previewData.availableSlots}) của kỳ này.`
        );
      } else {
        toast.success(
          `Kiểm tra thành công! File có ${previewData.validRowsCount} bản ghi hợp lệ sẵn sàng tiếp nhận.`
        );
      }
    } catch (err: any) {
      console.error('Lỗi xem trước file Excel:', err);
      toast.error(
        err.message || 'Không thể phân tích file Excel. Vui lòng kiểm tra định dạng dữ liệu.'
      );
      setState((prev) => ({ ...prev, file: null, preview: null }));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setState((prev) => ({ ...prev, isLoadingPreview: false }));
    }
  }, [program.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      void processFile(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, isDragOver: false }));
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!state.isDragOver) {
      setState((prev) => ({ ...prev, isDragOver: true }));
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, isDragOver: false }));
  };

  // 3. Xóa file đã chọn
  const handleClearFile = () => {
    setState((prev) => ({
      ...prev,
      file: null,
      preview: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 4. Xác nhận nhập thực tập sinh vào chương trình
  const handleSubmitImport = async () => {
    if (!state.file || !state.preview) return;

    if (state.preview.errors && state.preview.errors.length > 0) {
      toast.error('Vui lòng sửa các dòng dữ liệu bị lỗi trong file Excel trước khi tiếp nhận.');
      return;
    }

    if (state.preview.isQuotaExceeded) {
      toast.error('Số lượng ứng viên vượt quá chỉ tiêu tiếp nhận còn trống của kỳ thực tập.');
      return;
    }

    try {
      setState((prev) => ({ ...prev, isSubmitting: true }));
      const result = await programService.importInternsFromExcel(
        program.id,
        state.file,
        state.status
      );

      toast.success(
        `Đã tiếp nhận thành công ${result.importedCount} thực tập sinh vào chương trình "${program.name}".`
      );
      handleClearFile();
      onSuccess();
    } catch (err: any) {
      console.error('Lỗi khi thực hiện import Excel:', err);
      toast.error(
        err.message || 'Quá trình nhập dữ liệu thất bại. Toàn bộ thao tác đã được hoàn tác.'
      );
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const hasErrors = Boolean(state.preview?.errors && state.preview.errors.length > 0);
  const isQuotaExceeded = Boolean(state.preview?.isQuotaExceeded);
  const canSubmit = Boolean(
    state.preview &&
    !hasErrors &&
    !isQuotaExceeded &&
    state.preview.validRowsCount > 0 &&
    !state.isSubmitting
  );

  return (
    <div className={styles.container}>
      {/* 1. Guide Card / Template Download Banner */}
      <div className={styles.guideCard}>
        <div className={styles.guideInfo}>
          <div className={styles.guideIconWrapper}>
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <h4 className={styles.guideTitle}>Nhập danh sách từ tệp tin Excel (.xlsx)</h4>
            <p className={styles.guideText}>
              Sử dụng bảng tính mẫu chuẩn để nhập hàng loạt thực tập sinh vào chương trình.
              Hệ thống tự động hỗ trợ và chuẩn hóa số điện thoại (chấp nhận <code>+84...</code> hoặc <code>0...</code>), ngày sinh (<code>dd/MM/yyyy</code>) và kiểm tra toàn vẹn dữ liệu an toàn (All-or-Nothing).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownloadTemplate}
          disabled={state.isDownloadingTemplate}
          className={styles.templateDownloadBtn}
        >
          <Download size={14} />
          <span>
            {state.isDownloadingTemplate ? 'Đang tải...' : 'Tải bảng tính mẫu .xlsx'}
          </span>
        </button>
      </div>

      {/* 2. Dropzone hoặc File Card đã chọn */}
      {!state.file ? (
        <div
          role="button"
          tabIndex={0}
          className={`${styles.dropzone} ${state.isDragOver ? styles.dropzoneDragOver : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              fileInputRef.current?.click();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className={styles.hiddenFileInput}
          />
          <div className={styles.dropzoneContent}>
            <div className={styles.dropzoneIconWrapper}>
              <UploadCloud size={26} />
            </div>
            <span className={styles.dropzoneTitle}>
              Kéo thả file Excel vào đây hoặc click để chọn tệp
            </span>
            <span className={styles.dropzoneHint}>
              Hỗ trợ tệp Excel tối đa 5MB. Định dạng SĐT: +84... hoặc 0..., ngày sinh: dd/MM/yyyy
            </span>
            <span className={styles.dropzoneFormatBadge}>
              Định dạng .xlsx, .xls
            </span>
          </div>
        </div>
      ) : (
        <div className={styles.fileCard}>
          <div className={styles.fileCardLeft}>
            <FileSpreadsheet size={24} className={styles.fileIcon} />
            <div>
              <div className={styles.fileName}>{state.file.name}</div>
              <div className={styles.fileSize}>{formatFileSize(state.file.size)}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearFile}
            className={styles.removeFileBtn}
            title="Gỡ bỏ file để chọn lại"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* 3. Đang phân tích preview */}
      {state.isLoadingPreview && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem 0' }}>
          <Skeleton height={28} width="40%" />
          <Skeleton height={120} width="100%" />
        </div>
      )}

      {/* 4. Live Ingestion Ledger */}
      {state.preview && !state.isLoadingPreview && (
        <div className={styles.ledgerContainer}>
          {/* 4.1. Discrepancy Inspector (Khi có lỗi định dạng / dữ liệu) */}
          {hasErrors && (
            <div className={styles.discrepancyCard}>
              <div className={styles.discrepancyHeader}>
                <div className={styles.discrepancyTitleGroup}>
                  <AlertTriangle size={18} />
                  <span>Phát hiện lỗi không hợp lệ trong tệp dữ liệu</span>
                </div>
                <span className={styles.discrepancyBadge}>
                  {state.preview.errors.length} lỗi cần khắc phục
                </span>
              </div>
              <p className={styles.discrepancySubtext}>
                Hệ thống áp dụng cơ chế All-or-Nothing. Toàn bộ các dòng lỗi dưới đây phải được chỉnh sửa trong file Excel trước khi tiến hành tiếp nhận:
              </p>

              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Dòng</th>
                      <th style={{ width: '150px' }}>Thuộc tính</th>
                      <th style={{ width: '180px' }}>Giá trị lỗi</th>
                      <th>Nguyên nhân & Hướng dẫn sửa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.preview.errors.map((err, idx) => (
                      <tr key={`err-${err.rowNumber}-${err.fieldName}-${idx}`}>
                        <td>
                          <span className={styles.errorRowBadge}>Dòng {err.rowNumber}</span>
                        </td>
                        <td>
                          <span className={styles.errorFieldName}>
                            {getFieldLabel(err.fieldName)}
                          </span>
                        </td>
                        <td>
                          <code style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {err.cellValue ? String(err.cellValue) : '<Để trống>'}
                          </code>
                        </td>
                        <td>
                          <span className={styles.errorRemedy}>{err.errorMessage}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4.2. Cảnh báo vượt chỉ tiêu (Quota Exceeded) */}
          {isQuotaExceeded && (
            <div className={styles.discrepancyCard}>
              <div className={styles.discrepancyHeader}>
                <div className={styles.discrepancyTitleGroup}>
                  <AlertTriangle size={18} />
                  <span>Vượt quá chỉ tiêu tiếp nhận còn lại của chương trình</span>
                </div>
                <span className={styles.discrepancyBadge}>Chỉ tiêu không đủ</span>
              </div>
              <p className={styles.discrepancySubtext}>
                Số lượng thực tập sinh hợp lệ trong file là <strong>{state.preview.validRowsCount}</strong>, trong khi chương trình chỉ còn <strong>{state.preview.availableSlots}</strong> chỉ tiêu trống. Vui lòng giảm bớt số lượng ứng viên trong file hoặc mở rộng chỉ tiêu kỳ thực tập.
              </p>
            </div>
          )}

          {/* 4.3. Bảng xem trước dữ liệu hợp lệ (Valid Preview) */}
          {state.preview.validRowsCount > 0 && (
            <div className={styles.validCard}>
              <div className={styles.validHeader}>
                <div className={styles.validTitleGroup}>
                  <CheckCircle2 size={18} />
                  <span>Danh sách thực tập sinh hợp lệ</span>
                </div>
                <div className={styles.metricsPills}>
                  <div className={`${styles.metricPill} ${styles.metricPillSuccess}`}>
                    <Users size={13} />
                    <span>Hợp lệ: {state.preview.validRowsCount} / {state.preview.totalRows} dòng</span>
                  </div>
                  <div className={`${styles.metricPill} ${isQuotaExceeded ? styles.metricPillDanger : styles.metricPillWarning}`}>
                    <Info size={13} />
                    <span>Slot trống: {state.preview.availableSlots}</span>
                  </div>
                </div>
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>#</th>
                      <th>Họ và tên</th>
                      <th>Email</th>
                      <th>Số điện thoại</th>
                      <th>Giới tính</th>
                      <th>Trường ĐH</th>
                      <th>Ngành học</th>
                      <th>Vị trí ứng tuyển</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.preview.previewRows.map((row) => (
                      <tr key={`row-${row.rowNumber}-${row.email}`}>
                        <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                          {row.rowNumber}
                        </td>
                        <td style={{ fontWeight: 600 }}>{row.fullName}</td>
                        <td>{row.email}</td>
                        <td>{row.phone}</td>
                        <td>{row.gender || '—'}</td>
                        <td>{row.university}</td>
                        <td>{row.major}</td>
                        <td>{row.appliedPosition || 'Thực tập sinh'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {state.preview.validRowsCount > 10 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                  * Hiển thị tối đa 10 dòng đầu tiên xem trước trên giao diện.
                </div>
              )}
            </div>
          )}

          {/* 4.4. Tùy chọn trạng thái phê duyệt */}
          {!hasErrors && !isQuotaExceeded && (
            <div className={styles.modeSelector}>
              <span className={styles.modeTitle}>Tùy chọn trạng thái tiếp nhận vào chương trình:</span>
              <div className={styles.modeOptions}>
                <label className={styles.modeOptionLabel}>
                  <input
                    type="radio"
                    name="importStatus"
                    value="APPROVED"
                    checked={state.status === 'APPROVED'}
                    onChange={() => setState((prev) => ({ ...prev, status: 'APPROVED' }))}
                  />
                  <span>
                    <strong>Tiếp nhận chính thức ngay (APPROVED)</strong>
                    <span className={styles.modeDescription}> — Tự động cập nhật chỉ tiêu kỳ thực tập</span>
                  </span>
                </label>

                <label className={styles.modeOptionLabel}>
                  <input
                    type="radio"
                    name="importStatus"
                    value="PENDING"
                    checked={state.status === 'PENDING'}
                    onChange={() => setState((prev) => ({ ...prev, status: 'PENDING' }))}
                  />
                  <span>
                    <strong>Lưu vào danh sách chờ xét duyệt (PENDING)</strong>
                    <span className={styles.modeDescription}> — Phê duyệt thủ công từng ứng viên sau</span>
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* 4.5. Thanh hành động Footer */}
          <div className={styles.actionFooter}>
            <div className={styles.footerSummary}>
              {hasErrors ? (
                <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
                  Chưa thể tiếp nhận: Cần sửa {state.preview.errors.length} lỗi trong file Excel.
                </span>
              ) : isQuotaExceeded ? (
                <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
                  Chưa thể tiếp nhận: Vượt quá chỉ tiêu còn lại của chương trình.
                </span>
              ) : (
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                  Sẵn sàng nhập {state.preview.validRowsCount} thực tập sinh vào chương trình.
                </span>
              )}
            </div>

            <div className={styles.footerButtons}>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleClearFile}
                disabled={state.isSubmitting}
              >
                Hủy / Chọn file khác
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSubmitImport}
                disabled={!canSubmit}
                isLoading={state.isSubmitting}
              >
                <CheckCircle2 size={16} />
                <span>
                  {state.isSubmitting
                    ? 'Đang tiếp nhận...'
                    : `Tiếp nhận ${state.preview.validRowsCount} thực tập sinh`}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
