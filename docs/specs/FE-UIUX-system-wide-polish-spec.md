# Specification: Nâng Cấp Toàn Diện Giao Diện Frontend, Làm Mịn Visual, Loại Bỏ Khoảng Trắng Thừa & Chuẩn Hóa Bảng Dữ Liệu (Frontend System-Wide UI/UX Refactor & Bespoke Polish Spec)

> **Tài liệu Đặc Tả Kỹ Thuật (Frontend System-Wide Specification)**  
> **Dự án:** [InternHub-Frontend](file:///d:/codegym_final_project/InternHub-Frontend) (React 19, Vite, TypeScript, CSS Modules, Lucide React, Axios client)  
> **Mã Đề Án / Feature:** `FE-UIUX-SYSTEM-POLISH-01`  
> **Trạng thái:** SPECIFICATION DRAFT - PENDING APPROVAL  
> **Lưu trữ tại:** [`FE-UIUX-system-wide-polish-spec.md`](file:///d:/codegym_final_project/InternHub-Frontend/docs/specs/FE-UIUX-system-wide-polish-spec.md)  
> **Mức độ tác động (Change Level):** **L3 - System-Wide Refactor** (Tái cấu trúc và làm mịn toàn bộ bề mặt giao diện, tinh giản khoảng trắng thừa, xóa bỏ rác thị giác icon trong bảng dữ liệu, chuẩn hóa hệ thống Design Tokens và chuyển đổi trạng thái Dark/Light Mode 2 chiều hoàn hảo).  
> **Tiêu chuẩn tuân thủ:** 35 Nguyên tắc bất biến ([`AGENTS.md`](file:///d:/codegym_final_project/InternHub-Frontend/AGENTS.md)), Quy chuẩn UX/UI ([`08-ui-ux-guidelines.md`](file:///d:/codegym_final_project/InternHub-Frontend/.agents/08-ui-ux-guidelines.md)), Kỹ năng Thiết kế Giao diện Độc bản ([`frontend-design`](file:///d:/codegym_final_project/InternHub-Frontend/.agents/skills/frontend-design/SKILL.md)) & Web Interface Guidelines (Vercel Labs / WCAG 2.1 AA).

---

## 0. Nhật Ký Thay Đổi & Giải Trình Kỹ Thuật (Revision History & Change Rationale)

| Phiên bản | Ngày | Người thực hiện | Phạm vi | Loại thay đổi | Lý do & Giải trình kỹ thuật (Rationale) |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **v1.0** | 2026-10-23 | Senior Frontend AI Pair-Programmer | Toàn bộ Frontend | Khảo sát, Kiểm toán & Đặc tả Nâng cấp Toàn diện | **Đặc tả cải tổ toàn diện giao diện Frontend theo yêu cầu người dùng:**<br>1. *Khảo sát & Kiểm toán mã nguồn:* Quét toàn bộ hệ thống layouts, components và 26 bảng dữ liệu. Phát hiện hơn 2,600+ vị trí hardcode mã màu Hex trong CSS Modules làm đứt gãy Dark Mode, lỗi cộng dồn khoảng trắng (negative margin hack giữa Header và MainContent tạo khoảng hở 48px–72px), và hiện tượng "ô nhiễm icon" (Icon Pollution) tràn lan trên từng dòng dữ liệu.<br>2. *Ứng dụng triệt để kỹ năng `frontend-design`:* Chuyển hóa InternHub thành một nền tảng vận hành nhân sự cao cấp (Enterprise Operations Platform). Chống các bẫy mòn AI cliché (không dùng warm cream/terracotta rập khuôn, không dùng SaaS-card kit chia cắt manh mún, loại bỏ hoàn toàn chữ ALL-CAPS ở nhãn bảng, không dùng mũi tên `→` tùy tiện).<br>3. *Chiến dịch "Remove One Accessory" cho Bảng Dữ Liệu:* Bỏ toàn bộ icon thừa trong từng ô dữ liệu (bỏ icon Calendar, Phone, Mail, Building, Users lặp lại vô nghĩa), chuẩn hóa Status Badge với chấm phát sáng (Dot Indicator) tinh tế.<br>4. *Quy chuẩn nhịp thở 8pt Grid:* Tinh gọn khoảng cách lỏng lẻo, cố định App Shell, đảm bảo tỷ lệ vàng 10 dòng/bảng vừa khít màn hình 1080p và tự động ẩn phân trang khi $\le 10$ dòng. |
| **v1.1** | 2026-10-26 | Senior Frontend AI Pair-Programmer | Candidate Workspace & AI Interview | Chuẩn Hóa Phỏng Vấn AI & Nút Mời Phỏng Vấn Lại | **Khắc phục lỗi 404 khi xem điểm ứng viên chưa hoàn thành phỏng vấn:**<br>1. *Chặn gọi API khi chưa hoàn thành:* Kiểm tra điều kiện `session.status === 'COMPLETED'` trước khi gọi `GET .../evaluation` tại `CandidateWorkspaceModal`, `AiInterviewEvaluationTab`, `ProgramWorkspacePage` và `MentorFinalEvaluationTab`, triệt tiêu hoàn toàn lỗi 404 Not Found trong DevTools Network.<br>2. *Chuyển đổi nút ngữ cảnh:* Khi phiên phỏng vấn ở trạng thái `EXPIRED` hoặc `CANCELLED`, nút thao tác tự động chuyển thành **"Mời Phỏng Vấn Lại"** (Re-invite), nút "Xem Phiếu Đánh Giá AI" được thay thế bằng badge thông báo trạng thái thân thiện. |

---

## 1. Tổng Quan Hệ Thống & Bối Cảnh Tái Cấu Trúc (System Context & Scope)

### 1.1. Bối Cảnh Nghiệp Vụ
**InternHub** là nền tảng quản trị vòng đời thực tập sinh toàn diện (Internship Lifecycle Management Platform) dành cho Doanh nghiệp, kết nối 4 nhóm người dùng chính:
- **HR & Quản Trị Viên (Enterprise HR / Admins):** Cần màn hình làm việc có mật độ thông tin cao (High Information Density), quét mắt nhanh hàng trăm hồ sơ, hợp đồng, điểm chuyên cần mà không bị nhiễu thị giác.
- **Cố Vấn Kỹ Thuật (Technical Mentors):** Cần giao diện bảng phân công nhiệm vụ, duyệt đơn nghỉ phép, chấm báo cáo tuần sắc sảo, dứt khoát và tiện dụng.
- **Thực Tập Sinh (Interns):** Cần trải nghiệm mượt mà, chuyên nghiệp, chỉ dẫn rõ ràng (Form & Modal thân thiện, bảng chấm công chuẩn xác).

### 1.2. Mục Tiêu Trọng Tâm Của Đề Án
1. **Làm Mịn Giao Diện (Visual Smoothing & Polish):**
   - Đồng bộ hóa bán kính bo góc (`--radius-md: 10px`, `--radius-lg: 14px`), viền mảnh thanh lịch (`1px solid var(--border-default)`), đổ bóng đa tầng mềm mại.
   - Triệt tiêu hoàn toàn hiện tượng phân mảnh màu sắc, chuyển hóa toàn bộ mã màu Hex cứng sang biến ngữ nghĩa Design Tokens hỗ trợ Dark/Light Mode tự nhiên 100%.
2. **Loại Bỏ Khoảng Trắng Thừa (Tightening Loose Whitespace):**
   - Loại bỏ negative margin hacks giữa `Header` và `mainContent`, giải quyết tình trạng khoảng hở chết (48px - 72px) trên đỉnh trang.
   - Tối ưu hóa padding của các thẻ Card, Table cells và Modal body theo chuẩn nhịp thở **8pt Grid System** (bội số của 4px / 8px).
3. **Loại Bỏ Icon Không Cần Thiết Cho Bảng Dữ Liệu (Icon De-Cluttering):**
   - Loại bỏ các icon minh họa dư thừa lặp đi lặp lại trong tiêu đề cột và từng ô dữ liệu (như icon `Building` cạnh phòng ban, `Mail` cạnh email, `Phone` cạnh số điện thoại, `Calendar` cạnh ngày tháng, `Users` cạnh sĩ số).
   - Thay thế các badge gắn icon rườm rà bằng **Status Badge chấm phát sáng (Dot Indicator)** tối giản, thanh lịch và đạt chuẩn Enterprise UX.
4. **Kiểm Tra & Chuẩn Hóa Mã Nguồn Frontend (Codebase Audit & Clean Code):**
   - Loại bỏ inline styles viết tùy tiện và các class Tailwind lẫn lộn (`text-slate-800`, `text-emerald-700`) gây lỗi màu Dark Mode.
   - Chuẩn hóa Typography: Chuyển toàn bộ tiêu đề cột ALL-CAPS thành Sentence Case, bổ sung `font-tabular` (`tabular-nums`) cho tất cả cột số liệu, ngày tháng, GPA, tiến độ.
   - Đảm bảo 100% tuân thủ 35 Quy tắc bất biến ([`AGENTS.md`](file:///d:/codegym_final_project/InternHub-Frontend/AGENTS.md)).

---

## 2. Khảo Sát Hiện Trạng & Đánh Giá Tái Sử Dụng Mã Nguồn (Rule 16 Compliance)

Thực hiện nghiêm ngặt chỉ thị: *"Đảm bảo sẽ quét dự án, tránh việc tạo thêm code mới không cần thiết, sử dụng tối đa những gì đã có để phát triển"*.

### 2.1. Kết Quả Kiểm Toán Chi Tiết Mã Nguồn Frontend (Audit Findings)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       KẾT QUẢ KIỂM TOÁN HIỆN TRẠNG MÃ NGUỒN                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Tồn tại 2,614+ vị trí hardcode mã màu Hex (#...) trong file .module.css  │
│ 2. Lỗi cấu trúc Layout Header: margin-top: -1.5rem gây khoảng hở chết       │
│ 3. 18/26 bảng dữ liệu bị ô nhiễm icon lặp lại trên từng dòng (Icon Fatigue) │
│ 4. Tiêu đề bảng dùng ALL-CAPS thô cứng vi phạm nguyên tắc typography        │
│ 5. Trộn lẫn class Tailwind tĩnh (text-slate-*, bg-indigo-*) trong JSX       │
│ 6. Phân trang chưa đồng bộ cơ chế tự ẩn khi <= 10 dòng (Rule 32)            │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Bảng Kiểm Toán Hiện Trạng Từng Nhóm Thành Phần:

| Phân hệ / Thành phần | Tệp nguồn khảo sát | Vấn đề phát hiện thực tế | Giải pháp tái cấu trúc |
| :--- | :--- | :--- | :--- |
| **App Shell & Layout** | [`MainLayout.module.css`](file:///d:/codegym_final_project/InternHub-Frontend/src/layouts/MainLayout.module.css)<br>[`Header.module.css`](file:///d:/codegym_final_project/InternHub-Frontend/src/components/layout/Header.module.css)<br>[`Sidebar.module.css`](file:///d:/codegym_final_project/InternHub-Frontend/src/components/layout/Sidebar.module.css) | `Header` dùng hack negative margin (`margin: -1.5rem ...; width: calc(100% + 3rem)`) để lấn át padding của `.mainContent`. Khi các trang con có container thêm padding `1.5rem - 2.5rem`, khoảng hở giữa Header và bảng phình to lên `48px - 72px`. `Sidebar` chứa hàng chục mã màu Hex cứng (`#0b1120`, `#1e293b`, `#94a3b8`). | Tách `Header` ra khỏi luồng `.mainContent` để cố định trọn vẹn ở App Shell, gỡ bỏ hoàn toàn negative margin hack. Đưa toàn bộ màu Sidebar về Design Tokens ngữ nghĩa. |
| **Bảng Quản Lý TTS** | [`HrInternTable.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/components/HrInternTable.tsx)<br>[`HrInternTable.module.css`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/components/HrInternTable.module.css) | Lặp lại hàng loạt icon micro: `<History size={11} />`, `<RefreshCw size={10} />`, `<UserX size={10} />` và dấu bullet `•` cứng; nhúng Tailwind `text-slate-800`, `text-rose-500`; inline styles màu sắc. | Loại bỏ các icon micro thừa ở cột Mentor, dùng link text tối giản hoặc Action Dropdown thanh lịch; chuyển đổi Tailwind sang CSS Module classes. |
| **Bảng Chương Trình Thực Tập** | [`ProgramTable.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/programs/components/ProgramTable.tsx)<br>[`ProgramTable.module.css`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/programs/styles/ProgramTable.module.css) | Lặp lại `<Calendar size={14} />` và `<ArrowRight size={12} />` trên 100% dòng ở cột Thời lượng; lặp lại `<Users size={15} />`, `<Clock size={12} />` ở cột Tiếp nhận; 5 nút icon-only dính liền ở cột Thao tác. | Xóa icon `Calendar`, `ArrowRight` và `Users` trong cell (dùng ký tự gạch nối `–` trang nhã); sắp xếp lại nhóm nút hành động có khoảng thở và tooltip rõ nghĩa. |
| **Bảng Đơn Ứng Tuyển** | [`ApplicationsTab.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/programs/workspace/components/tabs/ApplicationsTab.tsx) | Mỗi dòng chứa tới 7 icon: `<Sparkles>`, `<School>`, `<FileText>`, `<AlertCircle>`, `<GraduationCap>`, `<Calendar>`, `<Sparkles>`. Trộn lẫn `text-slate-700`, `text-emerald-700`. | Cắt bỏ icon trường học, icon lịch, icon file. Thay bằng Badge văn bản có dot indicator (`Trường đối tác`, `Tự do`, `Đã có CV`). |
| **Bảng Quản Trị Mentor** | [`HrMentorManagementPage.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/mentors/HrMentorManagementPage.tsx) | Cột Phòng ban lặp lại `<Building2 size={14} />`; Cột Liên hệ lặp lại `<Mail size={12} />` và `<Phone size={12} />` trên từng hàng dù tiêu đề cột đã giải thích đầy đủ. | Loại bỏ 100% icon `Building2`, `Mail`, `Phone` trong cell; dùng định dạng phân cấp chữ (Tên mentor `font-weight: 600`, Email/Phone ở dòng phụ `var(--text-muted)`). |
| **Bảng Quản Lý Hợp Đồng** | [`HrContractManagementPage.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/contracts/HrContractManagementPage.tsx) | Nút hành động chứa 4-5 icon dính liền; ngày tháng dùng `&rarr;` thô; thiếu `font-tabular` cho số tiền phụ cấp và số hợp đồng. | Bổ sung `font-tabular` cho tiền tệ và số HĐ; dùng ký tự gạch nối typography `–`; tinh gọn thanh nút bấm thao tác. |
| **Bảng Phép & Chuyên Cần** | [`LeaveRequestTable.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/intern/leave/components/LeaveRequestTable/LeaveRequestTable.tsx)<br>[`MentorLeaveApprovalPage.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/mentor/leave/MentorLeaveApprovalPage.tsx)<br>[`InternDiligenceTable.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/attendance-reports/components/InternDiligenceTable/InternDiligenceTable.tsx) | Tiêu đề cột dùng ALL-CAPS thô cứng (`MÃ ĐƠN`, `LOẠI NGHỈ PHÉP`, `THỜI GIAN NGHỈ`, `SỐ CÔNG`); lặp lại icon `ArrowRight` ở cột ngày tháng. | Chuyển toàn bộ `<th>` sang Sentence Case; bỏ icon `ArrowRight` dư thừa; ghim cột Sticky cố định (`Mã TTS` và `Thao tác`). |
| **Bảng Quản Trị Hệ Thống** | [`AdminUserTab.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/admin/components/AdminUserTab.tsx)<br>[`AdminAuditTable.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/admin/components/AdminAuditTable.tsx) | Badge trạng thái chèn icon `<CheckCircle2 size={12} />`, `<XCircle size={12} />` làm phình to chiều cao dòng; tiêu đề bảng `modern-table` bị ép `uppercase`. | Chuyển đổi status badge sang dạng Dot Indicator siêu mảnh, gỡ bỏ ép kiểu `uppercase` trong `.modern-table th`. |
| **Trang Công Khai & Kích Hoạt** | [`OnboardingActivationPage.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/public/OnboardingActivationPage.tsx) | **3 lỗi Oxlint nghiêm trọng:** Khai báo React Hook (`useState`) có điều kiện sau `early return` (`react-hooks/rules-of-hooks`); Inline styles chứa mã màu Hex `#4f46e5`, `#64748b`. | Đưa toàn bộ `useState` lên đầu component trước mọi câu lệnh điều kiện; chuyển đổi toàn bộ inline hex sang CSS Variables và CSS Module chuẩn mực. |

### 2.2. Đánh Giá & Cam Kết Tái Sử Dụng Mã Nguồn Hiện Hữu
- **Tái sử dụng 100% Common Components**:
  - [`Button`](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Button/Button.tsx), [`Input`](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Input/Input.tsx), [`Select`](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Select/Select.tsx), [`Modal`](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Modal/Modal.tsx), [`Pagination`](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Pagination/Pagination.tsx), [`Skeleton`](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Skeleton/Skeleton.tsx), [`Alert`](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Alert/Alert.tsx), [`ErrorBoundary`](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/ErrorBoundary/ErrorBoundary.tsx).
- **Tái sử dụng 100% Utility Formatters**:
  - [`formatDate`, `formatDateTime`, `formatPhoneNumber`, `formatCurrency`, `formatScore`, `getInternStatusLabel`](file:///d:/codegym_final_project/InternHub-Frontend/src/utils/formatters.ts). Tuyệt đối cấm viết lại hàm format thủ công.
- **Tái sử dụng và mở rộng CSS Variables**:
  - Giữ vững toàn bộ token chuẩn trong [`src/index.css`](file:///d:/codegym_final_project/InternHub-Frontend/src/index.css), chỉ bổ sung các utility tokens còn thiếu (`--status-dot-size`, `--table-cell-py`, `--table-cell-px`).
- **Không tạo component mới dư thừa**: Không tạo mới bất kỳ Common Table Component riêng biệt gây xung đột các bảng hiện có, mà nâng cấp đồng bộ lớp CSS `.modern-table` trong `src/index.css` và chuẩn hóa cấu trúc module CSS của từng bảng hiện hành.

---

## 3. Triết Lý Thiết Kế Độc Bản (Bespoke Visual Design theo `frontend-design`)

Áp dụng đầy đủ các chỉ dẫn tinh hoa từ tài liệu [`frontend-design`](file:///d:/codegym_final_project/InternHub-Frontend/.agents/skills/frontend-design/SKILL.md):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 TRIẾT LÝ THIẾT KẾ ĐỘC BẢN CHO INTERNHUB                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Ground in subject matter: Nền tảng quản trị nhân sự thực tập chuyên sâu  │
│ 2. Spend boldness in one place: Trọng tâm thị giác vào Bảng Dữ Liệu Sắc Nét │
│ 3. Cut decorative clutter: Áp dụng lời khuyên Chanel: "Bỏ bớt một phụ kiện" │
│ 4. Anti-Cliché: Không dùng ALL-CAPS, không chia cắt SaaS-card kit manh mún  │
│ 5. Writing in design: Ngôn ngữ dứt khoát, hướng dẫn hành động, không sáo rỗng│
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.1. Định Vị Chủ Đề & Bối Cảnh Nghiệp Vụ (Subject Matter Grounding)
InternHub là công cụ tác nghiệp hàng ngày của các chuyên viên nhân sự (HR Specialist) và Trưởng nhóm công nghệ (Tech Mentor). Người dùng thao tác hàng giờ trên các bảng biểu. Vì vậy:
- **Tính trật tự & điềm tĩnh (Order & Calmness):** Giao diện phải mang lại cảm giác tĩnh lặng, kiểm soát được luồng dữ liệu, không làm mắt bị quá tải.
- **Cấu trúc thị giác mang giá trị thông tin (Visual structure is information):** Đường kẻ viền, sự tương phản đậm nhạt, màu sắc của status dot biểu thị chính xác trạng thái nghiệp vụ chứ không dùng để trang trí vô nghĩa.

### 3.2. Tiêu Điểm Thị Giác Duy Nhất (Spend Boldness in One Place)
Toàn bộ năng lượng thị giác tập trung vào **Bề Mặt Bảng Dữ Liệu Mịn Màng & Sắc Nét (The Sleek Data Workspace)**:
- Nền bảng trắng thuần (`--bg-surface: #ffffff`) trên Light Mode hoặc xanh đen than sâu thẳm (`--bg-card: #131d33`) trên Dark Mode.
- Viền bảng siêu mảnh (`1px solid var(--border-default)`), hàng bảng có hiệu ứng hover đổi màu nền siêu dịu (`rgba(79, 70, 229, 0.02)`), phản hồi tức thì nhưng không giật mắt.
- Toàn bộ các thành phần xung quanh (bộ lọc, thanh tìm kiếm, nút bấm) giữ phong cách tối giản, kỷ luật, nhường trọn vẹn sự chú ý cho dữ liệu.

### 3.3. Bảng Kiểm Soát Chống Các Bẫy Thiết Kế Mặc Định (Anti-Cliché Checklist)
- [x] **Không dùng ALL-CAPS cho nhãn và tiêu đề:** Chuyển 100% tiêu đề cột bảng (`<th>`), badge và nút bấm sang **Sentence Case** (Ví dụ: `Họ và tên`, `Trạng thái hồ sơ`, `Ngày bắt đầu`, không dùng `HỌ VÀ TÊN`, `TRẠNG THÁI`).
- [x] **Xóa bỏ hiện tượng "Ô Nhiễm Icon" (Remove Decorative Clutter):** Áp dụng lời khuyên của Coco Chanel: *"Trước khi rời khỏi nhà, hãy nhìn vào gương và tháo bớt một phụ kiện"*. Xóa bỏ hoàn toàn các icon hiển nhiên (`Calendar`, `Mail`, `Phone`, `Building`) trong các ô bảng.
- [x] **Không chia nhỏ nội dung thành các card manh mún (No SaaS-Card Kit):** Giữ cấu trúc bảng liền khối, ngăn cách hàng bằng đường kẻ viền mảnh tinh tế thay vì chia mỗi hàng thành một chiếc card nhỏ rời rạc.
- [x] **Không dùng ký tự nối vô nghĩa:** Bỏ dấu chấm lửng rải rác (`•`) hoặc dấu gạch ngang phân cách thô, sử dụng khoảng cách flexbox chuẩn (`gap: 0.5rem`).
- [x] **Chữ số không rung lắc (Tabular Numbers):** Bắt buộc `font-variant-numeric: tabular-nums` cho mọi dữ liệu có số (mã TTS, ngày tháng, GPA, tiến độ, tiền tệ).

---

## 4. Bốn Trụ Cột Nâng Cấp Kỹ Thuật Chi Tiết (Detailed Technical Pillars)

### 🏛️ Trụ Cột I: Chuẩn Hóa Nhịp Điệu Không Gian 8pt Grid & Loại Bỏ Khoảng Trắng Thừa

#### 1. Tinh Chỉnh Cấu Trúc Khung Sườn App Shell
- **Hiện trạng lỗi:** `Header` nằm bên trong `.mainContent` nhưng dùng negative margin `-1.5rem` để lấn ra ngoài.
- **Giải pháp chuẩn hóa:**
  1. Cấu trúc lại `MainLayout.tsx`: Đưa `Header` ra ngoài `.mainContent`, nằm ở tầng trên cùng của `.contentWrapper`.
  2. Đặt `Header` có chiều cao cố định **56px – 60px**, ghim `position: sticky; top: 0; z-index: 40;`, có đường viền đáy tinh tế `border-bottom: 1px solid var(--border-default)` và hiệu ứng mờ nền `backdrop-filter: blur(12px)`.
  3. Bỏ toàn bộ các thuộc tính negative margin trong `Header.module.css`.
  4. `.mainContent` giữ khoảng cách padding chuẩn mực: `padding: 1.25rem 1.5rem` trên Desktop, `padding: 1rem 0.75rem` trên Mobile.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ APPSHELL CHUẨN MỰC KHÔNG KHOẢNG HỞ THỪA                                    │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ HEADER CỐ ĐỊNH (Height: 58px | Sticky | 1px border-bottom | Blur)       │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ MAIN CONTENT (Padding: 1.25rem 1.5rem | Max-width: 1440px)              │ │
│ │  ┌───────────────────────────────────────────────────────────────────┐  │ │
│ │  │ Filter Bar / Action Toolbar (Gap: 0.75rem | Margin-bottom: 1rem) │  │ │
│ │  ├───────────────────────────────────────────────────────────────────┤  │ │
│ │  │ Data Table Card (10 Rows Golden Ratio | Auto-hide Pagination)     │  │ │
│ │  └───────────────────────────────────────────────────────────────────┘  │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 2. Quy Chuẩn Khoảng Trống Thở Bảng Dữ Liệu
- **Table Cell Padding:** Quy chuẩn về `padding: 0.625rem 1rem` (10px dọc, 16px ngang). Đảm bảo mỗi dòng có chiều cao lý tưởng **48px – 52px**.
- **Chiều cao tổng thể 10 dòng:** $\approx 500\text{px}$, cộng thêm Header trang và Filter Bar là vừa vặn trọn vẹn trong khung nhìn 1080p, người dùng không cần phải cuộn chuột dài để nhìn thấy hết bảng dữ liệu.

---

### 🛡️ Trụ Cột II: Tối Ưu Bảng Dữ Liệu Doanh Nghiệp & Triệt Tiêu Icon Thừa

#### 1. Chiến Dịch Loại Bỏ Icon Không Cần Thiết (Icon De-Cluttering Protocol)
Áp dụng quy tắc: **"Một icon chỉ được xuất hiện nếu nó cung cấp thông tin hành động hoặc phân biệt ngữ nghĩa mà văn bản không thể truyền tải nhanh hơn"**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      QUY TẮC DỌN DẸP ICON TRONG BẢNG DỮ LIỆU                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ ❌ LOẠI BỎ: Icon trang trí trong cell (Calendar, Mail, Phone, Building...) │
│ ❌ LOẠI BỎ: Icon trong tiêu đề cột (User, Clock, Filter ở thẻ <th>)        │
│ ❌ LOẠI BỎ: Icon trong Status Badge (CheckCircle, XCircle, AlertTriangle)  │
│ --------------------------------------------------------------------------- │
│ ✅ GIỮ LẠI: Status Dot Indicator (Chấm tròn phát sáng 7px)                 │
│ ✅ GIỮ LẠI: Nút hành động đơn lẻ có aria-label (Eye, Edit3, Trash2)        │
│ ✅ GIỮ LẠI: Avatar chữ viết tắt (Initials Circle 32px) nhận diện nhân sự   │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 2. Chuẩn Hóa Status Badge Với Chấm Phát Sáng (Dot Indicator)
Thay vì chèn các icon Lucide làm cồng kềnh badge, chuẩn hóa toàn bộ badge trạng thái:
- Bo tròn hoàn toàn (`border-radius: var(--radius-full)`).
- Chấm tròn phía trước đường kính **6px – 7px**, tự động mang màu trạng thái:
  - `Đang thực tập / Đang hoạt động / Đã duyệt`: Chấm xanh lục (`var(--success)`).
  - `Chờ phê duyệt / Chờ ký kết`: Chấm vàng cam (`var(--warning)`).
  - `Từ chối / Đã thôi việc / Đã khóa`: Chấm đỏ tươi (`var(--danger)`).
  - `Lưu trữ cũ / Tạm hoãn`: Chấm xám dịu (`var(--text-muted)`).

```css
/* Chuẩn CSS Status Badge Dot Indicator */
.statusBadge {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.2rem 0.65rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.25;
  white-space: nowrap;
}

.statusDot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
```

#### 3. Cột Đinh Cố Định (Sticky Columns - Rule 35)
Khi bảng có từ 7 cột trở lên và cần cuộn ngang cục bộ trên màn hình laptop:
- Cột bên trái (`Mã TTS` hoặc `Họ và Tên`): Ghim cố định `position: sticky; left: 0; z-index: 2;`.
- Cột bên phải (`Thao Tác`): Ghim cố định `position: sticky; right: 0; z-index: 2;`.
- Có viền phân tách mờ nhạt chống hiện tượng chữ đè lên nhau khi cuộn.

---

### 💎 Trụ Cột III: Làm Mịn Bề Mặt, Design Tokens & Đẳng Cấp Thẩm Mỹ

#### 1. Triệt Tiêu 2,600+ Mã Màu Hex Cứng (Rule 29 Zero-Hex Compliance)
Thay thế 100% các giá trị màu Hex trong file `.module.css` bằng Design Tokens tương ứng từ `src/index.css`:

| Mã Hex cứng thường gặp | Token thay thế bắt buộc | Ý nghĩa ngữ nghĩa |
| :--- | :--- | :--- |
| `#ffffff`, `#fff` | `var(--bg-surface)` hoặc `var(--bg-card)` | Nền thẻ, bảng, modal |
| `#f8fafc`, `#f1f5f9` | `var(--bg-body)` hoặc `var(--border-subtle)` | Nền ứng dụng, nền header bảng |
| `#0f172a`, `#1e293b` | `var(--text-main)` hoặc `var(--bg-sidebar)` | Chữ chính, nền thanh điều hướng |
| `#475569`, `#334155` | `var(--text-secondary)` | Chữ phụ, nhãn bảng |
| `#94a3b8`, `#64748b` | `var(--text-muted)` | Chú thích mờ, placeholder |
| `#e2e8f0`, `#cbd5e1` | `var(--border-default)` | Đường viền bảng, viền ô nhập |
| `#4f46e5`, `#6366f1` | `var(--primary)` | Màu thương hiệu chính |
| `#10b981`, `#16a34a` | `var(--success)` | Thành công, hoạt động |
| `#f59e0b`, `#d97706` | `var(--warning)` | Cảnh báo, chờ duyệt |
| `#ef4444`, `#dc2626` | `var(--danger)` | Xóa, nguy hiểm, từ chối |

#### 2. Kỹ Thuật Vi Mô Typography & Tabular Numbers
- Toàn bộ các cột dữ liệu số và thời gian được gắn class `.font-tabular`:
  - `font-variant-numeric: tabular-nums;`
  - Giúp các chữ số thẳng hàng tuyệt đối theo trục dọc, triệt tiêu hiện tượng bảng bị giật giật khi nhảy số.
- Các tiêu đề dài trên Modal hoặc Card áp dụng `text-wrap: balance` để chống hiện tượng "chữ mồ côi" (orphan words) rớt dòng lẻ loi.

---

### 🌐 Trụ Cột IV: Form Controls, Focus-Visible Rings & Khả Năng Tiếp Cận

#### 1. Chuẩn Hóa Focus States Bằng `:focus-visible`
- Thay thế hoàn toàn focus mặc định của trình duyệt:
  ```css
  .form-input:focus-visible,
  .form-select:focus-visible,
  .btn:focus-visible {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-glow);
  }
  ```
- Chuột click bình thường không bị hiện viền ring chói mắt, nhưng người dùng duyệt phím `Tab` sẽ thấy viền sáng nổi bật lập tức (WCAG 2.1 AA).

#### 2. Khả Năng Tiếp Cận Toàn Diện (Accessibility - A11y)
- Mọi icon trang trí còn lại được gắn `aria-hidden="true"`.
- 100% nút bấm chỉ có icon (như nút Đóng `X`, nút Xem, nút Sửa, nút Xóa) bắt buộc có `aria-label` mô tả chi tiết đối tượng tác động (Ví dụ: `aria-label="Xem chi tiết hồ sơ Nguyễn Văn A"`).
- Toàn bộ thanh phân trang có `aria-label="Trang trước"`, `aria-label="Trang sau"`, `aria-current="page"`.

---

## 5. Bảng Ánh Xạ Kiểm Toán & Phương Án Cải Tổ Chi Tiết Từng Màn Hình (Table-by-Table Matrix)

Dưới đây là ma trận hành động chi tiết cho toàn bộ các bảng dữ liệu trên hệ thống:

### 5.1. Phân Hệ Quản Trị Nhân Sự (HR Management)

#### 1. Bảng Hồ Sơ Thực Tập Sinh (`HrInternTable.tsx`)
- **Vị trí tệp:** [`src/pages/hr/components/HrInternTable.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/components/HrInternTable.tsx)
- **Hiện trạng icon & khoảng trắng thừa:**
  - Cột Mentor chèn 3 nút bấm nhỏ kèm icon: `<History size={11} />`, `<RefreshCw size={10} />`, `<UserX size={10} />` và các bullet point `•` rườm rà.
  - Lẫn lộn class Tailwind: `text-slate-800`, `text-slate-500`, `text-rose-500`.
- **Hành động tái cấu trúc:**
  - Lược bỏ icon micro trong các nút text của cột Mentor. Giữ nguyên chữ rõ nét: `"Lịch sử"`, `"Đổi"`, `"Thu hồi"`.
  - Thay thế Status Badge bằng dạng Dot Indicator chuẩn.
  - Chuyển toàn bộ class Tailwind sang CSS Module, dùng biến token ngữ nghĩa.
  - Gắn `font-tabular` cho cột Mã TTS và ngày bắt đầu.

#### 2. Bảng Chương Trình Thực Tập (`ProgramTable.tsx`)
- **Vị trí tệp:** [`src/pages/hr/programs/components/ProgramTable.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/programs/components/ProgramTable.tsx)
- **Hiện trạng icon & khoảng trắng thừa:**
  - Cột Thời lượng có icon `<Calendar size={14} />` và `<ArrowRight size={12} />` lặp lại 10/10 dòng.
  - Cột Tiếp nhận có icon `<Users size={15} />`, `<Clock size={12} />` lặp lại 10/10 dòng.
  - Cột Thao tác chứa cụm 5 nút icon dính sát nhau không có khoảng thở.
- **Hành động tái cấu trúc:**
  - Xóa bỏ icon `Calendar` và `ArrowRight` trong ngày tháng (hiển thị dạng: `01/10/2026 – 31/12/2026`).
  - Xóa icon `Users` và `Clock` trong cell tiếp nhận (hiển thị dạng thanh tiến độ tinh tế + văn bản `8 / 10 TTS`).
  - Tách nhóm nút hành động: Gom các thao tác phụ vào Menu hoặc bố trí khoảng cách `gap: 0.5rem` rõ ràng, nút xóa tách biệt.

#### 3. Bảng Duyệt Đơn Ứng Tuyển (`ApplicationsTab.tsx`)
- **Vị trí tệp:** [`src/pages/hr/programs/workspace/components/tabs/ApplicationsTab.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/programs/workspace/components/tabs/ApplicationsTab.tsx)
- **Hiện trạng icon & khoảng trắng thừa:**
  - Mỗi dòng chứa 7 icon nhỏ: `<Sparkles>`, `<School>`, `<FileText>`, `<AlertCircle>`, `<GraduationCap>`, `<Calendar>`.
  - Tiêu đề cột GPA và Ngày nộp thiếu tính cân đối.
- **Hành động tái cấu trúc:**
  - Xóa toàn bộ icon `School`, `FileText`, `AlertCircle`, `GraduationCap`, `Calendar`.
  - Đổi nhãn nguồn ứng viên thành Tag tinh giản: `Trường liên kết` (xanh dương dịu) và `Tự do` (tím nhạt).
  - Cột GPA bổ sung `font-tabular`, căn giữa chuẩn xác.

#### 4. Bảng Thực Tập Sinh Trong Workspace (`InternsTab.tsx`)
- **Vị trí tệp:** [`src/pages/hr/programs/workspace/components/tabs/InternsTab.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/programs/workspace/components/tabs/InternsTab.tsx)
- **Hiện trạng icon & khoảng trắng thừa:**
  - Tương tự `ApplicationsTab`, bị ô nhiễm icon ở nhãn ứng viên tự do / trường liên kết.
- **Hành động tái cấu trúc:**
  - Dọn sạch icon thừa trong cell, chuẩn hóa Avatar tròn 2 ký tự đầu, chuyển đổi nhãn trạng thái sang Dot Indicator.

#### 5. Bảng Danh Sách Mentor (`HrMentorManagementPage.tsx`)
- **Vị trí tệp:** [`src/pages/hr/mentors/HrMentorManagementPage.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/mentors/HrMentorManagementPage.tsx)
- **Hiện trạng icon & khoảng trắng thừa:**
  - Cột Phòng ban lặp lại `<Building2 size={14} />`.
  - Cột Liên hệ lặp lại `<Mail size={12} />` và `<Phone size={12} />`.
- **Hành động tái cấu trúc:**
  - Xóa 100% icon `Building2`, `Mail`, `Phone` trong cell. Bố trí Email và Số điện thoại theo 2 dòng phân cấp chữ rõ ràng.

#### 6. Bảng Quản Lý Hợp Đồng (`HrContractManagementPage.tsx`)
- **Vị trí tệp:** [`src/pages/hr/contracts/HrContractManagementPage.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/contracts/HrContractManagementPage.tsx)
- **Hiện trạng icon & khoảng trắng thừa:**
  - Dùng mũi tên `&rarr;` thô; thiếu `font-tabular` cho số tiền phụ cấp; cụm nút thao tác dính nhau.
- **Hành động tái cấu trúc:**
  - Thay `&rarr;` bằng gạch nối typography `–`, bổ sung `font-tabular` cho tiền tệ, tinh gọn khoảng cách các nút hành động.

#### 7. Bảng Báo Cáo Chuyên Cần (`InternDiligenceTable.tsx`)
- **Vị trí tệp:** [`src/pages/hr/attendance-reports/components/InternDiligenceTable/InternDiligenceTable.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/attendance-reports/components/InternDiligenceTable/InternDiligenceTable.tsx)
- **Hiện trạng icon & khoảng trắng thừa:**
  - Tiêu đề cột dùng `text-transform: uppercase`, padding cell 14px 16px hơi dày.
- **Hành động tái cấu trúc:**
  - Chuyển tiêu đề cột sang Sentence Case, giảm padding cell xuống `10px 14px`, bổ sung `font-tabular` cho toàn bộ cột ngày công, muộn, sớm, tỷ lệ %.

---

### 5.2. Phân Hệ Cố Vấn & Thực Tập Sinh (Mentor & Intern Portals)

#### 8. Bảng Duyệt Phép Của Mentor (`MentorLeaveApprovalPage.tsx`)
- **Vị trí tệp:** [`src/pages/mentor/leave/MentorLeaveApprovalPage.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/mentor/leave/MentorLeaveApprovalPage.tsx)
- **Hiện trạng icon & khoảng trắng thừa:**
  - Tiêu đề cột `<th>` viết hoa toàn bộ: `THỰC TẬP SINH`, `LOẠI NGHỈ PHÉP`, `THỜI GIAN NGHỈ`, `SỐ CÔNG`...
  - Cột thời gian có icon `<ArrowRight size={13} />`.
- **Hành động tái cấu trúc:**
  - Chuyển toàn bộ tiêu đề cột sang Sentence Case (`Thực tập sinh`, `Loại nghỉ phép`, `Thời gian nghỉ`, `Số công`).
  - Xóa icon `ArrowRight`, thay bằng `–`.
  - Đảm bảo thanh phân trang tự ẩn khi $\le 10$ đơn.

#### 9. Bảng Đơn Xin Nghỉ Của Thực Tập Sinh (`LeaveRequestTable.tsx`)
- **Vị trí tệp:** [`src/pages/intern/leave/components/LeaveRequestTable/LeaveRequestTable.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/intern/leave/components/LeaveRequestTable/LeaveRequestTable.tsx)
- **Hiện trạng icon & khoảng trắng thừa:**
  - Tiêu đề cột ALL-CAPS; lặp lại `<ArrowRight size={13} />` trong cell thời gian; padding cell lớn.
- **Hành động tái cấu trúc:**
  - Chuyển `<th>` sang Sentence Case, bỏ icon `ArrowRight`, tối ưu hóa padding cell và card di động.

#### 10. Bảng Lịch Sử Điểm Danh (`AttendanceHistoryTable.tsx`)
- **Vị trí tệp:** [`src/pages/intern/components/Attendance/AttendanceHistoryTable.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/intern/components/Attendance/AttendanceHistoryTable.tsx)
- **Hiện trạng icon & khoảng trắng thừa:**
  - Lặp lại icon đồng hồ và lịch; badge trạng thái chứa icon rườm rà.
- **Hành động tái cấu trúc:**
  - Chuẩn hóa sang Dot Indicator, gắn `font-tabular` cho giờ check-in / check-out.

---

### 5.3. Phân Hệ Quản Trị Hệ Thống (Admin Portal)

#### 11. Bảng Quản Trị Tài Khoản (`AdminUserTab.tsx`)
- **Vị trí tệp:** [`src/pages/admin/components/AdminUserTab.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/admin/components/AdminUserTab.tsx)
- **Hiện trạng icon & khoảng trắng thừa:**
  - Badge trạng thái chèn icon `<CheckCircle2 size={12} />` và `<XCircle size={12} />` làm lệch chiều cao dòng.
- **Hành động tái cấu trúc:**
  - Chuyển sang Dot Indicator tròn 6px, đồng bộ chiều cao dòng `48px`.

#### 12. Bảng Nhật Ký Hoạt Động (`AdminAuditTable.tsx`)
- **Vị trí tệp:** [`src/pages/admin/components/AdminAuditTable.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/admin/components/AdminAuditTable.tsx)
- **Hành động tái cấu trúc:**
  - Bổ sung `font-tabular` cho timestamp, gỡ bỏ `uppercase` trong tiêu đề cột, căn lề trái chuẩn cho payload chi tiết.

---

## 6. Kế Hoạch Triển Khai Theo Giai Đoạn (Execution Phasing & Verification)

Quá trình thực thi chia thành 5 giai đoạn tuần tự, đảm bảo không làm gián đoạn hệ thống và tuân thủ chu trình: **Khảo sát ➔ Triển khai ➔ Kiểm thử ➔ Hoàn thiện**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       LỘ TRÌNH 5 GIAI ĐOẠN THỰC THI                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ Giai đoạn 1: Core Foundation & Global Polish (index.css & Layout App Shell) │
│ Giai đoạn 2: Refactor Phân hệ Quản trị Nhân sự & Tuyển dụng (HR Tables)     │
│ Giai đoạn 3: Refactor Phân hệ Cố vấn & Nhiệm vụ (Mentor Workspace)          │
│ Giai đoạn 4: Refactor Phân hệ Thực tập sinh & Quản trị Hệ thống (Admin)     │
│ Giai đoạn 5: Kiểm toán Mã nguồn, Linting, Typecheck & Nghiệm thu A11y       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Giai Đoạn 1: Nền Tảng Thiết Kế Cốt Lõi & App Shell (`src/index.css` & Layouts)
1. Cập nhật `src/index.css`:
   - Bổ sung token kích thước bảng và status dot:
     - `--table-cell-py: 0.625rem;`
     - `--table-cell-px: 1rem;`
     - `--status-dot-size: 6px;`
   - Cập nhật `.modern-table th`: Bỏ `text-transform: uppercase`, chuyển sang `font-weight: 600`, màu `var(--text-secondary)`, kích thước `0.8125rem`.
   - Cập nhật class `.font-tabular` với `font-variant-numeric: tabular-nums;`.
2. Tái cấu trúc Layout Khung Sườn:
   - Sửa `MainLayout.tsx` & `MainLayout.module.css`: Đưa `Header` ra ngoài `.mainContent`.
   - Xóa bỏ toàn bộ negative margin hacks trong `Header.module.css`.
   - Chuẩn hóa màu sắc trong `Sidebar.module.css` (thay thế 100% mã màu Hex bằng Design Tokens).

### Giai Đoạn 2: Chuẩn Hóa Các Bảng Dữ Liệu Phân Hệ HR
1. Refactor `ProgramTable.tsx` & `ProgramTable.module.css`: Xóa icon Calendar, ArrowRight, Users; chuẩn hóa nhóm nút thao tác.
2. Refactor `HrInternTable.tsx` & `HrInternTable.module.css`: Xóa icon micro thừa, thay Status Badge bằng Dot Indicator, gỡ bỏ Tailwind tĩnh.
3. Refactor `ApplicationsTab.tsx` & `InternsTab.tsx`: Dọn sạch 7 icon lặp lại, chuẩn hóa thẻ nguồn ứng viên và avatar nhân sự.
4. Refactor `HrMentorManagementPage.tsx` & `HrContractManagementPage.tsx`: Xóa icon Building/Mail/Phone, gắn `tabular-nums` cho tiền tệ và số HĐ.
5. Refactor `InternDiligenceTable.tsx`: Tinh gọn padding, chuyển tiêu đề sang Sentence Case.

### Giai Đoạn 3: Chuẩn Hóa Phân Hệ Cố Vấn (Mentor Portal)
1. Refactor `MentorLeaveApprovalPage.tsx`: Chuyển tiêu đề sang Sentence Case, bỏ icon ArrowRight, tự ẩn phân trang khi $\le 10$ đơn.
2. Refactor `MentorDashboard.tsx` & `MentorInternsAndGroupsTab.tsx`: Tinh gọn icon cell, chuẩn hóa bảng tiến độ thực tập sinh.
3. Refactor `QuizReportModal.tsx`: Tinh gọn bảng kết quả thi trắc nghiệm AI.

### Giai Đoạn 4: Chuẩn Hóa Phân Hệ Thực Tập Sinh & Quản Trị Hệ Thống (Intern & Admin)
1. Refactor `LeaveRequestTable.tsx`: Chuyển tiêu đề sang Sentence Case, bỏ icon thừa, làm mịn card di động.
2. Refactor `AttendanceHistoryTable.tsx`: Chuẩn hóa Dot Indicator cho trạng thái vào/ra ca.
3. Refactor `AdminUserTab.tsx`, `AdminAuditTable.tsx`, `AdminBackupTab.tsx`: Xóa icon trong status badge, chuẩn hóa bảng nhật ký kiểm toán.
4. Tinh chỉnh các hộp thoại Modal và Dropdown: Đảm bảo sticky footer và padding chuẩn 8pt grid.

### Giai Đoạn 5: Kiểm Toán Mã Nguồn, Lệnh Lint, Type Check & Nghiệm Thu
1. Chạy kiểm tra tĩnh toàn diện:
   - Lệnh kiểm tra kiểu TypeScript: `npx tsc -b` (đảm bảo 0 lỗi kiểu).
   - Lệnh phân tích mã nguồn: `npm run lint` (oxlint) (đảm bảo 0 warning/lỗi).
2. Kiểm tra trực quan trên trình duyệt (Visual Inspection):
   - Chuyển đổi 2 chiều Dark Mode $\leftrightarrow$ Light Mode trên toàn bộ các trang để đảm bảo 0 lỗi màu sắc hoặc chữ chìm.
   - Kiểm tra điều hướng bàn phím (`Tab`, `Space`, `Enter`, `Escape`) và viền hào quang `:focus-visible`.
   - Kiểm tra khả năng co giãn trên các kích thước màn hình (Desktop 1440p/1080p, Laptop 1280px, Tablet 768px, Mobile 375px).

---

## 7. Ranh Giới An Toàn & Quy Chuẩn Bắt Buộc (Safety Guardrails)

Tuân thủ nghiêm ngặt Trụ cột II trong [`AGENTS.md`](file:///d:/codegym_final_project/InternHub-Frontend/AGENTS.md):

1. **Ranh giới phân hệ cách ly (Boundary Isolation):**
   - Tuyệt đối chỉ can thiệp mã nguồn trong thư mục `InternHub-Frontend/`.
   - Nghiêm cấm mọi hành vi chỉnh sửa hoặc can thiệp vào Backend Spring Boot (`InternHub/`).
2. **Vùng cấm bảo mật tuyệt đối đối với file cấu hình môi trường (.env):**
   - **Tuyệt đối nghiêm cấm** việc mở, xem, đọc (`view_file`, lệnh terminal), sửa (`write_to_file`, `replace_file_content`), hoặc phân tích (`grep_search`) đối với bất kỳ file `.env*` nào của hệ thống.
3. **Bảo toàn hợp đồng API & hành vi hệ thống (Behavior Preservation - Rule 27):**
   - Toàn bộ các API contracts (Endpoints, Axios Services, DTO types, Query params) được giữ nguyên vẹn 100%.
   - Không làm thay đổi logic nghiệp vụ, phân quyền RBAC hoặc quy trình phê duyệt dữ liệu.
4. **Không tự ý commit Git:**
   - Mọi thay đổi đều được lưu lại trên working tree để người dùng tự kiểm tra diff và quyết định commit.

---

## 8. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

- [ ] **Tiêu chí 1 (Khoảng trắng):** Không còn hiện tượng khoảng hở trống 48px–72px trên đỉnh trang. Toàn bộ padding card, modal và table tuân thủ đúng bội số của 8pt Grid (8px, 12px, 16px, 24px).
- [ ] **Tiêu chí 2 (Icon Bảng):** Không còn icon `Building`, `Mail`, `Phone`, `Calendar`, `ArrowRight`, `Users` lặp lại vô nghĩa trong từng ô dữ liệu.
- [ ] **Tiêu chí 3 (Status Badge):** 100% badge trạng thái sử dụng chuẩn Dot Indicator phát sáng 6px, chữ rõ nét, màu sắc ngữ nghĩa.
- [ ] **Tiêu chí 4 (Typography):** 100% tiêu đề bảng dùng Sentence Case (không còn ALL-CAPS). Các cột số liệu, ngày tháng, GPA, tiền tệ sử dụng `font-variant-numeric: tabular-nums`.
- [ ] **Tiêu chí 5 (Zero Hex):** Giảm thiểu tối đa mã màu Hex cứng trong `.module.css`, 100% màu sắc thích ứng mượt mà cả Dark Mode lẫn Light Mode.
- [ ] **Tiêu chí 6 (Phân trang):** Tự động ẩn thanh phân trang khi tổng số bản ghi $\le 10$ hoặc $\le 1$ trang trên toàn bộ các bảng.
- [ ] **Tiêu chí 7 (Clean Code & Quality):** Dự án pass 100% `tsc -b` và `oxlint` không có lỗi.
- [ ] **Tiêu chí 8 (Phỏng vấn AI & Chống 404):** Khi ứng viên chưa thi xong hoặc phiên thi `EXPIRED`/`CANCELLED`, hệ thống không gọi API `/evaluation`, giao diện tự động chuyển nút thành **"Mời Phỏng Vấn Lại"** và hiển thị badge trạng thái thân thiện.

---

## 9. Đặc Tả Xử Lý Ngữ Cảnh Phỏng Vấn AI (AI Interview State & Re-invite Specification)

### 9.1. Ma trận Trạng Thái Phiên Phỏng Vấn AI (Session State Matrix)

| Trạng thái phiên | Ý nghĩa thực tế | Nút thao tác lên lịch | Nút xem kết quả chấm điểm AI | Hành vi gọi API `/evaluation` |
| :--- | :--- | :--- | :--- | :--- |
| **Chưa có phiên** (`null`) | Ứng viên chưa được lên lịch phỏng vấn AI | **"Mời Phỏng Vấn AI"** (Icon `Calendar`) | Không hiển thị | **Không gọi** |
| **`EXPIRED`** | Phiên phỏng vấn đã hết hạn làm bài (ứng viên chưa thi hoặc bỏ dở) | **"Mời Phỏng Vấn Lại"** (Icon `RotateCw` cam) | Thay bằng Badge: `Phiên thi đã hết hạn - Chưa có điểm` | **Chặn tuyệt đối (Không gọi)** |
| **`CANCELLED`** | Phiên phỏng vấn đã bị HR thu hồi/hủy bỏ | **"Mời Phỏng Vấn Lại"** (Icon `RotateCw` cam) | Thay bằng Badge: `Phiên thi đã hủy` | **Chặn tuyệt đối (Không gọi)** |
| **`IN_PROGRESS`** / **`NOT_STARTED`** | Ứng viên đang trong quá trình làm bài hoặc chưa bấm bắt đầu | Nút phụ: Mời lại nếu cần | Thay bằng Badge: `Đang chờ thi / Đang làm bài` | **Chặn tuyệt đối (Không gọi)** |
| **`COMPLETED`** | Ứng viên đã nộp bài, AI Grader Engine đã chấm điểm xong | Nút phụ: Mời lại nếu cần | **"Xem Phiếu Đánh Giá AI"** (Icon `Sparkles` tím) | **Thực hiện gọi API:** `GET .../evaluation` |

### 9.2. Quy Tắc Phòng Thủ Chiều Sâu (Defense-in-Depth Guardrail)
1. **Chặn tại tầng Component trước khi gọi:**
   - Tại `CandidateWorkspaceModal`, `AiInterviewEvaluationTab`, `ProgramWorkspacePage`, `MentorFinalEvaluationTab`: Luôn kiểm tra `session.status === 'COMPLETED'` trước khi kích hoạt `aiInterviewService.getEvaluationDossier(sessionId)`.
2. **Fallback thân thiện tại Drawer:**
   - Nếu có bất kỳ trường hợp nào nhận lỗi HTTP 404 từ máy chủ, `EvaluationDossierDrawer` tự động chuyển đổi thông điệp kỹ thuật thành câu văn tiếng Việt thân thiện:
     *"Phiên phỏng vấn này chưa có kết quả đánh giá (ứng viên chưa hoàn thành bài thi hoặc phiên thi đã hết hạn)."*

