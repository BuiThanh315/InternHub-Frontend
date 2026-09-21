# Frontend AI Agent Guidelines (InternHub-Frontend)

Tập tin này định nghĩa quy tắc hoạt động, thứ tự nạp ngữ cảnh và quy chuẩn phát triển dành cho AI Agent khi làm việc trong dự án **InternHub-Frontend**.

---

## 1. Context Loading Order (Thứ tự nạp Ngữ cảnh)

Trước khi thực hiện bất kỳ nhiệm vụ nào (tạo trang mới, sửa UI, refactor component, debug, viết test), AI **BẮT BUỘC** phải nạp ngữ cảnh theo thứ tự sau:
1. 📖 **Tổng quan dự án & Cấu trúc**: Đọc [README.md](file:///c:/Users/Luong%20Anh%20Huy/InternHub-Workspace/InternHub-Frontend/README.md) và [package.json](file:///c:/Users/Luong%20Anh%20Huy/InternHub-Workspace/InternHub-Frontend/package.json) để nắm rõ cấu trúc thư mục, routes và các dependencies hiện có.
2. 🔴 **Quy chuẩn kỹ thuật BẮT BUỘC**: Đọc [antigravity/rules.md](file:///c:/Users/Luong%20Anh%20Huy/InternHub-Workspace/InternHub-Frontend/antigravity/rules.md) chứa toàn bộ quy định về coding conventions, kiến trúc, TypeScript types (`*Request`, `*Response`), quản lý state (React Query), Axios instance và các quy tắc bảo mật.
3. 🎨 **Đặc tả Thiết kế & Design System**: Đọc [docs/spec.md](file:///c:/Users/Luong%20Anh%20Huy/InternHub-Workspace/InternHub-Frontend/docs/spec.md) chứa quy chuẩn visual tokens, typography, 5 trạng thái DataTable, status config, filter UX và quy trình phân quyền 4 role (Admin, HR, Mentor, Intern).

---

## 2. Tech Stack & Môi trường Phát triển

- **Core Framework**: React 19, TypeScript, Vite, React Router DOM v7.
- **Styling**: Tailwind CSS, Lucide React.
- **Data Fetching & Server State**: Axios & TanStack React Query v5.
- **Form & Validation**: React Hook Form kết hợp Zod.
- **Linter & Code Quality**: Oxlint, TypeScript Compiler (`tsc`).

> Chi tiết danh sách quy chuẩn và thư viện được quản lý tập trung tại [antigravity/rules.md](file:///c:/Users/Luong%20Anh%20Huy/InternHub-Workspace/InternHub-Frontend/antigravity/rules.md).

---

## 3. Skill Trigger Rules (Tự Động Kích Hoạt Skill)

AI cần tự động áp dụng các skill sau theo đúng loại tác vụ:

- 💡 **Khi thảo luận, làm rõ ý tưởng, UI layout hoặc UX workflow mới trước khi code**: ➔ Sử dụng skill `brainstorming`
- 🧹 **Khi Refactor, tối ưu hóa code component, custom hook hoặc util chưa sạch**: ➔ Sử dụng skill `clean-code` (hoặc `codebase-cleanup-refactor-clean`)
- 🔍 **Khi đánh giá, review Frontend code hoặc kiểm tra chất lượng Pull Request**: ➔ Sử dụng skill `code-reviewer`
- 🎨 **Khi tạo/sửa UI Component, Layout, Page**: ➔ Sử dụng skill `senior-frontend`
- ⚡ **Khi xử lý Routing, Data Fetching, tối ưu cấu trúc Component**: ➔ Sử dụng skill `nextjs-best-practices`
- 🛡️ **Khi định nghĩa Type/Interface phức tạp, xử lý Generics hoặc Type safety**: ➔ Sử dụng skill `typescript-pro`
- 🎭 **Khi làm việc với End-to-End Test (E2E) hoặc Playwright Automation**: ➔ Sử dụng skill `e2e-testing-patterns` hoặc `playwright-skill`
- 🧪 **Khi viết kịch bản test giao diện web app thực tế (UI Testing)**: ➔ Sử dụng skill `webapp-testing`
- 🔬 **Khi viết Unit Test / Component Test**: ➔ Sử dụng skill `unit-testing-test-generate`

---

## 4. Nguyên Tắc Kiến Trúc & Coding Standards

1. **Phân chia logic rõ ràng**:
   - Tách biệt hoàn toàn giữa logic fetching dữ liệu và UI components. Sử dụng custom hooks hoặc React Query hooks thay vì gọi API trực tiếp trong component lớn.
   - Giữ components nhỏ gọn, modular, dễ tái sử dụng.
2. **Axios Client Centralization**:
   - Bắt buộc sử dụng instance Axios đã cấu hình sẵn trong `src/services/` hoặc `src/lib/` cho mọi request gửi lên Backend để tự động đính kèm header `Authorization: Bearer <token>`.
   - Tuyệt đối không tự ý tạo instance Axios mới hoặc gọi `axios.get/post` mặc định.
3. **TypeScript Conventions**:
   - Request payload gửi lên Backend: **bắt buộc** dùng hậu tố `*Request` (ví dụ: `CreateInternshipRequest`, `LoginRequest`).
   - Response dữ liệu nhận về từ Backend: **bắt buộc** dùng hậu tố `*Response` (ví dụ: `InternshipResponse`, `UserResponse`).
   - **Tuyệt đối KHÔNG dùng hậu tố `*Dto`**.
4. **Styling Standards**:
   - Sử dụng các utility classes của Tailwind CSS kết hợp helper `cn()` (`clsx` + `tailwind-merge`) khi ghép class động.
   - Hạn chế tối đa việc dùng inline style (`style={{...}}`).
5. **Naming Conventions**:
   - Component files & folders (trong `src/components/`): `PascalCase` (ví dụ: `InternshipCard.tsx`, `StudentTable/`).
   - Hooks, utils, services, helper functions: `camelCase` (ví dụ: `useAuth.ts`, `formatDate.ts`).
   - Route paths: `kebab-case` (ví dụ: `/internships`, `/company-profiles`).

---

## 5. Verification Checklist (Kiểm tra bắt buộc)

Sau khi tạo hoặc chỉnh sửa code, AI **BẮT BUỘC** phải hỗ trợ hoặc nhắc nhở kiểm tra lỗi biên dịch và kiểu dữ liệu:
```bash
# Kiểm tra TypeScript typecheck không bị lỗi
npx tsc --noEmit

# Kiểm tra Linter
npm run lint

# Kiểm tra Build dự án
npm run build
```

---

## 6. Git Branch & Commit Conventions (Quy chuẩn Git & Commit)

Khi người dùng yêu cầu AI tạo nhánh, tạo commit hoặc push code lên Git/GitHub, AI **BẮT BUỘC** phải tuân thủ các quy tắc sau:

### 💡 Ghi chú về `<mã-task-jira>` (Prefix dự án InternHub: ví dụ `INT-xxx` hoặc mã task do User cung cấp):
- **Tên nhánh**: Ưu tiên sử dụng mã Main Task / Story / Bug ID (để quản lý theo tính năng hoặc lỗi tổng thể).
- **Commit Message**: Ưu tiên sử dụng mã Sub-task / Sub-bug ID (nếu task/bug được chia nhỏ thành Sub-task trên Jira), hoặc mã Main Task / Bug ID (nếu làm việc trực tiếp trên Ticket chính).

### 🌿 Quy tắc đặt tên nhánh (Branch Naming)
Cấu trúc bắt buộc: `<type>/<mã-task-jira>/<tên-tính-năng>` (tên tính năng dùng `kebab-case`).

- `feature/<mã-task-jira>/<tên-tính-năng>` : Phát triển tính năng mới (ví dụ: `feature/INT-101/internship-application-form`)
- `bugfix/<mã-task-jira>/<tên-lỗi>` : Sửa lỗi / Bugfix (ví dụ: `bugfix/INT-205/auth-token-refresh-issue`)
- `refactor/<mã-task-jira>/<tên-mô-tả>` : Tối ưu hóa, cấu trúc lại component (ví dụ: `refactor/INT-302/sidebar-navigation`)
- `test/<mã-task-jira>/<tên-mô-tả>` : Bổ sung kiểm thử / Test suite (ví dụ: `test/INT-401/auth-flow-test`)
- `chore/<mã-task-jira>/<tên-mô-tả>` : Cấu hình dependencies, Tailwind, build tooling (ví dụ: `chore/INT-500/update-vite-config`)

### 💬 Quy tắc Commit Message (Conventional Commits)
Cấu trúc: `<type>(<mã-task-jira>): <nội dung mô tả ngắn gọn>`

- `feat(INT-101): xây dựng giao diện form nộp hồ sơ thực tập`
- `fix(INT-205): khắc phục lỗi chuyển hướng khi hết hạn token`
- `refactor(INT-302): tối ưu hóa component Sidebar và điều hướng phân quyền`
- `test(INT-401): bổ sung kiểm thử cho luồng đăng ký doanh nghiệp`
- `docs(INT-500): cập nhật quy chuẩn Git Branch và Commit vào AGENTS.md`
- `chore(INT-600): cập nhật cấu hình Tailwind CSS và Oxlint`

---

## 7. Forbidden Files & Security Restrictions
> [!CAUTION]
> **TUYỆT ĐỐI KHÔNG ĐƯỢC PHÉP ĐỌC HOẶC CHỈNH SỬA** các file môi trường chứa thông tin bí mật:
> - `.env`
> - `.env.local`
> - `.env.production`
> - `.env.development`
