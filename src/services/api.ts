import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

/**
 * Lớp lỗi chuẩn hóa cho toàn bộ ứng dụng Frontend, đóng gói thông tin HTTP status
 * và danh sách lỗi validation (fieldErrors) từ Spring Boot ApiResponse.
 */
export class AppError extends Error {
  public status?: number;
  public fieldErrors?: Record<string, string>;
  public originalError?: AxiosError<any>;

  constructor(
    message: string,
    status?: number,
    fieldErrors?: Record<string, string>,
    originalError?: AxiosError<any>
  ) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.originalError = originalError;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// 1. Quản lý Access Token trong In-Memory RAM (Chống lộ token trên DevTools / Application tab)
let inMemoryAccessToken: string | null = null;

export const setInMemoryAccessToken = (token: string | null): void => {
  inMemoryAccessToken = token;
};

export const getInMemoryAccessToken = (): string | null => inMemoryAccessToken;

// 2. Khởi tạo Axios Client với withCredentials = true để truyền nhận HttpOnly Cookie qua Gateway
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Chuẩn 10 giây theo quy định quy tắc
  withCredentials: true, // BẮT BUỘC: Cho phép gửi và nhận Cookie HttpOnly
});

// 3. Request interceptor gắn Bearer Token từ In-Memory RAM
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (inMemoryAccessToken && config.headers) {
      config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 4. Cơ chế Mutex Queue giải quyết Race Condition khi gặp nhiều 401 đồng thời
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 5. Response interceptor: Xử lý Silent Refresh với Mutex Queue và trích xuất lỗi chuẩn Spring Boot
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    // Không kích hoạt refresh nếu API đang gọi là các endpoint xác thực cơ bản
    const isAuthUrl =
      originalRequest?.url?.includes('/api/auth/login') ||
      originalRequest?.url?.includes('/api/auth/refresh') ||
      originalRequest?.url?.includes('/api/auth/logout') ||
      originalRequest?.url?.includes('/api/auth/oauth2/google');

    if (status === 401 && !originalRequest?._retry && !isAuthUrl) {
      // Nếu đã có 1 request đang refresh, xếp các request sau vào hàng đợi Mutex
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API cấp mới token. Trình duyệt tự động đính kèm Cookie internhub_refresh_token
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        if (!newAccessToken) {
          throw new Error('Không nhận được Access Token hợp lệ từ máy chủ');
        }

        // Cập nhật Access Token mới vào RAM
        setInMemoryAccessToken(newAccessToken);

        // Giải phóng hàng đợi: Cho phép các request đang đợi phát lại với token mới
        processQueue(null, newAccessToken);

        // Phát lại request ban đầu với token mới
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh thất bại (Refresh Token hết hạn hoặc bị thu hồi)
        processQueue(refreshError, null);
        setInMemoryAccessToken(null);
        localStorage.removeItem('internhub_user');

        const currentPath = window.location.pathname;
        if (currentPath !== '/' && currentPath !== '/apply') {
          window.location.href = '/?expired=true&login=true';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Trích xuất thông điệp lỗi chuẩn từ Spring Boot ApiResponse
    let errorMessage = 'Đã có lỗi xảy ra trong quá trình kết nối máy chủ';
    let fieldErrors: Record<string, string> | undefined;

    if (error.response) {
      const data = error.response.data;

      if (data?.errors && typeof data.errors === 'object') {
        fieldErrors = data.errors as Record<string, string>;
        const errorList = Object.entries(fieldErrors)
          .map(([field, msg]) => `• ${field}: ${msg}`)
          .join('\n');
        errorMessage = `${data.message || 'Dữ liệu không hợp lệ'}:\n${errorList}`;
      } else if (data?.message) {
        errorMessage = data.message;
      } else if (status === 401) {
        errorMessage = 'Phiên làm việc đã hết hạn hoặc thông tin đăng nhập không hợp lệ';
      } else if (status === 403) {
        errorMessage = 'Bạn không có quyền thực hiện thao tác này';
      } else if (status === 404) {
        errorMessage = 'Không tìm thấy dữ liệu yêu cầu';
      } else if (status === 409) {
        errorMessage = data?.message || 'Dữ liệu bị trùng lặp trong hệ thống';
      }
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      errorMessage = 'Yêu cầu kết nối quá thời gian quy định (10 giây). Máy chủ đang bận hoặc phản hồi chậm.';
    } else if (error.request) {
      errorMessage = 'Không thể kết nối đến máy chủ Backend (Gateway: Port 8080). Vui lòng kiểm tra dịch vụ Docker.';
    }

    const appError = new AppError(errorMessage, status, fieldErrors, error);
    return Promise.reject(appError);
  }
);

// Kiểm tra sức khỏe kết nối backend qua Gateway
export const checkBackendHealth = async (): Promise<{ isConnected: boolean; message: string }> => {
  try {
    const res = await apiClient.get('/api/employees');
    return {
      isConnected: true,
      message: typeof res.data === 'string' ? res.data : 'Kết nối Backend thành công!',
    };
  } catch (err: any) {
    return {
      isConnected: false,
      message: err.message || 'Không thể kết nối máy chủ',
    };
  }
};
