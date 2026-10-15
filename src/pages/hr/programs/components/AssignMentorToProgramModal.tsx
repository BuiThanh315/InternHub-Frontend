import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Building,
  Mail,
  UserCheck,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal, Button } from '../../../../components/common';
import { programService } from '../../../../services/programService';
import { internService } from '../../../../services/internService';
import { checkMentorDepartmentMatch } from '../../../../utils/departmentMatcher';
import type { ProgramDetailResponse, MentorOption, AssignMentorToProgramResponse } from '../../../../types';

interface AssignMentorToProgramModalProps {
  isOpen: boolean;
  program: ProgramDetailResponse | null;
  onClose: () => void;
  onSuccess: (result: AssignMentorToProgramResponse) => void;
}

export const AssignMentorToProgramModal: React.FC<AssignMentorToProgramModalProps> = ({
  isOpen,
  program,
  onClose,
  onSuccess,
}) => {
  const [mentors, setMentors] = useState<MentorOption[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState<number | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'DEPARTMENT' | 'ALL'>('DEPARTMENT');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMentors, setLoadingMentors] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !program) return;
    setError(null);
    setSelectedMentorId('');
    setSearchTerm('');
    setNotes('');
    void fetchMentors();
  }, [isOpen, program]);

  const fetchMentors = async () => {
    setLoadingMentors(true);
    try {
      const data = await internService.getAvailableMentors();
      setMentors(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách Mentor');
    } finally {
      setLoadingMentors(false);
    }
  };

  if (!program) return null;

  const selectedMentor = mentors.find((m) => m.id === Number(selectedMentorId));
  const isHighWorkload = selectedMentor ? selectedMentor.activeInternCount >= 5 : false;

  // Lọc theo bộ phận
  const departmentMatchedMentors = mentors
    .filter((m) => checkMentorDepartmentMatch(m, program.name) || checkMentorDepartmentMatch(m, program.departmentName))
    .sort((a, b) => a.activeInternCount - b.activeInternCount);

  const baseList = activeTab === 'DEPARTMENT' && departmentMatchedMentors.length > 0
    ? departmentMatchedMentors
    : [...mentors].sort((a, b) => a.activeInternCount - b.activeInternCount);

  const displayedMentors = searchTerm.trim()
    ? baseList.filter((m) =>
        m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.departmentName && m.departmentName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : baseList;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMentorId) {
      setError('Vui lòng chọn một Mentor để phân công cho kỳ');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await programService.assignMentorToProgram(program.id, {
        mentorId: Number(selectedMentorId),
        notes: notes.trim() || undefined,
      });

      toast.success(
        `Đã gán Mentor ${result.mentorName} cho kỳ thực tập! (${result.totalAssignedInterns} TTS đã được cập nhật)`
      );
      onSuccess(result);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi phân công Mentor cho kỳ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gán Mentor Cho Toàn Bộ Kỳ Thực Tập"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Banner thông tin kỳ thực tập */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Mã kỳ: <strong className="font-mono text-slate-700">{program.programCode}</strong></span>
            <span>Khoa / Bộ phận: <strong className="text-slate-700">{program.departmentName || 'Kỹ thuật'}</strong></span>
          </div>
          <h4 className="font-bold text-slate-900 text-sm">
            {program.name}
          </h4>
          <div className="mt-0.5 text-xs text-indigo-600 font-semibold">
            Số TTS hiện tại: {program.currentInterns} / {program.maxInterns} chỉ tiêu
          </div>
        </div>

        {/* Thông báo cơ chế Batch Cascade */}
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-3 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-950">
            <AlertTriangle size={14} className="text-amber-600 shrink-0" />
            <span>Cơ chế Phân công Tự động (Cascade Assignment)</span>
          </div>
          <p className="leading-relaxed text-amber-800 text-[11px]">
            Khi gán Mentor cho kỳ, <strong>toàn bộ thực tập sinh đã duyệt (APPROVED) và đang thực tập (INTERNING)</strong> trong kỳ sẽ được phân công trực tiếp cho Mentor này. Các phân công cũ (nếu có) sẽ tự động được chuyển sang trạng thái <em>ĐÃ THAY THẾ</em>.
          </p>
        </div>

        {/* Tabs bộ lọc Mentor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-800">
              Chọn Người Hướng Dẫn (Mentor) <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs border border-slate-200/60">
              <button
                type="button"
                onClick={() => setActiveTab('DEPARTMENT')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  activeTab === 'DEPARTMENT'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cùng Bộ Phận ({departmentMatchedMentors.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ALL')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  activeTab === 'ALL'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất Cả ({mentors.length})
              </button>
            </div>
          </div>

          {/* Ô tìm kiếm nhanh */}
          <div className="relative mb-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, email, chuyên môn..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs"
            />
          </div>

          {/* Danh sách Mentors có thể chọn */}
          {loadingMentors ? (
            <div className="py-6 text-center text-xs text-slate-500">
              Đang tải danh sách Mentor...
            </div>
          ) : displayedMentors.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              Không tìm thấy Mentor phù hợp trong danh sách.
            </div>
          ) : (
            <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
              {displayedMentors.map((m) => {
                const isSelected = Number(selectedMentorId) === m.id;
                const isOverloaded = m.activeInternCount >= 5;

                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMentorId(m.id)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-indigo-50/90 border-indigo-400 shadow-xs ring-1 ring-indigo-400'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-indigo-50 border border-indigo-100 text-indigo-700'
                      }`}>
                        {m.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span>{m.fullName}</span>
                          {isSelected && <UserCheck size={13} className="text-indigo-600" />}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail size={11} className="text-slate-400" /> {m.email}
                          </span>
                          {m.departmentName && (
                            <span className="flex items-center gap-1">
                              <Building size={11} className="text-slate-400" /> {m.departmentName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        isOverloaded
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        Đang kèm: {m.activeInternCount} TTS
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cảnh báo tải cao nếu Mentor được chọn >= 5 TTS */}
        {isHighWorkload && selectedMentor && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle size={15} className="text-rose-600 shrink-0" />
            <span>
              Mentor <strong>{selectedMentor.fullName}</strong> hiện đang hướng dẫn {selectedMentor.activeInternCount} thực tập sinh (tải cao). Bạn vẫn có thể tiếp tục phân công nếu đã được chấp thuận.
            </span>
          </div>
        )}

        {/* Ghi chú */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Ghi Chú Phân Công (Không bắt buộc)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Ví dụ: Phân công Mentor chính phụ trách giai đoạn 1 của kỳ thực tập..."
            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs"
          />
        </div>

        {/* Thông báo lỗi nếu có */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Buttons hành động */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Hủy Bỏ
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={loading || !selectedMentorId}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <ShieldCheck size={14} />
            {loading ? 'Đang Phân Công...' : 'Xác Nhận Gán Cho Cả Kỳ'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
