import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Kanban,
  FileCheck2,
  CalendarCheck,
  ClipboardList,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import type { InternProfile, DocumentResponse, DocumentType } from '../../../../types';
import { ROUTES } from '../../../../constants/routes';
import { attendanceService } from '../../../../services/attendanceService';
import {
  InternAttendanceWidget,
  AttendanceActionModal,
} from '../Attendance';
import type { AttendanceActionType } from '../Attendance';
import { useAttendanceToday } from '../../hooks/useAttendanceToday';
import { InternProfileCard } from '../InternProfileCard';
import { InternScheduleWidget } from '../InternScheduleWidget';
import { InternDocumentList } from '../InternDocumentList';
import { InternUploadForm } from '../InternUploadForm';
import styles from './Workspaces.module.css';

interface ActiveProductionWorkspaceProps {
  profile: InternProfile;
  documents: DocumentResponse[];
  onUploadDocument: (file: File, type: DocumentType) => Promise<void>;
  isUploading: boolean;
  onRefresh?: () => void;
}

export const ActiveProductionWorkspace: React.FC<ActiveProductionWorkspaceProps> = ({
  profile,
  documents,
  onUploadDocument,
  isUploading,
}) => {
  const navigate = useNavigate();
  const [modalAction, setModalAction] = useState<AttendanceActionType | null>(null);

  const {
    todayData,
    loading: attendanceLoading,
    refetch: refetchAttendance,
  } = useAttendanceToday();

  const handleQuickCheckOut = async () => {
    try {
      let lat: number | undefined;
      let lon: number | undefined;
      let acc: number | undefined;

      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 4000,
              enableHighAccuracy: true,
            });
          });
          lat = pos.coords.latitude;
          lon = pos.coords.longitude;
          acc = pos.coords.accuracy;
        } catch {
          // GPS optional
        }
      }

      let fp = localStorage.getItem('internhub_device_fingerprint');
      if (!fp) {
        fp = 'dev_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36);
        localStorage.setItem('internhub_device_fingerprint', fp);
      }

      await attendanceService.quickCheckOut({
        deviceFingerprint: fp,
        latitude: lat,
        longitude: lon,
        accuracyMeters: acc,
        notes: 'Tan ca nhanh qua Active Workspace',
      });

      toast.success('Tan ca thành công! Chúc bạn buổi tối vui vẻ.');
      refetchAttendance();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể thực hiện tan ca nhanh.';
      toast.error(msg);
    }
  };

  return (
    <div className={styles.workspaceLayout}>
      {/* Banner đang hoạt động */}
      <div className={`${styles.statusBanner} ${styles.interning}`}>
        <ShieldCheck size={22} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div className={styles.statusBannerTitle}>Không Gian Làm Việc Trực Tuyến Đang Hoạt Động</div>
          <div>
            Bạn đang tham gia thực tập tại chương trình <strong>{profile.programName || profile.programCode}</strong>.
            Hãy thực hiện điểm danh GPS hàng ngày, kiểm tra bảng Kanban nhiệm vụ và cập nhật báo cáo tuần đúng hạn.
          </div>
        </div>
      </div>

      {/* TM-25: Điểm danh & Chấm công GPS hàng ngày */}
      <InternAttendanceWidget
        todayData={todayData}
        loading={attendanceLoading}
        onCheckInClick={() => setModalAction('CHECK_IN')}
        onCheckOutClick={() => setModalAction('CHECK_OUT')}
        onQuickCheckOut={handleQuickCheckOut}
        onViewHistoryClick={() => navigate(ROUTES.INTERN.ATTENDANCE)}
      />

      {/* Quick Action Shortcuts */}
      <div className={styles.quickActionsGrid}>
        <div
          className={styles.quickActionCard}
          onClick={() => navigate(ROUTES.INTERN.MISSIONS)}
          role="button"
          tabIndex={0}
        >
          <div
            className={styles.quickActionIcon}
            style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}
          >
            <Kanban size={22} />
          </div>
          <div className={styles.quickActionContent}>
            <h4>Nhiệm Vụ &amp; Kanban</h4>
            <p>Xem công việc được giao</p>
          </div>
          <ArrowUpRight size={16} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
        </div>

        <div
          className={styles.quickActionCard}
          onClick={() => navigate(ROUTES.INTERN.WEEKLY_REPORTS)}
          role="button"
          tabIndex={0}
        >
          <div
            className={styles.quickActionIcon}
            style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}
          >
            <FileCheck2 size={22} />
          </div>
          <div className={styles.quickActionContent}>
            <h4>Báo Cáo Tuần</h4>
            <p>Gửi báo cáo cho Mentor</p>
          </div>
          <ArrowUpRight size={16} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
        </div>

        <div
          className={styles.quickActionCard}
          onClick={() => navigate(ROUTES.INTERN.LEAVE_REQUESTS)}
          role="button"
          tabIndex={0}
        >
          <div
            className={styles.quickActionIcon}
            style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}
          >
            <CalendarCheck size={22} />
          </div>
          <div className={styles.quickActionContent}>
            <h4>Xin Nghỉ Phép</h4>
            <p>Tạo đơn xin nghỉ có phép</p>
          </div>
          <ArrowUpRight size={16} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
        </div>

        <div
          className={styles.quickActionCard}
          onClick={() => navigate(ROUTES.INTERN.QUIZZES)}
          role="button"
          tabIndex={0}
        >
          <div
            className={styles.quickActionIcon}
            style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}
          >
            <ClipboardList size={22} />
          </div>
          <div className={styles.quickActionContent}>
            <h4>Bài Kiểm Tra Quiz</h4>
            <p>Đánh giá năng lực định kỳ</p>
          </div>
          <ArrowUpRight size={16} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* Grid: Profile & Mentor */}
      <InternProfileCard profile={profile} />

      {/* TM-17: Lộ trình & Lịch tuần làm việc */}
      <InternScheduleWidget profile={profile} />

      {/* Tài liệu & nộp biểu mẫu */}
      <div className={styles.contentGrid2Col}>
        <InternDocumentList documents={documents} />
        <InternUploadForm onUpload={onUploadDocument} isUploading={isUploading} />
      </div>

      {/* Modal Check-in / Check-out 3 khối */}
      {modalAction && (
        <AttendanceActionModal
          actionType={modalAction}
          isOpen={Boolean(modalAction)}
          onClose={() => setModalAction(null)}
          onSuccess={refetchAttendance}
          officeName={todayData?.officeName}
          allowedRadiusMeters={todayData?.allowedRadiusMeters}
          officeLatitude={todayData?.officeLatitude}
          officeLongitude={todayData?.officeLongitude}
        />
      )}
    </div>
  );
};
