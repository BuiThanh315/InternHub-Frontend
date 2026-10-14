import React, { useState } from 'react';
import { X, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { meetingService } from '../../services/meetingService';
import type { CreateMeetingRequest } from '../../types/meeting.types';
import styles from './CreateMeetingModal.module.css';

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  internProfileId: number;
  internName: string;
  onSuccess?: () => void;
}

export const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({
  isOpen,
  onClose,
  internProfileId,
  internName,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [meetingType, setMeetingType] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');
  const [locationOrUrl, setLocationOrUrl] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề cuộc họp');
      return;
    }
    if (!startTime) {
      toast.error('Vui lòng chọn thời gian bắt đầu');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreateMeetingRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        meetingType,
        locationOrUrl: locationOrUrl.trim() || undefined,
        startTime: new Date(startTime).toISOString(),
        endTime: endTime ? new Date(endTime).toISOString() : undefined,
        internProfileId,
      };

      await meetingService.createMeeting(payload);
      toast.success('Đã lên lịch họp thành công!', {
        description: `Hệ thống đang tự động gửi email và thông báo realtime đến ${internName}.`,
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Lỗi tạo lịch họp:', err);
      toast.error(err.response?.data?.message || 'Không thể tạo lịch họp. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="#4f46e5" />
            <h3 className={styles.headerTitle}>Lên Lịch Họp Với {internName}</h3>
          </div>
          <button type="button" onClick={onClose} className={styles.closeBtn}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Tiêu đề cuộc họp <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="VD: Họp định kỳ tuần 3 / Trao đổi tiến độ..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Hình thức họp</label>
              <select
                className={styles.select}
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value as 'ONLINE' | 'OFFLINE')}
              >
                <option value="ONLINE">Trực tuyến (Online)</option>
                <option value="OFFLINE">Trực tiếp tại văn phòng</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                {meetingType === 'ONLINE' ? 'Link phòng họp (Tùy chọn)' : 'Phòng họp / Địa điểm'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder={meetingType === 'ONLINE' ? 'Dán link Meet/Teams (Để trống sẽ tự tạo phòng họp)' : 'Phòng họp tầng 3'}
                  value={locationOrUrl}
                  onChange={(e) => setLocationOrUrl(e.target.value)}
                />
              </div>
              {meetingType === 'ONLINE' && (
                <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                  💡 Để trống hệ thống sẽ tự sinh phòng họp trực tuyến (Jitsi Meet) kèm link vào họp tức thì.
                </span>
              )}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Thời gian bắt đầu <span className={styles.required}>*</span>
              </label>
              <input
                type="datetime-local"
                className={styles.input}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Thời gian kết thúc</label>
              <input
                type="datetime-local"
                className={styles.input}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Nội dung / Mục tiêu trao đổi</label>
            <textarea
              className={styles.textarea}
              placeholder="Chuẩn bị tài liệu báo cáo tuần, review code hoặc các thắc mắc cần giải đáp..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={isSubmitting}>
              Hủy
            </button>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>Lưu & Gửi Thông Báo</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
