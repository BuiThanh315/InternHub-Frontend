import React, { useState, useEffect } from 'react';
import { X, Sparkles, FileText, User, Eye, Download, Award, Calendar, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import type { InternProfile, DocumentResponse, WeeklyAssessment, CreateWeeklyAssessmentPayload } from '../../../types';
import type { CreateMeetingRequest } from '../../../types/meeting.types';
import { MentorWeeklyEvaluationHub } from './MentorWeeklyEvaluationHub';
import { MentorFinalEvaluationTab } from './MentorFinalEvaluationTab';
import { documentService } from '../../../services/documentService';
import { meetingService } from '../../../services/meetingService';
import { Button } from '../../../components/common/Button/Button';
import { getInternStatusLabel } from '../../../utils/formatters';
import styles from './MentorInternDetailDrawer.module.css';

export interface MentorInternDetailModalProps {
  intern: InternProfile | null;
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentResponse[];
  historyAssessments: WeeklyAssessment[];
  onSaveAssessment: (payload: CreateWeeklyAssessmentPayload) => Promise<void>;
  loading?: boolean;
}

export const MentorInternDetailModal: React.FC<MentorInternDetailModalProps> = ({
  intern,
  isOpen,
  onClose,
  documents,
  historyAssessments,
  onSaveAssessment,
  loading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'evaluation' | 'final' | 'documents' | 'profile' | 'meeting'>('evaluation');

  // State cho Form Lên lịch họp 1-1 nội tuyến
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDesc, setMeetingDesc] = useState('');
  const [meetingType, setMeetingType] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');
  const [meetingLocationOrUrl, setMeetingLocationOrUrl] = useState('');
  const [meetingStartTime, setMeetingStartTime] = useState('');
  const [meetingEndTime, setMeetingEndTime] = useState('');
  const [isSubmittingMeeting, setIsSubmittingMeeting] = useState(false);

  // Khóa scroll body & lắng nghe ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Reset tab khi mở lại
  useEffect(() => {
    if (isOpen) {
      setActiveTab('evaluation');
    }
  }, [isOpen, intern?.id]);

  if (!isOpen || !intern) return null;

  const internDocs = documents.filter((d) => d.internCode === intern.internCode);

  const handleMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle.trim()) {
      toast.error('Vui lòng nhập tiêu đề cuộc họp.');
      return;
    }
    if (!meetingStartTime) {
      toast.error('Vui lòng chọn thời gian bắt đầu.');
      return;
    }

    try {
      setIsSubmittingMeeting(true);
      const payload: CreateMeetingRequest = {
        title: meetingTitle.trim(),
        description: meetingDesc.trim() || undefined,
        meetingType,
        locationOrUrl: meetingLocationOrUrl.trim() || undefined,
        startTime: new Date(meetingStartTime).toISOString(),
        endTime: meetingEndTime ? new Date(meetingEndTime).toISOString() : undefined,
        internProfileId: intern.id,
      };

      await meetingService.createMeeting(payload);
      toast.success('Đã lên lịch họp 1-1 thành công!', {
        description: `Hệ thống đã tự động gửi lời mời họp và thông báo đến ${intern.fullName}.`,
      });

      // Reset form & chuyển về tab đánh giá
      setMeetingTitle('');
      setMeetingDesc('');
      setMeetingLocationOrUrl('');
      setMeetingStartTime('');
      setMeetingEndTime('');
      setActiveTab('evaluation');
    } catch (err: any) {
      console.error('Lỗi tạo lịch họp:', err);
      toast.error(err.response?.data?.message || 'Không thể tạo lịch họp. Vui lòng thử lại.');
    } finally {
      setIsSubmittingMeeting(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mentor-intern-detail-title"
      tabIndex={-1}
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        {/* Header Modal */}
        <div className={styles.modalHeader}>
          <div className={styles.headerInfo}>
            <div className={styles.avatar}>
              {intern.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 id="mentor-intern-detail-title" className={styles.title}>
                {intern.fullName}
              </h2>
              <span className={styles.subtitle}>
                {intern.internCode} • {intern.appliedPosition || 'Thực tập sinh'} • {intern.university}
              </span>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.btnScheduleMeeting}
              onClick={() => setActiveTab('meeting')}
              title="Lên lịch họp 1-1 với thực tập sinh"
            >
              <Calendar size={15} /> Lên Lịch Họp 1-1
            </button>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Đóng cửa sổ chi tiết"
              title="Đóng (ESC)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabNav}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'evaluation' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('evaluation')}
          >
            <Sparkles size={16} /> Đánh Giá & Đồng Hành Tuần
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'final' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('final')}
          >
            <Award size={16} /> Tổng Kết Kỳ Thực Tập
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'documents' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <FileText size={16} /> Hồ Sơ & Tài Liệu ({internDocs.length})
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={16} /> Thông Tin Tiếp Nhận
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'meeting' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('meeting')}
          >
            <Calendar size={16} /> Lên Lịch Họp 1-1
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.modalContent}>
          {activeTab === 'evaluation' && (
            <MentorWeeklyEvaluationHub
              internCode={intern.internCode}
              internName={intern.fullName}
              currentWeek={8}
              historyAssessments={historyAssessments}
              onSaveAssessment={onSaveAssessment}
              loading={loading}
            />
          )}

          {activeTab === 'final' && (
            <MentorFinalEvaluationTab
              internCode={intern.internCode}
              internName={intern.fullName}
            />
          )}

          {activeTab === 'documents' && (
            <div className={styles.docSection}>
              {internDocs.length === 0 ? (
                <div className={styles.emptyDoc}>Chưa có tài liệu nào được nộp cho thực tập sinh này.</div>
              ) : (
                <div className={styles.docList}>
                  {internDocs.map((doc) => (
                    <div key={doc.id} className={styles.docItem}>
                      <div className={styles.docHeader}>
                        <FileText size={18} color="var(--primary, #6366f1)" />
                        <div>
                          <p className={styles.docName}>{doc.originalFileName || doc.fileName}</p>
                          <span className={styles.docMeta}>
                            Loại: {doc.documentType === 'CV' ? 'CV Ứng Tuyển' : 'Tài Liệu'}
                          </span>
                        </div>
                      </div>
                      <div className={styles.docActions}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => documentService.previewDocumentFile(doc.id)}
                        >
                          <Eye size={12} /> Xem
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => documentService.downloadDocumentFile(doc.id, doc.originalFileName)}
                        >
                          <Download size={12} /> Tải
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className={styles.profileSection}>
              <div className={styles.profileGrid}>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>Chương trình thực tập:</span>
                  <p className={styles.profileValue}>{intern.programName || 'Chương trình tiêu chuẩn'}</p>
                </div>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>Email liên hệ:</span>
                  <p className={styles.profileValue}>{intern.email}</p>
                </div>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>Số điện thoại:</span>
                  <p className={styles.profileValue}>{intern.phone || '—'}</p>
                </div>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>Trường đào tạo:</span>
                  <p className={styles.profileValue}>{intern.university} ({intern.major})</p>
                </div>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>Thời gian thực tập:</span>
                  <p className={styles.profileValue}>
                    {intern.startDate} → {intern.endDate || 'Hiện tại'}
                  </p>
                </div>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>Trạng thái hiện tại:</span>
                  <div className={styles.profileValue}>
                    <span className={`badge ${intern.status === 'INTERNING' ? 'badge-success' : 'badge-warning'}`}>
                      {getInternStatusLabel(intern.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'meeting' && (
            <div className={styles.meetingSection}>
              <div className={styles.meetingHeader}>
                <h3 className={styles.meetingTitle}>
                  <Calendar size={20} color="var(--primary, #4f46e5)" />
                  Lên Lịch Họp 1-1 Trực Tiếp Với {intern.fullName}
                </h3>
                <p className={styles.meetingDesc}>
                  Tạo cuộc họp định kỳ hoặc trao đổi tiến độ. Hệ thống sẽ tự động gửi email và thông báo realtime cho thực tập sinh.
                </p>
              </div>

              <form onSubmit={handleMeetingSubmit} className={styles.meetingForm}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Tiêu đề cuộc họp <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="VD: Họp định kỳ tuần 3 / Hướng dẫn xử lý vướng mắc..."
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Hình thức họp</label>
                    <select
                      className={styles.select}
                      value={meetingType}
                      onChange={(e) => setMeetingType(e.target.value as 'ONLINE' | 'OFFLINE')}
                    >
                      <option value="ONLINE">Trực tuyến (Google Meet / Zoom)</option>
                      <option value="OFFLINE">Trực tiếp tại văn phòng</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      {meetingType === 'ONLINE' ? 'Đường link cuộc họp (URL)' : 'Địa điểm phòng họp'}
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder={
                        meetingType === 'ONLINE'
                          ? 'https://meet.google.com/...'
                          : 'Phòng họp Tầng 3, Trụ sở chính...'
                      }
                      value={meetingLocationOrUrl}
                      onChange={(e) => setMeetingLocationOrUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Thời gian bắt đầu <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="datetime-local"
                      className={styles.input}
                      value={meetingStartTime}
                      onChange={(e) => setMeetingStartTime(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Thời gian kết thúc</label>
                    <input
                      type="datetime-local"
                      className={styles.input}
                      value={meetingEndTime}
                      onChange={(e) => setMeetingEndTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Nội dung / Ghi chú cuộc họp</label>
                  <textarea
                    rows={3}
                    className={styles.textarea}
                    placeholder="Nêu tóm tắt mục tiêu, chuẩn bị tài liệu hoặc vấn đề cần thảo luận..."
                    value={meetingDesc}
                    onChange={(e) => setMeetingDesc(e.target.value)}
                  />
                </div>

                <div className={styles.formActions}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setActiveTab('evaluation')}
                    disabled={isSubmittingMeeting}
                  >
                    Hủy Bỏ
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmittingMeeting}
                  >
                    {isSubmittingMeeting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Đang tạo lịch...
                      </>
                    ) : (
                      <>
                        <Send size={15} /> Tạo & Gửi Lời Mời Họp
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Backward-compatible alias
export const MentorInternDetailDrawer = MentorInternDetailModal;
export type MentorInternDetailDrawerProps = MentorInternDetailModalProps;
