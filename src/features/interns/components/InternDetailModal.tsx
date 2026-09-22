import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  Building2,
  FileText,
  Download,
} from 'lucide-react';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { documentService } from '../../../services/documentService';
import type { InternProfile, DocumentResponse } from '../../../types';

interface InternDetailModalProps {
  isOpen: boolean;
  intern: InternProfile | null;
  documents?: DocumentResponse[];
  onClose: () => void;
  onEdit?: (intern: InternProfile) => void;
}

/**
 * InternDetailModal - Chi tiết hồ sơ thực tập sinh theo đặc tả docs/spec.md mục 8:
 * - Header hồ sơ: Avatar, tên, mã TTS, badge trạng thái, liên hệ
 * - 3 tile chỉ số nhanh: GPA, tài liệu nộp, trạng thái hồ sơ
 * - Tabs: Tổng quan / Nhiệm vụ & Đánh giá / Tài liệu & CV
 */
export const InternDetailModal: React.FC<InternDetailModalProps> = ({
  isOpen,
  intern,
  documents = [],
  onClose,
  onEdit,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'documents'>('overview');

  if (!isOpen || !intern) return null;

  const internDocs = documents.filter((d) => d.internCode === intern.internCode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-surface rounded-xl border border-border shadow-pop overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Hồ Sơ (spec.md 8.1) */}
        <div className="p-6 border-b border-border-soft bg-surface-2/40">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-soft text-primary font-bold text-xl flex items-center justify-center border border-border shadow-xs shrink-0">
                {intern.fullName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-lg font-bold text-text-1 font-heading">
                    {intern.fullName}
                  </h2>
                  <StatusBadge status={intern.status} />
                </div>
                <p className="text-xs text-text-3 mt-1 flex items-center gap-3">
                  <span>Mã: <strong className="text-text-2">{intern.internCode}</strong></span>
                  <span>·</span>
                  <span>Vị trí: <strong className="text-primary">{intern.appliedPosition || 'Thực tập sinh'}</strong></span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => {
                    onClose();
                    onEdit(intern);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-border text-text-1 hover:bg-surface-2 transition-colors cursor-pointer"
                >
                  Chỉnh sửa
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* 3 Quick Indicator Tiles (spec.md 8.1) */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="p-3 rounded-lg bg-surface border border-border">
              <span className="text-[11px] text-text-3 font-medium block">Điểm GPA</span>
              <span className="text-base font-extrabold text-text-1 mt-0.5 block">
                {intern.gpa ? intern.gpa.toFixed(2) : 'Chưa có'}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-surface border border-border">
              <span className="text-[11px] text-text-3 font-medium block">Tài Liệu Đã Nộp</span>
              <span className="text-base font-extrabold text-primary mt-0.5 block">
                {internDocs.length} tệp
              </span>
            </div>
            <div className="p-3 rounded-lg bg-surface border border-border">
              <span className="text-[11px] text-text-3 font-medium block">Mentor Phụ Trách</span>
              <span className="text-xs font-bold text-text-1 mt-1 block truncate">
                {intern.mentorName || 'Chưa phân bổ'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-6 px-6 border-b border-border bg-surface text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-3 hover:text-text-1'
            }`}
          >
            Tổng Quan Hồ Sơ
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-3 hover:text-text-1'
            }`}
          >
            <span>Tài Liệu & CV</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-surface-2 text-text-2">
              {internDocs.length}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' ? (
            <div className="space-y-5">
              {/* Cột 1: Thông tin liên hệ & Học vấn */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border bg-surface-2/40 space-y-3">
                  <h4 className="text-xs font-bold text-text-1 uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap size={15} className="text-primary" /> Thông Tin Học Vấn
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-text-3 block">Trường đại học:</span>
                      <strong className="text-text-1">{intern.university}</strong>
                    </div>
                    <div>
                      <span className="text-text-3 block">Chuyên ngành:</span>
                      <strong className="text-text-1">{intern.major}</strong>
                    </div>
                    <div>
                      <span className="text-text-3 block">Niên khóa:</span>
                      <strong className="text-text-1">{intern.academicYear || 'Chưa cập nhật'}</strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-surface-2/40 space-y-3">
                  <h4 className="text-xs font-bold text-text-1 uppercase tracking-wider flex items-center gap-2">
                    <Building2 size={15} className="text-primary" /> Tiếp Nhận & Công Tác
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-text-3 block">Phòng ban:</span>
                      <strong className="text-text-1">{intern.department || 'Chưa phân bổ'}</strong>
                    </div>
                    <div>
                      <span className="text-text-3 block">Thời gian thực tập:</span>
                      <strong className="text-text-1">
                        {intern.startDate ? new Date(intern.startDate).toLocaleDateString('vi-VN') : '—'}
                        {' → '}
                        {intern.endDate ? new Date(intern.endDate).toLocaleDateString('vi-VN') : 'Dự kiến 3 tháng'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-text-3 block">Email:</span>
                      <strong className="text-text-1">{intern.email}</strong>
                    </div>
                    <div>
                      <span className="text-text-3 block">Số điện thoại:</span>
                      <strong className="text-text-1">{intern.phone}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ghi chú & Đánh giá sơ bộ */}
              {intern.notes && (
                <div className="p-4 rounded-xl border border-border bg-surface-2/30">
                  <span className="text-xs font-bold text-text-2 uppercase tracking-wider block mb-1">
                    Ghi Chú & Lưu Ý
                  </span>
                  <p className="text-xs text-text-2 leading-relaxed whitespace-pre-wrap">
                    {intern.notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {internDocs.length === 0 ? (
                <div className="text-center py-10">
                  <FileText className="w-10 h-10 text-text-3 mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-text-3">Chưa có tài liệu hoặc CV nào được tải lên.</p>
                </div>
              ) : (
                internDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-lg border border-border bg-surface-2/50 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-text-1 block truncate">
                        {doc.fileName}
                      </span>
                      <span className="text-[11px] text-text-3 block mt-0.5">
                        Loại: <strong className="text-text-2">{doc.documentType}</strong> · {(doc.fileSize / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          doc.status === 'APPROVED'
                            ? 'bg-success-soft text-success'
                            : doc.status === 'REJECTED'
                            ? 'bg-danger-soft text-danger'
                            : 'bg-warning-soft text-warning'
                        }`}
                      >
                        {doc.status}
                      </span>
                      <button
                        onClick={() => documentService.downloadDocumentFile(doc.id, doc.fileName)}
                        className="p-1.5 rounded-md text-text-3 hover:text-primary hover:bg-surface border border-border transition-colors cursor-pointer"
                        title="Tải xuống tệp"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
