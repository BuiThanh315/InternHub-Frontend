import React from 'react';

export interface OtpInputProps {
  digits: string[];
  inputRefs: React.RefObject<(HTMLInputElement | null)[]>;
  onChange: (index: number, value: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent<any>) => void;
  disabled?: boolean;
  isError?: boolean;
  isShaking?: boolean;
  className?: string;
}
