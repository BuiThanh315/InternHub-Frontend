import React from 'react';
import {
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Ban,
  Download,
  Eye,
} from 'lucide-react';
import { documentService } from '../../../services/documentService';
import type { InternProfile, DocumentResponse } from '../../../types';
import { canApprove } from '../../../lib/permissions';
import { useAuth } from '../../../contexts/AuthContext';

interface InternDocumentsModalProps {
  isOpen: boolean;
  intern: InternProfile | null;
  documents: DocumentResponse[];
  onClose: () => void;
  onApprove: (docId: number) => void;
  onReject: (docId: number, internCode: string) => void;
}

export const InternDocumentsModal: React.FC<InternDocumentsModalProps> = ({
  isOpen,
  intern,
  documents,
  onClose,
  onApprove,
  onReject,
}) => {
  const { role } = useAuth();

  if (!isOpen || !intern) return null;

  const internDocs = documents.filter((d) => d.internCode === intern.internCode);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-success-soft text-success">
            <CheckCircle2 size={12} /> Đã phê duyệt
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-danger-soft text-danger">
            <Ban size={12} /> Bị từ chối
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-warning-soft text-warning">
            <Clock size={12} /> Chờ duyệt
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-2">
          <div>
            <h3 className="text-base font-bold text-text-1 flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              Hồ Sơ & Tài Liệu Của TTS: {intern.fullName}
            </h3>
            <p className="text-xs text-text-3 mt-0.5">
              Mã TTS: <strong className="text-text-2">{intern.internCode}</strong> · {intern.university} · {intern.major}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-3 hover:text-text-1 hover:bg-surface transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {internDocs.length === 0 ? (
            <div className="py-12 text-center">
              <AlertCircle size={36} className="text-text-3 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-text-2">
                Thực tập sinh chưa nộp bất kỳ tài liệu hoặc CV nào.
              </p>
              <p className="text-xs text-text-3 mt-1">
                Tài liệu do sinh viên nộp qua cổng ứng tuyển sẽ tự động hiển thị tại đây.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {internDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-border bg-surface-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/40 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm text-text-1 truncate">
                        {doc.fileName}
                      </span>
                      {getStatusBadge(doc.status)}
                    </div>
                    <div className="text-xs text-text-3 flex items-center gap-2.5 flex-wrap">
                      <span className="text-primary font-medium">{doc.documentType}</span>
                      <span>·</span>
                      <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>
                      <span>·</span>
                      <span>Nộp lúc: {new Date(doc.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>

                    {doc.rejectionReason && (
                      <div className="mt-2 text-xs text-danger bg-danger-soft/40 p-2 rounded border border-danger-soft">
                        <strong>Lý do từ chối:</strong> {doc.rejectionReason}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => documentService.previewDocumentFile(doc.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface text-primary border border-primary/30 hover:bg-primary-soft transition-colors cursor-pointer shadow-xs"
                      title="Xem trực tuyến hồ sơ / CV"
                    >
                      <Eye size={14} /> Xem
                    </button>
                    <button
                      onClick={() => documentService.downloadDocumentFile(doc.id, doc.fileName)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface text-text-1 border border-border hover:bg-surface-2 transition-colors cursor-pointer shadow-xs"
                      title="Tải xuống tệp tin"
                    >
                      <Download size={14} /> Tải về
                    </button>

                    {canApprove(role) && doc.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => onReject(doc.id, intern.internCode)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-danger-soft text-danger hover:bg-danger/20 transition-colors cursor-pointer"
                        >
                          Từ chối
                        </button>
                        <button
                          onClick={() => onApprove(doc.id)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-success text-white hover:bg-success/90 transition-colors shadow-xs cursor-pointer"
                        >
                          Phê duyệt
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-surface-2 flex items-center justify-between">
          <span className="text-xs text-text-3">
            Tổng cộng: {internDocs.length} tài liệu
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface border border-border text-text-1 hover:bg-surface-2 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
