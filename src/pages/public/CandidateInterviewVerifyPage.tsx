import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiInterviewService } from '../../services/aiInterviewService';
import type { CandidateSessionAccessData } from '../../types/aiInterviewRoom.types';
import styles from './CandidateInterviewVerifyPage.module.css';

export const CandidateInterviewVerifyPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accessData, setAccessData] = useState<CandidateSessionAccessData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  // Microphone Check State
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [micTestText, setMicTestText] = useState('');
  const [micPassed, setMicPassed] = useState(false);
  const testRecognitionRef = useRef<any>(null);

  const toggleTestMic = () => {
    if (isTestingMic) {
      if (testRecognitionRef.current) {
        try {
          testRecognitionRef.current.stop();
        } catch (e) {}
      }
      setIsTestingMic(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicTestText('Trình duyệt chưa hỗ trợ Web Speech API. Bạn vẫn có thể làm bài bằng bàn phím.');
      setMicPassed(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsTestingMic(true);
        setMicTestText('Đang lắng nghe... Hãy thử nói một câu ngắn (ví dụ: "Xin chào")');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setMicTestText(`Đã nhận diện: "${transcript}"`);
          setMicPassed(true);
        }
      };

      recognition.onerror = (e: any) => {
        setIsTestingMic(false);
        setMicTestText(`Không nhận được âm thanh hoặc chưa cấp quyền micro: ${e.error}`);
      };

      recognition.onend = () => {
        setIsTestingMic(false);
      };

      recognition.start();
      testRecognitionRef.current = recognition;
    } catch (err) {
      setIsTestingMic(false);
      setMicTestText('Không thể khởi động Microphone.');
    }
  };

  useEffect(() => {
    return () => {
      if (testRecognitionRef.current) {
        try {
          testRecognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  useEffect(() => {
    handleTokenVerification();
  }, []);

  const handleTokenVerification = async () => {
    // 1. Kiểm tra nếu đã có token sẵn từ Dashboard nội bộ
    const storedToken = sessionStorage.getItem('candidate_session_token');
    const storedSessionId = sessionStorage.getItem('candidate_session_id');

    // 2. Bóc token từ URL Fragment (#token=...) nếu từ liên kết email
    const hash = window.location.hash;
    let token = '';

    if (hash && hash.includes('token=')) {
      const match = hash.match(/token=([^&]+)/);
      if (match && match[1]) {
        token = match[1];
      }
    }

    if (!token && storedToken && storedSessionId) {
      try {
        const recovery = await aiInterviewService.getCandidateRecoveryState(storedSessionId, storedToken);
        if (recovery.status === 'SUBMITTED') {
          sessionStorage.removeItem('candidate_session_token');
          sessionStorage.removeItem('candidate_session_id');
          navigate(`/interview/complete/${storedSessionId}`);
          return;
        }

        setAccessData({
          candidateSessionToken: storedToken,
          sessionId: Number(storedSessionId),
          candidateName: recovery.candidateName || 'Thực tập sinh',
          candidateEmail: recovery.candidateEmail || '',
          interviewTitle: recovery.interviewTitle || 'Buổi Phỏng Vấn AI',
          status: recovery.status as any,
          interviewMode: recovery.interviewMode,
          totalQuestions: recovery.totalQuestions,
          durationPerQuestionSec: 180,
          totalDurationMinutes: 30,
          maxBlurStrikes: recovery.maxBlurStrikes,
          allowRevisitQuestions: Boolean(recovery.allowRevisitQuestions),
          autoSubmitOnExceed: true,
        });
        setLoading(false);
        return;
      } catch (e) {
        console.warn('Could not restore session from storage:', e);
      }
    }

    if (!token) {
      setErrorMessage('Không tìm thấy mã mời phỏng vấn an toàn trong liên kết.');
      setLoading(false);
      return;
    }

    // 3. Dọn sạch URL Fragment chống rò rỉ qua lịch sử duyệt web
    window.history.replaceState(null, '', window.location.pathname);

    try {
      const data = await aiInterviewService.exchangeCandidateToken(token);
      setAccessData(data);

      // Lưu Session Token và Session ID vào sessionStorage
      sessionStorage.setItem('candidate_session_token', data.candidateSessionToken);
      sessionStorage.setItem('candidate_session_id', String(data.sessionId));
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 410) {
        setErrorMessage('Phiên phỏng vấn này đã hết hạn hoặc đã bị hủy bỏ bởi Nhà tuyển dụng.');
      } else if (status === 409) {
        setErrorMessage('Bài thi phỏng vấn này đã được nộp trước đó.');
      } else if (status === 429) {
        setErrorMessage('Quá nhiều yêu cầu xác thực. Vui lòng thử lại sau ít phút.');
      } else {
        setErrorMessage(err.response?.data?.message || 'Mã mời phỏng vấn không hợp lệ.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (!accessData) return;
    setStarting(true);
    try {
      // Đánh dấu người dùng đã xác nhận vào phòng thi từ trang Verify
      sessionStorage.setItem('candidate_user_confirmed_start', 'true');
      navigate(`/interview/room/${accessData.sessionId}`);
    } catch (err) {
      console.error('Failed to transition to room:', err);
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.badge}>Hệ thống Phỏng vấn Thông minh</span>
          <h1 className={styles.title}>
            {accessData ? accessData.interviewTitle : 'Xác thực Phiên Phỏng Vấn'}
          </h1>
          <p className={styles.subtitle}>
            {accessData
              ? `Chào mừng ứng viên ${accessData.candidateName} (${accessData.candidateEmail})`
              : 'Đang kiểm tra tính hợp lệ của liên kết...'}
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            Đang giải mã và kết nối buồng phỏng vấn an toàn...
          </div>
        ) : errorMessage ? (
          <div className={styles.errorBox}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Không Thể Truy Cập Buồng Thi
            </div>
            <p>{errorMessage}</p>
          </div>
        ) : accessData ? (
          <div>
            <div className={styles.infoGrid}>
              <div>
                <div className={styles.infoItemTitle}>Số câu hỏi</div>
                <div className={styles.infoItemValue}>{accessData.totalQuestions} câu</div>
              </div>
              <div>
                <div className={styles.infoItemTitle}>Chế độ làm bài</div>
                <div className={styles.infoItemValue}>
                  {accessData.interviewMode === 'PER_QUESTION'
                    ? `${accessData.durationPerQuestionSec}s / câu`
                    : `${accessData.totalDurationMinutes} phút`}
                </div>
              </div>
              <div>
                <div className={styles.infoItemTitle}>Giới hạn rời tab</div>
                <div className={styles.infoItemValue} style={{ color: '#f59e0b' }}>
                  {accessData.maxBlurStrikes} lần
                </div>
              </div>
            </div>

            {/* Bước kiểm tra Microphone trước khi thi (Spec Yêu cầu) */}
            <div className={styles.micCheckSection}>
              <div className={styles.micCheckTitle}>
                <span>🎙️ Kiểm tra Microphone & Thiết bị âm thanh</span>
                {micPassed && <span style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: 700 }}>✅ Thiết bị sẵn sàng</span>}
              </div>
              <div className={styles.micCheckControls}>
                <button
                  type="button"
                  className={`${styles.btnTestMic} ${isTestingMic ? styles.btnTestMicActive : ''}`}
                  onClick={toggleTestMic}
                >
                  <span>{isTestingMic ? '⏹️ Dừng thử' : '🎙️ Thử nói 1 câu'}</span>
                </button>
                <div className={styles.micLevelTrack}>
                  <div className={styles.micLevelFill} style={{ width: isTestingMic ? '100%' : micPassed ? '100%' : '0%' }} />
                </div>
              </div>
              <div className={styles.micFeedbackText}>
                {micTestText || 'Bấm "Thử nói 1 câu" để kiểm tra xem trình duyệt có nhận diện được giọng nói của bạn hay không.'}
              </div>
            </div>

            <div className={styles.rulesSection}>
              <div className={styles.rulesTitle}>
                <span>⚠️</span> Quy chế & Hướng dẫn làm bài quan trọng
              </div>
              <ul className={styles.rulesList}>
                <li>
                  <strong>Phương thức trả lời:</strong> Bạn có thể gõ văn bản hoặc bấm biểu tượng Micro để nói (Speech-to-Text). Hệ thống chỉ lưu trữ văn bản cuối cùng, không lưu âm thanh thô.
                </li>
                <li>
                  <strong>Kiểm soát thời gian:</strong> Đồng hồ đếm ngược được tính trực tiếp từ máy chủ. Hết giờ câu nào, hệ thống sẽ tự động chốt và chuyển câu tiếp theo.
                </li>
                <li>
                  <strong>Chống gian lận:</strong> Vui lòng giữ màn hình thi luôn hiển thị. Nếu rời khỏi màn hình hoặc chuyển tab quá {accessData.maxBlurStrikes} lần, bài thi sẽ bị tự động khóa và nộp ngay lập tức.
                </li>
                <li>
                  <strong>Sự cố mạng:</strong> Bài làm của bạn được lưu nháp liên tục. Nếu mất kết nối, hệ thống sẽ tự động đồng bộ lại khi có mạng.
                </li>
              </ul>
            </div>

            <button
              className={styles.btnStart}
              onClick={handleStart}
              disabled={starting}
            >
              {starting ? 'Đang vào phòng...' : 'Tôi Đã Hiểu Quy Chế & Bắt Đầu Làm Bài'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

