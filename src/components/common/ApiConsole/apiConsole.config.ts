export interface ApiEndpointConfig {
  id: string;
  name: string;
  category: 'AUTH' | 'INTERN' | 'DOCS' | 'USERS' | 'SYSTEM';
  method: 'GET' | 'POST' | 'PUT' | 'PATCH';
  url: string;
  description: string;
  defaultHeaders?: Record<string, string>;
  defaultBody?: Record<string, unknown>;
  requiresAuth?: boolean;
}

export const ENDPOINTS: ApiEndpointConfig[] = [
  {
    id: 'ping',
    name: '1. Ping Gateway & Employee Service',
    category: 'SYSTEM',
    method: 'GET',
    url: '/api/employees',
    description: 'Kiểm tra thông luồng API Gateway (8080) sang Employee Service (8081)',
  },
  {
    id: 'login-hr',
    name: '2. Đăng Nhập Lấy Token (HR)',
    category: 'AUTH',
    method: 'POST',
    url: '/api/auth/login',
    description: 'Xác thực tài khoản HR (hr / 123456) và cấp Bearer JWT Token',
    defaultBody: { username: 'hr', password: '123456' },
  },
  {
    id: 'login-admin',
    name: '3. Đăng Nhập Lấy Token (Admin)',
    category: 'AUTH',
    method: 'POST',
    url: '/api/auth/login',
    description: 'Xác thực tài khoản Admin (admin / 123456) và cấp Bearer JWT Token',
    defaultBody: { username: 'admin', password: '123456' },
  },
  {
    id: 'get-interns',
    name: '4. Lấy Danh Sách Thực Tập Sinh (Phân trang)',
    category: 'INTERN',
    method: 'GET',
    url: '/api/employees/interns?page=0&size=10',
    description: 'Tìm kiếm, lọc hồ sơ TTS với các tiêu chí keyword, university, status',
    requiresAuth: true,
  },
  {
    id: 'create-intern',
    name: '5. Tạo Mới Hồ Sơ Thực Tập Sinh (TM-1)',
    category: 'INTERN',
    method: 'POST',
    url: '/api/employees/interns',
    description: 'Tạo hồ sơ mới (Public / Candidate registration)',
    defaultBody: {
      fullName: 'Phan Minh Hoàng',
      email: 'hoang.phan992@gmail.com',
      phone: '0987654321',
      university: 'Đại Học Bách Khoa',
      major: 'Kỹ Thuật Phần Mềm',
      appliedPosition: 'Thực tập sinh Backend (Java/Spring)',
      startDate: new Date().toISOString().split('T')[0],
      gender: 'MALE',
      academicYear: '2022-2026',
      address: 'Hai Bà Trưng, Hà Nội',
    },
  },
  {
    id: 'update-intern',
    name: '6. Cập Nhật Trạng Thái & Thông Tin (TM-2)',
    category: 'INTERN',
    method: 'PUT',
    url: '/api/employees/interns/1',
    description: 'Cập nhật hồ sơ và chuyển trạng thái PENDING -> APPROVED -> INTERNING -> COMPLETED',
    requiresAuth: true,
    defaultBody: {
      fullName: 'Nguyễn Hoàng Long (Đã Cập Nhật)',
      email: 'long.nguyen@gmail.com',
      phone: '0912345678',
      university: 'Đại Học Bách Khoa',
      major: 'Khoa Học Máy Tính',
      appliedPosition: 'Thực tập sinh Backend (Java/Spring)',
      startDate: '2026-10-01',
      status: 'APPROVED',
      gender: 'MALE',
      academicYear: '2022-2026',
      address: 'Hà Nội',
      notes: 'Đã hoàn thành phỏng vấn vòng 1, chuyển duyệt hồ sơ.',
    },
  },
  {
    id: 'get-users',
    name: '7. Lấy Danh Sách Người Dùng (Admin/Users)',
    category: 'USERS',
    method: 'GET',
    url: '/api/employees/users',
    description: 'Danh sách tài khoản hệ thống từ database Microservices',
    requiresAuth: true,
  },
  {
    id: 'review-doc',
    name: '8. Thẩm Định Phê Duyệt Tài Liệu (TM-5)',
    category: 'DOCS',
    method: 'PATCH',
    url: '/api/employees/interns/documents/1/review',
    description: 'HR phê duyệt hoặc từ chối tài liệu đính kèm kèm lý do tối thiểu 5 ký tự',
    requiresAuth: true,
    defaultBody: {
      status: 'APPROVED',
      rejectionReason: '',
    },
  },
];
