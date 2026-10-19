import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Clock, HelpCircle, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { aiInterviewService } from '../../../services/aiInterviewService';
import type { InternInterviewItem } from '../../../types/aiInterviewRoom.types';
import styles from './InternAiInterviewWidget.module.css';

export const InternAiInterviewWidget: React.FC = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<InternInterviewItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInterviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await aiInterviewService.getMyInterviews();
      setInterviews(data || []);
    } catch (err) {
      console.warn('Lỗi khi tải lịch phỏng vấn AI của TTS:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();

    // Polling ngầm mỗi 10 giây để đảm bảo khi HR cập nhật lịch thì TTS thấy thay đổi ngay
    const pollInterval = setInterval(() => {
      fetchInterviews();
    }, 10000);

    // Lắng nghe sự kiện WebSocket realtime khi có thông báo mới
    const handleNewNotification = (e: any) => {
      const item = e.detail;
      if (item && item.type === 'AI_INTERVIEW_INVITATION') {
        fetchInterviews();
      }
    };

    window.addEventListener('internhub:new-notification', handleNewNotification);
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('internhub:new-notification', handleNewNotification);
    };
  }, [fetchInterviews]);

  // Hiển thị skeleton hoặc trạng thái ban đầu nếu đang loading lần đầu


  const handleStartInterview = (item: InternInterviewItem) => {
    if (!item.directRoomToken) {
      return;
    }
    // Thiết lập session token vào sessionStorage để buồng thi xác thực mượt mà
    sessionStorage.setItem('candidate_session_token', item.directRoomToken);
    sessionStorage.setItem('candidate_session_id', String(item.sessionId));
    // Luồng chuẩn Spec: Đi qua trang Kiểm tra thiết bị & Quy chế trước khi kích hoạt tính giờ
    navigate('/interview/verify');
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'INVITED':
        return <span className={`${styles.statusBadge} ${styles.statusInvited}`}>Được mời</span>;
      case 'IN_PROGRESS':
        return <span className={`${styles.statusBadge} ${styles.statusInProgress}`}>Đang làm dở</span>;
      case 'SUBMITTED':
        return <span className={`${styles.statusBadge} ${styles.statusSubmitted}`}>Đã nộp bài</span>;
      case 'EXPIRED':
        return <span className={`${styles.statusBadge} ${styles.statusExpired}`}>Hết hạn</span>;
      case 'CANCELLED':
        return <span className={`${styles.statusBadge} ${styles.statusCancelled}`}>Đã hủy</span>;
      default:
        return <span className={styles.statusBadge}>{status}</span>;
    }
  };

  const formatExpiry = (isoString?: string) => {
    if (!isoString) return 'Không giới hạn';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className={styles.widgetContainer}>
      <div className={styles.widgetHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className={styles.headerTitle}>
              Lịch Phỏng Vấn AI Trực Tuyến
              <span className={styles.activeBadge}>{interviews.length} đợt</span>
            </h3>
            <p className={styles.headerSubtitle}>
              Tham gia phỏng vấn tự động với trợ lý AI và camera giám sát trung thực
            </p>
          </div>
        </div>
      </div>

      {loading && interviews.length === 0 ? (
        <div className={styles.emptyState}>
          <div className="animate-spin" style={{ width: 24, height: 24, border: '2px solid rgba(139, 92, 246, 0.3)', borderTopColor: '#a78bfa', borderRadius: '50%', marginBottom: 8 }} />
          <span>Đang đồng bộ dữ liệu phỏng vấn...</span>
        </div>
      ) : interviews.length === 0 ? (
        <div className={styles.emptyState}>
          <HelpCircle size={32} className={styles.emptyIcon} />
          <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.95rem' }}>
            Hiện tại bạn chưa có lịch phỏng vấn AI nào
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', maxWidth: 460 }}>
            Khi người quản lý hoặc HR phân công đợt đánh giá năng lực AI, thông báo và phòng thi sẽ hiển thị ngay tại đây.
          </div>
        </div>
      ) : (
        <div className={styles.interviewList}>
          {interviews.map((item) => (
            <div key={item.sessionId} className={styles.interviewCard}>
              <div>
                <div className={styles.cardTop}>
                  <div>
                    <h4 className={styles.cardTitle}>{item.interviewTitle}</h4>
                    {item.programName && (
                      <span style={{ fontSize: '0.78rem', color: '#4f46e5', background: '#eef2ff', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                        {item.programName}
                      </span>
                    )}
                  </div>
                  {renderStatusBadge(item.status)}
                </div>

                <div className={styles.cardMeta}>
                  <div className={styles.metaRow}>
                    <HelpCircle size={15} className={styles.metaIcon} />
                    <span>Số câu hỏi: <strong>{item.totalQuestions} câu</strong></span>
                  </div>
                  <div className={styles.metaRow}>
                    <Clock size={15} className={styles.metaIcon} />
                    <span>
                      Chế độ:{' '}
                      <strong>
                        {item.interviewMode === 'PER_QUESTION'
                          ? `${item.durationPerQuestionSec || 120} giây / câu`
                          : `${item.totalDurationMinutes || 30} phút toàn bài`}
                      </strong>
                    </span>
                  </div>
                  <div className={styles.metaRow}>
                    <AlertTriangle size={15} className={styles.metaIcon} />
                    <span>Hạn chót: <strong>{formatExpiry(item.expireAt)}</strong></span>
                  </div>
                </div>
              </div>

              <div className={styles.cardFooter}>
                {item.status === 'INVITED' || item.status === 'IN_PROGRESS' ? (
                  <button
                    type="button"
                    className={styles.startBtn}
                    onClick={() => handleStartInterview(item)}
                  >
                    <span>{item.status === 'IN_PROGRESS' ? 'Tiếp tục phỏng vấn' : 'Bắt đầu phỏng vấn'}</span>
                    <ArrowRight size={15} />
                  </button>
                ) : item.status === 'SUBMITTED' ? (
                  <div className={styles.viewOnlyBtn}>
                    <CheckCircle2 size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: -2, color: '#60a5fa' }} />
                    Đã hoàn thành đánh giá
                  </div>
                ) : (
                  <div className={styles.viewOnlyBtn}>Phiên đã kết thúc</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
