import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseOtpCountdownOptions {
  initialExpiryMinutes?: number; // Mặc định 15 phút
  initialCooldownSeconds?: number; // Mặc định 60 giây khi vừa gửi
  autoStartCooldown?: boolean;
}

export interface UseOtpCountdownReturn {
  expirySeconds: number;
  formattedExpiry: string;
  isExpired: boolean;
  cooldownSeconds: number;
  isCooldownActive: boolean;
  startCooldown: (seconds?: number) => void;
  resetExpiry: (minutes?: number) => void;
}

export const useOtpCountdown = ({
  initialExpiryMinutes = 15,
  initialCooldownSeconds = 60,
  autoStartCooldown = true,
}: UseOtpCountdownOptions = {}): UseOtpCountdownReturn => {
  const [expirySeconds, setExpirySeconds] = useState<number>(initialExpiryMinutes * 60);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(
    autoStartCooldown ? initialCooldownSeconds : 0
  );

  const expiryTimerRef = useRef<number | null>(null);
  const cooldownTimerRef = useRef<number | null>(null);

  // Countdown timer cho thời hạn OTP
  useEffect(() => {
    expiryTimerRef.current = window.setInterval(() => {
      setExpirySeconds((prev) => {
        if (prev <= 1) {
          if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);
    };
  }, []);

  // Countdown timer cho Cooldown gửi lại mã
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    cooldownTimerRef.current = window.setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, [cooldownSeconds]);

  const startCooldown = useCallback((seconds = 60) => {
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    setCooldownSeconds(seconds);
  }, []);

  const resetExpiry = useCallback((minutes = 15) => {
    setExpirySeconds(minutes * 60);
  }, []);

  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return {
    expirySeconds,
    formattedExpiry: formatTime(expirySeconds),
    isExpired: expirySeconds <= 0,
    cooldownSeconds,
    isCooldownActive: cooldownSeconds > 0,
    startCooldown,
    resetExpiry,
  };
};

export default useOtpCountdown;
