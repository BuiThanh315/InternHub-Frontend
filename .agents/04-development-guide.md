# 04. Hướng Dẫn Phát Triển Tính Năng Mới (Development Guide)

Tài liệu này cung cấp hướng dẫn từng bước (Step-by-step) để phát triển một tính năng mới hoặc một UI component dùng chung trong **InternHub-Frontend** theo chuẩn mực kiến trúc Domain-Driven Modular, Axios 4 tầng, chống trùng lặp mã nguồn, quy chuẩn phân trang, formatters và phản hồi Mutation UX.

---

## 1. Quy Trình Chuẩn Phát Triển Tính Năng (Feature Development Lifecycle)

Khi xây dựng một tính năng mới, Agent phải thực hiện theo quy trình 7 bước chuẩn hóa sau:

```
[1. Khảo sát UI & Chức năng có sẵn (Tránh trùng lặp)] 
                         ↓
[2. Đề xuất Endpoint & Route trong Plan (Chờ User duyệt)] 
                         ↓
[3. Khai báo vào endpoints/{domain} & routes/{module}] 
                         ↓
[4. Định nghĩa Types theo Domain (types/{domain}.types.ts)] 
                         ↓
[5. Xây dựng Service API & Custom Hook (Xử lý 0-indexed pagination)] 
                         ↓
[6. Xây dựng UI Page (Common Components, prop error, Formatters, Mutation UX)] 
                         ↓
[7. Kiểm thử với Dữ liệu Thực tế (Yêu cầu User cấp tài khoản)]
```

---

### Bước 1: Khảo sát Mã Nguồn & Chống Trùng Lặp Giao Diện
- Trước khi code, phải rà soát:
  - Component này đã có trong `src/components/common/` chưa? (Ví dụ: `Button`, `Modal`, `Alert`, `SearchBar`, `Input`...).
  - Service này đã có trong `src/services/` chưa?
  - Màn hình này đã có khung sườn tại `src/pages/` chưa?
- **Nguyên tắc**: Tái sử dụng tối đa những gì đã có, tuyệt đối không tạo thêm component tương tự gây rác mã nguồn.

---

### Bước 2: Đề xuất Route & API Endpoint trong Plan và Chờ Duyệt
- **Bắt buộc**: Trước khi khai báo, phải liệt kê rõ trong `implementation_plan.md`:
  - Endpoint API dự kiến: file `endpoints/{domain}.endpoints.ts` và URL cụ thể.
  - Route dự kiến: file `routes/{module}.routes.ts` và Path cụ thể.
- **CHỈ TIẾN HÀNH KHAI BÁO KHI NGƯỜI DÙNG ĐÃ PHÊ DUYỆT PLAN.**

---

### Bước 3: Khai báo vào Cấu Trúc Module Domain-Driven
- **Khai báo Endpoints**:
  ```typescript
  // src/constants/endpoints/evaluation.endpoints.ts
  export const EVALUATION_ENDPOINTS = {
    BASE: '/api/evaluations',
    BY_INTERN: (internId: string | number) => `/api/evaluations/intern/${internId}`,
  } as const;

  // src/constants/endpoints/index.ts (re-export tập trung)
  import { EVALUATION_ENDPOINTS } from './evaluation.endpoints';
  export const API_ENDPOINTS = {
    // ...
    EVALUATIONS: EVALUATION_ENDPOINTS,
  } as const;
  ```
- **Khai báo Routes**:
  ```typescript
  // src/constants/routes/mentor.routes.ts
  export const MENTOR_ROUTES = {
    DASHBOARD: '/mentor/dashboard',
    EVALUATIONS: '/mentor/evaluations',
  } as const;

  // src/constants/routes/index.ts (re-export tập trung)
  import { MENTOR_ROUTES } from './mentor.routes';
  export const ROUTES = {
    // ...
    MENTOR: MENTOR_ROUTES,
  } as const;
  ```

---

### Bước 4: Định nghĩa Kiểu Dữ Liệu Theo Domain (TypeScript Types)
- Vị trí: `src/types/{domain}.types.ts`
  ```typescript
  // src/types/evaluation.types.ts
  export interface InternEvaluation {
    id: string;
    internId: string;
    score: number;
    feedback: string;
    createdAt: string;
  }
  ```
- Đăng ký re-export trong `src/types/index.ts` để các file khác import thuận tiện:
  ```typescript
  // src/types/index.ts
  export * from './common.types';
  export * from './auth.types';
  export * from './intern.types';
  export * from './evaluation.types';
  ```

---

### Bước 5: Xây dựng Service API & Custom Hook (Quy Chuẩn Phân Trang)
- **Quy chuẩn phân trang 0-indexed vs 1-indexed**:
  - UI làm việc với `page = 1, 2, 3...`.
  - Khi gửi request lên Backend Spring Boot, tự động trừ 1: `params.page = pageUI - 1`.
  - Khi nhận response từ Backend, cộng 1 để hiển thị: `currentPage = response.currentPage + 1`.
- Service: Luôn hỗ trợ `signal?: AbortSignal`, trả về Promise có kiểu rõ ràng, không fallback mock data trong `catch`.
- Custom Hook: Quản lý 4 trạng thái (`data`, `isLoading`, `error`, `refetch`) và tự kích hoạt `AbortController`.

---

### Bước 6: Xây dựng Giao Diện UI, Formatters & Xử Lý Mutation UX
- Vị trí: `src/pages/{role}/{FeatureName}.tsx`
- Giới hạn tối đa 3-4 states, sử dụng component dùng chung từ `src/components/common/`.
- **Định dạng dữ liệu hiển thị**: Toàn bộ ngày tháng, số tiền, điểm số phải dùng hàm format từ `src/utils/formatters.ts` (ví dụ: `formatDate(intern.createdAt)`).
- **Hiển thị lỗi Form Validation**: Các ô nhập liệu (`Input`, `Select`) bắt buộc nhận prop `error?: string` để hiển thị dòng chữ đỏ dưới ô input tương ứng khi backend trả về `fieldErrors`.
- **Quy chuẩn phản hồi Mutation Actions (Thêm / Sửa / Xóa)**:
  + Khi thành công: Hiện thông báo Toast/Alert thành công ➔ Đóng Modal ➔ Gọi `refetch()` làm mới bảng.
  + Khi thất bại: Hiện thông báo lỗi ➔ **Giữ nguyên Modal và dữ liệu đã nhập** để người dùng sửa đổi, cấm đóng modal làm mất dữ liệu.

---

### Bước 7: Kiểm Thử Với Dữ Liệu Thực Tế & Bàn Giao
- **Yêu cầu người dùng cung cấp thông tin**: Nếu cần tài khoản (Admin, HR, Mentor, Intern) hoặc dữ liệu cụ thể để test, Agent chủ động hỏi người dùng.
- **Nghiêm cấm tự ý commit Git**: Tuyệt đối không tự ý chạy `git commit` hoặc `git push`. Để người dùng kiểm tra diff và tự quyết định commit.
- **Chuẩn hóa Commit khi có yêu cầu**: Khi người dùng yêu cầu Agent hỗ trợ commit hoặc soạn commit message, bắt buộc tuân theo chuẩn **Conventional Commits**: `<type>(<scope>): <mô tả>` (ví dụ: `feat(hr-interns): add filter by status`).

---

## 2. Hướng Dẫn Xây Dựng UI Component Dùng Chung (Common UI Component)

Khi phát triển một component dùng chung mới (Button, Modal, Alert, SearchBar, Input, Select...):

1. **Cấu trúc thư mục độc lập**:
   Tạo thư mục riêng trong `src/components/common/[ComponentName]/`:
   ```text
   src/components/common/Input/
   ├── Input.tsx             # Logic hiển thị, JSX, hỗ trợ prop error
   ├── Input.types.ts        # Định nghĩa Interface Props riêng biệt
   └── Input.module.css      # CSS Modules chuyên biệt được băm class tự động
   ```
2. **Quy tắc thiết kế Presentational Component**:
   - Component nhận toàn bộ dữ liệu, cờ trạng thái (`isOpen`, `isLoading`, `error`) và sự kiện (`onClick`, `onClose`, `onChange`) qua `props`.
   - File `.types.ts` phải mô tả rõ ràng kiểu của từng prop và đánh dấu optional `?` hợp lý.
   - Không được phép gắn logic gọi API hay logic nghiệp vụ trực tiếp vào component dùng chung.

---

## 3. Quy Trình Chuẩn Tái Cấu Trúc Mã Nguồn (Refactoring Lifecycle - 6 Bước)

Khi tiến hành tái cấu trúc một màn hình lớn (God File > 300 dòng) hoặc chuẩn hóa lại kiến trúc dự án, Agent bắt buộc phải tuân theo chu trình 6 bước sau nhằm bảo đảm **Nguyên tắc Bảo Toàn Hành Vi (Behavior Preservation)**:

```text
[Bước 1: Khảo sát & Snapshot hành vi màn hình hiện tại]
                        ↓
[Bước 2: Lập Implementation Plan phân rã & ánh xạ file]
                        ↓
[Bước 3: Chuẩn hóa hạ tầng Types, Constants, Formatters]
                        ↓
[Bước 4: Chiết xuất Common Components & Custom Hooks]
                        ↓
[Bước 5: Ráp nối lại Container Page theo chuẩn 4 lớp]
                        ↓
[Bước 6: Kiểm thử hồi quy (Lint, Type-check, Manual Checklist)]
```

### Bước 1: Khảo sát & Snapshot Hành Vi (Behavior Baseline)
- Ghi nhận toàn bộ tính năng đang chạy: Các button, modal đóng/mở thế nào, filter hoạt động ra sao, API nào đang được gọi.
- Xác định rõ: Tái cấu trúc chỉ thay đổi cấu trúc mã nguồn bên trong, **tuyệt đối không làm thay đổi giao diện hoặc luồng nghiệp vụ của người dùng**.

### Bước 2: Lập Implementation Plan Phân Rã & Ánh Xạ File
- Liệt kê danh sách các file con sẽ được sinh ra từ file lớn theo chuẩn **Standard Page Composition**:
  - `Header`: nút bấm, breadcrumbs.
  - `Metrics`: thẻ thống kê.
  - `Table`: hiển thị dữ liệu và phân trang.
  - `Modals`: popup thao tác.
  - `Hook`: quản lý logic fetching và state.
- Trình người dùng phê duyệt trước khi code.

### Bước 3: Chuẩn Hóa Hạ Tầng Nền Tảng Trước
- Đưa các Endpoints vào `src/constants/endpoints/`.
- Đưa Routes vào `src/constants/routes/`.
- Tách Types vào `src/types/{domain}.types.ts`.
- Đưa các hàm format ngày/tháng/tiền tệ vào `src/utils/formatters.ts`.

### Bước 4: Chiết Xuất Presentation Components & Custom Hooks
- Chuyển logic gọi API và state sang Custom Hook riêng trong `src/hooks/`.
- Chuyển từng phần giao diện JSX sang Sub-components con.
- Chuyển CSS sang `[ComponentName].module.css` để cô lập hoàn toàn style.

### Bước 5: Ráp Nối Lại Container Page (Single Source of Truth)
- Container Page cấp cao nhất import Custom Hook và điều phối data xuống các component con qua props.
- Bảo đảm Container Page chỉ giữ từ **3 đến 4 state cục bộ**.

### Bước 6: Kiểm Thử Hồi Quy & Báo Cáo
- Chạy `npm run lint` và `npm run build` để kiểm tra type safety.
- Mở giao diện kiểm tra chéo với dữ liệu thật trong Database (hoặc báo cáo ngay cho người dùng nếu DB gặp lỗi).
- Lập báo cáo hoàn thành `walkthrough.md`.
