import React, { useState, useEffect, useCallback } from 'react';
import {
  LifeBuoy,
  PlusCircle,
  FileCheck,
  Download,
  Ban,
  UploadCloud,
  FileText,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmModal } from '../../../components/common/Modal/ConfirmModal';
import {
  supportRequestService,
  type SupportRequestResponse,
  type SupportRequestType,
} from '../../../services/supportRequestService';
import { getSupportRequestStatusLabel } from '../../../utils/formatters';

const TYPE_OPTIONS: { value: SupportRequestType; label: string; desc: string }[] = [
  {
    value: 'INTERNSHIP_CONFIRMATION',
    label: 'Giấy xác nhận thực tập',
    desc: 'Yêu cầu phòng Nhân sự cấp giấy xác nhận tham gia thực tập tại doanh nghiệp',
  },
  {
    value: 'COMPLETION_CERTIFICATE',
    label: 'Chứng nhận hoàn thành thực tập',
    desc: 'Cấp chứng chỉ/giấy chứng nhận hoàn thành kỳ thực tập có đóng dấu mộc (Hỗ trợ cả hợp đồng COMPLETED)',
  },
  {
    value: 'RECOMMENDATION_LETTER',
    label: 'Thư giới thiệu (Recommendation Letter)',
    desc: 'Yêu cầu thư giới thiệu nhận xét kết quả làm việc từ Mentor / Quản lý bộ phận',
  },
  {
    value: 'UNIVERSITY_CONFIRMATION',
    label: 'Xác nhận nộp Trường Đại học',
    desc: 'Ký xác nhận vào biểu mẫu thực tập do Trường Đại học của bạn cung cấp',
  },
  {
    value: 'ALLOWANCE_INQUIRY',
    label: 'Phúc khảo / Thắc mắc phụ cấp',
    desc: 'Khiếu nại sai sót số ngày công hoặc mức trợ cấp đã nhận trong tháng',
  },
  {
    value: 'OTHER',
    label: 'Yêu cầu hỗ trợ khác',
    desc: 'Các thắc mắc và đề xuất khác gửi đến bộ phận HR',
  },
];

export const InternSupportRequestPage: React.FC = () => {
  const [requests, setRequests] = useState<SupportRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal create
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [requestType, setRequestType] = useState<SupportRequestType>('INTERNSHIP_CONFIRMATION');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchMyRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await supportRequestService.getMyRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error('Không thể tải danh sách yêu cầu: ' + (err.message || 'Lỗi kết nối'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyRequests();
  }, [fetchMyRequests]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.warning('Vui lòng điền đầy đủ tiêu đề và nội dung yêu cầu');
      return;
    }
    try {
      setSubmitting(true);
      await supportRequestService.createRequest(
        {
          requestType,
          title,
          content,
        },
        file || undefined
      );
      toast.success('Gửi yêu cầu hỗ trợ thành công! HR sẽ phản hồi trong vòng 3 ngày làm việc.');
      setIsCreateModalOpen(false);
      setTitle('');
      setContent('');
      setFile(null);
      fetchMyRequests();
    } catch (err: any) {
      toast.error('Lỗi gửi yêu cầu: ' + (err.message || 'Hệ thống từ chối'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = (id: number) => {
    setCancelTargetId(id);
  };

  const handleConfirmCancelRequest = async () => {
    if (!cancelTargetId) return;
    try {
      setIsCancelling(true);
      await supportRequestService.cancelRequest(cancelTargetId);
      toast.success('Đã hủy yêu cầu thành công');
      setCancelTargetId(null);
      fetchMyRequests();
    } catch (err: any) {
      toast.error('Lỗi hủy yêu cầu: ' + (err.message || 'Không thể hủy'));
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDownloadAttachment = async (id: number, fileName?: string) => {
    try {
      const blob = await supportRequestService.downloadAttachment(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'dinh_kem';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error('Không thể tải file: ' + err.message);
    }
  };

  const handleDownloadResponseAttachment = async (id: number, fileName?: string) => {
    try {
      const blob = await supportRequestService.downloadResponseAttachment(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'van_ban_phan_hoi.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error('Không thể tải file phản hồi: ' + err.message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <LifeBuoy size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Yêu Cầu Hỗ Trợ & Giấy Tờ</h1>
            <p className="text-sm text-slate-500">
              Gửi ticket xin cấp giấy xác nhận thực tập, cấp phát thiết bị và phúc khảo đến phòng Nhân sự
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm"
        >
          <PlusCircle size={16} />
          <span>Tạo yêu cầu mới</span>
        </button>
      </div>

      {/* List / Cards */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Đang tải danh sách yêu cầu...</div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
          Bạn chưa gửi yêu cầu hỗ trợ nào. Bấm "Tạo yêu cầu mới" để gửi biểu mẫu.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex flex-col gap-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                    {TYPE_OPTIONS.find((t) => t.value === item.requestType)?.label || item.requestType}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      item.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'PROCESSING'
                        ? 'bg-blue-100 text-blue-800'
                        : item.status === 'CANCELLED'
                        ? 'bg-slate-100 text-slate-600'
                        : item.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {getSupportRequestStatusLabel(item.status)}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.content}</p>

                {(item.hrResponse || item.responseNote) && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-900">
                    <span className="font-bold">Phản hồi từ HR: </span>
                    {item.hrResponse || item.responseNote}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start md:self-center">
                {(item.attachmentFilename || item.attachmentFileName) && (
                  <button
                    onClick={() => handleDownloadAttachment(item.id, item.attachmentFilename || item.attachmentFileName)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700"
                  >
                    <Download size={14} />
                    <span>File gửi</span>
                  </button>
                )}

                {(item.responseFilename || item.responseAttachmentFileName) && (
                  <button
                    onClick={() => handleDownloadResponseAttachment(item.id, item.responseFilename || item.responseAttachmentFileName)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100"
                  >
                    <FileCheck size={14} />
                    <span>Tải kết quả</span>
                  </button>
                )}

                {item.status === 'PENDING' && (
                  <button
                    onClick={() => handleCancelRequest(item.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
                  >
                    <Ban size={14} />
                    <span>Hủy yêu cầu</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Create */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 flex flex-col gap-4 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900">Gửi Yêu Cầu Hỗ Trợ Mới</h2>
            <form onSubmit={handleCreateRequest} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Loại yêu cầu (*)</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as SupportRequestType)}
                  className="p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  {TYPE_OPTIONS.find((t) => t.value === requestType)?.desc}
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Tiêu đề yêu cầu (*)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Xin giấy xác nhận thực tập gửi trường..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Nội dung chi tiết (*)</label>
                <textarea
                  rows={4}
                  placeholder="Mô tả cụ thể thông tin cần cấp hoặc lý do phúc khảo..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">File tài liệu đính kèm (nếu có, tối đa 10MB)</label>
                {!file ? (
                  <label
                    htmlFor="support-file-upload"
                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 rounded-xl cursor-pointer transition-all duration-200 group bg-slate-50/60"
                  >
                    <div className="p-2.5 bg-white rounded-full shadow-sm border border-slate-100 group-hover:scale-110 group-hover:border-blue-200 transition-transform mb-2">
                      <UploadCloud className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-xs font-medium text-slate-700 text-center">
                      <span className="text-blue-600 font-semibold underline underline-offset-2">Nhấn để chọn tệp</span> hoặc kéo thả vào đây
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      PDF, PNG, JPG, DOC, DOCX (Tối đa 10MB)
                    </p>
                    <input
                      id="support-file-upload"
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0];
                        if (selectedFile) {
                          if (selectedFile.size > 10 * 1024 * 1024) {
                            toast.error('File không được vượt quá 10MB');
                            return;
                          }
                          setFile(selectedFile);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-blue-600 text-white rounded-lg flex-shrink-0 shadow-sm">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-semibold text-slate-800 truncate" title={file.name}>
                          {file.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      title="Gỡ bỏ tệp"
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={cancelTargetId !== null}
        title="Xác nhận hủy yêu cầu"
        message="Bạn có chắc chắn muốn hủy yêu cầu hỗ trợ này không? Hành động này sẽ dừng việc tiếp nhận và xử lý từ phía bộ phận Nhân sự."
        confirmText="Hủy yêu cầu"
        cancelText="Quay lại"
        variant="danger"
        isLoading={isCancelling}
        onConfirm={handleConfirmCancelRequest}
        onClose={() => setCancelTargetId(null)}
      />
    </div>
  );
};
