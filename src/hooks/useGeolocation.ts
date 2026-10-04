import { useState, useCallback, useEffect } from 'react';
import type { GeolocationCoordinates } from '../types';

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  immediate?: boolean;
}

export interface UseGeolocationReturn {
  coords: GeolocationCoordinates | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
  refreshLocation: () => Promise<GeolocationCoordinates | null>;
}

export const useGeolocation = (
  options: UseGeolocationOptions = {}
): UseGeolocationReturn => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    immediate = false,
  } = options;

  const [coords, setCoords] = useState<GeolocationCoordinates | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);

  const refreshLocation = useCallback((): Promise<GeolocationCoordinates | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        const errMsg = 'Trình duyệt của bạn không hỗ trợ định vị toạ độ GPS.';
        setError(errMsg);
        setLoading(false);
        resolve(null);
        return;
      }

      setLoading(true);
      setError(null);
      setPermissionDenied(false);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoords: GeolocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy * 10) / 10,
          };
          setCoords(newCoords);
          setLoading(false);
          resolve(newCoords);
        },
        (err) => {
          let message = 'Không thể xác định vị trí hiện tại.';
          let denied = false;

          switch (err.code) {
            case err.PERMISSION_DENIED:
              message =
                'Quyền truy cập vị trí đã bị từ chối. Vui lòng cho phép quyền định vị trên trình duyệt để điểm danh.';
              denied = true;
              break;
            case err.POSITION_UNAVAILABLE:
              message =
                'Không thể nhận tín hiệu GPS. Vui lòng kiểm tra kết nối mạng/Wi-Fi hoặc thử lại ngoài trời.';
              break;
            case err.TIMEOUT:
              message =
                'Thời gian chờ định vị GPS đã hết hạn. Vui lòng bấm quét lại vị trí.';
              break;
            default:
              message = err.message || message;
          }

          setError(message);
          setPermissionDenied(denied);
          setLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      );
    });
  }, [enableHighAccuracy, timeout, maximumAge]);

  useEffect(() => {
    if (immediate) {
      refreshLocation();
    }
  }, [immediate, refreshLocation]);

  return {
    coords,
    loading,
    error,
    permissionDenied,
    refreshLocation,
  };
};
