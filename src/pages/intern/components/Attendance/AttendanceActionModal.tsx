import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  X,
  LogIn,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Loader2,
  QrCode,
  Copy,
  ExternalLink,
  Smartphone,
  Scan,
  ShieldCheck,
  PauseCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  attendanceService,
  calculateHaversineDistance,
} from '../../../../services/attendanceService';
import { ATTENDANCE_ENDPOINTS } from '../../../../constants/endpoints/attendance.endpoints';
import { useGeolocation } from '../../../../hooks/useGeolocation';
import type { AttendanceActionModalProps } from './AttendanceActionModal.types';
import styles from './AttendanceActionModal.module.css';

// Toạ độ mặc định trụ sở chính InternHub (đồng bộ với OfficeLocationDataInitializer tại backend)
const DEFAULT_OFFICE_LAT = 21.035665;
const DEFAULT_OFFICE_LON = 105.768296;

const QR_TTL_SECONDS = 60;
const AUTO_PAUSE_SECONDS = 180; // 3 phút = 180s tự động tạm dừng để chống hao tổn tài nguyên

interface QrSessionState {
  qrToken: string;
  qrCodeDataUrl: string;
  confirmationUrl?: string;
  serverDistance?: number;
  officeName?: string;
  remainingSeconds: number;
  isExpired: boolean;
  isInitiating: boolean;
  isPaused: boolean;
  isSuccess: boolean;
  successData?: any;
}

export const AttendanceActionModal: React.FC<AttendanceActionModalProps> = ({
  actionType,
  isOpen,
  onClose,
  onSuccess,
  officeName: initialOfficeName = 'Trụ sở chính InternHub',
  allowedRadiusMeters = 25.0,
  officeLatitude,
  officeLongitude,
}) => {
  const { coords, loading: geoLoading, error: geoError, permissionDenied, refreshLocation } =
    useGeolocation({ immediate: isOpen });

  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [qrSession, setQrSession] = useState<QrSessionState | null>(null);

  const countdownTimerRef = useRef<any>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const sessionElapsedTimeRef = useRef<number>(0);
  const prefetchingRef = useRef<boolean>(false);

  // Toạ độ văn phòng mục tiêu (ưu tiên toạ độ động từ backend nếu có)
  const targetLat = officeLatitude ?? DEFAULT_OFFICE_LAT;
  const targetLon = officeLongitude ?? DEFAULT_OFFICE_LON;

  // Tính khoảng cách ước tính tới văn phòng tại máy khách
  const clientDistance = useMemo(() => {
    if (!coords) return null;
    return calculateHaversineDistance(
      coords.latitude,
      coords.longitude,
      targetLat,
      targetLon
    );
  }, [coords, targetLat, targetLon]);

  const isWithinRadius = clientDistance !== null && clientDistance <= allowedRadiusMeters;

  const previousTokenRef = useRef<string | null>(null);
  const fallbackPollTimerRef = useRef<any>(null);

  // Đóng kết nối SSE
  const closeSse = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  // Xoá các bộ đếm thời gian & SSE
  const clearTimers = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (fallbackPollTimerRef.current) {
      clearInterval(fallbackPollTimerRef.current);
      fallbackPollTimerRef.current = null;
    }
    closeSse();
  }, [closeSse]);

  // Xử lý khi Check-in thành công qua SSE hoặc Polling
  const handleCheckInSuccess = useCallback((attendanceData?: any) => {
    clearTimers();
    setQrSession((prev) => (prev ? { ...prev, isSuccess: true, successData: attendanceData } : null));
    toast.success('Điểm danh thành công! Hệ thống đã tự động đồng bộ thời gian thực.');

    // Chờ 2.5s hoạt họa ăn mừng rồi tự đóng modal và trigger onSuccess
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 2500);
  }, [clearTimers, onSuccess, onClose]);

  // Bắt đầu Fallback Polling (mỗi 2.5s kiểm tra xem hôm nay đã check-in thành công chưa)
  const startFallbackPolling = useCallback(() => {
    if (fallbackPollTimerRef.current) return;
    fallbackPollTimerRef.current = setInterval(async () => {
      try {
        const todayStatus = await attendanceService.getTodayAttendance();
        if (todayStatus && todayStatus.hasCheckedIn) {
          // Điện thoại đã quét thành công, cập nhật ngay lập tức!
          handleCheckInSuccess(todayStatus);
        }
      } catch {
        // Silent catch polling error
      }
    }, 2500);
  }, [handleCheckInSuccess]);

  // Mở luồng SSE nghe tín hiệu xác nhận từ điện thoại (hỗ trợ native auto-reconnect)
  const connectSse = useCallback((qrToken: string) => {
    closeSse();
    if (!qrToken) return;

    try {
      const sseUrl = `${ATTENDANCE_ENDPOINTS.CHECK_IN_STREAM}?qrToken=${encodeURIComponent(qrToken)}`;
      const es = new EventSource(sseUrl, { withCredentials: true });

      es.addEventListener('CHECK_IN_SUCCESS', (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data);
          handleCheckInSuccess(parsed);
        } catch {
          handleCheckInSuccess();
        }
      });

      es.onerror = () => {
        // Không gọi es.close() để trình duyệt tự động reconnect nếu tạm mất mạng.
        // Đồng thời kích hoạt fallback polling kiểm tra 2.5s/lần
        startFallbackPolling();
      };

      eventSourceRef.current = es;
    } catch (err) {
      console.warn('Không thể khởi tạo EventSource SSE, chuyển sang Polling:', err);
      startFallbackPolling();
    }
  }, [closeSse, handleCheckInSuccess, startFallbackPolling]);

  // Khởi tạo phiên QR Code check-in (TM-25 v2.0 - Khởi tạo tự do trên Laptop)
  const handleInitiateQr = useCallback(async (isPrefetch = false) => {
    if (!isPrefetch) {
      clearTimers();
      setApiError(null);
      setQrSession((prev) => ({
        qrToken: prev?.qrToken ?? '',
        qrCodeDataUrl: prev?.qrCodeDataUrl ?? '',
        confirmationUrl: prev?.confirmationUrl,
        serverDistance: prev?.serverDistance,
        officeName: prev?.officeName,
        remainingSeconds: QR_TTL_SECONDS,
        isExpired: false,
        isInitiating: true,
        isPaused: false,
        isSuccess: false,
      }));
    }

    try {
      const res = await attendanceService.initiateCheckIn({
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        clientBaseUrl: window.location.origin,
      });

      const expiresIn = res.expiresInSeconds || QR_TTL_SECONDS;
      prefetchingRef.current = false;

      setQrSession({
        qrToken: res.qrToken,
        qrCodeDataUrl: res.qrCodeDataUrl,
        confirmationUrl: res.confirmationUrl,
        serverDistance: res.distance,
        officeName: res.officeName,
        remainingSeconds: expiresIn,
        isExpired: false,
        isInitiating: false,
        isPaused: false,
        isSuccess: false,
      });

      // Mở kết nối SSE theo qrToken mới
      connectSse(res.qrToken);

      // Bắt đầu đếm ngược 60s
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }

      countdownTimerRef.current = setInterval(() => {
        sessionElapsedTimeRef.current += 1;

        // Kiểm tra Auto-pause 3 phút (180 giây)
        if (sessionElapsedTimeRef.current >= AUTO_PAUSE_SECONDS) {
          clearTimers();
          setQrSession((prev) => (prev ? { ...prev, isPaused: true, isExpired: true } : null));
          return;
        }

        setQrSession((prev) => {
          if (!prev || prev.isSuccess || prev.isPaused) return prev;

          const nextSec = prev.remainingSeconds - 1;

          // Silent prefetch khi còn <= 5s
          if (nextSec === 5 && !prefetchingRef.current) {
            prefetchingRef.current = true;
            attendanceService.initiateCheckIn({
              latitude: coords?.latitude,
              longitude: coords?.longitude,
              clientBaseUrl: window.location.origin,
            }).then((nextRes) => {
              // Khi đúng 0s, swap mượt sang mã mới
              setTimeout(() => {
                prefetchingRef.current = false;
                previousTokenRef.current = prev.qrToken;
                setQrSession({
                  qrToken: nextRes.qrToken,
                  qrCodeDataUrl: nextRes.qrCodeDataUrl,
                  confirmationUrl: nextRes.confirmationUrl,
                  serverDistance: nextRes.distance,
                  officeName: nextRes.officeName,
                  remainingSeconds: nextRes.expiresInSeconds || QR_TTL_SECONDS,
                  isExpired: false,
                  isInitiating: false,
                  isPaused: false,
                  isSuccess: false,
                });
                connectSse(nextRes.qrToken);
              }, 5000);
            }).catch(() => {
              prefetchingRef.current = false;
            });
          }

          if (nextSec <= 0) {
            return {
              ...prev,
              remainingSeconds: 0,
              isExpired: true,
            };
          }

          return {
            ...prev,
            remainingSeconds: nextSec,
          };
        });
      }, 1000);
    } catch (err: any) {
      prefetchingRef.current = false;
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Không thể khởi tạo mã QR xác thực.';
      setApiError(errorMsg);
      setQrSession(null);
    }
  }, [coords, clearTimers, connectSse]);

  // Reset form khi modal mở / đóng
  useEffect(() => {
    if (isOpen) {
      setNotes('');
      setApiError(null);
      setQrSession(null);
      sessionElapsedTimeRef.current = 0;
      prefetchingRef.current = false;
      refreshLocation();
    } else {
      clearTimers();
    }
    return () => clearTimers();
  }, [isOpen, refreshLocation, clearTimers]);

  // Tự động khởi tạo mã QR ngay khi mở Modal Check-in mà không bị chặn bởi GPS Laptop
  useEffect(() => {
    if (
      isOpen &&
      actionType === 'CHECK_IN' &&
      !qrSession &&
      !apiError
    ) {
      handleInitiateQr();
    }
  }, [isOpen, actionType, qrSession, apiError, handleInitiateQr]);

  // Đóng modal bằng phím Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Kiểm tra cảnh báo về sớm khi check-out
  const isEarlyLeaveNotice = useMemo(() => {
    if (actionType !== 'CHECK_OUT') return false;
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return hours < 17 || (hours === 17 && minutes < 30);
  }, [actionType]);

  // Sao chép đường dẫn quét QR vào Clipboard
  const handleCopyConfirmationUrl = () => {
    if (qrSession?.confirmationUrl) {
      navigator.clipboard.writeText(qrSession.confirmationUrl);
      toast.success('Đã sao chép liên kết xác nhận vào bộ nhớ tạm.');
    }
  };

  // Mở tab xác nhận trên trình duyệt (chỉ dùng cho môi trường test/dev)
  const handleOpenConfirmationUrl = () => {
    if (qrSession?.confirmationUrl) {
      window.open(qrSession.confirmationUrl, '_blank');
    }
  };

  // Lắng nghe tín hiệu hoàn tất Check-in qua postMessage (fallback)
  useEffect(() => {
    if (!isOpen || actionType !== 'CHECK_IN') return;

    const handleWindowMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ATTENDANCE_CHECKED_IN') {
        handleCheckInSuccess(event.data);
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [isOpen, actionType, handleCheckInSuccess]);

  // Gửi xác nhận điểm danh Check-out
  const handleSubmit = useCallback(async () => {
    if (!coords) {
      toast.warning('Chưa thể lấy toạ độ GPS. Vui lòng bấm quét lại vị trí.');
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      if (actionType === 'CHECK_OUT') {
        const res = await attendanceService.checkOut({
          latitude: coords.latitude,
          longitude: coords.longitude,
          notes: notes.trim() || undefined,
        });
        toast.success(
          `Check-out thành công! Tổng giờ làm việc: ${
            res.totalWorkingHours ?? 0
          } giờ.`
        );
      }

      clearTimers();
      onSuccess();
      onClose();
    } catch (err: any) {
      // Giữ nguyên modal và hiển thị lỗi để sửa (Nguyên tắc 24)
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Gửi dữ liệu điểm danh thất bại. Vui lòng thử lại.';
      setApiError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  }, [coords, actionType, notes, clearTimers, onSuccess, onClose]);

  if (!isOpen) return null;

  const isCheckIn = actionType === 'CHECK_IN';
  const effectiveDistance = qrSession?.serverDistance ?? clientDistance;
  const currentOfficeName = qrSession?.officeName ?? initialOfficeName;

  return (
    <div className={styles.modalOverlay} onClick={!isSubmitting ? onClose : undefined}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* KHỐI 1: HEADER CỐ ĐỊNH */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleGroup}>
            <div className={styles.headerIconBadge}>
              {isCheckIn ? <LogIn size={20} /> : <LogOut size={20} />}
            </div>
            <div>
              <h2 className={styles.headerTitle}>
                {isCheckIn ? 'Xác Nhận Điểm Danh Vào Ca' : 'Xác Nhận Điểm Danh Tan Ca'}
              </h2>
              <p className={styles.headerSubtitle}>
                {isCheckIn
                  ? 'Xác thực GPS và phiên mã QR 60 giây bảo mật'
                  : 'Xác thực toạ độ địa lý GPS thực tế quanh văn phòng'}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className={styles.closeButton}
            title="Đóng modal (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* KHỐI 2: BODY CUỘN ĐỘC LẬP */}
        <div className={styles.modalBody}>
          {/* Banner thông báo đang quét GPS khi chưa có toạ độ */}
          {geoLoading && !coords && (
            <div className={`${styles.alertBox} ${styles.alertInfo}`}>
              <Loader2 size={18} className={styles.spinning} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>Đang liên lạc với cảm biến định vị GPS...</div>
            </div>
          )}

          {/* Lỗi Geolocation */}
          {geoError && (
            <div className={`${styles.alertBox} ${styles.alertDanger}`}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <strong>Lỗi định vị:</strong> {geoError}
                {permissionDenied && (
                  <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.78rem' }}>
                    💡 Hướng dẫn: Bấm vào biểu tượng cài đặt cạnh URL trình duyệt, chọn Vị trí (Location) thành "Cho phép" (Allow), sau đó bấm "Quét lại GPS" bên dưới.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Cảnh báo lỗi từ Backend API */}
          {apiError && (
            <div className={`${styles.alertBox} ${styles.alertDanger}`}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <strong>Lỗi xử lý:</strong> {apiError}
              </div>
            </div>
          )}

          {/* Thông báo khoảng cách hợp lệ / cảnh báo ngoài phạm vi (chỉ hiển thị cho CHECK_OUT trên Laptop) */}
          {!isCheckIn && coords && effectiveDistance !== null && (
            <>
              {isWithinRadius ? (
                <div className={`${styles.alertBox} ${styles.alertValid}`}>
                  <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <strong>Toạ độ hợp lệ!</strong> Bạn đang cách {currentOfficeName}{' '}
                    <strong>{effectiveDistance}m</strong> (nằm trong bán kính cho phép {allowedRadiusMeters}m).
                  </div>
                </div>
              ) : (
                <div className={`${styles.alertBox} ${styles.alertWarning}`}>
                  <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <strong>Ngoài phạm vi cho phép:</strong> Bạn đang cách {currentOfficeName}{' '}
                    <strong>{effectiveDistance}m</strong> (vượt quá bán kính {allowedRadiusMeters}m). Vui lòng di chuyển vào trong toà nhà để điểm danh.
                  </div>
                </div>
              )}
            </>
          )}

          {/* KHỐI XÁC THỰC 2 BƯỚC CHECK-IN: QR CODE & COUNTDOWN */}
          {isCheckIn && (
            <div className={styles.qrSection}>
              <div className={styles.qrBadgeHeader}>
                <QrCode size={13} />
                <span>XÁC THỰC BẢO MẬT ĐA TẦNG (PERSONAL QR)</span>
              </div>

              {/* Thông báo Tự động tạm dừng sau 3 phút */}
              {qrSession?.isPaused && (
                <div className={styles.qrAutoPauseBanner}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                    <PauseCircle size={18} />
                    <span>Đã tạm dừng phát sinh mã QR sau 3 phút để bảo vệ tài nguyên.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInitiateQr(false)}
                    className={styles.refreshButton}
                    style={{ background: 'var(--bg-card)' }}
                  >
                    <RefreshCw size={12} />
                    <span>Tiếp tục</span>
                  </button>
                </div>
              )}

              {qrSession?.isInitiating ? (
                <div style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <Loader2 size={30} className={styles.spinning} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Đang khởi tạo phiên mã QR bảo mật...
                  </span>
                </div>
              ) : qrSession?.qrCodeDataUrl ? (
                <>
                  <div className={styles.qrCard}>
                    <img
                      src={qrSession.qrCodeDataUrl}
                      alt="Mã QR Xác Thực Điểm Danh"
                      className={styles.qrImage}
                    />

                    {/* Laser scan hiệu ứng */}
                    {!qrSession.isExpired && !qrSession.isPaused && !qrSession.isSuccess && (
                      <div className={styles.laserBeam} />
                    )}

                    {/* Overlay hết hạn */}
                    {qrSession.isExpired && !qrSession.isPaused && !qrSession.isSuccess && (
                      <div className={styles.qrExpiredOverlay}>
                        <AlertTriangle size={24} style={{ color: 'var(--warning)' }} />
                        <span className={styles.qrExpiredText}>Mã QR đã hết hạn</span>
                        <button
                          type="button"
                          onClick={() => handleInitiateQr(false)}
                          className={styles.refreshButton}
                          style={{ marginTop: '0.25rem', background: 'var(--bg-card)' }}
                        >
                          <RefreshCw size={13} />
                          <span>Tạo mã mới</span>
                        </button>
                      </div>
                    )}

                    {/* Overlay ăn mừng khi SSE nhận CHECK_IN_SUCCESS */}
                    {qrSession.isSuccess && (
                      <div className={styles.qrSuccessOverlay}>
                        <div className={styles.qrSuccessIcon}>
                          <CheckCircle2 size={28} />
                        </div>
                        <h4 className={styles.qrSuccessTitle}>Check-in Thành Công!</h4>
                        <p className={styles.qrSuccessSubtitle}>
                          Đã đồng bộ thiết bị tức thì. Đang quay lại trang tổng quan...
                        </p>
                      </div>
                    )}
                  </div>

                  {/* SVG RADIAL PROGRESS COUNTDOWN (60s -> 0s) */}
                  {!qrSession.isPaused && !qrSession.isSuccess && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
                      <div className={styles.qrRadialWrapper}>
                        {(() => {
                          const size = 64;
                          const strokeWidth = 5;
                          const radius = (size - strokeWidth) / 2;
                          const circumference = 2 * Math.PI * radius;
                          const progress = Math.max(0, Math.min(1, qrSession.remainingSeconds / QR_TTL_SECONDS));
                          const offset = circumference * (1 - progress);
                          const strokeColor =
                            qrSession.remainingSeconds <= 15
                              ? 'var(--danger)'
                              : qrSession.remainingSeconds <= 30
                              ? 'var(--warning)'
                              : 'var(--primary)';

                          return (
                            <>
                              <svg width={size} height={size} className={styles.qrRadialSvg}>
                                <circle
                                  cx={size / 2}
                                  cy={size / 2}
                                  r={radius}
                                  strokeWidth={strokeWidth}
                                  fill="transparent"
                                  className={styles.qrRadialBackground}
                                />
                                <circle
                                  cx={size / 2}
                                  cy={size / 2}
                                  r={radius}
                                  strokeWidth={strokeWidth}
                                  fill="transparent"
                                  stroke={strokeColor}
                                  strokeDasharray={circumference}
                                  strokeDashoffset={offset}
                                  className={styles.qrRadialIndicator}
                                />
                              </svg>
                              <div className={styles.qrRadialContent}>
                                <span className={styles.qrRadialSeconds} style={{ color: strokeColor }}>
                                  {qrSession.remainingSeconds}
                                </span>
                                <span className={styles.qrRadialUnit}>Giây</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      <div style={{ textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
                          <span>Mã làm mới tự động</span>
                        </div>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                          Hệ thống tự động prefetch mã tiếp theo khi còn 5 giây.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Micro-guide hướng dẫn quét */}
                  <div className={styles.qrMicroGuide}>
                    <div className={styles.qrMicroGuideItem}>
                      <Scan size={13} style={{ color: 'var(--primary)' }} />
                      <span>Camera điện thoại</span>
                    </div>
                    <div className={styles.qrMicroGuideItem}>
                      <Smartphone size={13} style={{ color: 'var(--info)' }} />
                      <span>Zalo / App quét QR</span>
                    </div>
                  </div>

                  <div className={styles.qrActionRow}>
                    <button
                      type="button"
                      onClick={handleCopyConfirmationUrl}
                      className={styles.qrSecondaryBtn}
                      title="Sao chép đường dẫn quét QR"
                    >
                      <Copy size={13} />
                      <span>Sao chép link QR</span>
                    </button>

                    {/* Chỉ hiển thị Mở link xác nhận khi ở môi trường DEV */}
                    {import.meta.env.DEV && (
                      <button
                        type="button"
                        onClick={handleOpenConfirmationUrl}
                        className={styles.qrSecondaryBtn}
                        title="Mở trang xác nhận di động trên tab mới (Dành cho Dev)"
                      >
                        <ExternalLink size={13} />
                        <span>Mở link test (Dev)</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleInitiateQr(false)}
                      disabled={isSubmitting || qrSession.isInitiating}
                      className={styles.refreshLinkBtn}
                    >
                      Làm mới mã QR
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Chưa tạo được phiên mã QR xác thực.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleInitiateQr(false)}
                    className={styles.refreshButton}
                  >
                    <RefreshCw size={13} />
                    <span>Tạo mã QR xác thực</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Dành riêng cho Check-out: Cảnh báo về sớm */}
          {!isCheckIn && isEarlyLeaveNotice && (
            <div className={`${styles.alertBox} ${styles.alertWarning}`}>
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <strong>Lưu ý về sớm:</strong> Hiện tại chưa đến 17:30 (giờ kết thúc ca chuẩn). Hệ thống sẽ ghi nhận trạng thái là &quot;Về sớm&quot; đối với lần điểm danh này.
              </div>
            </div>
          )}

          {/* Ô nhập ghi chú điểm danh (Chỉ hiển thị cho Check-Out, Check-In thực hiện tại cửa sổ xác nhận) */}
          {!isCheckIn && (
            <div className={styles.formGroup}>
              <label htmlFor="attendance-notes" className={styles.formLabel}>
                Ghi chú công việc (Tùy chọn):
              </label>
              <textarea
                id="attendance-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Hoàn thành task trong ngày, bàn giao công việc..."
                maxLength={255}
                disabled={isSubmitting}
                className={styles.formTextarea}
              />
              <span className={styles.charCount}>
                {notes.length}/255 ký tự
              </span>
            </div>
          )}
        </div>

        {/* KHỐI 3: STICKY FOOTER GHIM ĐÁY */}
        <div className={styles.modalFooter}>
          <div className={styles.footerLeft}>
            <button
              type="button"
              onClick={refreshLocation}
              disabled={geoLoading || isSubmitting}
              className={styles.refreshButton}
              title="Quét lại tín hiệu GPS"
            >
              <RefreshCw
                size={14}
                className={geoLoading ? styles.spinning : undefined}
              />
              <span>{geoLoading ? 'Đang quét...' : 'Quét lại GPS'}</span>
            </button>
          </div>

          <div className={styles.footerRight}>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className={styles.cancelButton}
            >
              {isCheckIn ? 'Đóng' : 'Hủy'}
            </button>

            {isCheckIn ? (
              qrSession?.isExpired && (
                <button
                  type="button"
                  disabled={isSubmitting || qrSession.isInitiating}
                  onClick={() => handleInitiateQr(false)}
                  className={styles.submitButton}
                  style={{ background: 'var(--warning)' }}
                >
                  <RefreshCw size={16} />
                  <span>Mã Đã Hết Hạn - Tạo Mã Mới</span>
                </button>
              )
            ) : (
              <button
                type="button"
                disabled={!coords || geoLoading || isSubmitting || !isWithinRadius}
                onClick={handleSubmit}
                className={styles.submitButton}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className={styles.spinning} />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <LogOut size={16} />
                    <span>Xác Nhận Check-out</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
