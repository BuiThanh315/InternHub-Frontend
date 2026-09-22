import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { InternProfile, DocumentType } from '../../../types';

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
      alert('Vui lòng chọn một tệp tin');
      return;
    }
    await onSubmit(docType, file);
    setFile(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        className="card"
        style={{ width: '100%', maxWidth: '480px', margin: '1rem' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
              Nộp Tài Liệu Mới (TM-4)
            </h4>
            <span
              style={{
                fontSize: '0.78rem',
                color: 'var(--primary)',
                fontWeight: 700,
              }}
            >
              TTS: {intern.fullName} ({intern.internCode})
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Loại tài liệu cần nộp *</label>
            <select
              className="form-select"
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocumentType)}
            >
              <option value="CV">CV / Sơ Yếu Lý Lịch (CV)</option>
              <option value="APPLICATION_LETTER">
                Đơn Xin Thực Tập (APPLICATION_LETTER)
              </option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Chọn tệp tin (PDF / DOCX, tối đa 5MB) *
            </label>
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              required
              className="form-input"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.5rem',
              marginTop: '1.25rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="btn btn-primary"
            >
              {uploading ? 'Đang tải lên...' : 'Tải Lên Qua API (POST)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
