import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  FileText,
  Briefcase,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { ROUTES } from '../../../constants/routes';
import styles from './InternEmptyState.module.css';

interface InternEmptyStateProps {
  userName?: string;
}

export const InternEmptyState: React.FC<InternEmptyStateProps> = ({ userName }) => {
  return (
    <div className={styles.container}>
      {/* Hero Welcome Card */}
      <div className={styles.heroCard}>
        <div className={styles.heroGlow} />

        <div className={styles.badge}>
          <Sparkles size={14} />
          <span>Chương Trình Thực Tập Doanh Nghiệp 2026</span>
        </div>

        <h2 className={styles.heroTitle}>
          Chào mừng{userName ? ` ${userName}` : ''} đến với{' '}
          <span className={styles.heroGradientText}>InternHub Portal</span>
        </h2>

        <p className={styles.heroSubtitle}>
          Tài khoản của bạn đã sẵn sàng. Hãy hoàn tất đơn ứng tuyển và tải lên CV để Hội đồng
          tuyển dụng thẩm định hồ sơ và xếp lịch phỏng vấn tiếp nhận thực tập.
        </p>

        {/* 3-Step Roadmap */}
        <div className={styles.roadmapContainer}>
          <div className={`${styles.roadmapStep} ${styles.roadmapActive}`}>
            <div className={styles.roadmapNumber}>1</div>
            <div className={styles.roadmapContent}>
              <span className={styles.roadmapTitle}>Nộp Hồ Sơ & CV</span>
              <span className={styles.roadmapDesc}>Bạn đang ở bước này</span>
            </div>
          </div>

          <ChevronRight size={18} className={styles.roadmapArrow} />

          <div className={`${styles.roadmapStep} ${styles.roadmapInactive}`}>
            <div className={styles.roadmapNumber}>2</div>
            <div className={styles.roadmapContent}>
              <span className={styles.roadmapTitle}>HR Thẩm Định</span>
              <span className={styles.roadmapDesc}>Duyệt hồ sơ & phỏng vấn</span>
            </div>
          </div>

          <ChevronRight size={18} className={styles.roadmapArrow} />

          <div className={`${styles.roadmapStep} ${styles.roadmapInactive}`}>
            <div className={styles.roadmapNumber}>3</div>
            <div className={styles.roadmapContent}>
              <span className={styles.roadmapTitle}>Vào Dự Án Thực Tập</span>
              <span className={styles.roadmapDesc}>Được Mentor dẫn dắt</span>
            </div>
          </div>
        </div>

        {/* Large Primary Action Button */}
        <div>
          <Link to={ROUTES.INTERN.APPLY} className={styles.ctaButton}>
            <span>Nộp Hồ Sơ Ứng Tuyển Ngay</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Feature Guidance Grid */}
      <div className={styles.featuresGrid}>
        <div className={styles.featureCard}>
          <div className={`${styles.featureIconWrapper} ${styles.iconIndigo}`}>
            <FileText size={22} />
          </div>
          <h3 className={styles.featureTitle}>Chuẩn Bị Hồ Sơ Chu Đáo</h3>
          <p className={styles.featureDescription}>
            Hệ thống hỗ trợ đính kèm CV bản mềm (PDF, DOCX) cùng đơn xin thực tập và bảng điểm đại học
            nhằm gia tăng tỷ lệ trúng tuyển.
          </p>
        </div>

        <div className={styles.featureCard}>
          <div className={`${styles.featureIconWrapper} ${styles.iconSky}`}>
            <Briefcase size={22} />
          </div>
          <h3 className={styles.featureTitle}>Đa Dạng Vị Trí Công Nghệ</h3>
          <p className={styles.featureDescription}>
            Lựa chọn chuyên ngành phù hợp với định hướng nghề nghiệp: Backend (Java/Spring),
            Frontend (React/TypeScript), Fullstack, AI & Data Science hoặc QA/QC.
          </p>
        </div>

        <div className={styles.featureCard}>
          <div className={`${styles.featureIconWrapper} ${styles.iconEmerald}`}>
            <ShieldCheck size={22} />
          </div>
          <h3 className={styles.featureTitle}>Minh Bạch Tiến Độ Xét Duyệt</h3>
          <p className={styles.featureDescription}>
            Nhận mã thực tập sinh ngay sau khi nộp và theo dõi trạng thái hồ sơ trực tiếp theo thời
            gian thực trên giao diện Portal.
          </p>
        </div>
      </div>
    </div>
  );
};
