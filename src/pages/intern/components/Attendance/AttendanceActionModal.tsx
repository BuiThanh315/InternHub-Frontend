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
  Timer,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  attendanceService,
  calculateHaversineDistance,
} from '../../../../services/attendanceService';
import { useGeolocation } from '../../../../hooks/useGeolocation';
import type { AttendanceActionModalProps } from './AttendanceActionModal.types';
import styles from './AttendanceActionModal.module.css';

// Toạ độ mặc định trụ sở chính InternHub (đồng bộ với OfficeLocationDataInitializer tại backend)
const DEFAULT_OFFICE_LAT = 21.035665;
const DEFAULT_OFFICE_LON = 105.768296;

interface QrSessionState {
  qrToken: string;
  qrCodeDataUrl: string;
  confirmationUrl?: string;
  serverDistance?: number;
  officeName?: string;
  remainingSeconds: number;
  isExpired: boolean;
  isInitiating: boolean;
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

  // Tuân thủ Nguyên tắc 14: Tối đa 3-4 useState
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [qrSession, setQrSession] = useState<QrSessionState | null>(null);

  const countdownTimerRef = useRef<any>(null);
  const pollTimerRef = useRef<any>(null);

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

  // Xoá các bộ đếm thời gian
  const clearTimers = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  // Khởi tạo phiên QR Code check-in (Bước 1 - TM-25)
  const handleInitiateQr = useCallback(async () => {
    if (!coords) return;
    clearTimers();
    setApiError(null);
    setQrSession((prev) => ({
      qrToken: prev?.qrToken ?? '',
      qrCodeDataUrl: prev?.qrCodeDataUrl ?? '',
      confirmationUrl: prev?.confirmationUrl,
      serverDistance: prev?.serverDistance,
      officeName: prev?.officeName,
      remainingSeconds: 60,
      isExpired: false,
      isInitiating: true,
    }));

    try {
      const res = await attendanceService.initiateCheckIn({
        latitude: coords.latitude,
        longitude: coords.longitude,
        clientBaseUrl: window.location.origin,
      });

      const expiresIn = res.expiresInSeconds || 60;
      setQrSession({
        qrToken: res.qrToken,
        qrCodeDataUrl: res.qrCodeDataUrl,
        confirmationUrl: res.confirmationUrl,
        serverDistance: res.distance,
        officeName: res.officeName,
        remainingSeconds: expiresIn,
        isExpired: false,
        isInitiating: false,
      });

      // Bắt đầu đếm ngược 60s
      countdownTimerRef.current = setInterval(() => {
        setQrSession((prev) => {
          if (!prev) return null;
          if (prev.remainingSeconds <= 1) {
            if (countdownTimerRef.current) {
              clearInterval(countdownTimerRef.current);
              countdownTimerRef.current = null;
            }
            return {
              ...prev,
              remainingSeconds: 0,
              isExpired: true,
            };
          }
          return {
            ...prev,
            remainingSeconds: prev.remainingSeconds - 1,
          };
        });
      }, 1000);

      // Bắt đầu Polling tự động phát hiện khi TTS quét xác nhận bằng điện thoại
      pollTimerRef.current = setInterval(async () => {
        try {
          const today = await attendanceService.getTodayAttendance();
          if (today?.hasCheckedIn) {
            clearTimers();
            toast.success('Hệ thống đã nhận diện điểm danh qua thiết bị di động thành công!');
            onSuccess();
            onClose();
          }
        } catch {
          // Bỏ qua lỗi tạm thời khi polling
        }
      }, 3000);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Không thể khởi tạo mã QR xác thực.';
      setApiError(errorMsg);
      setQrSession(null);
    }
  }, [coords, clearTimers, onSuccess, onClose]);

  // Reset form khi modal mở / đóng
  useEffect(() => {
    if (isOpen) {
      setNotes('');
      setApiError(null);
      setQrSession(null);
      refreshLocation();
    } else {
      clearTimers();
    }
    return () => clearTimers();
  }, [isOpen, refreshLocation, clearTimers]);

  // Tự động khởi tạo mã QR khi có toạ độ hợp lệ (chỉ cho CHECK_IN)
  useEffect(() => {
    if (
      isOpen &&
      actionType === 'CHECK_IN' &&
      coords &&
      isWithinRadius &&
      !qrSession &&
      !apiError
    ) {
      handleInitiateQr();
    }
  }, [isOpen, actionType, coords, isWithinRadius, qrSession, apiError, handleInitiateQr]);

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
    // Giờ kết thúc ca chuẩn: 17:30
    return hours < 17 || (hours === 17 && minutes < 30);
  }, [actionType]);

  // Sao chép đường dẫn quét QR vào Clipboard
  const handleCopyConfirmationUrl = () => {
    if (qrSession?.confirmationUrl) {
      navigator.clipboard.writeText(qrSession.confirmationUrl);
      toast.success('Đã sao chép liên kết xác nhận vào bộ nhớ tạm.');
    }
  };

  // Mở tab xác nhận trên trình duyệt
  const handleOpenConfirmationUrl = () => {
    if (qrSession?.confirmationUrl) {
      window.open(qrSession.confirmationUrl, '_blank');
    }
  };

  // Lắng nghe tín hiệu hoàn tất Check-in từ cửa sổ xác nhận mới (postMessage)
  useEffect(() => {
    if (!isOpen || actionType !== 'CHECK_IN') return;

    const handleWindowMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ATTENDANCE_CHECKED_IN') {
        clearTimers();
        toast.success('Hệ thống đã ghi nhận check-in thành công!');
        onSuccess();
        onClose();
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [isOpen, actionType, clearTimers, onSuccess, onClose]);

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

          {/* Thông báo khoảng cách hợp lệ / cảnh báo ngoài phạm vi */}
          {coords && effectiveDistance !== null && (
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
          {isCheckIn && isWithinRadius && (
            <div className={styles.qrSection}>
              <div className={styles.qrBadgeHeader}>
                <QrCode size={13} />
                <span>XÁC THỰC BẢO MẬT 2 BƯỚC (QR 60S)</span>
              </div>

              {qrSession?.isInitiating ? (
                <div style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <Loader2 size={30} className={styles.spinning} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Đang khởi tạo phiên mã QR xác thực...
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
                    {qrSession.isExpired && (
                      <div className={styles.qrExpiredOverlay}>
                        <AlertTriangle size={24} style={{ color: 'var(--warning)' }} />
                        <span className={styles.qrExpiredText}>Mã QR đã hết hạn</span>
                        <button
                          type="button"
                          onClick={handleInitiateQr}
                          className={styles.refreshButton}
                          style={{ marginTop: '0.25rem', background: 'var(--bg-card)' }}
                        >
                          <RefreshCw size={13} />
                          <span>Tạo mã mới</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Thanh đếm ngược thời gian */}
                  <div className={styles.qrTimerWrapper}>
                    <div className={styles.qrTimerHeader}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Timer size={13} />
                        <span>Hiệu lực phiên:</span>
                      </span>
                      <span
                        className={styles.qrTimerSeconds}
                        style={{
                          color:
                            qrSession.remainingSeconds <= 15
                              ? 'var(--danger)'
                              : 'var(--text-main)',
                        }}
                      >
                        {qrSession.remainingSeconds}s
                      </span>
                    </div>

                    <div className={styles.qrTimerTrack}>
                      <div
                        className={styles.qrTimerProgress}
                        style={{
                          width: `${(qrSession.remainingSeconds / 60) * 100}%`,
                          backgroundColor:
                            qrSession.remainingSeconds <= 15
                              ? 'var(--danger)'
                              : qrSession.remainingSeconds <= 30
                              ? 'var(--warning)'
                              : 'var(--primary)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Hướng dẫn & Tiện ích quét mã QR */}
                  <p className={styles.qrInstruction}>
                    Dùng camera điện thoại quét mã QR hoặc bấm &quot;Mở link xác nhận&quot; bên dưới để mở cửa sổ xác nhận Check-in.
                  </p>

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

                    <button
                      type="button"
                      onClick={handleOpenConfirmationUrl}
                      className={styles.qrSecondaryBtn}
                      title="Mở trang xác nhận di động trên tab mới"
                    >
                      <ExternalLink size={13} />
                      <span>Mở link xác nhận</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleInitiateQr}
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
                    onClick={handleInitiateQr}
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
                  onClick={handleInitiateQr}
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
