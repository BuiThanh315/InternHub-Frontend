# Walkthrough Tổng Hợp Triển Khai Frontend TM-21: Giao Diện Thực Tập Sinh - Soạn Thảo & Nộp Báo Cáo Tuần

> **Mã Ticket Jira:** [TM-21](https://robluccibn9935.atlassian.net/browse/TM-21)  
> **Tiêu đề Jira:** *Intern - Soạn thảo và nộp báo cáo tuần (Weekly Report Creation & Submission)*  
> **Tài liệu đặc tả (Spec):** [TM-21-intern-weekly-report-ui-spec.md](file:///d:/codegym_final_project/InternHub-Frontend/docs/specs/TM-21-intern-weekly-report-ui-spec.md)  
> **Kế hoạch triển khai (Plan):** [implementation_plan.md](file:///C:/Users/admin/.gemini/antigravity-ide/brain/6f23f4e4-cd13-4ddc-af3e-62b61766f750/implementation_plan.md)  
> **Đặc tả Backend tương ứng:** [TM-21-intern-weekly-report-spec.md](file:///d:/codegym_final_project/InternHub/docs/specs/TM-21-intern-weekly-report-spec.md)  
> **Trạng thái:** ACTIVE / IMPLEMENTED & VERIFIED  
> **Phân hệ phụ trách:** Frontend (`InternHub-Frontend` - React 19, TypeScript, Vite, CSS Modules)  
> **Tuân thủ quy chuẩn:** Tuân thủ 100% [AGENTS.md](file:///d:/codegym_final_project/InternHub-Frontend/AGENTS.md) (34 nguyên tắc bất biến Frontend), tài liệu [08-ui-ux-guidelines.md](file:///d:/codegym_final_project/InternHub-Frontend/.agents/08-ui-ux-guidelines.md) và kỹ năng thiết kế chuyên sâu [Frontend Design](file:///d:/codegym_final_project/InternHub-Frontend/.agents/skills/frontend-design/SKILL.md).

---

## 1. Tổng Quan Nhiệm Vụ & Nghiệp Vụ Cốt Lõi

1. **Tuyên ngôn nghiệp vụ:**
   - **Thực tập sinh (100% TTS Scope):** Sau khi hoàn thành các đầu việc trên bảng Kanban TM-20, TTS truy cập không gian Báo Cáo Tuần để:
     - Quan sát toàn cảnh tiến trình thực tập qua **Trục tiến độ các tuần (Learning Journey Timeline Rail)**.
     - Tự động lấy danh sách công việc đã làm và việc dở dang từ Bảng Kanban TM-20 chỉ bằng 1 cú click chuột.
     - Soạn thảo và đúc kết **4 Trụ Cột Báo Cáo Tuần**: (1) Nhiệm vụ hoàn thành, (2) Nhiệm vụ chưa xong & Lý do chậm trễ, (3) Khó khăn cần Mentor hỗ trợ, (4) Kiến thức và bài học chuyên môn mới.
     - Lưu nháp (`DRAFT`) an toàn và nộp chính thức (`SUBMITTED`) gửi thông báo tức thời tới Mentor.
     - Xem nhận xét và điểm số của Mentor khi đã hoàn tất đánh giá (`REVIEWED`), đồng thời báo cáo tự động khóa cứng (Read-Only) để bảo toàn tính toàn vẹn dữ liệu.
   - **Điều hướng 1 chạm từ Kanban TM-20:** Bổ sung nút bấm `"Báo cáo tuần"` trên thanh công cụ của bảng Kanban cá nhân ([InternMissionPage.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/intern/missions/InternMissionPage.tsx)), cho phép chuyển đổi không gian làm việc mượt mà mà không cần qua nhiều bước menu.

---

## 2. Khảo Sát Hiện Trạng & Báo Cáo Tái Sử Dụng Mã Nguồn (Rule 15)

Tuân thủ nghiêm ngặt chỉ thị: **"ĐẢM BẢO SẼ QUÉT DỰ ÁN, TRÁNH VIỆC TẠO THÊM CODE MỚI KHÔNG CẦN THIẾT, SỬ DỤNG TỐI ĐA NHỮNG GÌ ĐÃ CÓ ĐỂ PHÁT TRIỂN"**.

- **Tái sử dụng 100% thành phần Common UI:**
  - [Modal](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Modal): Chuẩn hóa Modal-First UX cho `SuggestedTasksModal` và `SubmitConfirmationModal`.
  - [Button](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Button): Nút bấm primary, outline, loading spinners và cơ chế khóa double-click.
  - [Skeleton](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Skeleton): Shimmer loading chống giật layout (CLS).
  - [Alert](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Alert): Báo lỗi kèm nút Thử lại, cảnh báo khóa báo cáo.
  - [ErrorBoundary](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/ErrorBoundary): Bao bọc toàn trang chống sập trắng giao diện.
  - [Header](file:///d:/codegym_final_project/InternHub-Frontend/src/components/layout/Header.tsx): Header cấp 1 chuẩn doanh nghiệp.
- **Tái sử dụng 100% Design Tokens & Utility:**
  - CSS Variables từ [index.css](file:///d:/codegym_final_project/InternHub-Frontend/src/index.css) (`var(--bg-body)`, `var(--bg-card)`, `var(--primary)`, `var(--success)`, v.v. - 0 mã màu hex hardcode).
  - Định dạng ngày tháng tập trung qua [formatters.ts](file:///d:/codegym_final_project/InternHub-Frontend/src/utils/formatters.ts) (`formatDate`, `formatDateTime`).
  - Toast thông báo `sonner` chuẩn hóa phản hồi tức thời.

---

## 3. Danh Mục Thành Phần Mã Nguồn Đã Triển Khai

### 3.1. Tuyến Đường, Hằng Số & Kiểu Dữ Liệu
- [intern.endpoints.ts](file:///d:/codegym_final_project/InternHub-Frontend/src/constants/endpoints/intern.endpoints.ts): Bổ sung 6 constant endpoints `MY_WEEKLY_REPORTS_*`.
- [intern.routes.ts](file:///d:/codegym_final_project/InternHub-Frontend/src/constants/routes/intern.routes.ts): Bổ sung `WEEKLY_REPORTS: '/intern/weekly-reports'`.
- [weeklyReport.types.ts](file:///d:/codegym_final_project/InternHub-Frontend/src/types/weeklyReport.types.ts): TypeScript interface khớp 100% DTO Backend.

### 3.2. Dịch Vụ & Custom Hook
- [weeklyReportService.ts](file:///d:/codegym_final_project/InternHub-Frontend/src/services/weeklyReportService.ts): Kiến trúc Axios 4 tầng có hỗ trợ `AbortSignal` chống rò rỉ bộ nhớ.
- [useInternWeeklyReport.ts](file:///d:/codegym_final_project/InternHub-Frontend/src/hooks/useInternWeeklyReport.ts): Custom Hook điều phối Timeline, nạp gợi ý Kanban, lưu nháp, nộp báo cáo và quản lý trạng thái form.

### 3.3. Các Component Giao Diện (CSS Modules Cô Lập Hoàn Toàn)
- [WeeklyTimelineRail.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/intern/reports/components/WeeklyTimelineRail/WeeklyTimelineRail.tsx): Trục thời gian trực quan, hiển thị dot trạng thái (`NOT_SUBMITTED`, `DRAFT`, `SUBMITTED`, `REVIEWED`), highlight tuần hiện tại, huy hiệu điểm số và khoảng ngày.
- [MentorFeedbackShowcase.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/intern/reports/components/MentorFeedbackShowcase/MentorFeedbackShowcase.tsx): Khối vinh danh nhận xét & điểm số của Mentor khi đã công bố đánh giá.
- [ReportPillarEditor.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/intern/reports/components/ReportPillarEditor/ReportPillarEditor.tsx): Khung soạn thảo 4 trụ cột có hiệu ứng viền hào quang khi focus (Rule 30), bộ đếm ký tự, hướng dẫn gợi mở tư duy và chip danh sách nhiệm vụ đính kèm.
- [SuggestedTasksModal.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/intern/reports/components/SuggestedTasksModal/SuggestedTasksModal.tsx): Modal chọn nhanh các công việc từ Kanban TM-20 để tự động chèn vào báo cáo.
- [SubmitConfirmationModal.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/intern/reports/components/SubmitConfirmationModal/SubmitConfirmationModal.tsx): Modal xác nhận nộp chính thức an toàn (Rule 33).
- [InternWeeklyReportPage.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/intern/reports/InternWeeklyReportPage.tsx): Trang chính chuẩn Standard Page Composition 4 lớp.

### 3.4. Tích Hợp Điều Hướng & Routing
- [Sidebar.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/components/layout/Sidebar.tsx): Bổ sung menu item `"Báo Cáo Tuần"` (Icon: `CalendarCheck2`).
- [AppRoutes.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/routes/AppRoutes.tsx): Đăng ký route được bảo vệ bởi `ProtectedRoute` cho role `INTERN`, `USER`, `ADMIN`.
- [InternMissionPage.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/intern/missions/InternMissionPage.tsx): Bổ sung nút bấm `"Báo cáo tuần"` trên action toolbar dẫn thẳng sang trang báo cáo.

---

## 4. Kết Quả Kiểm Thử & Xác Thực Hệ Thống (Verification Results)

| Hạng Mục Kiểm Thử | Lệnh Thực Thi | Kết Quả Thực Tế | Trạng Thái |
| :--- | :--- | :--- | :---: |
| **TypeScript Compilation** | `npx tsc -b` | `The command exited with code 0` (0 lỗi type) | ✅ PASS |
| **Linter Check** | `npx oxlint` | `Found 0 errors. Finished in 438ms on 301 files` | ✅ PASS |
| **Vite Production Build** | `npm run build` | `✓ built in 14.83s` (dist bundle hoàn chỉnh) | ✅ PASS |
| **Boundary Isolation** | `git status` trên `InternHub/` | `0` file Backend bị thay đổi | ✅ PASS |

---

## 5. Bảo Toàn Ranh Giới (Boundary Isolation)
- **Zero Backend Changes (Rule 7):** Tuyệt đối không can thiệp, không sửa đổi bất kỳ tệp Java nào trong `InternHub/` trong suốt quá trình phát triển Frontend.
- **Git Working Tree Sạch Sẽ (Rule 4):** Không tự ý chạy `git commit` hay `git push`. Toàn bộ thay đổi nằm trong working tree để người dùng tự do review diff.
