import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles,
  Send,
  Trash2,
  X,
  Minimize2,
  Maximize2,
  Copy,
  Check,
  CalendarCheck,
  Banknote,
  Kanban,
  FileQuestion,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { aiService, type ChatMessage, type QuickPromptsData } from '../../services/aiService';
import { attendanceService } from '../../services/attendanceService';
import { allowanceService, type AllowanceRecord } from '../../services/allowanceService';
import { missionService } from '../../services/missionService';
import { useAuth } from '../../contexts/AuthContext';
import styles from './InternChatWidget.module.css';

interface CustomCardPayload {
  type: 'ATTENDANCE_SUMMARY' | 'ALLOWANCE_INFO' | 'MISSION_TASKS';
  data?: any;
  loading?: boolean;
  error?: string;
}

interface EnhancedChatMessage extends ChatMessage {
  customCard?: CustomCardPayload;
}

export const InternChatWidget: React.FC = () => {
  const { role, hasPermission, user } = useAuth();
  // Trợ lý ảo FAQ này dành riêng cho Thực Tập Sinh (INTERN / USER)
  const isInternRole = role === 'INTERN' || role === 'USER';
  const canUseChat = isInternRole && (isInternRole || hasPermission('AI_CHAT_USE'));

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [sessionId, setSessionId] = useState<string>(() => {
    const saved = sessionStorage.getItem('ai_chat_session_id');
    if (saved) return saved;
    const newId = crypto.randomUUID();
    sessionStorage.setItem('ai_chat_session_id', newId);
    return newId;
  });

  const [messages, setMessages] = useState<EnhancedChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem('ai_chat_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [inputMsg, setInputMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickPrompts, setQuickPrompts] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Lưu tin nhắn tạm vào sessionStorage để phục hồi khi chuyển trang
  useEffect(() => {
    sessionStorage.setItem('ai_chat_messages', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load danh sách Quick Prompts khi mở widget
  useEffect(() => {
    if (isOpen && quickPrompts.length === 0) {
      aiService.getQuickPrompts()
        .then((data: QuickPromptsData) => {
          if (data && data.isActive && data.quickPrompts) {
            setQuickPrompts(data.quickPrompts);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, quickPrompts.length]);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ==========================================
  // GIAI ĐOẠN B: Direct API Data Cards (Zero LLM)
  // ==========================================

  // 1. Tra cứu Chuyên cần & Điểm danh trực tiếp từ AttendanceService
  const handleTriggerAttendanceCard = async () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const cardMsgId = crypto.randomUUID();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Tin nhắn người dùng
    const userMsg: EnhancedChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: 'Xem tóm tắt bảng công tháng này',
      timestamp: timeStr,
    };

    // Placeholder thẻ bot
    const botMsg: EnhancedChatMessage = {
      id: cardMsgId,
      sender: 'assistant',
      text: '',
      timestamp: timeStr,
      customCard: {
        type: 'ATTENDANCE_SUMMARY',
        loading: true,
      },
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);

    try {
      const summary = await attendanceService.getMyAttendanceHistory({
        month: currentMonth,
        year: currentYear,
      });

      setMessages((prev) =>
        prev.map((m) =>
          m.id === cardMsgId
            ? {
                ...m,
                customCard: {
                  type: 'ATTENDANCE_SUMMARY',
                  loading: false,
                  data: {
                    month: currentMonth,
                    year: currentYear,
                    summary,
                  },
                },
              }
            : m
        )
      );
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === cardMsgId
            ? {
                ...m,
                customCard: {
                  type: 'ATTENDANCE_SUMMARY',
                  loading: false,
                  error: err?.message || 'Không thể tải dữ liệu bảng công từ hệ thống chấm công.',
                },
              }
            : m
        )
      );
    }
  };

  // 2. Tra cứu Phụ cấp trực tiếp từ AllowanceService (Zero LLM)
  const handleTriggerAllowanceCard = async () => {
    const cardMsgId = crypto.randomUUID();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: EnhancedChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: 'Kiểm tra tình trạng phụ cấp thực tập',
      timestamp: timeStr,
    };

    const botMsg: EnhancedChatMessage = {
      id: cardMsgId,
      sender: 'assistant',
      text: '',
      timestamp: timeStr,
      customCard: {
        type: 'ALLOWANCE_INFO',
        loading: true,
      },
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);

    try {
      const records: AllowanceRecord[] = await allowanceService.getMyHistory();
      const latestRecord = records && records.length > 0 ? records[0] : null;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === cardMsgId
            ? {
                ...m,
                customCard: {
                  type: 'ALLOWANCE_INFO',
                  loading: false,
                  data: {
                    record: latestRecord,
                    totalRecords: records.length,
                  },
                },
              }
            : m
        )
      );
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === cardMsgId
            ? {
                ...m,
                customCard: {
                  type: 'ALLOWANCE_INFO',
                  loading: false,
                  error: err?.message || 'Không thể kết nối đến Dịch vụ Phụ cấp (AllowanceService).',
                },
              }
            : m
        )
      );
    }
  };

  // 3. Tra cứu Nhiệm vụ Kanban trực tiếp từ MissionService
  const handleTriggerMissionCard = async () => {
    const cardMsgId = crypto.randomUUID();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: EnhancedChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: 'Xem nhiệm vụ thực tập đang thực hiện',
      timestamp: timeStr,
    };

    const botMsg: EnhancedChatMessage = {
      id: cardMsgId,
      sender: 'assistant',
      text: '',
      timestamp: timeStr,
      customCard: {
        type: 'MISSION_TASKS',
        loading: true,
      },
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);

    try {
      const kanban = await missionService.getMyMissionKanban();

      setMessages((prev) =>
        prev.map((m) =>
          m.id === cardMsgId
            ? {
                ...m,
                customCard: {
                  type: 'MISSION_TASKS',
                  loading: false,
                  data: kanban,
                },
              }
            : m
        )
      );
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === cardMsgId
            ? {
                ...m,
                customCard: {
                  type: 'MISSION_TASKS',
                  loading: false,
                  error: err?.message || 'Không thể tải bảng nhiệm vụ cá nhân.',
                },
              }
            : m
        )
      );
    }
  };

  // ==========================================
  // GIAI ĐOẠN A: Chat Hỏi Đáp AI thông thường (Streaming SSE)
  // ==========================================
  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMsg).trim();
    if (!text || isLoading) return;

    const userMsg: EnhancedChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMsg('');
    setIsLoading(true);

    const botMsgId = crypto.randomUUID();
    const botMsgTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev,
      {
        id: botMsgId,
        sender: 'assistant',
        text: '',
        timestamp: botMsgTimestamp,
      },
    ]);

    try {
      let accumulatedText = '';

      await aiService.streamChat(
        sessionId,
        text,
        {
          onChunk: (chunk: string) => {
            accumulatedText += chunk;
            setMessages((prev) =>
              prev.map((m) => (m.id === botMsgId ? { ...m, text: accumulatedText } : m))
            );
          },
          onDone: () => {
            setIsLoading(false);
          },
          onError: (err: Error) => {
            console.error('Lỗi stream chat:', err);
            const errorMsgText = err.message || 'Trợ lý ảo tạm thời gặp sự cố. Vui lòng thử lại sau.';
            setMessages((prev) =>
              prev.map((m) =>
                m.id === botMsgId
                  ? { ...m, text: accumulatedText ? accumulatedText : errorMsgText }
                  : m
              )
            );
            setIsLoading(false);
          },
        }
      );
    } catch (err: any) {
      console.warn('Stream chat thất bại, kích hoạt cơ chế fallback sang Chat thông thường...', err);
      try {
        const responseData = await aiService.chat(sessionId, text);
        if (responseData && responseData.reply) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId ? { ...m, text: responseData.reply } : m
            )
          );
        } else {
          throw err;
        }
      } catch (fallbackErr: any) {
        const errorMsgText = fallbackErr.message || fallbackErr.response?.data?.message || 'Trợ lý ảo tạm thời gặp sự cố. Vui lòng thử lại sau.';
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId ? { ...m, text: m.text ? m.text : errorMsgText } : m
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const executeClearSession = async () => {
    setShowConfirmModal(false);
    try {
      await aiService.clearSession(sessionId);
    } catch {}
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);
    sessionStorage.setItem('ai_chat_session_id', newSessionId);
    setMessages([]);
    sessionStorage.removeItem('ai_chat_messages');
  };

  if (!canUseChat) {
    return null;
  }

  return (
    <>
      {/* 1. Nút mở Chat Floating Button Glassmorphism */}
      {!isOpen && (
        <button
          className={styles.floatingBtn}
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          title="Trợ lý ảo AI Thực tập sinh"
          aria-label="Mở trợ lý ảo AI InternHub"
        >
          <div className={styles.floatingIconWrapper}>
            <Sparkles size={24} className={styles.sparkleIcon} />
          </div>
          <span className={styles.floatingStatusDot} />
        </button>
      )}

      {/* 2. Cửa sổ Chatbot chính */}
      {isOpen && (
        <div
          className={`${styles.chatWidgetContainer} ${
            isMinimized ? styles.minimizedContainer : ''
          }`}
        >
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerTitleWrap}>
              <div className={styles.avatarGlow}>
                <Sparkles size={16} />
              </div>
              <div>
                <div className={styles.headerTitle}>Trợ lý Thực tập sinh</div>
                <div className={styles.headerStatusText}>
                  <span className={styles.onlineDot} /> AI & Dữ liệu trực tuyến
                </div>
              </div>
            </div>

            <div className={styles.headerActions}>
              <button
                className={styles.actionBtn}
                onClick={() => setIsMinimized((prev) => !prev)}
                title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
              >
                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => setShowConfirmModal(true)}
                title="Làm mới cuộc trò chuyện"
              >
                <Trash2 size={14} />
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => setIsOpen(false)}
                title="Đóng widget"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Security Privacy Warning Strip */}
              <div className={styles.warningBanner}>
                <ShieldAlert size={12} className={styles.shieldIcon} />
                <span>Không nhập CCCD, mật khẩu hoặc dữ liệu nhạy cảm.</span>
              </div>

              {/* Message List */}
              <div className={styles.messagesList}>
                {messages.length === 0 && (
                  <div className={styles.welcomeHero}>
                    <div className={styles.welcomeHeroIcon}>
                      <Sparkles size={28} />
                    </div>
                    <h4 className={styles.welcomeHeroTitle}>
                      Xin chào {user?.fullName ? `${user.fullName}` : 'bạn'}! 👋
                    </h4>
                    <p className={styles.welcomeHeroDesc}>
                      Mình là Trợ lý ảo thực tập. Bạn có thể hỏi mình về nội quy, quy chế thực tập hoặc bấm nhanh các thẻ dữ liệu trực tiếp bên dưới:
                    </p>

                    {/* Action Chips Shortcut Cards */}
                    <div className={styles.heroShortcutGrid}>
                      <button
                        className={styles.heroShortcutBtn}
                        onClick={handleTriggerAttendanceCard}
                      >
                        <CalendarCheck size={16} className={styles.shortcutIconAttendance} />
                        <span>Xem bảng công tháng này</span>
                      </button>

                      <button
                        className={styles.heroShortcutBtn}
                        onClick={handleTriggerAllowanceCard}
                      >
                        <Banknote size={16} className={styles.shortcutIconAllowance} />
                        <span>Tra cứu phụ cấp thực tập</span>
                      </button>

                      <button
                        className={styles.heroShortcutBtn}
                        onClick={handleTriggerMissionCard}
                      >
                        <Kanban size={16} className={styles.shortcutIconMission} />
                        <span>Nhiệm vụ Kanban cá nhân</span>
                      </button>
                    </div>
                  </div>
                )}

                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`${styles.messageBubble} ${
                      m.sender === 'user' ? styles.userBubble : styles.assistantBubble
                    }`}
                  >
                    {/* Render Nội dung người dùng */}
                    {m.sender === 'user' && (
                      <div className={styles.userText}>{m.text}</div>
                    )}

                    {/* Render Thẻ dữ liệu trực tiếp (Direct API Cards) */}
                    {m.customCard && (
                      <div className={styles.customCardWrapper}>
                        {m.customCard.loading && (
                          <div className={styles.cardLoading}>
                            <div className={styles.loadingSpinner} />
                            <span>Đang truy xuất dữ liệu từ máy chủ...</span>
                          </div>
                        )}

                        {m.customCard.error && (
                          <div className={styles.cardError}>
                            <ShieldAlert size={16} />
                            <span>{m.customCard.error}</span>
                          </div>
                        )}

                        {/* 1. THẺ ĐIỂM DANH & CHUYÊN CẦN */}
                        {!m.customCard.loading &&
                          !m.customCard.error &&
                          m.customCard.type === 'ATTENDANCE_SUMMARY' && (
                            <div className={styles.attendanceCard}>
                              <div className={styles.cardHeader}>
                                <div className={styles.cardHeaderTitle}>
                                  <CalendarCheck size={16} color="#3b82f6" />
                                  <span>
                                    Bảng Công Tháng {m.customCard.data?.month}/{m.customCard.data?.year}
                                  </span>
                                </div>
                                <span className={styles.cardSourceBadge}>API Trực tiếp</span>
                              </div>

                              <div className={styles.cardStatsGrid}>
                                <div className={styles.cardStatItem}>
                                  <span className={styles.cardStatLabel}>Ngày làm thực tế</span>
                                  <span className={styles.cardStatValue}>
                                    {m.customCard.data?.summary?.actualWorkDays ?? 0} ngày
                                  </span>
                                </div>
                                <div className={styles.cardStatItem}>
                                  <span className={styles.cardStatLabel}>Muộn / Sớm</span>
                                  <span className={styles.cardStatValue}>
                                    {m.customCard.data?.summary?.lateCount ?? 0}m •{' '}
                                    {m.customCard.data?.summary?.earlyLeaveCount ?? 0}s
                                  </span>
                                </div>
                                <div className={styles.cardStatItem}>
                                  <span className={styles.cardStatLabel}>Nghỉ có phép</span>
                                  <span className={styles.cardStatValue}>
                                    {m.customCard.data?.summary?.approvedLeaveDays ?? 0} ngày
                                  </span>
                                </div>
                                <div className={styles.cardStatItem}>
                                  <span className={styles.cardStatLabel}>Tỷ lệ chuyên cần</span>
                                  <span
                                    className={styles.cardStatValue}
                                    style={{ color: '#10b981', fontWeight: 700 }}
                                  >
                                    {(m.customCard.data?.summary?.diligenceRate ?? 0).toFixed(1)}%
                                  </span>
                                </div>
                              </div>

                              <a href="/intern/attendance" className={styles.cardFooterLink}>
                                <span>Xem lịch sử chi tiết & check-in</span>
                                <ExternalLink size={12} />
                              </a>
                            </div>
                          )}

                        {/* 2. THẺ PHỤ CẤP THỰC TẬP (AllowanceService) */}
                        {!m.customCard.loading &&
                          !m.customCard.error &&
                          m.customCard.type === 'ALLOWANCE_INFO' && (
                            <div className={styles.allowanceCard}>
                              <div className={styles.cardHeader}>
                                <div className={styles.cardHeaderTitle}>
                                  <Banknote size={16} color="#10b981" />
                                  <span>
                                    Phụ Cấp Kỳ {m.customCard.data?.record?.periodMonth || 'Hiện tại'}
                                  </span>
                                </div>
                                <span className={styles.cardSourceBadgeAllowance}>
                                  Nguồn: AllowanceService
                                </span>
                              </div>

                              {m.customCard.data?.record ? (
                                <>
                                  <div className={styles.allowanceAmountRow}>
                                    <span className={styles.allowanceAmountLabel}>Thực nhận:</span>
                                    <span className={styles.allowanceAmountValue}>
                                      {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                      }).format(
                                        m.customCard.data.record.actualAmount ??
                                          m.customCard.data.record.baseAllowance ??
                                          0
                                      )}
                                    </span>
                                  </div>

                                  <div className={styles.allowanceMetaList}>
                                    <div className={styles.metaRow}>
                                      <span>Trạng thái:</span>
                                      <span
                                        className={`${styles.statusPill} ${
                                          m.customCard.data.record.status === 'PAID'
                                            ? styles.pillPaid
                                            : m.customCard.data.record.status === 'APPROVED'
                                              ? styles.pillApproved
                                              : styles.pillDraft
                                        }`}
                                      >
                                        {m.customCard.data.record.status === 'PAID'
                                          ? 'Đã chi trả'
                                          : m.customCard.data.record.status === 'APPROVED'
                                            ? 'Đã phê duyệt'
                                            : 'Đang lập dự thảo'}
                                      </span>
                                    </div>
                                    <div className={styles.metaRow}>
                                      <span>Số ngày công tính lương:</span>
                                      <strong>
                                        {m.customCard.data.record.actualWorkingDays ?? 0} /{' '}
                                        {m.customCard.data.record.standardWorkingDays ?? 22} ngày
                                      </strong>
                                    </div>
                                    {m.customCard.data.record.paymentDate && (
                                      <div className={styles.metaRow}>
                                        <span>Ngày chuyển khoản:</span>
                                        <strong>{m.customCard.data.record.paymentDate}</strong>
                                      </div>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <div className={styles.cardEmptyNotice}>
                                  Chưa phát sinh bản ghi phụ cấp nào cho kỳ này.
                                </div>
                              )}

                              <a href="/intern/allowance-history" className={styles.cardFooterLink}>
                                <span>Xem lịch sử phiếu phụ cấp</span>
                                <ExternalLink size={12} />
                              </a>
                            </div>
                          )}

                        {/* 3. THẺ NHIỆM VỤ KANBAN */}
                        {!m.customCard.loading &&
                          !m.customCard.error &&
                          m.customCard.type === 'MISSION_TASKS' && (
                            <div className={styles.missionCard}>
                              <div className={styles.cardHeader}>
                                <div className={styles.cardHeaderTitle}>
                                  <Kanban size={16} color="#8b5cf6" />
                                  <span>Bảng Nhiệm Vụ Kanban</span>
                                </div>
                                <span className={styles.cardSourceBadge}>MissionService</span>
                              </div>

                              <div className={styles.kanbanCountsStrip}>
                                <span className={styles.kanbanCountBadge}>
                                  Chưa làm: {m.customCard.data?.todoItems?.length ?? 0}
                                </span>
                                <span className={styles.kanbanCountBadgeActive}>
                                  Đang làm: {m.customCard.data?.inProgressItems?.length ?? 0}
                                </span>
                                <span className={styles.kanbanCountBadgeDone}>
                                  Hoàn thành: {m.customCard.data?.completedItems?.length ?? 0}
                                </span>
                              </div>

                              <a href="/intern/missions" className={styles.cardFooterLink}>
                                <span>Mở bảng kéo thả nhiệm vụ đầy đủ</span>
                                <ChevronRight size={14} />
                              </a>
                            </div>
                          )}
                      </div>
                    )}

                    {/* Render Nội dung Markdown của Trợ lý AI */}
                    {m.sender === 'assistant' && m.text && (
                      <div className={styles.assistantContent}>
                        <div className={styles.markdownBody}>
                          <ReactMarkdown
                            components={{
                              a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.markdownLink}
                                >
                                  {children}
                                </a>
                              ),
                              img: () => null, // Chặn hoàn toàn ảnh raw để chống SSRF
                            }}
                          >
                            {m.text}
                          </ReactMarkdown>
                        </div>

                        {/* Action Bar dưới phản hồi */}
                        <div className={styles.bubbleActionRow}>
                          <button
                            className={styles.bubbleCopyBtn}
                            onClick={() => handleCopyText(m.id, m.text)}
                            title="Sao chép nội dung"
                          >
                            {copiedId === m.id ? (
                              <>
                                <Check size={12} color="#10b981" /> <span>Đã sao chép</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} /> <span>Sao chép</span>
                              </>
                            )}
                          </button>
                          <span className={styles.disclaimerText}>
                            * Thông tin AI chỉ mang tính tham khảo
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className={styles.typingIndicatorBubble}>
                    <div className={styles.typingDot} />
                    <div className={styles.typingDot} />
                    <div className={styles.typingDot} />
                    <span>AI đang phản hồi...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Action Chips Shortcut Strip (Sticky trên khung nhập) */}
              <div className={styles.actionChipsBar}>
                <button
                  className={styles.actionChip}
                  onClick={handleTriggerAttendanceCard}
                  disabled={isLoading}
                >
                  <CalendarCheck size={13} />
                  <span>Bảng công</span>
                </button>
                <button
                  className={styles.actionChip}
                  onClick={handleTriggerAllowanceCard}
                  disabled={isLoading}
                >
                  <Banknote size={13} />
                  <span>Phụ cấp</span>
                </button>
                <button
                  className={styles.actionChip}
                  onClick={handleTriggerMissionCard}
                  disabled={isLoading}
                >
                  <Kanban size={13} />
                  <span>Nhiệm vụ</span>
                </button>
                {quickPrompts.slice(0, 3).map((prompt, idx) => (
                  <button
                    key={idx}
                    className={styles.actionChipPrompt}
                    onClick={() => handleSend(prompt)}
                    disabled={isLoading}
                  >
                    <FileQuestion size={13} />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>

              {/* Input Section */}
              <div className={styles.inputSection}>
                <input
                  type="text"
                  className={styles.chatInput}
                  placeholder="Nhập câu hỏi hoặc yêu cầu..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSend();
                  }}
                  disabled={isLoading}
                />
                <button
                  className={styles.sendBtn}
                  onClick={() => handleSend()}
                  disabled={isLoading || !inputMsg.trim()}
                  title="Gửi câu hỏi"
                >
                  <Send size={15} />
                </button>
              </div>

              {/* Confirm Clear Modal */}
              {showConfirmModal && (
                <div
                  className={styles.confirmModalOverlay}
                  onClick={() => setShowConfirmModal(false)}
                >
                  <div
                    className={styles.confirmModalCard}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className={styles.confirmIconWrap}>
                      <Trash2 size={24} color="#ef4444" />
                    </div>
                    <div className={styles.confirmTitle}>Làm mới phiên trò chuyện?</div>
                    <div className={styles.confirmDesc}>
                      Toàn bộ tin nhắn trao đổi trong phiên hiện tại sẽ được dọn dẹp sạch sẽ.
                    </div>
                    <div className={styles.confirmActions}>
                      <button
                        type="button"
                        className={styles.cancelConfirmBtn}
                        onClick={() => setShowConfirmModal(false)}
                      >
                        Giữ lại
                      </button>
                      <button
                        type="button"
                        className={styles.deleteConfirmBtn}
                        onClick={executeClearSession}
                      >
                        Xác nhận xóa
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};
export default InternChatWidget;
