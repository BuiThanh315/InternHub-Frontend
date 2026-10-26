import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { aiInterviewService } from '../../services/aiInterviewService';
import type {
  CandidateQuestionData,
  CandidateRecoveryStateData,
} from '../../types/aiInterviewRoom.types';
import type { ProctoringAlertEvent } from '../../types/proctoring.types';
import styles from './CandidateInterviewRoomPage.module.css';

export const CandidateInterviewRoomPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<CandidateRecoveryStateData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<CandidateQuestionData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Soạn thảo câu trả lời
  const [answerText, setAnswerText] = useState('');
  const [currentRevision, setCurrentRevision] = useState(1);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');

  // Đếm ngược thời gian (Server Authoritative)
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  // Voice-to-Text (Web Speech API)
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef<boolean>(false);
  const [speechLanguage, setSpeechLanguage] = useState<'vi-VN' | 'en-US'>('vi-VN');
  const [sttTranscript, setSttTranscript] = useState('');
  const [sttInterimText, setSttInterimText] = useState('');
  const [showSttPreview, setShowSttPreview] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isPromptingPermissionRef = useRef<boolean>(false);
  const sttTimeoutRef = useRef<any>(null);

  // Modal xác nhận nộp bài cuối cùng
  const [confirmSubmitModalOpen, setConfirmSubmitModalOpen] = useState(false);

  // Anti-cheat Telemetry & Modal Cảnh báo
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [currentStrikes, setCurrentStrikes] = useState(0);
  const [maxStrikes, setMaxStrikes] = useState(3);
  const [isTerminated, setIsTerminated] = useState(false);

  // Token phiên làm bài
  const sessionToken = sessionStorage.getItem('candidate_session_token') || '';

  // Trạng thái mạng Offline / Online (Cụm 7)
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Đã kết nối lại Internet thành công.');
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Mất kết nối Internet! Đừng tắt trình duyệt, bài làm đang lưu tạm trên máy.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Tự động yêu cầu toàn màn hình (Fullscreen API - Cụm 7)
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Nút Khôi phục bản lưu gần nhất trên Server (Reset draft - Cụm 3)
  const handleResetToLastSaved = () => {
    if (!currentQuestion) return;
    setAnswerText(currentQuestion.savedAnswerText || '');
    setAutoSaveStatus('saved');
    toast.info('Đã khôi phục nội dung bản lưu gần nhất trên hệ thống.');
  };

  // Beforeunload Guard: Cảnh báo người dùng khi reload hoặc đóng tab lúc có dữ liệu chưa lưu
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (autoSaveStatus === 'dirty') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [autoSaveStatus]);

  useEffect(() => {
    if (!sessionId || !sessionToken) {
      navigate('/interview/verify');
      return;
    }
    initializeRoom();
  }, [sessionId]);

  // Khởi tạo phòng thi hoặc khôi phục khi F5
  const initializeRoom = async () => {
    setLoading(true);
    try {
      let recovery: CandidateRecoveryStateData;
      try {
        recovery = await aiInterviewService.getCandidateRecoveryState(sessionId!, sessionToken);
        if (!recovery || !recovery.questions || recovery.questions.length === 0) {
          await aiInterviewService.startCandidateSession(sessionId!, sessionToken);
          recovery = await aiInterviewService.getCandidateRecoveryState(sessionId!, sessionToken);
        }
      } catch (err: any) {
        await aiInterviewService.startCandidateSession(sessionId!, sessionToken);
        recovery = await aiInterviewService.getCandidateRecoveryState(sessionId!, sessionToken);
      }

      setSessionData(recovery);
      setCurrentStrikes(recovery.blurCount);
      setMaxStrikes(recovery.maxBlurStrikes);

      // Nếu phiên đã hoàn thành / đã nộp bài trước đó -> Chuyển thẳng về trang Completion Summary
      if (recovery.status === 'SUBMITTED') {
        sessionStorage.removeItem('candidate_session_token');
        sessionStorage.removeItem('candidate_session_id');
        sessionStorage.removeItem('candidate_user_confirmed_start');
        toast.info('Phiên phỏng vấn này đã được nộp bài thành công.');
        navigate(`/interview/complete/${sessionId}`);
        return;
      }
      if (recovery.status === 'EXPIRED' || recovery.status === 'CANCELLED') {
        sessionStorage.removeItem('candidate_session_token');
        sessionStorage.removeItem('candidate_session_id');
        sessionStorage.removeItem('candidate_user_confirmed_start');
        toast.warning('Phiên phỏng vấn này đã hết hạn hoặc bị hủy bởi nhà tuyển dụng.');
        navigate('/interview/verify');
        return;
      }

      const activeIdx = recovery.currentQuestionIndex || 0;
      setCurrentQuestionIndex(activeIdx);

      const activeQ = recovery.questions && recovery.questions[activeIdx];
      if (activeQ) {
        setCurrentQuestion(activeQ);
        setAnswerText(activeQ.savedAnswerText || '');
        setCurrentRevision(activeQ.currentRevision || 1);
        setRemainingSeconds(activeQ.remainingSeconds || 0);
      }
    } catch (err: any) {
      console.error('Failed to initialize room:', err);
      const msg = err.response?.data?.message || err.message || 'Không thể truy cập buồng phỏng vấn.';
      if (err.response?.status === 409) {
        toast.warning('Phiên phỏng vấn đã kết thúc hoặc đã nộp bài.');
        navigate('/');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Lưu thời điểm deadline tuyệt đối để tính giờ chống trôi (Drift-free Timer)
  const targetDeadlineMsRef = useRef<number>(0);

  useEffect(() => {
    if (remainingSeconds > 0) {
      targetDeadlineMsRef.current = Date.now() + remainingSeconds * 1000;
    }
  }, [currentQuestionIndex]);

  // Đồng hồ đếm ngược mỗi giây dựa trên mốc thời gian tuyệt đối (Chống Clock Drift)
  useEffect(() => {
    if (loading || isTerminated) return;

    const timer = setInterval(() => {
      if (targetDeadlineMsRef.current <= 0) return;
      const diffSec = Math.max(0, Math.ceil((targetDeadlineMsRef.current - Date.now()) / 1000));
      setRemainingSeconds(diffSec);

      if (diffSec <= 0) {
        clearInterval(timer);
        handleTimeExpired();
      }
    }, 500);

    return () => clearInterval(timer);
  }, [loading, isTerminated]);

  // Hết giờ tự động nộp câu hỏi
  const handleTimeExpired = async () => {
    console.warn('Server deadline reached for current question.');
    await handleNextQuestion(true);
  };

  // STOMP WebSocket: Lắng nghe kênh riêng tư của phiên thi (/topic/proctoring/session/{sessionId})
  useEffect(() => {
    if (!sessionId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        client.subscribe(`/topic/proctoring/session/${sessionId}`, (message) => {
          try {
            const event: ProctoringAlertEvent = JSON.parse(message.body);
            if (event.severity === 'DISQUALIFIED') {
              setIsTerminated(true);
              setWarningMessage(
                event.details || 'Phiên phỏng vấn của bạn đã bị đình chỉ do vi phạm quy chế thi trực tuyến.'
              );
              setWarningModalOpen(true);
              toast.error('Buổi thi đã bị dừng bởi giám thị hoặc vượt quá số lần vi phạm cho phép.');
            } else if (event.severity === 'CRITICAL' || event.severity === 'WARNING') {
              setCurrentStrikes(event.strikeCount);
              setMaxStrikes(event.maxStrikes);
              setWarningMessage(
                event.details || `Cảnh báo vi phạm lần ${event.strikeCount}/${event.maxStrikes}. Vui lòng tập trung vào màn hình làm bài!`
              );
              setWarningModalOpen(true);
            }
          } catch (err) {
            console.error('Error parsing proctoring STOMP message:', err);
          }
        });
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [sessionId]);

  // Telemetry Listener: Giám sát khi ứng viên chuyển tab / rời khỏi màn hình làm bài với Debounce 1500ms
  useEffect(() => {
    let blurDebounceTimer: ReturnType<typeof setTimeout> | null = null;

    const reportBlurEvent = async (reason: string) => {
      if (isTerminated || loading) return;
      if (isPromptingPermissionRef.current) {
        console.info('Bỏ qua cảnh báo blur do đang cấp quyền Microphone.');
        return;
      }

      try {
        const res = await aiInterviewService.recordCandidateEvidence(
          sessionId!,
          {
            eventType: 'TAB_BLUR',
            metadata: reason,
            clientTimestamp: new Date().toISOString(),
          },
          sessionToken
        );

        if (res.recorded) {
          setCurrentStrikes(res.currentBlurCount);
          setWarningMessage(
            res.warningMessage ||
              `Cảnh báo: Bạn vừa rời khỏi màn hình làm bài! Lần vi phạm ${res.currentBlurCount}/${res.maxStrikes}.`
          );
          setWarningModalOpen(true);

          if (res.isTerminated) {
            setIsTerminated(true);
          }
        }
      } catch (err) {
        console.error('Failed to record blur telemetry:', err);
      }
    };

    // 1. Chỉ kích hoạt khi tab thực sự bị ẩn vượt quá 1500ms
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        blurDebounceTimer = setTimeout(() => {
          reportBlurEvent('Ứng viên chuyển tab hoặc ẩn trình duyệt quá 1.5 giây');
        }, 1500);
      } else {
        if (blurDebounceTimer) {
          clearTimeout(blurDebounceTimer);
          blurDebounceTimer = null;
        }
      }
    };

    // 2. Window blur thông thường: Nếu tab bị ẩn thì chờ timer 1.5s
    const handleWindowBlur = () => {
      if (isPromptingPermissionRef.current) return;
      if (document.visibilityState === 'hidden') {
        if (!blurDebounceTimer) {
          blurDebounceTimer = setTimeout(() => {
            reportBlurEvent('Cửa sổ mất focus (rời khỏi màn hình) quá 1.5 giây');
          }, 1500);
        }
      }
    };

    const handleWindowFocus = () => {
      if (blurDebounceTimer) {
        clearTimeout(blurDebounceTimer);
        blurDebounceTimer = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      if (blurDebounceTimer) clearTimeout(blurDebounceTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [sessionId, sessionToken, isTerminated, loading]);

  // Web Speech API Voice-to-Text chuẩn Mục 7.3 của Spec
  const stopSpeechRecognition = () => {
    isRecordingRef.current = false;
    if (sttTimeoutRef.current) {
      clearTimeout(sttTimeoutRef.current);
      sttTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsRecording(false);
  };

  const toggleSpeechRecognition = () => {
    if (isRecording) {
      stopSpeechRecognition();
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.warning('Trình duyệt hiện tại (Firefox/Safari) chưa bật Web Speech API trực tiếp. Vui lòng sử dụng Chrome/Edge hoặc nhập văn bản trực tiếp bằng bàn phím.');
      return;
    }

    try {
      isPromptingPermissionRef.current = true;
      const recognition = new SpeechRecognition();
      recognition.lang = speechLanguage;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        isRecordingRef.current = true;
        setIsRecording(true);
        setShowSttPreview(true);
        setSttTranscript('');
        setSttInterimText('');
        // Sau khi đã start thành công (người dùng đã bấm Cho phép), mở lại giám sát sau 1s
        setTimeout(() => {
          isPromptingPermissionRef.current = false;
        }, 1500);

        // Safeguard: Tự động ngắt thu âm sau 120 giây (Mục 7.3 Spec)
        sttTimeoutRef.current = setTimeout(() => {
          stopSpeechRecognition();
          toast.info('Đã tự động ngắt micro sau 120 giây ghi âm liên tục.');
        }, 120000);
      };

      recognition.onresult = (event: any) => {
        let currentFinal = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentFinal += trans;
          } else {
            currentInterim += trans;
          }
        }

        if (currentFinal) {
          setSttTranscript((prev) => (prev ? prev + ' ' : '') + currentFinal.trim());
        }
        setSttInterimText(currentInterim);
      };

      recognition.onerror = (err: any) => {
        console.error('Speech recognition error:', err);
        // Không ngắt thu âm nếu chỉ là no-speech ngắn
        if (err.error !== 'no-speech') {
          stopSpeechRecognition();
        }
        isPromptingPermissionRef.current = false;
      };

      recognition.onend = () => {
        // Tự động khôi phục kết nối nếu người dùng chưa chủ động bấm Dừng thu âm (Khắc phục ngắt kết nối 10-15s của Chrome)
        if (isRecordingRef.current && recognitionRef.current) {
          try {
            console.info('Speech recognition tự động tái kết nối luồng âm thanh...');
            recognitionRef.current.start();
            return;
          } catch (e) {
            console.warn('Không thể tái kết nối STT ngay, dừng phiên:', e);
          }
        }
        stopSpeechRecognition();
        isPromptingPermissionRef.current = false;
      };

      recognition.start();
      recognitionRef.current = recognition;

      // Đặt timeout phòng trường hợp người dùng đóng popup mà không cấp quyền
      setTimeout(() => {
        if (isPromptingPermissionRef.current) {
          isPromptingPermissionRef.current = false;
        }
      }, 10000);
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      stopSpeechRecognition();
      isPromptingPermissionRef.current = false;
    }
  };

  // Nút Xác nhận chèn đoạn nói vào Textarea
  const handleInsertSttText = () => {
    const textToInsert = (sttTranscript + ' ' + sttInterimText).trim();
    if (textToInsert) {
      setAnswerText((prev) => (prev ? prev + '\n' + textToInsert : textToInsert));
      setAutoSaveStatus('dirty');
      toast.success('Đã chèn nội dung giọng nói vào bài làm.');
    }
    stopSpeechRecognition();
    setShowSttPreview(false);
    setSttTranscript('');
    setSttInterimText('');
  };

  // Nút Hủy bỏ đoạn nhận diện giọng nói
  const handleDiscardSttText = () => {
    stopSpeechRecognition();
    setShowSttPreview(false);
    setSttTranscript('');
    setSttInterimText('');
    toast.info('Đã hủy đoạn giọng nói vừa thu.');
  };

  // Lưu nháp (Auto-save) sau mỗi lần gõ
  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswerText(e.target.value);
    setAutoSaveStatus('dirty');
  };

  const saveCurrentDraft = async (isSubmitting = false, isManual = false) => {
    if (!currentQuestion || !sessionId) return;
    setAutoSaveStatus('saving');

    try {
      const res = await aiInterviewService.saveCandidateAnswer(
        sessionId,
        currentQuestion.questionId,
        {
          answerText,
          inputMethod: 'HYBRID',
          baseRevision: currentRevision,
          timeSpentSeconds: 0,
          isSubmitted: isSubmitting,
        },
        sessionToken
      );
      setCurrentRevision(res.newRevision);
      setAutoSaveStatus('saved');
      if (isManual) {
        toast.success('Đã lưu bài làm thành công!');
      }
      return res;
    } catch (err: any) {
      console.error('Failed to save draft:', err);
      setAutoSaveStatus('dirty');
      if (isManual) {
        toast.error('Lưu bài thất bại, vui lòng thử lại.');
      }
      return null;
    }
  };

  // Tự động lưu nháp Debounce 2.5 giây khi có thay đổi nội dung câu trả lời
  useEffect(() => {
    if (autoSaveStatus !== 'dirty' || !answerText.trim() || loading || isTerminated) {
      return;
    }

    const timer = setTimeout(() => {
      saveCurrentDraft(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [answerText, autoSaveStatus, loading, isTerminated]);

  // Chuyển câu hỏi (Tiến hoặc Quay lại theo allowRevisitQuestions)
  const navigateToQuestion = async (targetIdx: number) => {
    if (!sessionData?.questions || targetIdx === currentQuestionIndex || targetIdx < 0 || targetIdx >= sessionData.questions.length) {
      return;
    }
    // Nếu có thay đổi chưa lưu, lưu nháp trước khi chuyển
    if (autoSaveStatus === 'dirty') {
      await saveCurrentDraft(false);
    }

    const targetQ = sessionData.questions[targetIdx];
    setCurrentQuestionIndex(targetIdx);
    setCurrentQuestion(targetQ);
    setAnswerText(targetQ.savedAnswerText || '');
    setCurrentRevision(targetQ.currentRevision || 1);
    setRemainingSeconds(targetQ.remainingSeconds || 180);
  };

  // Chuyển câu tiếp theo hoặc kích hoạt modal nộp toàn bộ bài
  const handleNextQuestion = async (forcedByTimeout = false) => {
    if (!sessionData || !currentQuestion) return;

    // Nếu ở câu cuối cùng và người dùng bấm thủ công -> Mở modal xác nhận thay vì nộp ngay
    const isLastQuestion = currentQuestionIndex + 1 >= (sessionData.questions?.length || 0);
    if (isLastQuestion && !forcedByTimeout) {
      setConfirmSubmitModalOpen(true);
      return;
    }

    setIsSubmittingQuestion(true);
    try {
      // Chốt câu hiện tại lên Server
      const saveRes = await saveCurrentDraft(true);

      const nextIdx = currentQuestionIndex + 1;
      if (nextIdx < sessionData.questions.length) {
        let freshRecovery: CandidateRecoveryStateData | null = null;
        try {
          freshRecovery = await aiInterviewService.getCandidateRecoveryState(sessionId!, sessionToken);
          setSessionData(freshRecovery);
        } catch (fetchErr) {
          console.warn('Could not refresh recovery state, using cached:', fetchErr);
        }

        const nextQ = freshRecovery?.questions ? freshRecovery.questions[nextIdx] : sessionData.questions[nextIdx];
        if (nextQ) {
          setCurrentQuestionIndex(nextIdx);
          setCurrentQuestion(nextQ);
          setAnswerText(nextQ.savedAnswerText || '');
          setCurrentRevision(nextQ.currentRevision || 1);
          setRemainingSeconds(nextQ.remainingSeconds || (saveRes?.serverDeadline ? Math.max(0, Math.floor((new Date(saveRes.serverDeadline).getTime() - Date.now()) / 1000)) : 180));
        }
      } else {
        // Hết giờ câu cuối cùng -> Nộp toàn bộ bài do Timeout
        await handleFinalSubmit('TIMEOUT');
      }
    } catch (err) {
      console.error('Error transitioning question:', err);
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const handleFinalSubmit = async (reason = 'MANUAL') => {
    setConfirmSubmitModalOpen(false);
    setIsSubmittingQuestion(true);
    try {
      await saveCurrentDraft(true);
      await aiInterviewService.submitCandidateSession(sessionId!, reason, sessionToken);
      sessionStorage.removeItem('candidate_session_token');
      sessionStorage.removeItem('candidate_session_id');
      sessionStorage.removeItem('candidate_user_confirmed_start');
      toast.success('Chúc mừng bạn đã hoàn thành bài phỏng vấn! Đang chuyển đến trang tóm tắt...');
      navigate(`/interview/complete/${sessionId}`);
    } catch (err) {
      console.error('Failed to submit session:', err);
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Tính số từ và ký tự
  const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;
  const charCount = answerText.length;

  // Helper định dạng danh mục câu hỏi thân thiện với ứng viên
  const formatCategory = (cat?: string) => {
    if (!cat) return 'Câu hỏi chung';
    switch (cat.toUpperCase()) {
      case 'TECHNICAL_FOUNDATION':
        return 'Kiến thức Kỹ thuật Nền tảng';
      case 'TECHNICAL':
      case 'CODING':
        return 'Chuyên môn Kỹ thuật';
      case 'PROBLEM_SOLVING':
        return 'Giải quyết Vấn đề';
      case 'SYSTEM_DESIGN':
        return 'Thiết kế Hệ thống';
      case 'BEHAVIORAL':
      case 'SOFT_SKILLS':
        return 'Kỹ năng Mềm & Thái độ';
      case 'PROJECT_EXPERIENCE':
        return 'Kinh nghiệm Dự án';
      default:
        return cat.replace(/_/g, ' ');
    }
  };

  // Helper định dạng độ khó thân thiện với ứng viên
  const formatDifficulty = (diff?: string) => {
    if (!diff) return 'Trung bình';
    switch (diff.toUpperCase()) {
      case 'EASY':
        return 'Mức độ: Dễ';
      case 'MEDIUM':
        return 'Mức độ: Trung bình';
      case 'HARD':
        return 'Mức độ: Nâng cao';
      default:
        return diff;
    }
  };

  // Kiểm tra câu hỏi kỹ thuật để kích hoạt Monospace Editor (Cụm 3)
  const isTechnicalQuestion =
    currentQuestion?.category === 'TECHNICAL' ||
    currentQuestion?.category === 'CODING' ||
    currentQuestion?.category === 'TECHNICAL_FOUNDATION';

  // Đếm số dòng của văn bản (Line numbers)
  const lineNumbers = answerText.split('\n').map((_, index) => index + 1);

  if (loading) {
    return (
      <div className={styles.roomLayout} style={{ alignItems: 'center', justifyContent: 'center' }}>

        <p>Đang tải buồng phỏng vấn...</p>
      </div>
    );
  }

  const isTimerDanger = remainingSeconds <= 15;
  const isTimerWarning = remainingSeconds <= 60 && !isTimerDanger;

  return (
    <div className={styles.roomLayout}>
      {/* Offline Alert Banner (Cụm 7) */}
      {!isOnline && (
        <div className={styles.offlineBanner}>
          <span>⚠️ Mất kết nối mạng Internet! Đừng tải lại trang, bài làm vẫn đang được lưu tạm trên máy.</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className={styles.topBar}>
        <div className={styles.brandArea}>
          <div>
            <div className={styles.roomTitle}>
              {sessionData?.interviewTitle || 'Buồng Phỏng Vấn AI Trực Tuyến'}
            </div>
            {sessionData?.candidateName && (
              <div className={styles.candidateSub}>
                <span>Thí sinh: <strong className={styles.candidateName}>{sessionData.candidateName}</strong></span>
                {sessionData.candidateEmail && <span>({sessionData.candidateEmail})</span>}
                <span>•</span>
                <span>Phòng #{sessionId}</span>
              </div>
            )}
          </div>
          <span className={styles.questionIndicator}>
            Câu {currentQuestionIndex + 1} / {sessionData?.totalQuestions || 1}
          </span>
          <span className={currentStrikes > 0 ? styles.strikeBadgeWarning : styles.strikeBadgeNormal}>
            Vi phạm: {currentStrikes}/{maxStrikes}
          </span>
        </div>

        {/* Server Authoritative Timer Badge & Fullscreen Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className={styles.btnFullscreen}
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Thu nhỏ màn hình' : 'Mở toàn màn hình'}
          >
            {isFullscreen ? '🗗 Thu nhỏ' : '⛶ Toàn màn hình'}
          </button>

          <div
            className={`${styles.timerBadge} ${
              isTimerDanger ? styles.timerDanger : isTimerWarning ? styles.timerWarning : ''
            }`}
          >
            <span>⏱️</span>
            <span>{formatTimer(remainingSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Main Area: 2 Cột chuẩn Spec (Sidebar Tiến độ câu hỏi & Khung làm bài) */}
      <div className={styles.mainContent}>
        {/* Cột trái: Tiến độ & Danh sách câu hỏi */}
        <div className={styles.sidebarCard}>
          <div className={styles.sidebarTitle}>
            <span>Tiến Độ Phỏng Vấn</span>
            <span className={styles.progressPercentBadge}>
              {Math.round(
                ((sessionData?.questions?.filter((q) => q.questionStatus === 'COMPLETED').length || 0) /
                  (sessionData?.totalQuestions || 1)) *
                  100
              )}%
            </span>
          </div>

          {/* Thanh Tiến Độ Tỷ Lệ Hoàn Thành Nổi Bật */}
          <div className={styles.stepperProgressBarContainer}>
            <div
              className={styles.stepperProgressBarFill}
              style={{
                width: `${Math.round(
                  ((sessionData?.questions?.filter((q) => q.questionStatus === 'COMPLETED').length || 0) /
                    (sessionData?.totalQuestions || 1)) *
                    100
                )}%`,
              }}
            />
          </div>
          <div className={styles.stepperSummaryText}>
            <span>Đã hoàn thành {sessionData?.questions?.filter((q) => q.questionStatus === 'COMPLETED').length || 0}/{sessionData?.totalQuestions || 1} câu hỏi</span>
          </div>

          <div className={styles.questionListGrid}>
            {sessionData?.questions?.map((q, idx) => {
              const isActive = idx === currentQuestionIndex;
              const isCompleted = q.questionStatus === 'COMPLETED' || idx < currentQuestionIndex;
              const canClick = sessionData.allowRevisitQuestions;

              return (
                <div
                  key={q.questionId}
                  className={`${styles.questionStepItem} ${
                    isActive ? styles.stepActive : isCompleted ? styles.stepCompleted : styles.stepPending
                  }`}
                  style={{ cursor: canClick ? 'pointer' : 'default' }}
                  onClick={() => canClick && navigateToQuestion(idx)}
                  title={canClick ? `Bấm để chuyển sang Câu ${idx + 1}` : undefined}
                >
                  <div className={styles.stepItemLeft}>
                    <div className={styles.stepIndexBadge}>
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <div className={styles.stepInfoText}>
                      <span className={styles.stepLabel}>Câu {idx + 1}</span>
                      <span className={styles.stepCategorySubtitle}>{formatCategory(q.category)}</span>
                    </div>
                  </div>
                  <span className={styles.stepStatusBadge}>
                    {isCompleted ? 'Đã nộp' : isActive ? 'Đang làm' : 'Chờ mở'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cột phải: Đề bài & Khu vực soạn thảo câu trả lời */}
        <div className={styles.workArea}>
          {currentQuestion && (
            <div className={styles.questionCard}>
              <div className={styles.questionMeta}>
                <span className={styles.categoryTag}>{formatCategory(currentQuestion.category)}</span>
                <span className={styles.difficultyTag}>{formatDifficulty(currentQuestion.difficulty)}</span>
                {currentQuestion.focusArea && (
                  <span className={styles.focusTag}>
                    Trọng tâm: {currentQuestion.focusArea}
                  </span>
                )}
              </div>
              <div className={styles.questionText}>{currentQuestion.questionText}</div>
            </div>
          )}

          {/* STT Live Preview Card (Chuẩn Mục 7.3 của Spec - Nâng cấp Dynamic Waveform) */}
          {showSttPreview && (
            <div className={`${styles.sttPreviewCard} ${isRecording ? styles.sttPreviewActive : ''}`}>
              <div className={styles.sttHeader}>
                <div className={styles.sttLiveStatus}>
                  {isRecording && (
                    <div className={styles.dynamicAudioWave}>
                      <span className={styles.waveBar} style={{ '--bar-h': '8px', '--anim-d': '0.1s' } as any} />
                      <span className={styles.waveBar} style={{ '--bar-h': '18px', '--anim-d': '0.25s' } as any} />
                      <span className={styles.waveBar} style={{ '--bar-h': '26px', '--anim-d': '0.15s' } as any} />
                      <span className={styles.waveBar} style={{ '--bar-h': '14px', '--anim-d': '0.35s' } as any} />
                      <span className={styles.waveBar} style={{ '--bar-h': '28px', '--anim-d': '0.2s' } as any} />
                      <span className={styles.waveBar} style={{ '--bar-h': '20px', '--anim-d': '0.3s' } as any} />
                      <span className={styles.waveBar} style={{ '--bar-h': '12px', '--anim-d': '0.12s' } as any} />
                      <span className={styles.waveBar} style={{ '--bar-h': '6px', '--anim-d': '0.4s' } as any} />
                    </div>
                  )}
                  <span className={styles.sttLiveStatusLabel}>
                    {isRecording ? 'Đang nhận diện giọng nói...' : 'Đã tạm dừng thu âm'}
                  </span>
                </div>

                <div className={styles.sttActions}>
                  <button
                    type="button"
                    className={styles.btnSttInsert}
                    onClick={handleInsertSttText}
                    title="Chèn nội dung đã nhận diện vào bài làm"
                  >
                    <span>✅ Chèn vào bài</span>
                  </button>
                  <button
                    type="button"
                    className={styles.btnSttDiscard}
                    onClick={handleDiscardSttText}
                    title="Hủy bỏ đoạn thu âm này"
                  >
                    <span>❌ Hủy</span>
                  </button>
                </div>
              </div>

              <div className={styles.sttTranscriptText}>
                {sttTranscript || sttInterimText ? (
                  <>
                    <span>{sttTranscript}</span>
                    {sttInterimText && <span className={styles.sttInterim}> {sttInterimText}</span>}
                  </>
                ) : (
                  <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                    Hãy nói vào micro, văn bản sẽ hiển thị tại đây theo thời gian thực...
                  </span>
                )}
              </div>
            </div>
          )}

          <div className={styles.editorCard}>
            <div className={styles.editorToolbar}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className={styles.toolbarTitle}>
                  Nội dung câu trả lời {isTechnicalQuestion && <span style={{ fontSize: '0.75rem', color: '#4f46e5', background: '#eef2ff', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>Chế độ Code Editor</span>}
                </span>

                {/* Auto-save Status hiển thị nổi bật trên Toolbar */}
                <div className={styles.autoSaveStatusTop}>
                  {autoSaveStatus === 'saving' && <span>🔄 Đang lưu nháp...</span>}
                  {autoSaveStatus === 'saved' && <span>✅ Đã lưu</span>}
                  {autoSaveStatus === 'dirty' && <span>⚠️ Chưa lưu</span>}
                </div>
              </div>

              {/* Bộ điều khiển STT Micro, Ngôn ngữ & Khôi phục */}
              <div className={styles.sttControls}>
                <button
                  type="button"
                  className={styles.btnResetDraft}
                  onClick={handleResetToLastSaved}
                  title="Khôi phục lại bản lưu gần nhất trên máy chủ"
                >
                  ↩️ Bản lưu trước
                </button>

                <select
                  className={styles.langSelect}
                  value={speechLanguage}
                  onChange={(e) => setSpeechLanguage(e.target.value as any)}
                  disabled={isRecording}
                  title="Chọn ngôn ngữ nhận diện giọng nói"
                >
                  <option value="vi-VN">Tiếng Việt (vi-VN)</option>
                  <option value="en-US">English (en-US)</option>
                </select>

                <button
                  type="button"
                  className={`${styles.micBtn} ${isRecording ? styles.micRecording : ''}`}
                  onClick={toggleSpeechRecognition}
                >
                  <span>{isRecording ? '⏹️ Dừng thu âm' : '🎙️ Nói bằng Micro'}</span>
                </button>
              </div>
            </div>

            <div className={styles.editorBody}>
              <div className={styles.lineNumbersCol}>
                {lineNumbers.map((num) => (
                  <span key={num}>{num}</span>
                ))}
              </div>
              <textarea
                className={`${styles.textArea} ${isTechnicalQuestion ? styles.textAreaMonospace : ''}`}
                value={answerText}
                onChange={handleAnswerChange}
                onPaste={async (e) => {
                  const pastedData = e.clipboardData.getData('text');
                  if (pastedData && pastedData.length > 5) {
                    console.warn('[Anti-Cheat] Phát hiện hành vi dán văn bản (Paste):', pastedData.length, 'ký tự');
                    try {
                      await aiInterviewService.recordCandidateEvidence(
                        sessionId!,
                        {
                          eventType: 'PASTE_DETECTED',
                          metadata: `Dán ${pastedData.length} ký tự vào câu trả lời`,
                          clientTimestamp: new Date().toISOString(),
                        },
                        sessionToken
                      );
                      toast.warning('Cảnh báo: Hành vi dán văn bản (Paste) đã được ghi nhận vào biên bản thi!');
                    } catch (err) {
                      console.error('Failed to record paste telemetry:', err);
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Tab') {
                    e.preventDefault();
                    const target = e.currentTarget;
                    const start = target.selectionStart;
                    const end = target.selectionEnd;
                    const newText = answerText.substring(0, start) + '    ' + answerText.substring(end);
                    setAnswerText(newText);
                    setAutoSaveStatus('dirty');
                    setTimeout(() => {
                      target.selectionStart = target.selectionEnd = start + 4;
                    }, 0);
                  }
                }}
                placeholder="Nhập câu trả lời hoặc đoạn mã lập trình chi tiết của bạn tại đây (Hỗ trợ phím Tab thụt dòng code, hoặc bấm nút Micro phía trên để nói)..."
                disabled={isTerminated}
              />
            </div>


            <div className={styles.bottomBar}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div className={styles.autoSaveStatus}>
                  {autoSaveStatus === 'saving' && <span>🔄 Đang lưu nháp lên máy chủ...</span>}
                  {autoSaveStatus === 'saved' && <span>✅ Đã lưu nháp an toàn trên máy chủ</span>}
                  {autoSaveStatus === 'dirty' && <span>⚠️ Có nội dung chưa lưu (Tự động lưu sau 2.5s)</span>}
                </div>
                <div className={styles.counterInfo}>
                  <span>Số từ: <strong>{wordCount}</strong></span>
                  <span>•</span>
                  <span>Ký tự: <strong>{charCount}</strong></span>
                </div>
              </div>

              <div className={styles.navActions}>
                <button
                  type="button"
                  className={styles.btnPrev}
                  onClick={() => saveCurrentDraft(false, true)}
                  disabled={autoSaveStatus === 'saving' || isTerminated}
                  title="Lưu câu trả lời vào máy chủ ngay lập tức"
                  style={{ background: '#f8fafc', borderColor: '#cbd5e1' }}
                >
                  {autoSaveStatus === 'saving' ? 'Đang lưu...' : '💾 Lưu nháp'}
                </button>

                {sessionData?.allowRevisitQuestions && currentQuestionIndex > 0 && (
                  <button
                    type="button"
                    className={styles.btnPrev}
                    onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
                    disabled={isSubmittingQuestion || isTerminated}
                  >
                    ⬅ Câu trước
                  </button>
                )}

                <button
                  type="button"
                  className={styles.btnNext}
                  onClick={() => handleNextQuestion(false)}
                  disabled={isSubmittingQuestion || isTerminated}
                >
                  {isSubmittingQuestion
                    ? 'Đang gửi...'
                    : currentQuestionIndex + 1 === sessionData?.totalQuestions
                    ? 'Hoàn Thành & Nộp Bài'
                    : 'Lưu & Câu Tiếp Theo ➔'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Xác Nhận Nộp Toàn Bộ Bài Thi */}
      {confirmSubmitModalOpen && (
        <div className={styles.alertModalOverlay}>
          <div className={styles.confirmModal}>
            <div className={styles.confirmTitle}>Xác Nhận Nộp Toàn Bộ Bài Thi</div>
            <div className={styles.confirmText}>
              Bạn đã hoàn thành câu hỏi cuối cùng. Sau khi bấm nộp bài, hệ thống AI sẽ tiến hành chấm điểm và bạn sẽ không thể chỉnh sửa lại bài làm. Bạn có chắc chắn muốn nộp không?
            </div>
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.btnCancelModal}
                onClick={() => setConfirmSubmitModalOpen(false)}
              >
                Kiểm tra lại
              </button>
              <button
                type="button"
                className={styles.btnConfirmModal}
                onClick={() => handleFinalSubmit('MANUAL')}
                disabled={isSubmittingQuestion}
              >
                {isSubmittingQuestion ? 'Đang nộp...' : 'Đồng Ý Nộp Bài'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Anti-cheat Warning Modal */}
      {warningModalOpen && (
        <div className={styles.alertModalOverlay}>
          <div className={styles.alertModal}>
            <div className={styles.alertTitle}>CẢNH BÁO VI PHẠM</div>
            <div className={styles.alertText}>{warningMessage}</div>

            <div style={{
              margin: '1rem 0',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#dc2626',
              fontSize: '0.9rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <span>⏱️ Thời gian làm bài vẫn đang đếm ngược:</span>
              <span style={{ fontSize: '1.1rem', color: '#b91c1c' }}>{formatTimer(remainingSeconds)}</span>
            </div>

            {isTerminated ? (
              <button
                type="button"
                className={styles.alertBtn}
                onClick={() => handleFinalSubmit('STRIKE_LIMIT_EXCEEDED')}
              >
                Rời Phòng Thi
              </button>
            ) : (
              <button
                type="button"
                className={styles.alertBtn}
                onClick={() => setWarningModalOpen(false)}
              >
                Tôi Đã Hiểu & Quay Lại Làm Bài
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

