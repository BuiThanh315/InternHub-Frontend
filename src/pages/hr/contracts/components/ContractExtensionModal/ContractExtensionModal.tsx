import React, { useState, useRef } from 'react';
import { FileSignature, X, UploadCloud, FileText, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { contractService } from '../../../../../services/contractService';
import { formatFileSize, formatDate } from '../../../../../utils/formatters';
import type { ContractResponse } from '../../../../../types';
import styles from './ContractExtensionModal.module.css';

interface ContractExtensionModalProps {
  parentContract: ContractResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newContract: ContractResponse) => void;
}

const calculateExtendedEndDate = (startDateStr: string, months: number): string => {
  if (!startDateStr) return '';
  const [y, m, d] = startDateStr.split('-').map(Number);
  if (!y || !m || !d) return '';
  const date = new Date(y, m - 1 + months, d);
  const endYear = date.getFullYear();
  const endMonth = String(date.getMonth() + 1).padStart(2, '0');
  const endDay = String(date.getDate()).padStart(2, '0');
  return `${endYear}-${endMonth}-${endDay}`;
};

export const ContractExtensionModal: React.FC<ContractExtensionModalProps> = ({
  parentContract,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Khởi tạo ngày bắt đầu phụ lục là ngày tiếp theo của ngày kết thúc hợp đồng cha
  const defaultStartDate = parentContract?.endDate || '';
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [durationMonths, setDurationMonths] = useState(2);
  const [endDate, setEndDate] = useState(() => calculateExtendedEndDate(defaultStartDate, 2));
  const [contractTitle, setContractTitle] = useState(
    parentContract ? `Phụ lục gia hạn HĐTT (${parentContract.internFullName})` : 'Phụ lục gia hạn hợp đồng thực tập'
  );
  const [allowanceAmount, setAllowanceAmount] = useState(
    parentContract?.allowanceAmount ? new Intl.NumberFormat('vi-VN').format(parentContract.allowanceAmount) : ''
  );
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  if (!isOpen || !parentContract) return null;

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    setEndDate(calculateExtendedEndDate(val, durationMonths));
  };

  const handleDurationSelect = (months: number) => {
    setDurationMonths(months);
    setEndDate(calculateExtendedEndDate(startDate, months));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Kích thước tệp không được vượt quá 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Vui lòng đính kèm tệp văn bản phụ lục hợp đồng');
      return;
    }
    if (!contractTitle.trim() || contractTitle.trim().length < 3) {
      toast.error('Tiêu đề phụ lục phải có ít nhất 3 ký tự');
      return;
    }
    if (!startDate || !endDate || endDate <= startDate) {
      toast.error('Thời hạn gia hạn không hợp lệ');
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadProgress(0);

      const parsedAllowance = allowanceAmount
        ? Number(allowanceAmount.replace(/\./g, ''))
        : undefined;

      const prefix = `PLHD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      const contractNumber = `${prefix}-${String(Math.floor(1000 + Math.random() * 9000))}`;

      let result: any;
      try {
        result = await contractService.uploadContractDirectToS3(
          parentContract.internCode,
          {
            contractTitle: contractTitle.trim(),
            startDate,
            endDate,
            contractNumber,
            allowanceAmount: parsedAllowance,
            contractType: 'EXTENSION_APPENDIX',
            parentContractId: parentContract.id,
            notes: notes.trim() || undefined,
          },
          selectedFile,
          (progress) => setUploadProgress(progress)
        );
      } catch (s3Err) {
        console.warn('Direct S3 upload failed, trying fallback:', s3Err);
        result = await contractService.uploadContract(
          parentContract.internCode,
          {
            contractTitle: contractTitle.trim(),
            startDate,
            endDate,
            contractNumber,
            allowanceAmount: parsedAllowance,
            contractType: 'EXTENSION_APPENDIX',
            parentContractId: parentContract.id,
            notes: notes.trim() || undefined,
          },
          selectedFile,
          (progress) => setUploadProgress(progress)
        );
      }

      toast.success(`Tạo phụ lục gia hạn thành công! Mã: ${result.contractNumber}`);
      onSuccess(result);
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi tạo phụ lục gia hạn.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && !isSubmitting && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="extension-title">
        <div className={styles.header}>
          <div className={styles.headerTitleWrap}>
            <div className={styles.iconWrap}>
              <FileSignature size={22} />
            </div>
            <div>
              <h3 id="extension-title" className={styles.title}>
                Gia Hạn Hợp Đồng Thực Tập (Tạo Phụ Lục)
              </h3>
              <p className={styles.subTitle}>
                HĐ gốc: <strong>{parentContract.contractNumber}</strong> — Thực tập sinh: <strong>{parentContract.internFullName}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          <div className={styles.infoBanner}>
            Hợp đồng cũ kết thúc ngày <strong>{formatDate(parentContract.endDate)}</strong>. Sau khi phụ lục mới được TTS ký nhận, hợp đồng cũ sẽ tự động chuyển sang trạng thái <strong>SUPERSEDED (Đã được gia hạn)</strong>.
          </div>

          <div className={styles.formRow}>
            <div className={styles.formCol}>
              <label className={styles.fieldLabel}>
                Ngày bắt đầu gia hạn <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                className={styles.input}
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            <div className={styles.formCol}>
              <label className={styles.fieldLabel}>
                Ngày kết thúc gia hạn <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                className={styles.input}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className={styles.quickDurationWrap}>
            <label className={styles.fieldLabel}>Thời gian gia hạn thêm nhanh:</label>
            <div className={styles.durationTabs}>
              {[1, 2, 3, 6].map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`${styles.durationBtn} ${durationMonths === m ? styles.durationActive : ''}`}
                  onClick={() => handleDurationSelect(m)}
                  disabled={isSubmitting}
                >
                  +{m} Tháng
                </button>
              ))}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.fieldLabel}>
              Tiêu đề phụ lục hợp đồng <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={contractTitle}
              onChange={(e) => setContractTitle(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.fieldLabel}>Mức phụ cấp mới (VNĐ/tháng)</label>
            <input
              type="text"
              className={styles.input}
              value={allowanceAmount}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '');
                setAllowanceAmount(raw ? new Intl.NumberFormat('vi-VN').format(Number(raw)) : '');
              }}
              placeholder="VD: 4.500.000"
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.fieldLabel}>Ghi chú phụ lục (không bắt buộc)</label>
            <input
              type="text"
              className={styles.input}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Gia hạn theo đề xuất của Mentor..."
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.fieldLabel}>
              Đính kèm tệp văn bản phụ lục (PDF) <span className={styles.required}>*</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={isSubmitting}
            />
            {selectedFile ? (
              <div className={styles.fileSelectedBox}>
                <div className={styles.fileMeta}>
                  <FileText size={18} className={styles.fileIcon} />
                  <div>
                    <span className={styles.fileName}>{selectedFile.name}</span>
                    <span className={styles.fileSize}>({formatFileSize(selectedFile.size)})</span>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.fileRemoveBtn}
                  onClick={() => setSelectedFile(null)}
                  disabled={isSubmitting}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={styles.uploadAreaBtn}
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
              >
                <UploadCloud size={24} className={styles.uploadIcon} />
                <span>Nhấn để chọn tệp PDF phụ lục hợp đồng</span>
              </button>
            )}
          </div>

          {uploadProgress !== null && (
            <div className={styles.progressWrap}>
              <div className={styles.progressBar} style={{ width: `${uploadProgress}%` }} />
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting || !selectedFile}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className={styles.spinner} />
                  Đang tải lên...
                </>
              ) : (
                'Phát Hành Phụ Lục Gia Hạn'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
