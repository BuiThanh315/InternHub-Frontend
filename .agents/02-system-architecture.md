# 02. Cấu Trúc Hệ Thống & Kiến Trúc Frontend (System Architecture)

Tài liệu này mô tả chi tiết kiến trúc kỹ thuật, cấu trúc thư mục chuẩn **Domain-Driven Modular** (ngăn ngừa triệt để hiện tượng God Files ngay từ ngày đầu), luồng dữ liệu và mô hình phân tầng gọi API bằng Axios của dự án **InternHub-Frontend**.

---

## 1. Công Nghệ Nền Tảng (Technology Stack)

| Thành phần | Công nghệ / Thư viện | Phiên bản | Mục đích |
| :--- | :--- | :--- | :--- |
| **Core Framework** | React | `^19.2.8` | UI Library xây dựng giao diện dựa trên component |
| **Language** | TypeScript | `~6.0.2` | Static typing, đảm bảo type safety |
| **Build Tool & Dev Server** | Vite | `^8.3.0` | Đóng gói và chạy môi trường dev tốc độ cao |
| **Routing** | React Router DOM | `^7.18.4` | Định tuyến SPA, điều hướng và bảo vệ route theo role |
| **HTTP Client** | Axios | `^1.20.0` | Gọi REST API, quản lý request/response interceptor |
| **Icons** | Lucide React | `^1.47.0` | Hệ thống biểu tượng UI hiện đại |
| **Linter** | Oxlint | `^1.81.0` | Kiểm tra cú pháp và chất lượng mã nguồn hiệu năng cao |
| **Styling** | Vanilla CSS / App.css / index.css | Chuẩn CSS3 | Phong cách UI hiện đại, biến CSS tokens |

---

## 2. Cấu Trúc Thư Mục Chuẩn Domain-Driven Modular (Anti-God-File from Day 1)

Toàn bộ các thành phần có xu hướng mở rộng theo tính năng đều được **tách nhỏ theo Domain nghiệp vụ ngay từ ban đầu**:

```text
InternHub-Frontend/
├── .agents/                    # Bộ quy chuẩn và hướng dẫn dành cho AI Agent
├── public/                     # Tài nguyên tĩnh phục vụ trực tiếp
├── src/
│   ├── assets/                 # Hình ảnh, fonts, logo tĩnh nội bộ
│   ├── components/             # Các component giao diện
│   │   ├── common/             # UI Components dùng chung (tách thư mục độc lập)
│   │   │   ├── Button/         # Button.tsx, Button.types.ts, Button.module.css
│   │   │   ├── Modal/          # Modal.tsx, Modal.types.ts, Modal.module.css
│   │   │   ├── Alert/          # Alert.tsx, Alert.types.ts, Alert.module.css
│   │   │   ├── Input/          # Input.tsx, Input.types.ts, Input.module.css (hỗ trợ prop error)
│   │   │   └── SearchBar/      # SearchBar.tsx, SearchBar.types.ts, SearchBar.module.css
│   │   └── layout/             # Các thành phần khung sườn (Header, Sidebar...)
│   ├── constants/              # HẠ TẦNG HẰNG SỐ PHÂN RÃ THEO DOMAIN (ANTI-GOD-FILE)
│   │   ├── endpoints/          # CHIA NHỎ API ENDPOINTS THEO DOMAIN
│   │   │   ├── auth.endpoints.ts
│   │   │   ├── employee.endpoints.ts
│   │   │   ├── document.endpoints.ts
│   │   │   ├── evaluation.endpoints.ts
│   │   │   └── index.ts        # Barrel export tập hợp thành API_ENDPOINTS duy nhất
│   │   └── routes/             # CHIA NHỎ ROUTE PATHS THEO MODULE / ROLE
│   │       ├── public.routes.ts
│   │       ├── admin.routes.ts
│   │       ├── hr.routes.ts
│   │       ├── mentor.routes.ts
│   │       ├── intern.routes.ts
│   │       └── index.ts        # Barrel export tập hợp thành ROUTES duy nhất
│   ├── contexts/               # React Context quản lý global state (AuthContext,...)
│   ├── hooks/                  # Custom Hooks (quản lý fetching API, debounce, form...)
│   ├── layouts/                # Bố cục giao diện chung (DashboardLayout, AuthLayout...)
│   ├── pages/                  # Các trang màn hình được nhóm theo phân quyền (Role)
│   │   ├── admin/              # Màn hình dành cho quản trị viên (Admin)
│   │   ├── auth/               # Màn hình đăng nhập, đăng ký, quên mật khẩu
│   │   ├── hr/                 # Màn hình dành cho quản lý nhân sự (HR)
│   │   ├── intern/             # Màn hình dành cho thực tập sinh (Intern)
│   │   └── mentor/             # Màn hình dành cho người hướng dẫn (Mentor)
│   ├── routes/                 # Cấu hình danh sách routes, ProtectedRoute theo phân quyền
│   ├── services/               # Tầng giao tiếp API Backend theo từng Domain
│   │   ├── api.ts              # Axios instance, Interceptors, AppError, cấu hình BaseURL
│   │   ├── authService.ts      # API xác thực, đăng nhập, đổi mật khẩu
│   │   ├── internService.ts    # API quản lý hồ sơ và tiến độ thực tập
│   │   ├── documentService.ts  # API quản lý tài liệu và upload
│   │   └── mockData.ts         # Dữ liệu mẫu phục vụ kiểm thử độc lập
│   ├── types/                  # HỆ THỐNG TYPES PHÂN RÃ THEO DOMAIN (ANTI-GOD-FILE)
│   │   ├── auth.types.ts       # Types cho xác thực, user, token
│   │   ├── intern.types.ts     # Types cho hồ sơ, trạng thái thực tập
│   │   ├── document.types.ts   # Types cho tài liệu, upload
│   │   ├── common.types.ts     # Types dùng chung: ApiResponse<T>, PageResponse<T>
│   │   ├── props/              # Props types dành cho các component phức tạp
│   │   └── index.ts            # Re-export tập trung (Barrel Export)
│   ├── utils/                  # TIỆN ÍCH DÙNG CHUNG TOÀN HỆ THỐNG
│   │   └── formatters.ts       # QUẢN LÝ TẬP TRUNG TOÀN BỘ HÀM FORMAT (Date, Phone, Score, Money)
│   ├── App.css                 # CSS chung cho ứng dụng và animation
│   ├── App.tsx                 # Root Component thiết lập Provider và Routes
│   ├── index.css               # Design tokens, variables, typography, reset CSS
│   └── main.tsx                # Entry point gắn kết React App vào DOM
├── .env                        # Cấu hình biến môi trường cục bộ (VITE_API_BASE_URL)
├── index.html                  # HTML entry template
├── package.json                # Danh sách dependencies và npm scripts
├── tsconfig.json               # Cấu hình TypeScript compiler
└── vite.config.ts              # Cấu hình Vite (plugins, proxy server)
```

---

## 3. Kiến Trúc Gọi API 4 Tầng & Quy Chuẩn Phân Trang

```
┌──────────────────────────────────────────────────────────┐
│  TẦNG 1: CONSTANTS (src/constants/endpoints/index.ts)    │
│  - Phân rã theo Domain: auth, employee, document...      │
│  - Barrel export tập hợp thành API_ENDPOINTS duy nhất     │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│  TẦNG 2: CORE HTTP CLIENT (src/services/api.ts)          │
│  - Axios instance cấu hình baseURL, timeout, headers     │
│  - Request Interceptor: Gắn Bearer Token                 │
│  - Response Interceptor: Chuẩn hóa AppError, xử lý 401   │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│  TẦNG 3: TYPED SERVICES (src/services/*.service.ts)      │
│  - Các hàm gọi API theo domain (auth, intern, document)  │
│  - Nhận params kiểu rõ ràng, trả về Promise<T>           │
│  - Hỗ trợ AbortSignal truyền từ trên xuống               │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│  TẦNG 4: CUSTOM HOOKS (src/hooks/use*.ts)                │
│  - Quản lý state: data, isLoading, error, refetch        │
│  - Chuyển đổi phân trang: (pageUI - 1 ➔ params.page)     │
│  - Tự động hủy request với AbortController khi unmount   │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│  TẦNG 5: UI PRESENTATION (src/pages/*.tsx)               │
│  - Component TSX thuần túy render giao diện từ Hook      │
│  - Không chứa logic axios, tuân thủ tối đa 3-4 state     │
│  - Input hiển thị lỗi đỏ từ prop error (fieldErrors)     │
│  - Dữ liệu hiển thị được format qua src/utils/formatters │
└──────────────────────────────────────────────────────────┘
```

### Quy Chuẩn Chuyển Đổi Phân Trang (Pagination Convention):
- **Spring Boot Backend**: Quy ước đánh số trang từ `0` (`0-indexed`).
- **Giao diện Người dùng (UI)**: Hiển thị trang bắt đầu từ `1` (`1-indexed`).
- **Cơ chế chuyển đổi**: Tầng Hook/Service tự động trừ 1 khi gửi request lên máy chủ (`pageBE = pageUI - 1`) và cộng 1 khi trả về cho UI (`pageUI = pageBE + 1`), đảm bảo không xảy ra lỗi lệch 1 trang (off-by-one bug).

---

## 4. Chiến Lược Quản Lý State (State Management Architecture)

Để giữ cho ứng dụng dễ bảo trì, dễ hiểu và tránh over-engineering, dự án phân tách rõ 2 loại trạng thái:

1. **Client State (Trạng thái giao diện cục bộ)**:
   - *Đặc điểm*: Đóng/mở modal, tab đang chọn, giá trị nhập trong ô tìm kiếm tạm thời.
   - *Công nghệ*: Sử dụng `useState` cục bộ trong component (tối đa 3 - 4 state) hoặc `useReducer` khi form phức tạp.
   - *Global Client State*: Sử dụng React Context (`AuthContext`) cho trạng thái phiên đăng nhập và người dùng hiện tại.

2. **Server State (Dữ liệu từ API máy chủ)**:
   - *Đặc điểm*: Danh sách thực tập sinh, thông tin chi tiết báo cáo, dữ liệu phân trang.
   - *Chuẩn mực hiện tại (Mặc định)*: **Custom Hook 4 tầng kết hợp `AbortController`**. Mỗi hook đóng gói `data`, `isLoading`, `error`, `refetch()` và tự động hủy request khi unmount.
   - *Nguyên tắc Single Source of Truth (Chống Duplicate Requests)*:
     + Khi phân rã một màn hình lớn thành nhiều component con, **Container Page cấp cao nhất** chịu trách nhiệm gọi Hook lấy dữ liệu và truyền xuống các sub-component qua `props`.
     + **Nghiêm cấm** các sub-component anh em (sibling components) tự ý gọi cùng một Hook để lấy dữ liệu trùng lặp, gây bão request không cần thiết tới máy chủ.
   - *Định hướng tương lai (Future Reference)*: Khi dự án mở rộng với nhiều màn hình cần cache ngầm phức tạp, có thể cân nhắc tích hợp **TanStack Query (React Query)** để tự động hóa caching và background refetching mà không làm thay đổi cấu trúc tầng Service.

---

## 5. Kiến Trúc Phân Lớp Error Boundary (Resilience Architecture)

Nhằm ngăn chặn hiện tượng một lỗi runtime nhỏ làm sụp đổ toàn bộ ứng dụng (White Screen of Death), dự án áp dụng mô hình Error Boundary phân lớp:

```
┌────────────────────────────────────────────────────────┐
│ 1. Root Error Boundary (Bao quanh toàn bộ App.tsx)     │
│    ➔ Hiển thị trang Crash khẩn cấp kèm nút F5 tải lại   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 2. Layout Error Boundary (Bao quanh từng Role Layout)  │
│    ➔ AdminLayout, HrLayout, MentorLayout, InternLayout │
│    ➔ Lỗi ở trang con không làm mất Sidebar / Header    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 3. Widget Error Boundary (Bao quanh bảng dữ liệu/chart)│
│    ➔ Hiển thị Fallback UI cục bộ kèm nút "Thử lại"     │
└────────────────────────────────────────────────────────┘
```

---

## 6. Kiến Trúc Màn Hình Chuẩn 4 Lớp (Standard Page Composition Pattern)

Để phân rã triệt để các màn hình lớn (như `HrDashboard.tsx` hay `InternDashboard.tsx`) và bảo đảm mọi file luôn **dưới 200 - 300 dòng**, toàn bộ các trang Dashboard được tổ chức theo mô hình 4 lớp rõ ràng:

```
┌─────────────────────────────────────────────────────────────────┐
│ [Container Page] (src/pages/{role}/{Feature}Page.tsx)           │
│ - Gọi Custom Hook lấy Server State, quản lý bộ lọc URL/Params   │
│ - Tối đa 3 - 4 state cục bộ, truyền props xuống các sub-views   │
├─────────────────────────────────────────────────────────────────┤
│ 1. Header & Action Bar ([Feature]Header.tsx)                    │
│    ➔ Title, breadcrumbs, nút "Thêm mới", nút "Export"           │
├─────────────────────────────────────────────────────────────────┤
│ 2. Metrics / Summary Grid ([Feature]Metrics.tsx)                │
│    ➔ Thẻ thống kê số lượng, tiến độ, KPIs                       │
├─────────────────────────────────────────────────────────────────┤
│ 3. Data Presentation ([Feature]Table.tsx / List.tsx)            │
│    ➔ Ô tìm kiếm, bộ lọc trạng thái, bảng hiển thị & phân trang   │
├─────────────────────────────────────────────────────────────────┤
│ 4. Modals Manager ([Feature]Modals.tsx)                         │
│    ➔ Quản lý hiển thị các Modal tạo, sửa, chi tiết, xóa         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Kiến Trúc CSS Modules Cô Lập Phong Cách Giao Diện

Để loại bỏ hoàn toàn hiện tượng xung đột CSS (CSS Leakage) khi dự án đóng gói:
1. **Bắt buộc dùng CSS Modules**: Mọi Common Component và Sub-component đều phải dùng định dạng `[ComponentName].module.css`.
2. **Cơ chế hoạt động**: Vite sẽ tự động băm (hash) tên class (ví dụ: `.button_a1b2c`), bảo đảm class của component này không bao giờ làm vỡ layout của component khác.
3. **Design Tokens toàn cục**: Các biến màu, font chữ, khoảng cách dùng chung được lưu trữ duy nhất tại `src/index.css` dưới dạng CSS Variables (`--primary-color`, `--spacing-md`...) và được tham chiếu trong các file module CSS qua cú pháp `var(--variable-name)`.

