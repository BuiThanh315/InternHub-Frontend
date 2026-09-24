import axios, { AxiosError } from 'axios';

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

// Nếu có VITE_API_BASE_URL thì dùng, nếu để rỗng hoặc dev thì dùng relative path để qua Vite Proxy (tránh CORS)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Chuẩn 10 giây theo quy định quy tắc
});

// Request interceptor gắn Bearer Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('internhub_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor trích xuất thông điệp lỗi chuẩn từ Spring Boot ApiResponse
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    let errorMessage = 'Đã có lỗi xảy ra trong quá trình kết nối máy chủ';
    let fieldErrors: Record<string, string> | undefined;
    const status = error.response?.status;

    if (error.response) {
      const data = error.response.data;

      // 1. Trích xuất lỗi validation chi tiết (Spring Boot MethodArgumentNotValidException)
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

      // Xử lý tự động dọn session và điều hướng khi 401 (không redirect khi đang ở các trang công khai)
      if (status === 401) {
        const currentPath = window.location.pathname;
        if (
          currentPath !== '/apply' &&
          currentPath !== '/'
        ) {
          localStorage.removeItem('internhub_token');
          localStorage.removeItem('internhub_user');
          window.location.href = '/?expired=true&login=true';
        }
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
