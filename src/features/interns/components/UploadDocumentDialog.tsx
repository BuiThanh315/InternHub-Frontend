import React, { useState } from 'react';
import { X, UploadCloud, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import type { DocumentType } from '../../../types';
import { documentService } from '../../../services/documentService';

interface UploadDocumentDialogProps {
  isOpen: boolean;
  internCode: string;
  internName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * UploadDocumentDialog - Dialog nộp tài liệu chuẩn TM-4
 * - Hỗ trợ kéo thả / chọn file CV, Đơn xin thực tập, Giấy giới thiệu
 * - Giới hạn dung lượng < 5MB và định dạng PDF, DOC, DOCX
 * - Gọi API POST /api/employees/interns/{internCode}/documents multipart
 */
export const UploadDocumentDialog: React.FC<UploadDocumentDialogProps> = ({
  isOpen,
  internCode,
  internName,
  onClose,
  onSuccess,
}) => {
  const [documentType, setDocumentType] = useState<DocumentType>('CV');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateFile = (selected: File): boolean => {
    if (selected.size > 5 * 1024 * 1024) {
      setError('Kích thước tệp vượt quá 5MB. Vui lòng chọn tệp nhỏ hơn.');
      return false;
    }
    const ext = selected.name.split('.').pop()?.toLowerCase();
    if (!ext || !['pdf', 'doc', 'docx'].includes(ext)) {
      setError('Định dạng tệp không hợp lệ. Chỉ chấp nhận các tệp .pdf, .doc, .docx.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (validateFile(selected)) {
        setFile(selected);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (validateFile(selected)) {
        setFile(selected);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Vui lòng chọn hoặc kéo thả một tệp tin.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await documentService.uploadDocument(internCode, file, documentType);
      toast.success(`Đã tải lên tài liệu ${file.name} thành công!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Không thể tải lên tài liệu. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-2">
          <div>
            <h3 className="text-base font-bold text-text-1 flex items-center gap-2">
              <UploadCloud size={18} className="text-primary" />
              Tải Lên Tài Liệu & CV
            </h3>
            <p className="text-xs text-text-3 mt-0.5">
              TTS: <strong className="text-text-2">{internName || internCode}</strong> ({internCode})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-3 hover:text-text-1 hover:bg-surface transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-danger-soft/60 border border-danger-soft text-danger text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Loại tài liệu */}
          <div>
            <label className="block text-xs font-semibold text-text-2 mb-1.5">
              Loại tài liệu <span className="text-danger">*</span>
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-bg border border-border text-text-1 focus:outline-none focus:border-primary font-medium"
            >
              <option value="CV">Hồ sơ lý lịch / CV (Curriculum Vitae)</option>
              <option value="INTERNSHIP_APPLICATION">Đơn xin thực tập (Application Letter)</option>
              <option value="RECOMMENDATION_LETTER">Giấy giới thiệu từ trường (Recommendation Letter)</option>
              <option value="TRANSCRIPT">Bảng điểm tích lũy (Transcript)</option>
              <option value="OTHER">Tài liệu khác</option>
            </select>
          </div>

          {/* Vùng kéo thả file */}
          <div>
            <label className="block text-xs font-semibold text-text-2 mb-1.5">
              Tệp tin đính kèm <span className="text-danger">*</span>
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                dragOver
                  ? 'border-primary bg-primary-soft/20'
                  : file
                  ? 'border-success/60 bg-success-soft/10'
                  : 'border-border hover:border-primary/50 bg-bg'
              }`}
            >
              {file ? (
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-success-soft text-success mx-auto flex items-center justify-center">
                    <CheckCircle2 size={22} />
                  </div>
                  <p className="text-xs font-semibold text-text-1 truncate max-w-xs mx-auto">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-text-3">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-xs text-danger hover:underline cursor-pointer"
                  >
                    Chọn tệp khác
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <UploadCloud size={32} className="mx-auto text-text-3" />
                  <p className="text-xs font-semibold text-text-1">
                    Kéo thả tệp tin vào đây, hoặc{' '}
                    <label className="text-primary hover:underline cursor-pointer">
                      chọn từ máy tính
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-[11px] text-text-3">
                    Hỗ trợ định dạng PDF, DOC, DOCX (Dung lượng tối đa: 5MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface border border-border text-text-2 hover:bg-surface-2 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!file || isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
            >
              {isSubmitting ? 'Đang tải lên...' : 'Tải Lên Tài Liệu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
