import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { InternStatus } from '../../../types';
import styles from './InternStepper.module.css';

interface InternStepperProps {
  status?: InternStatus;
}

const STEPS = [
  { num: 1, label: 'Nộp Hồ Sơ (PENDING)', desc: 'Chờ HR tiếp nhận' },
  { num: 2, label: 'Đã Duyệt (APPROVED)', desc: 'Hồ sơ đã được phê duyệt' },
  { num: 3, label: 'Đang Thực Tập (INTERNING)', desc: 'Làm việc cùng Mentor' },
  { num: 4, label: 'Hoàn Thành (COMPLETED)', desc: 'Đánh giá & Cấp chứng nhận' },
];

export const InternStepper: React.FC<InternStepperProps> = ({ status }) => {
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
    </div>
  );
};
