import React from 'react';
import { Info, CheckCircle2, AlertOctagon, Clock } from 'lucide-react';
import type { InternProfile, DocumentResponse, DocumentType } from '../../../../types';
import { InternStepper } from '../InternStepper';
import { InternProfileCard } from '../InternProfileCard';
import { InternAiInterviewWidget } from '../InternAiInterviewWidget';
import { InternDocumentList } from '../InternDocumentList';
import { InternUploadForm } from '../InternUploadForm';
import { InternContractSection } from '../InternContractSection';
import { getInternStatusLabel } from '../../../../utils/formatters';
import styles from './Workspaces.module.css';

interface ApplicationProgressWorkspaceProps {
  profile: InternProfile;
  documents: DocumentResponse[];
  onUploadDocument: (file: File, type: DocumentType) => Promise<void>;
  isUploading: boolean;
  onRefresh?: () => void;
}

export const ApplicationProgressWorkspace: React.FC<ApplicationProgressWorkspaceProps> = ({
  profile,
  documents,
  onUploadDocument,
  isUploading,
  onRefresh,
}) => {
  const renderStatusBanner = () => {
    switch (profile.status) {
      case 'PENDING':
        return (
          <div className={`${styles.statusBanner} ${styles.pending}`}>
            <Clock size={22} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div className={styles.statusBannerTitle}>Hồ sơ đang trong quy trình thẩm định</div>
              <div>
                Hồ sơ ứng tuyển kỳ <strong>{profile.programName || profile.programCode}</strong> đang được Phòng Nhân Sự và AI thẩm định. Hãy chắc chắn bạn đã tải lên CV chi tiết và hoàn tất phỏng vấn AI để nâng cao tỷ lệ xét duyệt.
              </div>
            </div>
          </div>
        );
      case 'APPROVED':
        return (
          <div className={`${styles.statusBanner} ${styles.approved}`}>
            <CheckCircle2 size={22} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div className={styles.statusBannerTitle}>Hồ sơ đã được phê duyệt thành công!</div>
              <div>
                Chúc mừng bạn đã vượt qua vòng sơ tuyển cho chương trình <strong>{profile.programName || profile.programCode}</strong>. Vui lòng kiểm tra và hoàn tất ký hợp đồng thực tập điện tử bên dưới để chính thức nhận kỳ thực tập.
              </div>
            </div>
          </div>
        );
      case 'REJECTED':
        return (
          <div className={`${styles.statusBanner} ${styles.rejected}`}>
            <AlertOctagon size={22} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div className={styles.statusBannerTitle}>Thông báo kết quả thẩm định</div>
              <div>
                Rất tiếc hồ sơ của bạn chưa phù hợp với chỉ tiêu của kỳ thực tập này.
                {profile.rejectionReason && (
                  <p style={{ margin: '0.35rem 0 0 0', fontWeight: 600 }}>
                    Lý do: {profile.rejectionReason}
                  </p>
                )}
                Bạn có thể nộp hồ sơ vào các chương trình thực tập khác đang mở tuyển.
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className={`${styles.statusBanner} ${styles.pending}`}>
            <Info size={22} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div className={styles.statusBannerTitle}>Trạng thái hồ sơ: {getInternStatusLabel(profile.status)}</div>
              <div>Theo dõi tiến độ chi tiết của kỳ thực tập qua lộ trình bên dưới.</div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={styles.workspaceLayout}>
      {/* Banner thông báo trạng thái */}
      {renderStatusBanner()}

      {/* Lộ trình thẩm định 5 giai đoạn */}
      <InternStepper status={profile.status} />

      {/* Grid nội dung */}
      <div className={styles.contentGrid2Col}>
        {/* Cột trái: Hồ sơ & Upload tài liệu */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <InternDocumentList documents={documents} />
          <InternUploadForm onUpload={onUploadDocument} isUploading={isUploading} />
        </div>

        {/* Cột phải: Phỏng vấn AI & Hợp đồng (nếu đã duyệt) & Thông tin hồ sơ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {profile.status === 'APPROVED' && (
            <InternContractSection
              internName={profile.fullName}
              internCode={profile.internCode}
              onContractUpdated={onRefresh}
            />
          )}

          <InternAiInterviewWidget />
          <InternProfileCard profile={profile} />
        </div>
      </div>
    </div>
  );
};
