import { useState, useRef, useCallback } from 'react';

export interface UseOtpInputReturn {
  digits: string[];
  otpValue: string;
  isComplete: boolean;
  inputRefs: React.RefObject<(HTMLInputElement | null)[]>;
  handleChange: (index: number, value: string) => void;
  handleKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  handlePaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  clearOtp: () => void;
  focusFirst: () => void;
}

export const useOtpInput = (length = 6): UseOtpInputReturn => {
  const [digits, setDigits] = useState<string[]>(() => Array.from({ length }, () => ''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const otpValue = digits.join('');
  const isComplete = otpValue.length === length && /^\d+$/.test(otpValue);

  const focusInput = useCallback((index: number) => {
    if (index >= 0 && index < length && inputRefs.current[index]) {
      inputRefs.current[index]?.focus();
      inputRefs.current[index]?.select();
    }
  }, [length]);

  const focusFirst = useCallback(() => {
    focusInput(0);
  }, [focusInput]);

  const handleChange = useCallback((index: number, value: string) => {
    // Chỉ lấy ký tự số cuối cùng nếu người dùng nhập đè
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      setDigits((prev) => {
        const next = [...prev];
        next[index] = '';
        return next;
      });
      return;
    }

    const lastDigit = cleaned.slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = lastDigit;
      return next;
    });

    // Tự động focus sang ô kế tiếp nếu có
    if (index < length - 1) {
      focusInput(index + 1);
    }
  }, [length, focusInput]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Nếu ô hiện tại rỗng, lùi về ô trước và xóa
        setDigits((prev) => {
          const next = [...prev];
          next[index - 1] = '';
          return next;
        });
        focusInput(index - 1);
      } else {
        // Xóa ô hiện tại
        setDigits((prev) => {
          const next = [...prev];
          next[index] = '';
          return next;
        });
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      focusInput(index + 1);
    }
  }, [digits, length, focusInput]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const cleanedDigits = pastedData.replace(/\D/g, '').slice(0, length).split('');

    if (cleanedDigits.length === 0) return;

    setDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < length; i++) {
        next[i] = cleanedDigits[i] || '';
      }
      return next;
    });

    // Focus vào ô tiếp theo cần nhập hoặc ô cuối cùng
    const nextIndex = Math.min(cleanedDigits.length, length - 1);
    focusInput(nextIndex);
  }, [length, focusInput]);

  const clearOtp = useCallback(() => {
    setDigits(Array.from({ length }, () => ''));
    focusInput(0);
  }, [length, focusInput]);

  return {
    digits,
    otpValue,
    isComplete,
    inputRefs,
    handleChange,
    handleKeyDown,
    handlePaste,
    clearOtp,
    focusFirst,
  };
};

export default useOtpInput;
