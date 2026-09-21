# Rules & Standards for AI Agent — InternHub Frontend (FE)

## 1. Project Overview & Context
- **Project**: `InternHub-Frontend` (Frontend cho nền tảng quản trị thực tập InternHub kết nối Sinh viên, Nhà trường và Doanh nghiệp).
- **Mục tiêu**: Xây dựng giao diện web trực quan, hiện đại, mượt mà giúp quản lý quá trình ứng tuyển, theo dõi tiến độ thực tập, báo cáo và đánh giá.
- **Tiêu chí cốt lõi**: Trải nghiệm người dùng (UX/UI) chuẩn mực, code sạch (Clean Code), modular, dễ bảo trì và mở rộng.

---

## 2. Tech Stack & Project Structure

### Tech Stack
- **Core**: React 19, TypeScript, Vite, React Router DOM v7.
- **Styling**: Tailwind CSS, Lucide React.
- **Data Fetching & Server State**: Axios & TanStack React Query v5.
- **Form & Validation**: React Hook Form kết hợp Zod.

### Project Structure Conventions
```text
src/
├── components/       # Các React component theo module / feature
│   ├── ui/           # Base UI components (Buttons, Inputs, Modals...)
│   ├── auth/         # Login, Register, ProtectedRoute
│   ├── dashboard/    # Widgets, thống kê, bảng điều khiển
│   ├── assignments/  # Quản lý bài tập, danh sách, chi tiết
│   ├── layout/       # Header, Sidebar, Footer, Layout shells
│   └── providers/    # Context providers, QueryClientProvider
├── services/         # Logic gọi API (api client, endpoint functions)
├── hooks/            # Custom hooks tái sử dụng
├── types/            # TypeScript interfaces / types
├── lib/ hoặc utils/  # Helper functions (cn helper, axios client, formatters)
└── routes/           # Cấu hình routing / guards
```

---

## 3. Coding Conventions & Standards

### Naming Conventions
- **Component files & folders** (trong `components/`): `PascalCase` (ví dụ: `AssignmentCard.tsx`, `StudentTable/`).
- **Helper functions, custom hooks, variables**: `camelCase` (ví dụ: `useAssignment.ts`, `formatDate.ts`, `isAuthenticated`).
- **Routes & route files**: `kebab-case` hoặc cấu trúc định tuyến tiêu chuẩn (ví dụ: `/student-list`, `[id]`).
- **TypeScript Types & Interfaces**:
  - Request payload gửi lên Backend: **Bắt buộc** dùng hậu tố `*Request` (ví dụ: `CreateAssignmentRequest`, `LoginRequest`).
  - Response dữ liệu nhận về từ Backend: **Bắt buộc** dùng hậu tố `*Response` (ví dụ: `UserResponse`, `AssignmentResponse`).
  - **Tuyệt đối KHÔNG dùng hậu tố `*Dto`**.

### Styles & UI
- Sử dụng Tailwind CSS classes kết hợp tiện ích `cn()` (`clsx` + `tailwind-merge`) khi nối class động.
- Giữ giao diện hiện đại, trực quan, độ tương phản tốt, có micro-interactions cho các nút bấm và trạng thái hover/focus.

---

## 4. Architecture & Design Patterns
- **Phân tách Server & Client logic**: Tách biệt rõ ràng phần fetching dữ liệu và UI rendering. Không gọi trực tiếp API trong file UI component lớn mà dùng React Query hooks hoặc service functions.
- **Modular Components**: Thiết kế component nhỏ gọn, độc lập, có prop interface rõ ràng, tránh lồng ghép quá sâu hoặc viết component quá dài (> 200 dòng nên cân nhắc tách nhỏ).
- **State Management**:
  - Dùng **TanStack React Query v5** quản lý Server State (cache, sync, background update).
  - Dùng React local state (`useState`, `useReducer`) hoặc React Context cho UI state cục bộ.
  - **Không** tự ý cài đặt thêm các thư viện Global State (như Redux Toolkit, Zustand) trừ khi có yêu cầu cụ thể.

---

## 5. Module-specific Rules

### 5.1. Authentication & Authorization (JWT)
- **Token Storage**: Lưu trữ Access Token theo cấu hình dự án (localStorage / sessionStorage / cookies an toàn).
- **Axios API Client**: Bắt buộc sử dụng instance cấu hình sẵn (ví dụ: `services/api.ts` hoặc `lib/axios.ts`) cho mọi request để tự động gắn header `Authorization: Bearer <token>`. **Không tạo instance Axios rời rạc**.
- **Route Guarding**: Mọi trang nội bộ (Dashboard, Assignments, Profile...) phải được bảo vệ bởi Route Guard. Nếu chưa xác thực, tự động redirect về trang `/login`.
- **Cookie Security**: Với cookie lưu trữ auth token ở client-side, bắt buộc có cờ `; Secure` trên HTTPS.

### 5.2. Form & Validation Module
- **Client-side Validation**: Mọi form nhập liệu phải được validate tại client trước khi submit.
- **Thư viện chuẩn**: Sử dụng thống nhất **React Hook Form + Zod**. Tuyệt đối không viết logic `if/else` thủ công để validate form.
- **Error Mapping**: Khi Backend trả về lỗi validation (HTTP 400), cần map và hiển thị thông báo lỗi chi tiết bên dưới từng input field tương ứng.

### 5.3. Performance & Optimization
- **Dynamic Imports / Lazy Loading**: Với các component nặng (Rich text editor, biểu đồ chart, modal phức tạp), ưu tiên dùng dynamic import / `React.lazy` để code-split, giảm bundle size ban đầu.
- **Tối ưu tương tác (INP)**:
  - Tránh tính toán nặng trực tiếp trong render loop.
  - Logic filter, sort, transform danh sách lớn gắn với input search phải được bọc trong `useMemo` / debounce để tránh giật lag khi gõ phím.
- **Caching Strategy**: Cấu hình `staleTime` hợp lý (1 - 5 phút) cho các query dữ liệu tổng quan, danh sách ít thay đổi. Tránh dùng `staleTime: 0` cho mọi request.

### 5.4. Notification & Alerts
- **Toast Notifications**: Mọi thông báo Thành công / Thất bại phải qua hệ sinh thái Toast (như Sonner hoặc Radix/Shadcn Toast). **Tuyệt đối không dùng `alert()` mặc định của trình duyệt**.
- **Loading State & Anti-Spam**: Mọi nút submit / action gọi API phải có trạng thái loading (spinner / disabled) để tránh người dùng double-click gây spam request.

### 5.5. Security & Vulnerability Prevention
- **XSS Prevention**: Mọi nội dung HTML/Markdown từ người dùng hoặc backend trả về phải được sanitize (ví dụ: qua `rehype-sanitize` với schema chuẩn) trước khi render.
- **Type Checking nghiêm ngặt**: Không ép kiểu bừa bãi bằng `any`. Tuyệt đối không cấu hình bỏ qua lỗi TypeScript khi build.

---

## 6. Forbidden Files & Security Restrictions
> [!CAUTION]
> **TUYỆT ĐỐI KHÔNG ĐƯỢC PHÉP ĐỌC HOẶC CHỈNH SỬA** các file môi trường chứa thông tin bí mật:
> - `.env`
> - `.env.local`
> - `.env.production`
> - `.env.development`

---

## 7. AI Agent Workflow & Response Standards

### Nguyên tắc xuất Code
- Trả về code React/TypeScript hoàn chỉnh, có thể copy-paste và chạy được ngay.
- **Không tự ý cài dependency mới** ngoài `package.json` trừ khi được yêu cầu trực tiếp.
- **Không tự ý thay đổi file config gốc** (`tsconfig.json`, `vite.config.ts`, `eslint.config.js`, `postcss.config.js`...) trừ khi có chỉ định rõ ràng.
- Đọc kỹ context các file liên quan trước khi sửa code để đảm bảo tương thích type/prop.

### Quy trình thực hiện
- **Task phức tạp** (thêm module mới, refactor lớn): Lập kế hoạch (Implementation Plan) trước, chờ duyệt mới triển khai.
- **Task đơn giản** (fix bug nhỏ, sửa UI/CSS, thêm prop): Thực hiện trực tiếp, súc tích.
- Sau khi hoàn thành code: Nhắc chạy kiểm tra:
  - `npm run dev` hoặc `npm run build`
  - `npm run lint`

### Session Management
Cuối mỗi session / phản hồi lớn, AI Agent tạo summary theo định dạng:
1. **Đang làm gì?**
2. **Đã làm xong gì?**
3. **Decision đã chốt?**
4. **Task tiếp theo là gì?**
