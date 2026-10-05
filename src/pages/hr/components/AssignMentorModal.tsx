import React, { useState, useEffect } from 'react';
import { User, AlertTriangle, Info } from 'lucide-react';
import type { InternProfile, MentorOption } from '../../../types';
import { Modal, Button } from '../../../components/common';
import { internService } from '../../../services/internService';
import { checkMentorDepartmentMatch } from '../../../utils/departmentMatcher';

interface AssignMentorModalProps {
  intern: InternProfile | null;
  onClose: () => void;
  onSuccess: (updated: InternProfile) => void;
}

export const AssignMentorModal: React.FC<AssignMentorModalProps> = ({
  intern,
  onClose,
  onSuccess,
}) => {
  const [mentors, setMentors] = useState<MentorOption[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState<number | ''>('');
  const [activeTab, setActiveTab] = useState<'DEPARTMENT' | 'ALL'>('DEPARTMENT');
  const [notes, setNotes] = useState('');
  const [replaceReason, setReplaceReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMentors, setLoadingMentors] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReplacing = Boolean(intern?.mentorId);

  useEffect(() => {
    if (!intern) return;
    setError(null);
    setSelectedMentorId('');
    setNotes('');
    setReplaceReason('');
    fetchMentors();
  }, [intern]);

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

  if (!intern) return null;

  const isBlockedByProgram = Boolean(intern.needsReassignment) || !intern.programId;
  const selectedMentor = mentors.find((m) => m.id === Number(selectedMentorId));
  const isHighWorkload = selectedMentor ? selectedMentor.activeInternCount >= 5 : false;
  const filteredDeptMentors = mentors
    .filter((m) => checkMentorDepartmentMatch(m, intern.programName))
    .sort((a, b) => a.activeInternCount - b.activeInternCount);

  const displayedMentors = (activeTab === 'DEPARTMENT' && filteredDeptMentors.length > 0)
    ? filteredDeptMentors
    : [...mentors].sort((a, b) => a.activeInternCount - b.activeInternCount);

  const isDifferentDept = selectedMentor ? !checkMentorDepartmentMatch(selectedMentor, intern.programName) : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlockedByProgram) return;

    if (!selectedMentorId) {
      setError('Vui lòng chọn một người hướng dẫn (Mentor)');
      return;
    }

    if (isReplacing && (!replaceReason || !replaceReason.trim())) {
      setError('Vui lòng nhập lý do thay đổi người hướng dẫn');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const updated = await internService.assignMentor(intern.id, {
        mentorId: Number(selectedMentorId),
        notes: notes.trim() || undefined,
        replaceReason: isReplacing ? replaceReason.trim() : undefined,
      });
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi phân công Mentor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={!!intern}
      onClose={onClose}
      title={isReplacing ? 'Thay Đổi Người Hướng Dẫn (Mentor)' : 'Phân Công Người Hướng Dẫn (Mentor)'}
      size="md"
      footer={
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            isLoading={loading}
            disabled={loading || isBlockedByProgram || !selectedMentorId}
          >
            {isReplacing ? 'Lưu Thay Đổi' : 'Xác Nhận Phân Công'}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* TTS Info Card */}
        <div
          style={{
            background: 'var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            border: '1px solid var(--border-default)',
            fontSize: '0.875rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <User size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
              {intern.fullName} ({intern.internCode})
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <div>Vị trí: <strong>{intern.appliedPosition}</strong></div>
            <div>Chương trình: <strong>{intern.programName || 'Chưa gán'}</strong></div>
            {isReplacing && (
              <div style={{ gridColumn: '1 / -1', color: 'var(--danger)', fontWeight: 500 }}>
                Mentor hiện tại: {intern.mentorName || 'Không rõ'}
              </div>
            )}
          </div>
        </div>

        {/* Blocking Warning if needsProgramReassignment */}
        {isBlockedByProgram && (
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <AlertTriangle size={18} />
              <span>Chưa thể phân công Mentor</span>
            </div>
            <p style={{ margin: 0, lineHeight: 1.5 }}>
              Thực tập sinh này hiện chưa được xếp vào Chương trình thực tập nào hoặc đang chờ điều phối lại chương trình. Vui lòng hoàn tất việc tiếp nhận hoặc xếp chương trình trước khi chỉ định người hướng dẫn.
            </p>
          </div>
        )}

        {/* Form Controls */}
        {!isBlockedByProgram && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              {/* Tab Selector */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('DEPARTMENT')}
                  style={{
                    background: activeTab === 'DEPARTMENT' ? 'var(--primary)' : 'transparent',
                    color: activeTab === 'DEPARTMENT' ? '#fff' : 'var(--text-secondary)',
                    border: 'none',
                    padding: '0.4rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  🎯 Cùng Phòng Ban ({filteredDeptMentors.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ALL')}
                  style={{
                    background: activeTab === 'ALL' ? 'var(--primary)' : 'transparent',
                    color: activeTab === 'ALL' ? '#fff' : 'var(--text-secondary)',
                    border: 'none',
                    padding: '0.4rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  🌐 Toàn Bộ Mentor ({mentors.length})
                </button>
              </div>

              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                Chọn Người Hướng Dẫn (Mentor) <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <select
                className="form-select"
                value={selectedMentorId}
                onChange={(e) => setSelectedMentorId(e.target.value ? Number(e.target.value) : '')}
                disabled={loadingMentors || loading}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)' }}
              >
                <option value="">-- Chọn Mentor từ danh sách --</option>
                {displayedMentors.map((m) => {
                  const isPending = m.status === 'PENDING_ACTIVATION';
                  const loadIndicator = m.activeInternCount >= 5 ? '🔴 Quá tải' : m.activeInternCount >= 3 ? '🟡 Trung bình' : '🟢 Sẵn sàng';
                  return (
                    <option key={m.id} value={m.id} disabled={isPending}>
                      {m.fullName} - {m.departmentName || 'Chung'} [{loadIndicator}: {m.activeInternCount} TTS]
                      {isPending ? ' (Chờ kích hoạt)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Static Workload Warning if >= 5 */}
            {isHighWorkload && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--warning-bg)',
                  border: '1px solid var(--warning-border)',
                  color: '#92400e',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                }}
              >
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Cảnh báo định mức:</strong> Mentor này hiện đang hướng dẫn {selectedMentor?.activeInternCount} TTS (vượt khuyến nghị 5 TTS/mentor). Bạn vẫn có thể tiếp tục phân công nếu được phê duyệt.
                </span>
              </div>
            )}

            {/* Static Department Matching Notice */}
            {isDifferentDept && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--info-bg)',
                  border: '1px solid var(--info-border)',
                  color: 'var(--info)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                }}
              >
                <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  Lưu ý: Mentor thuộc {selectedMentor?.departmentName}, khác với phòng ban dự kiến của Chương trình thực tập.
                </span>
              </div>
            )}

            {/* Required Replace Reason when Changing Mentor */}
            {isReplacing && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                  Lý Do Thay Đổi Người Hướng Dẫn <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={replaceReason}
                  onChange={(e) => setReplaceReason(e.target.value)}
                  placeholder="Nhập lý do thay đổi mentor (ví dụ: Mentor cũ chuyển công tác, phân bổ lại dự án...)"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                Ghi Chú Hướng Dẫn / Định Hướng
              </label>
              <textarea
                className="form-textarea"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú phân công (mảng chuyên môn, dự án bàn giao...)"
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}
              />
            </div>

            {error && (
              <div style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 500 }}>
                {error}
              </div>
            )}
          </form>
        )}
      </div>
    </Modal>
  );
};
