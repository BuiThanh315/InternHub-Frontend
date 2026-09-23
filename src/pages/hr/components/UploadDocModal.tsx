import React, { useState } from 'react';
import { toast } from 'sonner';
import { UploadCloud } from 'lucide-react';
import type { InternProfile, DocumentType } from '../../../types';
import { Modal, Button } from '../../../components/common';

interface UploadDocModalProps {
  intern: InternProfile | null;
  uploading: boolean;
  onClose: () => void;
  onSubmit: (docType: DocumentType, file: File) => Promise<void>;
}

export const UploadDocModal: React.FC<UploadDocModalProps> = ({
  intern,
  uploading,
  onClose,
  onSubmit,
}) => {
  const [docType, setDocType] = useState<DocumentType>('CV');
  const [file, setFile] = useState<File | null>(null);

  if (!intern) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Vui lòng chọn một tệp tin');
      return;
    }
    await onSubmit(docType, file);
    setFile(null);
  };

  return (
    <Modal
      isOpen={!!intern}
      onClose={onClose}
      title={`Tải Lên Tài Liệu Cho: ${intern.fullName}`}
      size="md"
      footer={
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={uploading}>
            Hủy Bỏ
          </Button>
          <Button type="submit" form="upload-doc-form" variant="primary" isLoading={uploading}>
            Tải Lên Tệp Tin
          </Button>
        </div>
      }
    >
      <form id="upload-doc-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Loại tài liệu cần nộp *</label>
          <select
            className="form-select"
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocumentType)}
          >
            <option value="CV">CV / Hồ Sơ Ứng Tuyển</option>
            <option value="APPLICATION_FORM">Đơn Xin Thực Tập</option>
            <option value="TRANSCRIPT">Bảng Điểm Đại Học</option>
            <option value="REPORT">Báo Cáo Thực Tập</option>
            <option value="CERTIFICATE">Chứng Chỉ / Giấy Khen</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Chọn tệp tin (PDF, DOCX - Tối đa 10MB) *</label>
          <div
            style={{
              border: '2px dashed var(--border-default)',
              borderRadius: '8px',
              padding: '1.5rem',
              textAlign: 'center',
              backgroundColor: 'var(--border-subtle)',
              cursor: 'pointer',
            }}
            onClick={() => document.getElementById('file-upload-input')?.click()}
          >
            <UploadCloud size={32} color="var(--primary)" style={{ margin: '0 auto 0.5rem auto' }} />
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>
              {file ? file.name : 'Bấm vào đây để chọn tệp tin tải lên'}
            </p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {file
                ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                : 'Hỗ trợ các định dạng PDF, DOC, DOCX'}
            </p>
          </div>
          <input
            id="file-upload-input"
            type="file"
            accept=".pdf,.doc,.docx"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFile(e.target.files[0]);
              }
            }}
          />
        </div>
      </form>
    </Modal>
  );
};

export default UploadDocModal;
