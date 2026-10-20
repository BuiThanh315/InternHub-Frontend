import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { aiService, type ChatMessage, type QuickPromptsData } from '../../services/aiService';
import { useAuth } from '../../contexts/AuthContext';
import styles from './InternChatWidget.module.css';

export const InternChatWidget: React.FC = () => {
  const { role, hasPermission } = useAuth();
  // Trợ lý ảo FAQ này dành riêng cho Thực Tập Sinh (INTERN / USER)
  const isInternRole = role === 'INTERN' || role === 'USER';
  const canUseChat = isInternRole && (isInternRole || hasPermission('AI_CHAT_USE'));

  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => {
    const saved = sessionStorage.getItem('ai_chat_session_id');
    if (saved) return saved;
    const newId = crypto.randomUUID();
    sessionStorage.setItem('ai_chat_session_id', newId);
    return newId;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
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

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMsg).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
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

    // Tạo sẵn message placeholder rỗng cho bot
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

  const handleClearSession = () => {
    setShowConfirmModal(true);
  };

  if (!canUseChat) {
    return null;
  }

  return (
    <>
      {/* Floating Button góc phải */}
      <button
        className={styles.floatingBtn}
        onClick={() => setIsOpen((prev) => !prev)}
        title="Trợ lý ảo AI InternHub"
      >
        💬
      </button>

      {/* Cửa sổ chat */}
      {isOpen && (
        <div className={styles.chatWidgetContainer}>
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <span>🤖</span> Trợ lý ảo InternHub
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.actionBtn}
                onClick={handleClearSession}
                title="Xóa đoạn chat"
              >
                Xóa
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => setIsOpen(false)}
                title="Đóng"
              >
                ✕
              </button>
            </div>
          </div>

          <div className={styles.warningBanner}>
            ⚠️ Không nhập mật khẩu, CCCD, số tài khoản hay thông tin nhạy cảm.
          </div>

          <div className={styles.messagesList}>
            {messages.length === 0 && (
              <div style={{ color: '#64748b', textAlign: 'center', margin: 'auto', fontSize: '13px' }}>
                👋 Xin chào! Mình là Trợ lý ảo của InternHub.<br />
                Hãy hỏi mình về nội quy điểm danh, quy chế nghỉ phép hoặc tiền phụ cấp nhé!
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`${styles.messageBubble} ${
                  m.sender === 'user' ? styles.userBubble : styles.assistantBubble
                }`}
              >
                {/* Render an toàn: User text dạng thuần, Assistant dạng Markdown không cho phép HTML raw */}
                {m.sender === 'user' ? (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                ) : (
                  <div className={styles.markdownBody}>
                    <ReactMarkdown
                      components={{
                        a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5', textDecoration: 'underline' }}>
                            {children}
                          </a>
                        ),
                        img: () => null, // Chặn hoàn toàn render thẻ img để chống SSRF / Image tracking
                      }}
                    >
                      {m.text}
                    </ReactMarkdown>
                  </div>
                )}
                {m.sender === 'assistant' && (
                  <div className={styles.disclaimer}>
                    * Thông tin chỉ mang tính tham khảo, vui lòng liên hệ HR/Mentor để xác nhận.
                  </div>
                )}
              </div>
            ))}

            {isLoading && (!messages[messages.length - 1] || messages[messages.length - 1].sender !== 'assistant' || !messages[messages.length - 1].text) && (
              <div className={styles.typingIndicator}>
                <span>🤖 AI đang soạn câu trả lời...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {quickPrompts.length > 0 && (
            <div className={styles.quickPromptsSection}>
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  className={styles.quickPromptBtn}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Chat */}
          <div className={styles.inputSection}>
            <input
              type="text"
              className={styles.chatInput}
              placeholder="Nhập câu hỏi..."
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
            >
              Gửi
            </button>
          </div>

          {/* Modal xác nhận xóa lịch sử chat tùy biến thay thế window.confirm */}
          {showConfirmModal && (
            <div className={styles.confirmModalOverlay} onClick={() => setShowConfirmModal(false)}>
              <div className={styles.confirmModalCard} onClick={(e) => e.stopPropagation()}>
                <div className={styles.confirmIconWrap}>
                  🗑️
                </div>
                <div className={styles.confirmTitle}>Xóa lịch sử đoạn chat?</div>
                <div className={styles.confirmDesc}>
                  Toàn bộ nội dung hội thoại hiện tại sẽ được làm mới và xóa khỏi bộ nhớ phiên.
                </div>
                <div className={styles.confirmActions}>
                  <button
                    type="button"
                    className={styles.cancelConfirmBtn}
                    onClick={() => setShowConfirmModal(false)}
                  >
                    Hủy
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
        </div>
      )}
    </>
  );
};
