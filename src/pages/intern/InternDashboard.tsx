import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  UploadCloud,
  FileText,
  GraduationCap,
  User,
  ShieldAlert,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { useInterns, useInternDocuments, useUploadDocument } from '../../features/interns/hooks/useInterns';
import { getInternStepProgress } from '../../features/interns/schema';
import { documentService } from '../../services/documentService';
import type { DocumentType } from '../../types';

export const InternDashboard: React.FC = () => {
  const internCode = 'INT-2026-001'; // Default logged-in mock intern

  const { data: internPage, isLoading: loadingIntern } = useInterns({ keyword: internCode });
  const { data: documents = [], isLoading: loadingDocs } = useInternDocuments(internCode);
  const uploadDocMutation = useUploadDocument();

  // Upload new doc state (TM-4)
  const [uploadType, setUploadType] = useState<DocumentType>('CV');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const profile = internPage?.content && internPage.content.length > 0 ? internPage.content[0] : null;

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Vui lòng chọn một tệp tin');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('Kích thước tệp vượt quá 5MB. Vui lòng chọn tệp nhỏ hơn.');
      return;
    }

    uploadDocMutation.mutate(
      {
        internCode,
        file: selectedFile,
        documentType: uploadType,
      },
      {
        onSuccess: () => {
          setSelectedFile(null);
        },
      }
    );
  };

  const loading = loadingIntern || loadingDocs;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-text-1 font-heading">
          Không Gian Thực Tập Sinh (Intern Portal)
        </h1>
        <p className="text-sm text-text-2 mt-0.5">
          Theo dõi lộ trình thực tập, tra cứu kết quả thẩm định hồ sơ và nộp tài liệu trực tuyến (TM-4, TM-5)
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-text-3 text-sm animate-pulse">
          Đang nạp thông tin cá nhân và tài liệu...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Progress Stepper */}
          <div className="p-5 rounded-xl border border-border bg-surface shadow-card">
            <h3 className="text-sm font-bold text-text-1 font-heading mb-4">
              Lộ Trình Kỳ Thực Tập Của Bạn
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { num: 1, label: 'Nộp Hồ Sơ & CV', desc: 'Đã hoàn tất nộp online' },
                { num: 2, label: 'HR Phê Duyệt', desc: 'Thẩm định hồ sơ' },
                { num: 3, label: 'Đang Thực Tập', desc: 'Làm việc cùng Mentor' },
                { num: 4, label: 'Hoàn Thành', desc: 'Đánh giá & Cấp chứng nhận' },
              ].map((step) => {
                const state = getInternStepProgress(profile?.status, step.num);
                return (
                  <div key={step.num} className="flex flex-col items-center text-center p-3 rounded-lg bg-surface-2/60">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                        state === 'completed'
                          ? 'bg-success text-white'
                          : state === 'active'
                          ? 'bg-primary text-white ring-4 ring-primary-soft'
                          : 'bg-border-soft text-text-3'
                      }`}
                    >
                      {state === 'completed' ? <CheckCircle2 size={18} /> : step.num}
                    </div>
                    <p className={`text-xs font-bold ${state === 'pending' ? 'text-text-3' : 'text-text-1'}`}>
                      {step.label}
                    </p>
                    <span className="text-[10px] text-text-3 mt-0.5">{step.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Profile Card & Mentorship Info */}
          {profile && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Student Info */}
              <div className="lg:col-span-2 p-5 rounded-xl border border-border bg-surface shadow-card space-y-4">
                <div className="flex items-center justify-between border-b border-border-soft pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-soft text-primary font-bold text-sm flex items-center justify-center border border-border">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-text-1 font-heading">{profile.fullName}</h3>
                      <span className="text-xs font-semibold text-primary">Mã TTS: {profile.internCode}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-soft text-success border border-success/20">
                    {profile.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-text-3 block">Email liên hệ:</span>
                    <strong className="text-text-1 font-semibold">{profile.email}</strong>
                  </div>
                  <div>
                    <span className="text-text-3 block">Số điện thoại:</span>
                    <strong className="text-text-1 font-semibold">{profile.phone}</strong>
                  </div>
                  <div>
                    <span className="text-text-3 block">Trường đại học:</span>
                    <strong className="text-text-1 font-semibold">{profile.university}</strong>
                  </div>
                  <div>
                    <span className="text-text-3 block">Chuyên ngành:</span>
                    <strong className="text-text-1 font-semibold">{profile.major}</strong>
                  </div>
                  <div>
                    <span className="text-text-3 block">Điểm GPA:</span>
                    <strong className="text-text-1 font-semibold">{profile.gpa ? profile.gpa.toFixed(2) : 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-text-3 block">Phòng ban phân bổ:</span>
                    <strong className="text-text-1 font-semibold">{profile.department || 'Đang cập nhật'}</strong>
                  </div>
                </div>
              </div>

              {/* Mentor Info */}
              <div className="p-5 rounded-xl border border-border bg-surface shadow-card space-y-3 border-l-4 border-l-success">
                <div className="flex items-center gap-2 text-success font-bold text-sm">
                  <User size={18} />
                  <span>Mentor Hướng Dẫn</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <p className="text-text-2">
                    Họ và tên: <strong className="text-text-1">{profile.mentorName || 'Lê Văn Hướng Dẫn'}</strong>
                  </p>
                  <p className="text-text-2">
                    Email hỗ trợ: <strong className="text-text-1">mentor@internhub.vn</strong>
                  </p>
                  <p className="text-text-2">
                    Thời gian: <strong className="text-text-1">{profile.startDate || '01/03/2026'}</strong> đến{' '}
                    <strong className="text-text-1">{profile.endDate || '30/06/2026'}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upload & Document Management Section (TM-4, TM-5) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Document Status List (2/3) */}
            <div className="lg:col-span-2 p-5 rounded-xl border border-border bg-surface shadow-card space-y-4">
              <h3 className="text-sm font-bold text-text-1 font-heading border-b border-border-soft pb-3">
                Danh Sách Hồ Sơ & Kết Quả Thẩm Định (TM-5)
              </h3>

              {documents.length === 0 ? (
                <p className="text-xs text-text-3 text-center py-8">Chưa có tài liệu nào được nộp.</p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className={`p-3.5 rounded-lg border transition-all ${
                        doc.status === 'REJECTED'
                          ? 'border-danger/30 bg-danger-soft/30'
                          : 'border-border bg-surface-2/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <FileText size={20} className="text-primary shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-text-1 block truncate">
                              {doc.fileName}
                            </span>
                            <span className="text-[11px] text-text-3 block mt-0.5">
                              Loại: {doc.documentType} · {(doc.fileSize / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {doc.status === 'APPROVED' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-success-soft text-success">
                              <CheckCircle2 size={12} /> Đã Duyệt
                            </span>
                          )}
                          {(doc.status === 'PENDING' || doc.status === 'PENDING_REVIEW') && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-warning-soft text-warning">
                              <Clock size={12} /> Chờ Duyệt
                            </span>
                          )}
                          {doc.status === 'REJECTED' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-danger-soft text-danger">
                              <ShieldAlert size={12} /> Từ Chối
                            </span>
                          )}

                          <a
                            href={documentService.getDocumentDownloadUrl(doc.id, 'attachment')}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded text-text-3 hover:text-text-1 hover:bg-surface transition-colors"
                            title="Tải về"
                          >
                            <Download size={14} />
                          </a>
                        </div>
                      </div>

                      {/* Lý do từ chối từ HR (TM-5) */}
                      {doc.status === 'REJECTED' && doc.rejectionReason && (
                        <div className="mt-2.5 p-2 rounded bg-danger-soft border border-danger/20 text-danger text-[11px]">
                          <strong>Lý do từ chối từ HR:</strong> {doc.rejectionReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upload New Document Dropzone (TM-4) (1/3) */}
            <div className="p-5 rounded-xl border border-border bg-surface shadow-card space-y-4">
              <div>
                <h3 className="text-sm font-bold text-text-1 font-heading">
                  Nộp Thêm Tài Liệu Mới (TM-4)
                </h3>
                <p className="text-[11px] text-text-3 mt-0.5">
                  Bổ sung CV hoặc nộp lại tài liệu bị yêu cầu sửa đổi
                </p>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-text-2 mb-1">
                    Loại tài liệu cần nộp
                  </label>
                  <select
                    className="w-full px-3 py-2 text-xs rounded-lg bg-bg border border-border text-text-1 focus:outline-none focus:border-primary font-medium"
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as DocumentType)}
                  >
                    <option value="CV">CV / Sơ Yếu Lý Lịch</option>
                    <option value="INTERNSHIP_APPLICATION">Đơn Xin Thực Tập</option>
                    <option value="TRANSCRIPT">Bảng Điểm Tích Lũy</option>
                    <option value="RECOMMENDATION_LETTER">Giấy Giới Thiệu Từ Trường</option>
                    <option value="OTHER">Tài Liệu Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-2 mb-1">
                    Chọn tệp tin (PDF/DOCX, tối đa 5MB)
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-border rounded-lg bg-surface-2/50 hover:bg-surface-2 cursor-pointer transition-colors text-center">
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                    />
                    {selectedFile ? (
                      <div>
                        <FileText size={24} className="text-primary mx-auto mb-1.5" />
                        <p className="text-xs font-semibold text-text-1 truncate max-w-[200px]">
                          {selectedFile.name}
                        </p>
                        <span className="text-[10px] text-text-3">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Bấm để đổi tệp
                        </span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={24} className="text-primary mb-1" />
                        <p className="text-xs font-semibold text-text-1">Bấm để chọn tệp</p>
                        <span className="text-[10px] text-text-3">Hỗ trợ PDF, DOCX tối đa 5MB</span>
                      </>
                    )}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={uploadDocMutation.isPending || !selectedFile}
                  className="w-full py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover shadow-xs transition-colors disabled:opacity-50"
                >
                  {uploadDocMutation.isPending ? 'Đang tải lên...' : 'Tải Lên Tài Liệu'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
