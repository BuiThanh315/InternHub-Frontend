import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Home, ArrowRight, ShieldCheck, Clock, FileText } from 'lucide-react';
import styles from './CandidateInterviewCompletionPage.module.css';

export const CandidateInterviewCompletionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const handleBackHome = () => {
    const isIntern = Boolean(localStorage.getItem('user_role') || sessionStorage.getItem('user_info'));
    navigate(isIntern ? '/intern/dashboard' : '/');
  };

  return (
    <div className={styles.completionContainer}>
      <div className={styles.completionCard}>
        <div className={styles.iconWrapper}>
          <CheckCircle2 size={64} className={styles.checkIcon} />
        </div>

        <h1 className={styles.title}>Nộp Bài Thi Thành Công!</h1>
        <p className={styles.subtitle}>
          Cảm ơn bạn đã tham gia buổi phỏng vấn trực tuyến với trợ lý AI của InternHub.
        </p>

        <div className={styles.summaryBox}>
          <div className={styles.summaryItem}>
            <ShieldCheck size={20} className={styles.itemIcon} />
            <div>
              <div className={styles.itemLabel}>Mã định danh phòng thi</div>
              <div className={styles.itemValue}>#{sessionId || 'AI-SESSION'}</div>
            </div>
          </div>

          <div className={styles.summaryItem}>
            <Clock size={20} className={styles.itemIcon} />
            <div>
              <div className={styles.itemLabel}>Trạng thái ghi nhận</div>
              <div className={styles.itemValue} style={{ color: '#16a34a' }}>Đã hoàn tất toàn bộ câu hỏi</div>
            </div>
          </div>

          <div className={styles.summaryItem}>
            <FileText size={20} className={styles.itemIcon} />
            <div>
              <div className={styles.itemLabel}>Quy trình tiếp theo</div>
              <div className={styles.itemValue}>Hệ thống AI đang chấm điểm tự động & gửi báo cáo đến HR</div>
            </div>
          </div>
        </div>

        <div className={styles.noticeText}>
          Kết quả đánh giá năng lực chi tiết và nhận xét từ Hội đồng tuyển dụng sẽ được phản hồi qua email hoặc bảng điều khiển thực tập sinh trong thời gian sớm nhất.
        </div>

        <button type="button" className={styles.btnHome} onClick={handleBackHome}>
          <Home size={18} />
          <span>Quay Về Trang Bảng Điều Khiển</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default CandidateInterviewCompletionPage;
