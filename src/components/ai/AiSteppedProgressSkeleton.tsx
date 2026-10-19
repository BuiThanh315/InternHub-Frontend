import React, { useState, useEffect } from 'react';
import { Sparkles, Check, Loader2, Clock } from 'lucide-react';
import styles from './AiSteppedProgressSkeleton.module.css';

export interface ProgressStep {
  id: number;
  title: string;
  description: string;
  durationMs?: number;
}

interface AiSteppedProgressSkeletonProps {
  title?: string;
  steps?: ProgressStep[];
  /** Nếu cung cấp currentStep bên ngoài (qua WebSocket / SSE / Polling) */
  currentStep?: number;
  /** Thời gian ước lượng (giây) */
  estimatedSeconds?: number;
  className?: string;
}

const DEFAULT_STEPS: ProgressStep[] = [
  {
    id: 1,
    title: 'Bước 1: Bóc tách văn bản CV & Khử định danh PII',
    description: 'Trích xuất học vấn, kinh nghiệm, dự án & ẩn thông tin nhạy cảm...',
    durationMs: 3500,
  },
  {
    id: 2,
    title: 'Bước 2: Đối chiếu kỹ năng & JD vị trí thực tập',
    description: 'So khớp năng lực với yêu cầu tuyển dụng, tính toán điểm tương thích...',
    durationMs: 5000,
  },
  {
    id: 3,
    title: 'Bước 3: Tổng hợp đánh giá & Sinh câu hỏi phỏng vấn',
    description: 'Hoàn thiện nhận xét chuyên sâu, gợi ý câu hỏi chất vấn & bảng tiêu chí...',
    durationMs: 6500,
  },
];

export const AiSteppedProgressSkeleton: React.FC<AiSteppedProgressSkeletonProps> = ({
  title = 'AI Đang Xử Lý Phân Tích Thông Minh',
  steps = DEFAULT_STEPS,
  currentStep: externalCurrentStep,
  estimatedSeconds = 15,
  className = '',
}) => {
  const [internalStep, setInternalStep] = useState<number>(1);
  const [remainingSec, setRemainingSec] = useState<number>(estimatedSeconds);

  // Đồng bộ với externalCurrentStep nếu có
  const activeStep = externalCurrentStep !== undefined ? externalCurrentStep : internalStep;

  // Tự động chuyển bước giả lập mượt mà nếu không có nguồn external
  useEffect(() => {
    if (externalCurrentStep !== undefined) return;

    let timer: ReturnType<typeof setTimeout>;
    if (internalStep < steps.length) {
      const stepDuration = steps[internalStep - 1]?.durationMs || 4000;
      timer = setTimeout(() => {
        setInternalStep((prev) => Math.min(prev + 1, steps.length));
      }, stepDuration);
    }

    return () => clearTimeout(timer);
  }, [internalStep, steps, externalCurrentStep]);

  // Đồng hồ đếm ngược ước lượng thời gian
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSec((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <Sparkles size={18} className={styles.sparkleIcon} />
          <span>{title}</span>
        </div>
        <div className={styles.timeEstimate}>
          <Clock size={12} className="inline mr-1 text-slate-400" />
          Ước tính: ~{remainingSec}s
        </div>
      </div>

      {/* Danh sách 3 bước tiến trình */}
      <div className={styles.stepsList}>
        {steps.map((step) => {
          const isCompleted = activeStep > step.id;
          const isActive = activeStep === step.id;
          const isPending = activeStep < step.id;

          let itemClass = styles.stepPending;
          let iconClass = styles.iconPending;
          if (isCompleted) {
            itemClass = styles.stepCompleted;
            iconClass = styles.iconCompleted;
          } else if (isActive) {
            itemClass = styles.stepActive;
            iconClass = styles.iconActive;
          } else if (isPending) {
            itemClass = styles.stepPending;
            iconClass = styles.iconPending;
          }

          return (
            <div key={step.id} className={`${styles.stepItem} ${itemClass}`}>
              <div className={`${styles.stepIconWrapper} ${iconClass}`}>
                {isCompleted ? (
                  <Check size={16} strokeWidth={2.5} />
                ) : isActive ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>

              <div className={styles.stepContent}>
                <div
                  className={`${styles.stepTitle} ${
                    isActive ? styles.stepTitleActive : ''
                  }`}
                >
                  {step.title}
                </div>
                <div className={styles.stepDesc}>{step.description}</div>

                {isActive && (
                  <div className={styles.shimmerBar}>
                    <div className={styles.shimmerProgress} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
