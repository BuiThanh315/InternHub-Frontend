import { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (notification?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              type?: 'standard' | 'icon';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: string | number;
              locale?: string;
            }
          ) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

export interface UseGoogleAuthOptions {
  onSuccess: (idToken: string) => void | Promise<void>;
  onError?: (error: string) => void;
}

const GOOGLE_GSI_URL = 'https://accounts.google.com/gsi/client';

export const useGoogleAuth = ({ onSuccess, onError }: UseGoogleAuthOptions) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // Tuân thủ Rule #12: Nạp qua import.meta.env với fallback an toàn
  const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || 'mock-google-client-id';

  // Callback tiếp nhận Google Credential
  const handleCredentialResponse = useCallback(async (response: { credential: string }) => {
    if (!response?.credential) {
      const errText = 'Không nhận được mã xác thực từ tài khoản Google.';
      setError(errText);
      onErrorRef.current?.(errText);
      return;
    }

    try {
      setIsAuthenticating(true);
      setError(null);
      // DevTools Privacy: Không log credential ra console
      await onSuccessRef.current(response.credential);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Đăng nhập Google thất bại.';
      setError(message);
      onErrorRef.current?.(message);
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  // Tải script GIS
  useEffect(() => {
    if (window.google?.accounts?.id) {
      setIsScriptLoaded(true);
      return;
    }

    const existingScript = document.querySelector(`script[src="${GOOGLE_GSI_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsScriptLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_GSI_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => {
      const errText = 'Không thể kết nối đến dịch vụ Google Identity. Vui lòng kiểm tra kết nối mạng.';
      setError(errText);
      onErrorRef.current?.(errText);
    };
    document.head.appendChild(script);
  }, []);

  // Khởi tạo Google Accounts ID khi script đã sẵn sàng
  useEffect(() => {
    if (!isScriptLoaded || !window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    } catch (e: unknown) {
      // Bắt lỗi an toàn nếu Client ID không hợp lệ hoặc CSP chặn
      const errText = 'Lỗi cấu hình Google Sign-In SDK.';
      setError(errText);
      onErrorRef.current?.(errText);
    }
  }, [isScriptLoaded, clientId, handleCredentialResponse]);

  // Hàm render Google Button chính thức vào container DOM
  const renderGoogleButton = useCallback(
    (element: HTMLElement | null, customWidth?: string | number) => {
      if (!element || !window.google?.accounts?.id) return;
      try {
        window.google.accounts.id.renderButton(element, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: customWidth || '100%',
          locale: 'vi',
        });
      } catch (err) {
        // Fallback im lặng nếu không render được iframe
      }
    },
    []
  );

  // Hàm chủ động mở Google One-tap / Account prompt
  const promptGoogleSignIn = useCallback(() => {
    if (!window.google?.accounts?.id) {
      const errText = 'Đang tải dịch vụ xác thực Google, vui lòng thử lại sau giây lát.';
      setError(errText);
      onErrorRef.current?.(errText);
      return;
    }

    try {
      setIsAuthenticating(true);
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setIsAuthenticating(false);
        }
      });
    } catch {
      setIsAuthenticating(false);
    }
  }, []);

  return {
    isScriptLoaded,
    isAuthenticating,
    error,
    renderGoogleButton,
    promptGoogleSignIn,
  };
};

export default useGoogleAuth;
