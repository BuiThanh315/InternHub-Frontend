import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FileSignature, X, UploadCloud, FileText, Trash2, Loader2, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { contractService } from '../../../../services/contractService';
import { formatFileSize } from '../../../../utils/formatters';
import type { UploadContractModalProps } from './UploadContractModal.types';
import styles from './UploadContractModal.module.css';

interface FormState {
  contractTitle: string;
  startDate: string;
  endDate: string;
  durationMonths: number;
  contractNumber: string;
  allowanceAmount: string;
  notes: string;
}

interface MetaState {
  error: string | null;
  fieldErrors: Record<string, string>;
  uploadProgress: number | null;
  isDragging: boolean;
  canScrollMore: boolean;
}

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Sinh mã hợp đồng tự động theo chuẩn HDTT-YYYYMM-XXXX
 */
const generateContractNumber = (internId?: number): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const suffix = internId
    ? String(internId).padStart(4, '0')
    : String(Math.floor(1000 + Math.random() * 9000));
  return `HDTT-${year}${month}-${suffix}`;
};

/**
 * Tính ngày kết thúc tự động từ ngày bắt đầu và số tháng
 */
const calculateEndDate = (startDateStr: string, months: number): string => {
  if (!startDateStr) return '';
  const [y, m, d] = startDateStr.split('-').map(Number);
  if (!y || !m || !d) return '';
  const date = new Date(y, m - 1 + months, d);
  const endYear = date.getFullYear();
  const endMonth = String(date.getMonth() + 1).padStart(2, '0');
  const endDay = String(date.getDate()).padStart(2, '0');
  return `${endYear}-${endMonth}-${endDay}`;
};

export const UploadContractModal: React.FC<UploadContractModalProps> = ({
  intern,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLFormElement>(null);

  // State 1: Form fields gom nhóm
  const [formData, setFormData] = useState<FormState>({
    contractTitle: '',
    startDate: '',
    endDate: '',
    durationMonths: 3,
    contractNumber: '',
    allowanceAmount: '',
    notes: '',
  });

  // State 2: File được chọn
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // State 3: Trạng thái submit
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // State 4: Trạng thái phụ trợ
  const [metaState, setMetaState] = useState<MetaState>({
    error: null,
    fieldErrors: {},
    uploadProgress: null,
    isDragging: false,
    canScrollMore: false,
  });

  const checkScrollable = useCallback(() => {
    if (bodyRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = bodyRef.current;
      const isMore = scrollHeight - (scrollTop + clientHeight) > 20;
      setMetaState((prev) => (prev.canScrollMore !== isMore ? { ...prev, canScrollMore: isMore } : prev));
    }
  }, []);

  useEffect(() => {
    if (isOpen && intern) {
      const today = new Date().toISOString().split('T')[0];
      const start = intern.startDate || today;
      const defaultDuration = 3;
      const computedEnd = calculateEndDate(start, defaultDuration);
      const generatedCode = generateContractNumber(intern.id);

      setFormData({
        contractTitle: `Hợp đồng thực tập - ${intern.fullName}`,
        startDate: start,
        endDate: computedEnd,
        durationMonths: defaultDuration,
        contractNumber: generatedCode,
        allowanceAmount: '',
        notes: '',
      });
      setSelectedFile(null);
      setIsSubmitting(false);
      setMetaState({
        error: null,
        fieldErrors: {},
        uploadProgress: null,
        isDragging: false,
        canScrollMore: false,
      });

      // Kiểm tra cuộn sau khi DOM render
      setTimeout(checkScrollable, 200);
    }
  }, [isOpen, intern, checkScrollable]);

  if (!isOpen || !intern) return null;

  const validateFile = (file: File): string | null => {
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
    if (!hasValidExtension) {
      return 'Chỉ chấp nhận tệp có định dạng .pdf, .docx, .doc';
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return 'Kích thước tệp vượt quá giới hạn 10MB';
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const errorMsg = validateFile(file);
      if (errorMsg) {
        toast.error(errorMsg);
        setMetaState((prev) => ({ ...prev, error: errorMsg }));
        return;
      }
      setSelectedFile(file);
      setMetaState((prev) => ({ ...prev, error: null }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!metaState.isDragging) {
      setMetaState((prev) => ({ ...prev, isDragging: true }));
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setMetaState((prev) => ({ ...prev, isDragging: false }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setMetaState((prev) => ({ ...prev, isDragging: false }));
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const errorMsg = validateFile(file);
      if (errorMsg) {
        toast.error(errorMsg);
        setMetaState((prev) => ({ ...prev, error: errorMsg }));
        return;
      }
      setSelectedFile(file);
      setMetaState((prev) => ({ ...prev, error: null }));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFieldChange = (field: keyof FormState, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (metaState.fieldErrors[field]) {
      setMetaState((prev) => ({
        ...prev,
        fieldErrors: { ...prev.fieldErrors, [field]: '' },
      }));
    }
  };

  const handleStartDateChange = (newStartDate: string) => {
    const newEnd = calculateEndDate(newStartDate, formData.durationMonths);
    setFormData((prev) => ({
      ...prev,
      startDate: newStartDate,
      endDate: newEnd,
    }));
  };

  const handleDurationSelect = (months: number) => {
    const newEnd = calculateEndDate(formData.startDate, months);
    setFormData((prev) => ({
      ...prev,
      durationMonths: months,
      endDate: newEnd,
    }));
  };

  const handleRegenerateCode = () => {
    const newCode = generateContractNumber(intern.id);
    handleFieldChange('contractNumber', newCode);
    toast.info(`Đã sinh mã hợp đồng mới: ${newCode}`);
  };

  const handleAllowanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 12);
    if (!rawVal) {
      handleFieldChange('allowanceAmount', '');
      return;
    }
    const formatted = new Intl.NumberFormat('vi-VN').format(Number(rawVal));
    handleFieldChange('allowanceAmount', formatted);
  };

  // Logic kiểm tra tính hợp lệ toàn diện của biểu mẫu
  const isTitleValid = formData.contractTitle.trim().length >= 3;
  const isDateRangeValid = Boolean(
    formData.startDate &&
    formData.endDate &&
    formData.endDate > formData.startDate
  );
  const isFileValid = Boolean(selectedFile);
  const isFormValid = isTitleValid && isDateRangeValid && isFileValid;

  const getSubmitDisabledReason = (): string => {
    if (!isFileValid) return 'Vui lòng đính kèm tệp văn bản hợp đồng (.pdf, .docx)';
    if (!isTitleValid) return 'Tiêu đề hợp đồng phải có ít nhất 3 ký tự';
    if (!formData.startDate) return 'Vui lòng chọn ngày bắt đầu thực tập';
    if (!formData.endDate || !isDateRangeValid) return 'Ngày kết thúc không hợp lệ';
    return 'Nhấn để hoàn tất tải lên hợp đồng thực tập';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setMetaState((prev) => ({ ...prev, error: null, uploadProgress: 0 }));

    try {
      const parsedAllowance = formData.allowanceAmount
        ? Number(formData.allowanceAmount.replace(/\./g, ''))
        : undefined;

      const result = await contractService.uploadContract(
        intern.internCode,
        {
          contractTitle: formData.contractTitle.trim(),
          startDate: formData.startDate,
          endDate: formData.endDate,
          contractNumber: formData.contractNumber.trim() || undefined,
          allowanceAmount: parsedAllowance,
          notes: formData.notes.trim() || undefined,
        },
        selectedFile!,
        (progress) => {
          setMetaState((prev) => ({ ...prev, uploadProgress: progress }));
        }
      );

      toast.success(
        `Tải lên hợp đồng thành công! (Mã HĐ: ${result.contractNumber})`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      const serverMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Có lỗi xảy ra trong quá trình tải lên hợp đồng. Vui lòng thử lại.';

      const serverFieldErrors: Record<string, string> = {};
      if (err?.response?.status === 409) {
        serverFieldErrors.contractNumber = 'Số hiệu hợp đồng đã tồn tại trong hệ thống';
      }

      setMetaState((prev) => ({
        ...prev,
        error: serverMessage,
        fieldErrors: serverFieldErrors,
        uploadProgress: null,
      }));
      toast.error(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && !isSubmitting && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="upload-contract-title">
        {/* Khối 1: Header cố định */}
        <div className={styles.header}>
          <div className={styles.headerTitleWrapper}>
            <div className={styles.iconWrapper}>
              <FileSignature size={22} />
            </div>
            <div>
              <h3 id="upload-contract-title" className={styles.title}>
                Tải Lên Hợp Đồng Thực Tập Sinh
              </h3>
              <p className={styles.subtitle}>
                {intern.internCode} &bull; {intern.fullName}
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Đóng cửa sổ"
          >
            <X size={20} />
          </button>
        </div>

        {/* Khối 2: Body cuộn độc lập */}
        <form
          ref={bodyRef}
          id="upload-contract-form"
          onSubmit={handleSubmit}
          className={styles.body}
          onScroll={checkScrollable}
        >
          {metaState.error && (
            <div className={styles.errorBanner} role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{metaState.error}</div>
            </div>
          )}

          {/* Drag & Drop File Zone */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Tệp văn bản hợp đồng <span className={styles.requiredMark}>*</span>
            </label>

            {!selectedFile ? (
              <div
                className={`${styles.dropzone} ${metaState.isDragging ? styles.dropzoneActive : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileChange}
                />
                <UploadCloud size={34} className={styles.dropzoneIcon} />
                <p className={styles.dropzoneText}>
                  Kéo thả tệp vào đây hoặc <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>chọn từ máy tính</span>
                </p>
                <p className={styles.dropzoneHint}>Hỗ trợ định dạng .PDF, .DOCX, .DOC (Tối đa 10MB)</p>
              </div>
            ) : (
              <div className={styles.fileCard}>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileChange}
                />
                <div className={styles.fileInfo}>
                  <FileText size={26} className={styles.fileIcon} />
                  <div className={styles.fileDetails}>
                    <span className={styles.fileName}>{selectedFile.name}</span>
                    <span className={styles.fileSize}>{formatFileSize(selectedFile.size)}</span>
                  </div>
                </div>
                <div className={styles.fileActions}>
                  <button
                    type="button"
                    className={styles.changeFileButton}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                    title="Chọn tệp văn bản khác để thay thế"
                  >
                    <RefreshCw size={13} />
                    <span>Đổi tệp</span>
                  </button>
                  <button
                    type="button"
                    className={styles.removeFileButton}
                    onClick={handleRemoveFile}
                    disabled={isSubmitting}
                    title="Gỡ tệp này"
                    aria-label="Xóa tệp đã chọn"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}

            {metaState.uploadProgress !== null && (
              <div className={styles.progressBarContainer}>
                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${metaState.uploadProgress}%` }}
                  />
                </div>
                <span className={styles.progressLabel}>
                  Đang tải lên: {metaState.uploadProgress}%
                </span>
              </div>
            )}
          </div>

          {/* Tiêu đề hợp đồng */}
          <div className={styles.formGroup}>
            <label htmlFor="contractTitle" className={styles.label}>
              Tiêu đề hợp đồng <span className={styles.requiredMark}>*</span>
            </label>
            <input
              id="contractTitle"
              type="text"
              className={`${styles.input} ${metaState.fieldErrors.contractTitle ? styles.inputError : ''}`}
              placeholder="VD: Hợp đồng thực tập kỹ thuật phần mềm"
              value={formData.contractTitle}
              onChange={(e) => handleFieldChange('contractTitle', e.target.value)}
              disabled={isSubmitting}
              maxLength={200}
            />
            {metaState.fieldErrors.contractTitle && (
              <span className={styles.errorText}>{metaState.fieldErrors.contractTitle}</span>
            )}
          </div>

          {/* Ngày bắt đầu & Ngày kết thúc (Kèm 3 button thời hạn) */}
          <div className={styles.dateGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="startDate" className={styles.label}>
                Ngày bắt đầu <span className={styles.requiredMark}>*</span>
              </label>
              <input
                id="startDate"
                type="date"
                className={styles.input}
                value={formData.startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                disabled={isSubmitting}
              />
              <span className={styles.helperText}>Chọn ngày bắt đầu thực tập</span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="endDate" className={styles.label}>
                Ngày kết thúc <span className={styles.requiredMark}>*</span>
              </label>
              <input
                id="endDate"
                type="date"
                className={`${styles.input} ${styles.readOnlyInput}`}
                value={formData.endDate}
                readOnly
                disabled={isSubmitting}
                title="Ngày kết thúc được tự động tính theo thời hạn bên dưới"
              />
              {/* 3 button thời hạn: 1 tháng, 2 tháng, 3 tháng */}
              <div className={styles.durationPresets}>
                {[1, 2, 3].map((months) => (
                  <button
                    key={months}
                    type="button"
                    className={`${styles.presetBtn} ${formData.durationMonths === months ? styles.presetBtnActive : ''}`}
                    onClick={() => handleDurationSelect(months)}
                    disabled={isSubmitting || !formData.startDate}
                    title={`Chọn thời hạn ${months} tháng`}
                  >
                    {months} tháng
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Số hiệu hợp đồng (Tự sinh & Điền sẵn) & Mức phụ cấp */}
          <div className={styles.dateGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="contractNumber" className={styles.label}>
                Số hiệu hợp đồng
              </label>
              <div className={styles.inputWithButton}>
                <input
                  id="contractNumber"
                  type="text"
                  className={`${styles.input} ${metaState.fieldErrors.contractNumber ? styles.inputError : ''}`}
                  placeholder="VD: HDTT-202609-0001"
                  value={formData.contractNumber}
                  onChange={(e) => handleFieldChange('contractNumber', e.target.value)}
                  disabled={isSubmitting}
                  maxLength={50}
                />
                <button
                  type="button"
                  className={styles.regenerateBtn}
                  onClick={handleRegenerateCode}
                  disabled={isSubmitting}
                  title="Sinh lại mã số hợp đồng mới"
                  aria-label="Sinh lại mã"
                >
                  <Sparkles size={16} />
                </button>
              </div>
              <span className={styles.helperText}>
                💡 Mã sinh tự động theo quy tắc chuẩn HDTT-YYYYMM-XXXX
              </span>
              {metaState.fieldErrors.contractNumber && (
                <span className={styles.errorText}>{metaState.fieldErrors.contractNumber}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="allowanceAmount" className={styles.label}>
                Mức phụ cấp hàng tháng
              </label>
              <div className={styles.currencyWrapper}>
                <input
                  id="allowanceAmount"
                  type="text"
                  className={styles.input}
                  placeholder="VD: 3.000.000"
                  value={formData.allowanceAmount}
                  onChange={handleAllowanceChange}
                  disabled={isSubmitting}
                />
                <span className={styles.currencySuffix}>₫</span>
              </div>
              <span className={styles.helperText}>
                Mức hỗ trợ hàng tháng (VND). Bỏ trống nếu không có.
              </span>
            </div>
          </div>

          {/* Ghi chú */}
          <div className={styles.formGroup}>
            <label htmlFor="contractNotes" className={styles.label}>
              Ghi chú thêm
            </label>
            <textarea
              id="contractNotes"
              className={styles.textarea}
              placeholder="Nhập ghi chú bổ sung về điều khoản, người phụ trách hoặc đợt thực tập..."
              value={formData.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              disabled={isSubmitting}
              maxLength={1000}
            />
            <div className={styles.charCounter}>{formData.notes.length} / 1000</div>
          </div>
        </form>

        {/* Chỉ báo cuộn thị giác khi chưa cuộn hết */}
        {metaState.canScrollMore && (
          <div className={styles.scrollHint}>
            Cuộn xuống để xem thêm ghi chú &darr;
          </div>
        )}

        {/* Khối 3: Sticky Footer ghim cố định */}
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy Bỏ
          </button>
          <button
            type="submit"
            form="upload-contract-form"
            className={styles.submitButton}
            disabled={isSubmitting || !isFormValid}
            title={getSubmitDisabledReason()}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className={styles.spinner} />
                <span>Đang Tải Lên...</span>
              </>
            ) : (
              <>
                <FileSignature size={16} />
                <span>Tải Lên Hợp Đồng</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadContractModal;
