import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import type { DocumentType } from '../../../types';
import styles from './InternUploadForm.module.css';

interface InternUploadFormProps {
  onUpload: (file: File, type: DocumentType) => Promise<void>;
  isUploading: boolean;
}

export const InternUploadForm: React.FC<InternUploadFormProps> = ({ onUpload, isUploading }) => {
  const [uploadType, setUploadType] = useState<DocumentType>('CV');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Vui lòng chọn một tệp tin (PDF / DOCX)');
      return;
    }
    try {
      await onUpload(selectedFile, uploadType);
      setSelectedFile(null);
      const msg = 'Tải lên tài liệu thành công! Đang chờ HR thẩm định.';
      setSuccessMsg(msg);
      toast.success(msg);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tải lên tài liệu');
    }
  };

  return (
    <div className="card">
      <h3 className={styles.title}>Nộp Thêm Tài Liệu Mới</h3>
      <p className={styles.subtitle}>
        Tải lên CV hoặc Đơn xin thực tập để HR xét duyệt (chấp nhận PDF, DOCX tối đa 5MB)
      </p>

      {successMsg && (
        <div
          style={{
            backgroundColor: 'var(--success-bg, #ecfdf5)',
            border: '1px solid var(--success-border, #a7f3d0)',
            borderRadius: '8px',
            padding: '0.65rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--success, #065f46)',
            fontSize: '0.825rem',
            marginBottom: '1rem',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 500 }}>
            Loại tài liệu cần nộp *
          </label>
          <select
            className="form-select"
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value as DocumentType)}
            style={{
              width: '100%',
              padding: '0.625rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #cbd5e1)',
              backgroundColor: 'var(--bg-card, #ffffff)',
              color: 'var(--text-main, #1e293b)',
            }}
          >
            <option value="CV">CV / Sơ Yếu Lý Lịch (CV)</option>
            <option value="APPLICATION_LETTER">Đơn Xin Thực Tập (APPLICATION_LETTER)</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 500 }}>
            Chọn tệp tin (PDF/DOCX, tối đa 5MB) *
          </label>
          <label className={styles.dropzone}>
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
            />
            {selectedFile ? (
              <div className={styles.fileCenter}>
                <FileText size={28} color="var(--primary)" style={{ margin: '0 auto 0.4rem' }} />
                <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>{selectedFile.name}</p>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB - Nhấp để chọn lại
                </span>
              </div>
            ) : (
              <>
                <UploadCloud size={28} color="var(--primary)" style={{ marginBottom: '0.35rem' }} />
                <p style={{ fontSize: '0.825rem', fontWeight: 600, margin: 0 }}>
                  Kéo thả hoặc nhấp để chọn tệp
                </p>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Hỗ trợ PDF, DOCX tối đa 5MB
                </span>
              </>
            )}
          </label>
        </div>

        <button
          type="submit"
          disabled={isUploading || !selectedFile}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
        >
          {isUploading ? 'Đang gửi tệp lên Backend qua Axios...' : 'Tải Lên Hồ Sơ Mới'}
        </button>
      </form>
    </div>
  );
};
