# Implementation Plan: Nâng Cấp Toàn Diện Giao Diện Frontend, Làm Mịn Visual, Loại Bỏ Khoảng Trắng Thừa & Chuẩn Hóa Bảng Dữ Liệu (Frontend System-Wide UI/UX Polish)

> **Mã công việc / Feature:** `FE-UIUX-SYSTEM-POLISH-01`  
> **Tài liệu đặc tả liên kết:** [`FE-UIUX-system-wide-polish-spec.md`](file:///d:/codegym_final_project/InternHub-Frontend/docs/specs/FE-UIUX-system-wide-polish-spec.md)  
> **Phạm vi tác động:** `InternHub-Frontend` (React 19, TypeScript, CSS Modules, Vite)  
> **Mức độ tác động:** **L3 - System-Wide Refactor**  
> **Tiêu chuẩn tuân thủ:** 35 Nguyên tắc bất biến ([`AGENTS.md`](file:///d:/codegym_final_project/InternHub-Frontend/AGENTS.md)), Quy chuẩn UX/UI ([`08-ui-ux-guidelines.md`](file:///d:/codegym_final_project/InternHub-Frontend/.agents/08-ui-ux-guidelines.md)), Kỹ năng Thiết kế Giao diện Độc bản ([`frontend-design`](file:///d:/codegym_final_project/InternHub-Frontend/.agents/skills/frontend-design/SKILL.md)) & Web Interface Guidelines (Vercel Labs / WCAG 2.1 AA).

---

## 1. Khảo Sát Hiện Trạng & Đánh Giá Tái Sử Dụng Mã Nguồn (Mandatory Reuse Audit)

> [!IMPORTANT]
> **Tuân thủ triệt để Quy tắc 16 & Chỉ thị bắt buộc:** *"ĐẢM BẢO SẼ QUÉT DỰ ÁN, TRÁNH VIỆC TẠO THÊM CODE MỚI KHÔNG CẦN THIẾT, SỬ DỤNG TỐI ĐA NHỮNG GÌ ĐÃ CÓ ĐỂ PHÁT TRIỂN"*.

### 1.1. Bảng Khảo Sát Hiện Trạng & Đánh Giá Tái Sử Dụng
| Thành phần giao diện / Mã nguồn | Hiện trạng quét được trong dự án Frontend | Đánh giá & Quyết định tái sử dụng | Lý do kỹ thuật & Giải trình |
| :--- | :--- | :--- | :--- |
| **Common UI Components** | [`Button`](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Button/Button.tsx), [`Input`](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Input/Input.tsx), [`Select`](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Select/Select.tsx), [`Modal`](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Modal/Modal.tsx), [`Pagination`](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Pagination/Pagination.tsx), [`Skeleton`](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Skeleton/Skeleton.tsx), [`Alert`](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Alert/Alert.tsx), [`ErrorBoundary`](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/ErrorBoundary/ErrorBoundary.tsx). | **TÁI SỬ DỤNG 100%** | Giữ nguyên vẹn toàn bộ common components. Tuyệt đối không tạo thêm component bảng hay modal mới làm phân mảnh codebase. |
| **App Shell & Layout** | [`MainLayout.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/layouts/MainLayout.tsx), [`Header.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/components/layout/Header.tsx), [`Sidebar.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/components/layout/Sidebar.tsx). | **TÁI CẤU TRÚC & LÀM MỊN** | Khắc phục triệt để lỗi negative margin hack (`-1.5rem`), chuyển Header cố định ở tầng App Shell để xóa bỏ khoảng hở chết 48px–72px. Thay thế toàn bộ mã Hex tĩnh trong Sidebar bằng token ngữ nghĩa. |
| **Bảng Dữ Liệu Toàn Hệ Thống** | 26 bảng dữ liệu phân bổ trên các trang HR, Mentor, Intern, Admin. | **TÁI CẤU TRÚC VÀ TINH LỌC** | Xóa bỏ rác thị giác (icon lặp lại trong cell); chuẩn hóa Status Badge có chấm phát sáng (Dot Indicator); chuyển đổi tiêu đề ALL-CAPS sang Sentence Case; gắn `tabular-nums`. |
| **Formatters & Helpers** | [`formatDate`, `formatPhoneNumber`, `formatCurrency`, `formatScore`, `getInternStatusLabel`](file:///d:/codegym_final_project/InternHub-Frontend/src/utils/formatters.ts). | **TÁI SỬ DỤNG 100%** | Sử dụng toàn bộ tiện ích format có sẵn tại `src/utils/formatters.ts`. Cấm format thủ công trong JSX. |
| **Design Tokens & Theme** | Hệ thống CSS Variables trong [`src/index.css`](file:///d:/codegym_final_project/InternHub-Frontend/src/index.css). | **MỞ RỘNG & TUÂN THỦ 100%** | Bổ sung các tokens chuẩn cho bảng (`--table-cell-py`, `--table-cell-px`, `--status-dot-size`), triệt tiêu 2,614+ vị trí hardcode Hex trong `.module.css`. |
| **Lỗi Tĩnh Oxlint** | [`OnboardingActivationPage.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/public/OnboardingActivationPage.tsx#L98-L100). | **SỬA LỖI TRIỆT ĐỂ** | Đưa 3 `useState` bị gọi có điều kiện sau `early return` lên đầu component để tuân thủ 100% Rules of Hooks. |

---

## 2. Mục Tiêu & Định Hướng Kỹ Thuật (Objectives & Technical Direction)

1. **Khắc phục khoảng hở chết và làm mịn App Shell:**
   - Cố định Header độ cao 58px tại App Shell, gỡ bỏ hoàn toàn negative margin hack trong `Header.module.css`.
   - Chuẩn hóa padding nội dung: `1.25rem 1.5rem` trên Desktop, `1rem 0.75rem` trên Mobile.
2. **Chiến dịch "Remove One Accessory" xóa bỏ Icon thừa trong Bảng Dữ Liệu:**
   - Xóa icon `Building`, `Mail`, `Phone`, `Calendar`, `ArrowRight`, `Users` lặp lại trên từng dòng của 18 bảng dữ liệu.
   - Chuẩn hóa Status Badge với **Dot Indicator tròn 6px** thanh lịch, màu sắc pastel nhạt.
3. **Làm mịn Typography & Thiết kế theo chuẩn `frontend-design`:**
   - Xóa bỏ kiểu chữ in hoa gắt gỏng `ALL-CAPS` ở tất cả tiêu đề cột bảng (`<th>`).
   - Bổ sung `font-tabular` (`font-variant-numeric: tabular-nums`) cho mã TTS, ngày tháng, GPA, tiến độ, tiền tệ.
   - Hạn chế tối đa các card chia nhỏ manh mún (SaaS-card kit cliché), giữ khối bảng liền mạch với viền mảnh `1px solid var(--border-default)`.
4. **Triệt tiêu 2,614+ mã Hex cứng trong `.module.css` (Rule 29 Zero-Hex):**
   - Đảm bảo thích ứng 2 chiều Dark Mode $\leftrightarrow$ Light Mode hoàn hảo, không lỗi tương phản.
5. **Đảm bảo chất lượng mã nguồn:**
   - Sửa triệt để 3 lỗi Rules of Hooks tại `OnboardingActivationPage.tsx`.
   - Đảm bảo `npx tsc -b` và `npm run lint` (oxlint) đạt 100% không có lỗi.

---

## 3. Danh Sách Tệp Tác Động (Impacted Files)

### 3.1. Foundation, Design Tokens & Layout Shell (Giai đoạn 1):
- `[MODIFY]` [src/index.css](file:///d:/codegym_final_project/InternHub-Frontend/src/index.css): Cập nhật `.modern-table`, token bảng, `font-tabular`.
- `[MODIFY]` [src/layouts/MainLayout.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/layouts/MainLayout.tsx): Tái định vị Header ra khỏi `.mainContent`.
- `[MODIFY]` [src/layouts/MainLayout.module.css](file:///d:/codegym_final_project/InternHub-Frontend/src/layouts/MainLayout.module.css): Tối ưu khoảng thở.
- `[MODIFY]` [src/components/layout/Header.module.css](file:///d:/codegym_final_project/InternHub-Frontend/src/components/layout/Header.module.css): Xóa bỏ negative margin hacks.
- `[MODIFY]` [src/components/layout/Sidebar.module.css](file:///d:/codegym_final_project/InternHub-Frontend/src/components/layout/Sidebar.module.css): Thay thế mã màu Hex cứng bằng token ngữ nghĩa.

### 3.2. Phân Hệ Quản Trị Tuyển Dụng & Nhân Sự HR (Giai đoạn 2):
- `[MODIFY]` [src/pages/hr/programs/components/ProgramTable.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/programs/components/ProgramTable.tsx)
- `[MODIFY]` [src/pages/hr/programs/styles/ProgramTable.module.css](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/programs/styles/ProgramTable.module.css)
- `[MODIFY]` [src/pages/hr/components/HrInternTable.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/components/HrInternTable.tsx)
- `[MODIFY]` [src/pages/hr/components/HrInternTable.module.css](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/components/HrInternTable.module.css)
- `[MODIFY]` [src/pages/hr/programs/workspace/components/tabs/ApplicationsTab.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/programs/workspace/components/tabs/ApplicationsTab.tsx)
- `[MODIFY]` [src/pages/hr/programs/workspace/components/tabs/InternsTab.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/programs/workspace/components/tabs/InternsTab.tsx)
- `[MODIFY]` [src/pages/hr/mentors/HrMentorManagementPage.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/mentors/HrMentorManagementPage.tsx)
- `[MODIFY]` [src/pages/hr/contracts/HrContractManagementPage.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/contracts/HrContractManagementPage.tsx)
- `[MODIFY]` [src/pages/hr/attendance-reports/components/InternDiligenceTable/InternDiligenceTable.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/attendance-reports/components/InternDiligenceTable/InternDiligenceTable.tsx)
- `[MODIFY]` [src/pages/hr/attendance-reports/components/InternDiligenceTable/InternDiligenceTable.module.css](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/attendance-reports/components/InternDiligenceTable/InternDiligenceTable.module.css)

### 3.3. Phân Hệ Cố Vấn (Mentor Portal - Giai đoạn 3):
- `[MODIFY]` [src/pages/mentor/leave/MentorLeaveApprovalPage.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/mentor/leave/MentorLeaveApprovalPage.tsx)
- `[MODIFY]` [src/pages/mentor/leave/MentorLeaveApprovalPage.module.css](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/mentor/leave/MentorLeaveApprovalPage.module.css)
- `[MODIFY]` [src/pages/mentor/MentorDashboard.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/mentor/MentorDashboard.tsx)
- `[MODIFY]` [src/pages/mentor/missions/components/MentorProgramWorkspace/tabs/MentorInternsAndGroupsTab.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/mentor/missions/components/MentorProgramWorkspace/tabs/MentorInternsAndGroupsTab.tsx)

### 3.4. Phân Hệ Thực Tập Sinh & Quản Trị Hệ Thống (Intern & Admin - Giai đoạn 4):
- `[MODIFY]` [src/pages/intern/leave/components/LeaveRequestTable/LeaveRequestTable.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/intern/leave/components/LeaveRequestTable/LeaveRequestTable.tsx)
- `[MODIFY]` [src/pages/intern/leave/components/LeaveRequestTable/LeaveRequestTable.module.css](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/intern/leave/components/LeaveRequestTable/LeaveRequestTable.module.css)
- `[MODIFY]` [src/pages/intern/components/Attendance/AttendanceHistoryTable.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/intern/components/Attendance/AttendanceHistoryTable.tsx)
- `[MODIFY]` [src/pages/admin/components/AdminUserTab.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/admin/components/AdminUserTab.tsx)
- `[MODIFY]` [src/pages/admin/components/AdminAuditTable.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/admin/components/AdminAuditTable.tsx)
- `[MODIFY]` [src/pages/public/OnboardingActivationPage.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/public/OnboardingActivationPage.tsx)

---

## 4. Kế Hoạch Triển Khai Tuần Tự (5 Phased Execution)

### Giai Đoạn 1: Chuẩn Hóa Nền Tảng Thiết Kế Cốt Lõi & App Shell
- **Bước 1.1:** Cập nhật `src/index.css`: Bổ sung tokens cho bảng (`--table-cell-py: 0.625rem`, `--table-cell-px: 1rem`, `--status-dot-size: 6px`); loại bỏ `text-transform: uppercase` ở `.modern-table th`; bổ sung class `.status-dot`.
- **Bước 1.2:** Tái cấu trúc `MainLayout.tsx` & `MainLayout.module.css`: Đưa `Header` ra ngoài `.mainContent`, cố định ở khung nhìn trên cùng của `.contentWrapper`.
- **Bước 1.3:** Dọn dẹp `Header.module.css`: Loại bỏ hoàn toàn negative margin hack (`margin-top: -1.5rem; margin-left: -1.5rem; width: calc(100% + 3rem)`).
- **Bước 1.4:** Tinh chỉnh `Sidebar.module.css`: Chuyển đổi toàn bộ mã Hex tĩnh sang biến token ngữ nghĩa (`var(--bg-sidebar)`, `var(--border-default)`, `var(--text-muted)`).

### Giai Đoạn 2: Tái Cấu Trúc Toàn Bộ Bảng Dữ Liệu Phân Hệ HR
- **Bước 2.1:** Refactor `ProgramTable.tsx` & `ProgramTable.module.css`:
  - Xóa bỏ icon `Calendar`, `ArrowRight` ở cột ngày tháng (dùng định dạng `01/10/2026 – 31/12/2026`).
  - Xóa bỏ icon `Users`, `Clock` ở cột tiếp nhận và đơn chờ.
  - Sắp xếp lại nhóm nút hành động có khoảng cách `gap: 0.5rem`, bổ sung `aria-label`.
- **Bước 2.2:** Refactor `HrInternTable.tsx` & `HrInternTable.module.css`:
  - Xóa các icon micro thừa ở cột Mentor (`<History>`, `<RefreshCw>`, `<UserX>`).
  - Chuyển Status Badge sang Dot Indicator 6px.
  - Chuyển các class Tailwind tĩnh sang CSS Modules, gắn `tabular-nums`.
- **Bước 2.3:** Refactor `ApplicationsTab.tsx` & `InternsTab.tsx`:
  - Dọn sạch 7 icon nhỏ lặp lại trong từng hàng dữ liệu.
  - Thay nhãn nguồn ứng viên bằng Tag văn bản tinh giản.
  - Căn lề số liệu GPA và gắn `font-tabular`.
- **Bước 2.4:** Refactor `HrMentorManagementPage.tsx` & `HrContractManagementPage.tsx`:
  - Xóa icon `Building2`, `Mail`, `Phone` trong cell.
  - Thay `&rarr;` bằng gạch nối typography `–`, gắn `tabular-nums` cho tiền tệ và số HĐ.
- **Bước 2.5:** Refactor `InternDiligenceTable.tsx` & `InternDiligenceTable.module.css`:
  - Chuyển tiêu đề cột `<th>` sang Sentence Case, tinh gọn padding cell xuống `10px 14px`.

### Giai Đoạn 3: Tái Cấu Trúc Bảng Dữ Liệu Phân Hệ Cố Vấn (Mentor Portal)
- **Bước 3.1:** Refactor `MentorLeaveApprovalPage.tsx` & `MentorLeaveApprovalPage.module.css`:
  - Chuyển toàn bộ tiêu đề cột `<th>` từ ALL-CAPS sang Sentence Case.
  - Xóa icon `ArrowRight`, thay bằng gạch nối `–`.
  - Đảm bảo thanh phân trang tự ẩn khi $\le 10$ đơn.
- **Bước 3.2:** Refactor `MentorDashboard.tsx` & `MentorInternsAndGroupsTab.tsx`:
  - Tinh gọn bảng tiến độ thực tập sinh, loại bỏ icon thừa, chuẩn hóa thanh tiến độ.

### Giai Đoạn 4: Tái Cấu Trúc Phân Hệ Thực Tập Sinh, Quản Trị Hệ Thống & Sửa Lỗi Oxlint
- **Bước 4.1:** Refactor `LeaveRequestTable.tsx` & `LeaveRequestTable.module.css`:
  - Chuyển tiêu đề cột `<th>` sang Sentence Case.
  - Xóa icon `ArrowRight`, làm mịn thẻ card di động.
- **Bước 4.2:** Refactor `AttendanceHistoryTable.tsx`:
  - Chuẩn hóa Dot Indicator cho trạng thái vào/ra ca, gắn `tabular-nums` cho giờ chấm công.
- **Bước 4.3:** Refactor `AdminUserTab.tsx` & `AdminAuditTable.tsx`:
  - Chuẩn hóa Status Badge thành Dot Indicator tròn 6px, bỏ icon `CheckCircle2`/`XCircle` trong cell.
- **Bước 4.4:** Sửa triệt để 3 lỗi Rules of Hooks tại `OnboardingActivationPage.tsx`:
  - Đưa toàn bộ `useState` lên đầu component trước `if (loading) return ...`.
  - Chuyển các inline hex styles sang CSS Variables và CSS Module.

### Giai Đoạn 5: Kiểm Toán Mã Nguồn, Kiểm Tra Tĩnh & Nghiệm Thu Toàn Diện
- **Bước 5.1:** Chạy `npx tsc -b` để xác nhận 0 lỗi TypeScript trên toàn bộ dự án.
- **Bước 5.2:** Chạy `npm run lint` (oxlint) để xác nhận 0 lỗi cú pháp và 0 vi phạm Rules of Hooks.
- **Bước 5.3:** Kiểm tra trực quan giao diện Dark Mode $\leftrightarrow$ Light Mode, kiểm tra nhịp thở không gian 8pt Grid, kiểm tra điều hướng bàn phím `:focus-visible`.
- **Bước 5.4:** Tổng kết và lập báo cáo kết quả nghiệm thu (`walkthrough.md`).

---

## 5. Kế Hoạch Kiểm Thử & Tiêu Chí Nghiệm Thu (Acceptance Criteria)

- [ ] **Khoảng trắng thừa:** Không còn khoảng hở chết 48px–72px trên đỉnh trang. Toàn bộ padding/margin tuân thủ hệ thống 8pt Grid (8px, 12px, 16px, 24px).
- [ ] **Icon bảng dữ liệu:** Triệt tiêu hoàn toàn các icon lặp lại hiển nhiên (`Calendar`, `Building`, `Mail`, `Phone`, `ArrowRight`, `Users`) trong cell của 18 bảng dữ liệu.
- [ ] **Status Badges:** 100% badge trạng thái sử dụng dạng Dot Indicator phát sáng 6px, màu sắc ngữ nghĩa rõ ràng.
- [ ] **Typography:** 100% tiêu đề bảng dùng Sentence Case. Toàn bộ cột số liệu, ngày tháng, GPA, tiền tệ sử dụng `font-variant-numeric: tabular-nums`.
- [ ] **Dark / Light Mode:** 100% các thành phần thích ứng mượt mà cả 2 chế độ, không bị chìm chữ hoặc viền sáng bất thường.
- [ ] **Auto-Hide Pagination:** Bảng tự động ẩn thanh phân trang khi tổng số bản ghi $\le 10$ hoặc $\le 1$ trang.
- [ ] **Clean Code & Quality:** `npx tsc -b` và `oxlint` đạt 100% pass không có lỗi.

---

## 6. Ranh Giới An Toàn (Safety Guardrails Compliance)

1. **Ranh giới phân hệ cách ly:** Chỉ can thiệp vào `InternHub-Frontend/`. Tuyệt đối không can thiệp Backend Java (`InternHub/`).
2. **Vùng cấm bảo mật:** Tuyệt đối nghiêm cấm mở, đọc, sửa hay grep bất kỳ file `.env*` nào.
3. **Bảo toàn hành vi nghiệp vụ:** Giữ nguyên 100% API contracts và business logic.
4. **Không tự ý commit Git:** Giữ nguyên thay đổi trên working tree để người dùng review.
