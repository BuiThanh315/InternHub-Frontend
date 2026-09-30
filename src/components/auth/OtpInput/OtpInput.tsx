import React from 'react';

import type { OtpInputProps } from './OtpInput.types';
import styles from './OtpInput.module.css';

export const OtpInput: React.FC<OtpInputProps> = ({
  digits,
  inputRefs,
  onChange,
  onKeyDown,
  onPaste,
  disabled = false,
  isError = false,
  isShaking = false,
  className = '',
}) => {
  return (
    <fieldset
      className={`${styles.container} ${isShaking ? styles.shake : ''} ${className}`}
      onPaste={onPaste}
    >
      <legend className="sr-only">Cụm 6 ô nhập mã OTP kích hoạt tài khoản</legend>
      {digits.map((digit, idx) => {
        const isFilled = Boolean(digit);
        const cellClass = [
          styles.cell,
          isFilled ? styles.cellFilled : '',
          isError ? styles.cellError : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <input
            key={`otp-slot-${idx}`}
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={idx === 0 ? 'one-time-code' : 'off'}
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            disabled={disabled}
            aria-label={`Chữ số thứ ${idx + 1}`}
            className={cellClass}
            onChange={(e) => onChange(idx, e.target.value)}
            onKeyDown={(e) => onKeyDown(idx, e)}
          />
        );
      })}
    </fieldset>
  );
};

export default OtpInput;
