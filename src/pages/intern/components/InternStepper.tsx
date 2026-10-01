import React from 'react';
import { CheckCircle2, AlertOctagon } from 'lucide-react';
import type { InternStatus } from '../../../types';
import styles from './InternStepper.module.css';

interface InternStepperProps {
  status?: InternStatus;
}

const STEPS = [
  { num: 1, label: 'Nộp Hồ Sơ (PENDING)', desc: 'Chờ HR tiếp nhận' },
  { num: 2, label: 'Đã Duyệt (APPROVED)', desc: 'Chờ ký hợp đồng' },
  { num: 3, label: 'Đang Thực Tập (INTERNING)', desc: 'Làm việc cùng Mentor' },
  { num: 4, label: 'Hoàn Thành (COMPLETED)', desc: 'Đánh giá & Cấp chứng nhận' },
];

export const InternStepper: React.FC<InternStepperProps> = ({ status }) => {
  const isRejected = status === 'REJECTED';

  const getStepStatus = (step: number) => {
    if (!status) return 'pending';
    const statusMap: Record<string, number> = {
      PENDING: 1,
      APPROVED: 2,
      INTERNING: 3,
      COMPLETED: 4,
      REJECTED: 0,
    };
    const currentStep = statusMap[status] ?? 1;
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div className={`card ${styles.container}`}>
      <h3 className={styles.title}>Lộ Trình Kỳ Thực Tập Của Bạn</h3>

      <div className={styles.stepperTrack}>
        {STEPS.map((step) => {
          const state = getStepStatus(step.num);
          return (
            <div key={step.num} className={styles.stepItem}>
              <div className={`${styles.stepCircle} ${styles[state]}`}>
                {state === 'completed' ? <CheckCircle2 size={20} /> : step.num}
              </div>
              <span className={styles.stepLabel} style={{ fontWeight: state === 'active' ? 700 : 600 }}>
                {step.label}
              </span>
              <span className={styles.stepDesc}>{step.desc}</span>
            </div>
          );
        })}
      </div>

      {status === 'APPROVED' && (
        <div
          style={{
            marginTop: '1rem',
            backgroundColor: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            fontSize: '0.85rem',
            color: 'var(--text-main)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span>
              Hồ sơ của bạn đã được phê duyệt! Vui lòng vào mục <strong>Hợp Đồng & Tài Liệu</strong> để kiểm tra và ký xác nhận tiếp nhận.
            </span>
          </div>
          <a
            href="/intern/documents"
            style={{
              color: 'var(--primary)',
              fontWeight: 700,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Đến Ký Hợp Đồng &rarr;
          </a>
        </div>
      )}

      {isRejected && (
        <div className={styles.rejectedAlert}>
          <AlertOctagon size={18} />
          <span>
            Hồ sơ hiện tại đang ở trạng thái <strong>Bị Từ Chối (REJECTED)</strong>. Vui lòng kiểm tra lý do thẩm định tài liệu bên dưới hoặc liên hệ HR để nộp lại.
          </span>
        </div>
      )}
    </div>
  );
};
