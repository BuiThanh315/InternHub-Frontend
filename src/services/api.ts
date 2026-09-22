import axios from 'axios';

// Luôn dùng '' trong browser để request đi qua Vite dev server proxy (cùng origin http://localhost:5173), loại bỏ triệt để lỗi CORS Network Error
const API_BASE_URL = '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
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

// Response interceptor xử lý lỗi xác thực & trích xuất message từ Backend
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token hết hạn hoặc không hợp lệ -> yêu cầu đăng nhập lại
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/' && currentPath !== '/apply') {
        localStorage.removeItem('internhub_token');
        localStorage.removeItem('internhub_user');
        window.location.href = '/login?expired=true';
      }
    }

    // Trích xuất thông điệp chi tiết từ Backend nếu có (ví dụ: error.response.data.message)
    const backendMessage = error.response?.data?.message;
    if (backendMessage) {
      error.message = backendMessage;
    }

    return Promise.reject(error);
  }
);
