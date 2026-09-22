# 05. Tiêu Chuẩn Lập Trình & Clean Code (Coding Standards)

Tài liệu này thiết lập các tiêu chuẩn viết mã nguồn TypeScript/React, tiêu chuẩn Axios, phân trang, xử lý form, quy tắc Anti-God-File, CSS scoping và các ràng buộc an ninh bắt buộc phải tuân thủ trong dự án **InternHub-Frontend**.

---

## 1. Triết Lý Clean Code & Thiết Kế Component

Mọi dòng code được sinh ra hoặc sửa đổi phải đáp ứng các tiêu chuẩn:

1. **Single Responsibility (Đơn nhiệm)**: Mỗi hàm hoặc component chỉ nên giải quyết duy nhất một nhiệm vụ cụ thể.
2. **DRY (Don't Repeat Yourself)**: Không lặp lại mã nguồn. Logic hoặc giao diện xuất hiện từ 2 lần trở lên phải tách thành helper, custom hook hoặc common component.
3. **KISS & YAGNI**: Code rõ ràng, tường minh, không over-engineering cho các tính năng chưa có trong yêu cầu.

---

## 2. Tiêu Chuẩn Kiến Trúc Anti-God-File (Domain-Driven Modular Design)

> [!CAUTION]
> **NGHIÊM CẤM TẠO CÁC FILE NGUYÊN KHỐI (MONOLITHIC / GOD FILES) CHỨA TOÀN BỘ CODE CỦA HỆ THỐNG.**

### 2.1. Giới Hạn Chiều Dài File (File Length Ceiling)
- Khuyến nghị mọi file `.ts` / `.tsx` **không dài quá 200 - 300 dòng code**.
- Khi một file có xu hướng vượt quá 300 dòng, bắt buộc phải phân rã thành các sub-components, sub-services hoặc helper functions.

### 2.2. Phân Rã Endpoints & Routes Theo Domain
- **API Endpoints**: Nằm trong `src/constants/endpoints/` chia theo domain (`auth.endpoints.ts`, `employee.endpoints.ts`, `document.endpoints.ts`...), tập hợp qua `index.ts`. Cấm tạo file `apiEndpoints.ts` một cục.
- **Routes**: Nằm trong `src/constants/routes/` chia theo module (`public.routes.ts`, `admin.routes.ts`, `hr.routes.ts`, `mentor.routes.ts`, `intern.routes.ts`...), tập hợp qua `index.ts`. Cấm tạo file `routes.ts` một cục.

### 2.3. Phân Rã Hệ Thống TypeScript Types
- Nằm trong `src/types/` chia theo domain: `auth.types.ts`, `intern.types.ts`, `document.types.ts`, `common.types.ts`...
- File `src/types/index.ts` chỉ làm nhiệm vụ re-export (Barrel Export), cấm nhồi nhét toàn bộ khai báo interface vào một file duy nhất.

---

## 3. Tiêu Chuẩn Thứ Tự Import 5 Tầng Nhất Quán (Import Order Hierarchy)

Mọi file `.ts` / `.tsx` đều tuân thủ thứ tự import từ trên xuống dưới:
```typescript
// Tầng 1: Thư viện bên ngoài (React, React Router, Axios, Lucide...)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit } from 'lucide-react';

// Tầng 2: Components giao diện (Common Components, Layouts, Sub-components)
import { Button } from '../../components/common/Button/Button';
import { Modal } from '../../components/common/Modal/Modal';
import { Input } from '../../components/common/Input/Input';

// Tầng 3: Hooks & Contexts
import { useInterns } from '../../hooks/useInterns';
import { useAuth } from '../../contexts/AuthContext';

// Tầng 4: Constants & Services
import { ROUTES } from '../../constants/routes';
import { API_ENDPOINTS } from '../../constants/endpoints';
import { internService } from '../../services/internService';

// Tầng 5: Types, Utils & Styles (Luôn để ở cuối cùng)
import { formatDate } from '../../utils/formatters';
import type { InternProfile } from '../../types';
import './InternTable.css';
```

---

## 4. Tiêu Chuẩn Kiến Trúc TSX & Component (Component Architecture)

### 4.1. Tách Biệt Toàn Bộ UI Elements Dùng Chung (Reusable UI Components)
> [!IMPORTANT]
> **TẤT CẢ NÚT BẤM, MODAL, ALERT, SEARCHBAR, INPUT, DROPDOWN, PAGINATION... ĐỀU PHẢI ĐƯỢC TÁCH RIÊNG THÀNH COMPONENT.**
>
> - **Nghiêm cấm**: Viết các khối giao diện thô inline (thẻ `<button>` với class dài dòng, modal tự tạo bằng `div absolute`, input thô...) trực tiếp trong các Page.
> - **Bắt buộc**: Sử dụng hoặc tạo mới các component dùng chung tại `src/components/common/` (ví dụ: `Button`, `Modal`, `Alert`, `Input`, `SearchBar`).
> - **Cơ chế**: Các component này là Controlled/Presentational Components, nhận toàn bộ dữ liệu hiển thị và callback sự kiện thông qua `props`.

---

### 4.2. Bắt Buộc Tách Props Interface Ra File Riêng Biệt
> [!CAUTION]
> **KHÔNG ĐƯỢC ĐỊNH NGHĨA PROPS INTERFACE TRONG CÙNG FILE VỚI COMPONENT.**

- **Đối với Common UI Component**: Tạo file props song hành cùng thư mục với định dạng `[ComponentName].types.ts` (ví dụ: `Input.types.ts` hỗ trợ prop `error?: string`).
- **Đối với Page/Feature Components**: Khai báo props trong thư mục `src/types/props/` hoặc trong file types của module (`src/types/{module}.types.ts`).

---

### 4.3. Giới Hạn Số Lượng State Trong 1 Component (Tối đa 3 - 4 State)
> [!WARNING]
> **MỘT COMPONENT KHÔNG ĐƯỢC PHÉP CHỨA QUÁ NHIỀU STATE (TỐT NHẤT TỪ 3 ĐẾN 4 `useState`).**

#### 4 Giải pháp xử lý bắt buộc khi cần quản lý nhiều state:
1. **Tách Sub-components**: Chia component lớn thành các component con nhỏ hơn.
2. **Gộp State Object**: Gom các state liên quan mật thiết thành 1 state object duy nhất (như filter params, form fields).
3. **Tách Custom Hook**: Đưa toàn bộ state, effects và logic gọi API ra một Custom Hook riêng biệt (ví dụ: `useInterns()`).
4. **Sử dụng React Hook Form + Zod Schema**: Đối với các form từ 4 trường nhập liệu trở lên, bắt buộc sử dụng `react-hook-form` (quản lý uncontrolled refs) kết hợp `zod` để validate. Giải pháp này giúp component chỉ giữ 1 state quản lý submit/modal mà vẫn kiểm soát được hàng chục trường dữ liệu mà không gây re-render liên tục.

---

### 4.4. Quy Chuẩn Phân Trang (Pagination Convention)
- **Spring Boot**: Đếm trang từ `0` (`0-indexed`).
- **Frontend UI**: Hiển thị trang bắt đầu từ `1` (`1-indexed`).
- **Quy tắc**: Tự động trừ 1 khi gửi request (`params.page = pageUI - 1`) và cộng 1 khi nhận response (`pageUI = pageBE + 1`).

---

### 4.5. Quy Chuẩn Hàm Tiện Ích Format (Utility Formatters)
- Toàn bộ hàm format ngày tháng, số điện thoại, điểm số, tiền tệ phải nằm tập trung tại `src/utils/formatters.ts` (`formatDate`, `formatDateTime`, `formatPhoneNumber`, `formatScore`).
- **Nghiêm cấm**: Viết logic format ngày tháng hoặc chuỗi thủ công bên trong JSX của Component.

---

### 4.6. Quy Chuẩn CSS Modules & Cấm Lạm Dụng Inline Styles
- **Bắt buộc sử dụng CSS Modules**: Toàn bộ Common Components và Sub-components phải sử dụng định dạng `[ComponentName].module.css`.
  ```typescript
  import styles from './Button.module.css';
  // Sử dụng:
  <button className={`${styles.button} ${styles.primary}`}>
  ```
- **Nghiêm cấm viết inline styles** (`style={{ marginTop: '16px', color: 'red' }}`) cho các thuộc tính layout, spacing, typography hoặc màu sắc.
- Chỉ cho phép dùng inline `style` cho các giá trị động thực sự tính toán theo runtime (ví dụ: `style={{ width: `${percent}%` }}`).

---

### 4.7. Quy Chuẩn Phản Hồi Thao Tác Thay Đổi Dữ Liệu (Mutation Action Feedback)
- **Khi Mutation thành công (Thêm/Sửa/Xóa)**:
  1. Hiển thị thông báo thành công (Toast / Alert rõ ràng).
  2. Tự động đóng Modal hoặc Form tạo/sửa.
  3. Tự động kích hoạt `refetch()` để làm mới dữ liệu danh sách hiển thị trên bảng.
- **Khi Mutation thất bại**:
  1. Hiển thị thông báo lỗi cụ thể (từ `AppError.message` hoặc bôi đỏ ô input từ `AppError.fieldErrors`).
  2. **TUYỆT ĐỐI KHÔNG ĐÓNG MODAL / FORM**, giữ nguyên dữ liệu người dùng đã nhập để họ chỉnh sửa, tránh làm mất công sức nhập liệu.

---

## 5. Tiêu Chuẩn An Toàn & Cấm Bypass Bảo Mật (Security & Anti-Bypass Standards)

1. **Cấm chèn cờ bypass bảo mật**: Tuyệt đối không đưa vào mã nguồn các biến hoặc cờ như `BYPASS_AUTH = true`, `IS_DEV_AUTO_LOGIN = true`.
2. **Cấm hardcode user ảo hoặc token giả**: Không gán cố định token hoặc role vào `localStorage` hay state để qua mặt hệ thống phân quyền.
3. **Tuân thủ đúng phản hồi lỗi quyền hạn**: Khi gặp 401 hoặc 403 từ backend, bắt buộc phải hiển thị đúng thông báo hoặc redirect về login. Không được fallback mock data để truy cập trái phép.
4. **Kiểm soát Git**: Nghiêm cấm Agent tự ý chạy `git commit` hoặc `git push`. Toàn bộ thao tác commit phải do người dùng tự thực hiện sau khi review.

---

## 6. Tiêu Chuẩn Gọi API Bằng Axios (Axios Best Practices)

1. **Cấm gọi Axios trực tiếp trong Component UI**: Toàn bộ các tác vụ gọi HTTP phải nằm trong `src/services/` và được tiêu thụ qua Custom Hooks.
2. **Nghiêm cấm ép kiểu lỗi thành `as any`**: Lỗi từ Axios phải được chuẩn hóa qua class `AppError` trong `src/services/api.ts`.
3. **Nghiêm cấm Fallback Mock Data trong khối `catch` của Service**: Không được viết `try { apiClient.get(...) } catch { return mockData; }` bên trong Service.
4. **Bắt buộc hỗ trợ `AbortController`**: Mọi hàm Service nhận dữ liệu danh sách hoặc tìm kiếm phải hỗ trợ tham số `signal?: AbortSignal`.
5. **Xử lý trích xuất lỗi Validation từ Spring Boot**: Interceptor phải bóc tách danh sách lỗi trường `errors: Record<string, string>` từ response của Spring Boot và truyền vào `fieldErrors` của `AppError`.
6. **Hỗ trợ theo dõi tiến trình tải lên & hủy tải file (Upload Progress & Cancellation)**: Các service tải lên tệp (upload CV, báo cáo) bắt buộc hỗ trợ cấu hình `onUploadProgress?: (progressEvent: AxiosProgressEvent) => void` và `signal?: AbortSignal` để cập nhật % tiến trình cho người dùng và cho phép hủy thao tác ngay lập tức.

---

## 7. Tiêu Chuẩn TypeScript (TypeScript Standards)

> [!CAUTION]
> **NGHIÊM CẤM LẠM DỤNG KIỂU `any`.**

- **Thay thế `any`**: Sử dụng `interface`, `type`, `unknown` (kèm type guard) hoặc Generics.
- **An toàn dữ liệu**: Luôn sử dụng Optional Chaining `?.` và Nullish Coalescing `??`.
- **Hạn chế ép kiểu ép buộc**: Tránh dùng `as unknown as Type`. Hãy kiểm tra kiểu trước khi xử lý (Type Narrowing).

---

## 8. Quy Ước Đặt Tên (Naming Conventions)

| Đối tượng | Quy ước | Ví dụ |
| :--- | :--- | :--- |
| **React Components** | `PascalCase` | `Button.tsx`, `Modal.tsx`, `Input.tsx` |
| **Interfaces & Types** | `PascalCase` | `InputProps`, `ButtonProps`, `InternProfile` |
| **Biến & Hàm** | `camelCase` | `fetchInternList`, `currentUser`, `handleSubmit` |
| **Custom Hooks** | `camelCase` (bắt đầu bằng `use`) | `useAuth`, `useInterns`, `useDebounce` |
| **Hằng số (Constants)** | `UPPER_SNAKE_CASE` | `API_ENDPOINTS`, `ROUTES`, `DEFAULT_PAGE_SIZE` |
| **Biến trạng thái Boolean** | Tiền tố `is`, `has`, `should`, `can` | `isOpen`, `isLoading`, `hasPermission`, `canEdit` |
| **File Props Types** | `[ComponentName].types.ts` | `Input.types.ts`, `Button.types.ts` |
| **File CSS Modules** | `[ComponentName].module.css` | `Input.module.css`, `Button.module.css` |
| **Zod Schema Validation** | `[domain].schema.ts` | `auth.schema.ts`, `intern.schema.ts` |
| **File Endpoints theo Domain** | `{domain}.endpoints.ts` | `auth.endpoints.ts`, `employee.endpoints.ts` |
| **File Routes theo Module** | `{module}.routes.ts` | `hr.routes.ts`, `admin.routes.ts` |
| **File Types theo Domain** | `{domain}.types.ts` | `intern.types.ts`, `auth.types.ts` |
| **Class Lỗi Kỹ Thuật** | `PascalCase` | `AppError` |

---

## 9. Tiêu Chuẩn Commit Message (Conventional Commits)

Khi người dùng yêu cầu Agent commit hoặc soạn thảo nội dung commit, bắt buộc tuân theo quy tắc:
```text
<type>(<scope>): <mô tả ngắn gọn bằng tiếng Việt hoặc tiếng Anh>
```

| Type | Ý Nghĩa | Ví Dụ Cụ Thể |
| :--- | :--- | :--- |
| `feat` | Thêm mới tính năng hoặc màn hình | `feat(hr-interns): integrate pagination with spring boot api` |
| `fix` | Sửa lỗi logic hoặc giao diện | `fix(auth): redirect to login on 401 response interceptor` |
| `refactor` | Cải tiến cấu trúc code, không đổi chức năng | `refactor(services): modularize internService into sub-domains` |
| `style` | Thay đổi CSS, khoảng cách, format mã nguồn | `style(common-button): adjust padding and hover state color` |
| `docs` | Cập nhật tài liệu hướng dẫn hoặc `.agents/` | `docs(working-rules): add fast-track protocol guidelines` |
| `chore` | Thay đổi cấu hình build, scripts, dependencies | `chore(vite): update proxy routing for gateway` |

---

## 10. Tiêu Chuẩn Error Boundary & Fallback UI

Mọi Error Boundary trong dự án bắt buộc phải đáp ứng:
1. **Không hiển thị màn hình trắng**: Luôn hiển thị giao diện Fallback UI thân thiện với người dùng.
2. **Nút Thử lại (Retry Action)**: Cung cấp nút bấm cho phép người dùng kích hoạt reset state của component hoặc tải lại trang cục bộ.
3. **Thông tin kỹ thuật an toàn**: Trong môi trường `development`, hiển thị `error.message` và `componentStack` bên trong khối accordion thu gọn. Trong môi trường `production`, chỉ hiển thị thông báo chung: *"Đã xảy ra sự cố không mong muốn. Vui lòng thử lại sau."*

