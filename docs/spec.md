# InternHub — Design System Specification

> **Tài liệu đặc tả thiết kế cho AI Agent triển khai và refactor Frontend**  
> **Stack**: React / Next.js + Tailwind CSS + shadcn/ui + TanStack Table + TanStack Query + React Hook Form + Zod  
> **Đối tượng**: Admin, HR, Mentor, Thực tập sinh (4 role, quyền khác nhau trên cùng một bộ màn hình)  
> **Phong cách**: Modern SaaS Admin — sáng, sạch, table-first, mật độ thông tin cao nhưng dễ quét

---

## 0. Nguyên tắc tổng quát cho Agent khi code

- **Token màu & kích thước**: Mọi màu sắc, spacing, radius phải lấy từ token ở mục 1, không hard-code hex/px tùy tiện trong component.
- **Trạng thái tập trung**: Mọi trạng thái dữ liệu (status) phải đi qua `statusConfig` tập trung (mục 6), không viết điều kiện màu rải rác trong JSX.
- **5 State bắt buộc của Table**: Mọi bảng dữ liệu phải có đủ 5 state:
  1. `loading` (skeleton)
  2. `empty` (hệ thống chưa có dữ liệu)
  3. `error`
  4. `success` (có dữ liệu)
  5. `filtered_empty` (đang filter mà rỗng — khác empty state gốc)
- **Thao tác ghi an toàn**: Mọi thao tác ghi (create/update/delete) phải có:
  - Validate client (Zod) → optimistic hoặc pending state → toast kết quả → rollback nếu lỗi.
- **Phân quyền UX & Bảo mật**: UI phải tự ẩn/hiện hành động theo role hiện tại — không dựa vào việc "người dùng sẽ không bấm vào" để đảm bảo an toàn quyền hạn; ẩn ở UI là UX, chặn ở API là bảo mật thật, cả hai đều phải có.

---

## 1. Visual Language (Ngôn ngữ thị giác)

### 1.1 Color Tokens
Định nghĩa dưới dạng CSS variable, ánh xạ sang Tailwind qua cấu hình (`colors: { bg: 'var(--bg)', ... }`).

| Token | Light | Dark | Dùng cho |
| :--- | :--- | :--- | :--- |
| `--bg` | `#F6F7FA` | `#0E1015` | Nền toàn app |
| `--surface` | `#FFFFFF` | `#171A21` | Card, table, dialog |
| `--surface-2` | `#FAFBFC` | `#1D2028` | Header bảng, filter bar, hover row |
| `--border` | `#E7E9EF` | `#2A2E38` | Viền card, divider chính |
| `--border-soft` | `#F0F1F5` | `#22252D` | Divider phụ, row separator |
| `--text-1` | `#12141C` | `#EEF0F4` | Tiêu đề, text chính |
| `--text-2` | `#5B6072` | `#9BA0AF` | Text phụ, label |
| `--text-3` | `#9599A8` | `#686E7E` | Placeholder, meta, timestamp |
| `--primary` | `#4F46E5` | `#8B85FF` | CTA chính, active state, link |
| `--primary-soft` | `#EEF0FF` | `#232244` | Nền active nav, badge nhấn |
| `--success` / `--success-soft` | `#0E9F6E` / `#E8F9F1` | `#3CCB93` / `#123527` | Đang thực tập (`INTERNING`) / Tích cực |
| `--warning` / `--warning-soft` | `#D97706` / `#FEF6E7` | `#F0A93C` / `#3A2A0D` | Chờ duyệt (`PENDING`), cần chú ý |
| `--sky` / `--sky-soft` | `#0284C7` / `#E0F2FE` | `#38BDF8` / `#0C4A6E` | Đã tiếp nhận hồ sơ (`APPROVED`), chờ gán Mentor |
| `--danger` / `--danger-soft` | `#E1493F` / `#FCEAE9` | `#F17069` / `#3B1C1A` | Chấm dứt sớm (`TERMINATED`), lỗi, xoá |
| `--info` / `--info-soft` | `#7C5CFC` / `#F1EDFF` | `#A996FF` / `#2A2245` | Hoàn thành chu kỳ (`COMPLETED`), thông tin |
| `--neutral` / `--neutral-soft` | `#4B5563` / `#F3F4F6` | `#9CA3AF` / `#1F2937` | Tạm dừng (`ON_HOLD`), bảo lưu thực tập |

> **Nguyên tắc dùng màu**: `primary` chỉ dùng cho hành động/điều hướng, **KHÔNG** dùng `primary` để biểu diễn status "tích cực" (tránh nhầm với `success`). Mỗi status chỉ có đúng 1 cặp màu (solid + soft), không tự phối màu mới. Status `REJECTED` (không tiếp nhận hồ sơ) sử dụng màu trung tính dịu nhẹ `--text-2` trên nền `--surface-2` (border `--border`) để phân biệt rành mạch với vi phạm kỷ luật `--danger` (`TERMINATED`).

### 1.2 Typography
- **Font chính**: Inter (UI text toàn bộ).
- **Font phụ**: Manrope (weight 700–800) chỉ dùng cho H1/H2 cấp trang và số liệu lớn trong KPI card — tạo phân tầng thị giác mà không phá vỡ tính "phần mềm nghiêm túc".

**Type scale**:
| Cấp | Size / Line-height | Weight | Dùng cho |
| :--- | :--- | :--- | :--- |
| **Display** | 22px / 28px | 800 (Manrope) | Tiêu đề trang (H1) |
| **Title** | 15–16px / 22px | 700 | Tiêu đề card, dialog |
| **Body** | 13–14px / 20px | 400–500 | Nội dung chính, bảng |
| **Label** | 12px / 16px | 600 | Label field, header cột, badge |
| **Caption** | 12px / 16px | 400 | Meta, timestamp, helper text |

- **Line length**: Nội dung mô tả (ghi chú, note): tối đa ~80 ký tự/dòng.

### 1.3 Spacing, Radius, Shadow
- **Spacing scale**: Bội số 4px (4, 8, 12, 16, 20, 24, 32, 40).
- **Padding card**: Mặc định 20px (desktop), 16px (mobile).
- **Radius**: 8px cho input/button nhỏ, 12px cho card/dialog, 999px cho badge/pill/avatar.
- **Shadow** (chỉ 2 cấp):
  - `--shadow-card`: Rất nhẹ, dùng cho card/table tĩnh.
  - `--shadow-pop`: Rõ hơn, chỉ dùng cho lớp nổi (dropdown, dialog, popover).

### 1.4 Iconography & Avatar
- **Icon set**: Lucide (outline, stroke-width 2). Không trộn icon filled và outline trong cùng 1 màn.
- **Avatar**: Ảnh thật nếu có, fallback là avatar generative theo tên (nhất quán 1 seed = 1 người) — không dùng chữ cái đơn thuần trừ khi không có network.

---

## 2. App Shell

### 2.1 Cấu trúc Layout
```text
┌────────────┬──────────────────────────────────────────┐
│            │  Topbar (search · role switcher(*) · bell │
│  Sidebar   │  · avatar)                                │
│  236px     ├──────────────────────────────────────────┤
│  fixed     │  Role/context banner (khi cần)            │
│            ├──────────────────────────────────────────┤
│            │  Main content (scrollable, padding 24px)  │
└────────────┴──────────────────────────────────────────┘
```
*(*) role switcher chỉ tồn tại ở môi trường demo/QA — sản phẩm thật xác định role qua tài khoản đăng nhập, không cho người dùng tự chuyển.*

### 2.2 Sidebar
- Rộng cố định **236px** desktop; sụp thành icon-rail **64px** ở tablet, ẩn hoàn toàn sau hamburger ở mobile (<768px) — không bao giờ overlay đè content bằng cách thu nhỏ nội dung chính.
- Nav item theo role lấy từ 1 config map `role → NavItem[]` duy nhất (xem mục 10.3), không hard-code nav theo từng page.
- Item active: nền `--primary-soft`, chữ `--primary`, font-weight 600.
- Khối user ở đáy sidebar: avatar + tên + role label, click mở menu (Hồ sơ, Đổi mật khẩu, Đăng xuất).

### 2.3 Topbar
- Search bar toàn cục bên trái (debounce 300ms, tìm theo tên/email/mentor — không phải filter bảng, đây là quick jump).
- Bên phải: notification bell (có dot đỏ khi có việc chưa đọc), avatar user.
- Topbar sticky, z-index cao hơn nội dung nhưng thấp hơn dialog/toast.

### 2.4 Breakpoints
| Breakpoint | Range | Hành vi |
| :--- | :--- | :--- |
| **Desktop** | ≥1280px | Sidebar đầy đủ, bảng hiển thị full cột |
| **Laptop** | 1024–1279px | Sidebar đầy đủ, bảng ẩn bớt cột phụ (Trường/Chuyên ngành → tooltip) |
| **Tablet** | 768–1023px | Sidebar icon-rail, bảng scroll ngang |
| **Mobile** | <768px | Sidebar off-canvas, bảng chuyển thành list card (xem 4.5) |

---

## 3. Dashboard

Dashboard là màn hình tổng quan theo role, không phải nơi thao tác sâu — mọi số liệu đều click-through ra màn chi tiết tương ứng (Intern List đã filter sẵn), không hiển thị số liệu "chết".

### 3.1 Bố cục
- **KPI row (4 card)**: Tổng thực tập sinh, Đang thực tập, Chờ duyệt, Hoàn thành — mỗi card click → Intern List với filter status tương ứng đã áp sẵn.
- **Biểu đồ xu hướng (2/3 width)**: Số lượng intern theo tuần/tháng, theo đợt.
- **Việc cần xử lý (1/3 width, ưu tiên UX cao nhất)**: Danh sách action đang chờ — hồ sơ chờ duyệt, đánh giá quá hạn, tài liệu thiếu. Biến dashboard thành nơi bắt đầu công việc mỗi sáng của HR/Admin.
- **Hoạt động gần đây**: Activity feed toàn hệ thống dạng timeline rút gọn.

### 3.2 Khác biệt theo Role
- **Admin / HR**: Đầy đủ 4 khối trên, phạm vi toàn hệ thống.
- **Mentor**: KPI đổi thành "Intern của tôi / Nhiệm vụ đã giao / Chờ tôi đánh giá"; không có biểu đồ toàn hệ thống.
- **Thực tập sinh**: Dashboard thay bằng "Trang của tôi" — tiến độ cá nhân, nhiệm vụ sắp đến hạn, thông báo từ mentor. Không thấy số liệu người khác.

---

## 4. Intern List — Màn hình trọng tâm UX

### 4.1 Nguyên tắc thiết kế bảng
- **Density trước, decoration sau**: Hàng cao 44–48px, đủ để quét nhanh 15–20 dòng/màn hình mà không cảm giác chật.
- **Thứ tự cột trái → phải**:
  `Người (ai)` → `Học vấn (bối cảnh)` → `Mentor / Phòng ban (quan hệ)` → `Thời gian` → `Tiến độ` → `Trạng thái` → `Hành động`.
  *(Không sắp xếp cột theo thứ tự tạo ra trong DB)*.
- **Vị trí Trạng thái & Tiến độ**: Luôn ở gần cuối, ngay trước Hành động — 2 cột quét mắt ra quyết định.
- **Sticky**: Header cột sticky khi scroll dọc; cột đầu tiên (tên) có thể sticky khi scroll ngang trên laptop/tablet.

### 4.2 Bulk Actions
- Chọn ≥1 checkbox → thanh hành động nổi lên phía trên bảng (thay chỗ filter bar, không cộng thêm chiều cao layout): Gửi email, Đổi trạng thái, Xuất Excel, Xoá (nếu Admin).
- Chọn "tất cả trên trang" phải có gợi ý phụ: *"Chọn toàn bộ N kết quả phù hợp filter"* — tránh nhầm giữa "trang hiện tại" và "toàn bộ danh sách đã lọc".

### 4.3 Row Interaction
- Click vào hàng (ngoài checkbox/menu) → mở Intern Detail. Toàn hàng là target bấm được.
- Hover: Đổi nền `--surface-2`, không đổi shadow/scale (tránh giật layout).
- Menu ⋮ cuối hàng: Hành động nhanh không cần rời trang (Xem hồ sơ, Nhắn tin, Đổi mentor, Xoá) — lọc theo quyền role.

### 4.4 5 States của Bảng
| State | Thiết kế |
| :--- | :--- |
| **Loading** | Skeleton row (không spinner toàn trang) — giữ layout bảng, tránh giật khi data về |
| **Có dữ liệu** | Render bảng chuẩn theo thứ tự cột |
| **Rỗng gốc (chưa có intern nào)** | Illustration nhẹ + CTA "Thêm thực tập sinh đầu tiên" |
| **Rỗng do filter** | Text "Không có kết quả phù hợp" + nút "Xoá bộ lọc" — khác hẳn empty gốc |
| **Lỗi tải dữ liệu** | Inline banner trong vùng bảng + nút Thử lại, không thay cả trang bằng error page |

### 4.5 Responsive: Bảng → List Card
Dưới 768px, bảng chuyển thành danh sách card dọc: avatar + tên trên cùng, badge trạng thái góc phải, 2 dòng meta (mentor · phòng ban, tiến độ).

### 4.6 Hiệu năng
- Dùng **TanStack Table** với server-side pagination + sorting + filtering (không load hết rồi filter client khi >500 dòng).
- Virtualization (`@tanstack/react-virtual`) nếu client-side render >200 dòng trong 1 trang.

---

## 5. Filter UX

### 5.1 Hai tầng filter, không gộp chung
- **Quick filter (chip trạng thái)**: Nằm ngay trong filter bar, 1 click, dùng hàng ngày (Tất cả / Đang thực tập / Chờ duyệt / Hoàn thành / Từ chối). Luôn hiển thị.
- **Advanced filter (drawer bên phải, không phải dialog giữa màn hình)**: Các điều kiện ít dùng hơn: phòng ban, mentor, đợt thực tập, khoảng ngày, trường. Nút "Lọc thêm" có badge số lượng filter đang bật.

### 5.2 Nguyên tắc
- Mọi filter đang áp dụng phải hiện thành chip có thể xoá từng cái ngay dưới filter bar khi advanced filter đang mở.
- **Search + filter + sort + page** đồng bộ vào URL query params (để copy link gửi đồng nghiệp, back/forward chuẩn, refresh không mất filter).
- Kết quả filter cập nhật đếm số dòng ngay trong tiêu đề khu vực bảng (*"86 kết quả"*).
- Có nút *"Lưu bộ lọc này"* cho HR (saved view).

### 5.3 Search Field
- Debounce 300ms, hiển thị spinner nhỏ trong ô search khi đang gọi API.
- Search rỗng ký tự đầu tiên không gọi API.

---

## 6. Status System

### 6.1 Danh sách trạng thái chính thức (Khớp 100% Backend & Frontend)
| Status key (DB & API) | Label UI | Màu / Token | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `PENDING` | Chờ duyệt | `warning` (`--warning` / `--warning-soft`) | Hồ sơ mới nộp/ứng tuyển, chưa được HR xét duyệt |
| `APPROVED` | Đã duyệt tiếp nhận | `sky` (`--sky` / `--sky-soft`) | Đã duyệt vào chương trình, chờ xếp Mentor hoặc chờ ngày bắt đầu |
| `INTERNING` | Đang thực tập | `success` (`--success` / `--success-soft`) | Đang thực tập chính thức (thỏa mãn điều kiện kép: có Mentor VÀ Program ONGOING) |
| `ON_HOLD` | Tạm dừng | `neutral` (`--neutral` / `--neutral-soft`) | Nghỉ phép dài hạn / tạm ngưng thực tập có lý do (không liên quan cascade hủy program) |
| `COMPLETED` | Hoàn thành | `info` (`--info` / `--info-soft`) | Hoàn thành trọn vẹn chương trình đúng hạn, có đánh giá cuối kỳ |
| `REJECTED` | Không tiếp nhận | `slate` (`--text-2` trên `--surface-2`) | Hồ sơ không đạt yêu cầu ở vòng xét duyệt ban đầu |
| `TERMINATED` | Buộc thôi việc | `danger` (`--danger` / `--danger-soft`) | Chấm dứt kỷ luật / dừng thực tập trước hạn do vi phạm |

> **Lưu ý nghiệp vụ Cascade Hủy Program**: Khi chương trình thực tập bị hủy (CANCELLED), hệ thống **GIỮ NGUYÊN** trạng thái `APPROVED` hoặc `INTERNING` của thực tập sinh và kích hoạt cờ hành động riêng `needs_reassignment = true` kèm lý do để HR điều phối lại — tuyệt đối **KHÔNG** chuyển sang `ON_HOLD`.

### 6.2 Nguyên tắc
- Mỗi status có đúng 1 badge component dùng chung (`<StatusBadge status="INTERNING" />`), tự tra `statusConfig` — **cấm hard-code class màu tại nơi dùng**.
- Badge luôn có **dot + label**, không dùng màu nền đơn thuần không chữ (accessibility).
- Chuyển trạng thái không được sửa trực tiếp trên badge; phải qua hành động rõ ràng (menu hành động hoặc dialog xác nhận) để giữ audit log.

---

## 7. Dialog & Form Patterns

### 7.1 Phân loại & Kích thước
| Loại | Kích thước | Ví dụ |
| :--- | :--- | :--- |
| **Confirm dialog** | Nhỏ (~360–420px), 1 câu hỏi rõ ràng, 2 nút | Xoá hồ sơ, Từ chối đơn |
| **Form dialog ngắn** | Vừa (~480–560px), 1 cột | Đổi mentor, Đổi trạng thái |
| **Form dialog dài** | Lớn (~640–720px) hoặc trang riêng nếu >12 field | Thêm / Sửa thực tập sinh |

> **Quy tắc**: Nếu form có nhóm field logic khác nhau → dùng dialog có tab hoặc section có anchor cuộn, **không dùng multi-step wizard** trừ khi là luồng onboarding lần đầu.

### 7.2 Form Pattern (React Hook Form + Zod)
- Validate `onBlur` cho từng field + validate toàn form khi `submit`.
- Lỗi hiện ngay dưới field bằng `--danger`, kèm icon (không dùng `alert()` / toast cho lỗi field-level).
- Nút submit disable khi đang gửi, đổi label tạm thời (*"Đang lưu…"*).
- Đóng dialog khi đang có thay đổi chưa lưu → confirm phụ *"Huỷ thay đổi?"*.

### 7.3 Vị trí
- Dialog luôn center màn hình, overlay tối `rgba(0,0,0,.4)`, đóng bằng ESC / click ngoài trừ form đang dirty.
- Advanced filter dùng drawer trượt từ phải (tác vụ song song).

---

## 8. Intern Detail

### 8.1 Bố cục
- **Header hồ sơ**: Avatar, tên, badge trạng thái, thông tin liên hệ nhanh, hành động chính — cố định phía trên khi chuyển tab.
- **3 tile chỉ số nhanh**: Điểm đánh giá, nhiệm vụ hoàn thành, chuyên cần — trả lời ngay câu hỏi *"intern này đang ổn không"*.
- **Tabs**: `Tổng quan` / `Nhiệm vụ` / `Đánh giá` / `Tài liệu`.
  - Tab Tổng quan chia 2 cột: cột chính (2/3) chứa thông tin cấu trúc + ghi chú mentor; cột phụ (1/3) chứa tiến độ, kỹ năng, hoạt động gần đây (thông tin liếc nhanh).

### 8.2 Quyền theo Role
- **Admin / HR**: Đầy đủ hành động (Chỉnh sửa, Đổi trạng thái, Xoá), thấy toàn bộ tab.
- **Mentor**: Không có quyền sửa hồ sơ hành chính, nhưng có quyền ghi ở tab `Nhiệm vụ` và `Đánh giá`.
- **Thực tập sinh**: Chỉ xem hồ sơ của mình, không có action quản trị; tab Đánh giá là read-only, tab Nhiệm vụ có thể đánh dấu hoàn thành/nộp bài.

### 8.3 Điều hướng
- Nút *"Quay lại danh sách"* giữ nguyên filter / trang trước đó.
- Deep-link: `/interns/:id?tab=tasks` mở thẳng vào tab tương ứng.

---

## 9. Workflow (Vòng đời thực tập sinh)

```text
[Ứng viên nộp hồ sơ]
         │
         ▼
     Pending ──────── (HR từ chối) ────────► Rejected
         │
    (HR duyệt + phân Mentor)
         │
         ▼
      Active ◄──── (Quay lại thực tập) ────┐
       │   │                               │
       │   └──── (Nghỉ phép/Lý do) ────► OnHold
       │
       ├──── (Hết hạn + Đánh giá cuối kỳ) ──► Completed
       │
       └──── (Chấm dứt sớm + Lý do) ──────► Terminated
```

### 9.1 Trách nhiệm theo giai đoạn
| Giai đoạn | Ai thao tác | UI liên quan |
| :--- | :--- | :--- |
| **Nộp hồ sơ** | Ứng viên | Form ứng tuyển riêng |
| **Duyệt hồ sơ** | HR / Admin | Intern List filter `pending` → Dialog "Duyệt/Từ chối" (bắt buộc chọn Mentor + phòng ban khi duyệt) |
| **Theo dõi quá trình** | Mentor | Intern Detail tab Nhiệm vụ / Đánh giá, ghi chú định kỳ |
| **Đánh giá giữa/cuối kỳ** | Mentor tạo, HR duyệt | Tab Đánh giá (có trạng thái nháp / đã gửi / đã duyệt riêng) |
| **Kết thúc** | HR / Admin | Đổi trạng thái `Completed` / `Terminated` — **bắt buộc kèm lý do nếu Terminated** |

### 9.2 Nguyên tắc Workflow
- Mọi chuyển trạng thái quan trọng (đặc biệt `Rejected` / `Terminated`) đều qua confirm dialog có lý do bắt buộc, và được ghi vào audit log ở tab Hoạt động.
- Trạng thái là kết quả của hành động có chủ đích, không phải field tự do chỉnh sửa trực tiếp trên badge hay trong form chung.
- Notification tự động: `Active` → email chào mừng cho intern + mentor; `Completed` → nhắc HR xuất chứng nhận.

---

## 10. Component Architecture

### 10.1 Cấu trúc thư mục gợi ý
```text
src/
├── components/
│   ├── ui/              # shadcn/ui primitives (Button, Dialog, Badge, Input, Select, Tabs, Drawer…)
│   ├── shared/          # StatusBadge, AvatarWithFallback, EmptyState, DataTable, FilterBar, KpiCard
│   └── layout/          # AppShell, Sidebar, Topbar, RoleBanner
├── features/
│   ├── interns/
│   │   ├── components/  # InternTable, InternFilters, InternDetailHeader, InternFormDialog
│   │   ├── hooks/       # useInterns(), useInternDetail(id), useUpdateInternStatus()
│   │   ├── schema.ts    # Zod schema dùng chung cho form + validate API response
│   │   └── types.ts
│   ├── dashboard/
│   └── auth/            # Role & Permission context
├── lib/
│   ├── permissions.ts   # canEdit(role), canApprove(role), navConfig[role]
│   └── query-client.ts
└── routes/ (hoặc app/)  # Các trang và route guards
```

### 10.2 Nguyên tắc kiến trúc
1. **1 nguồn sự thật cho status**: `statusConfig` trong `features/interns/schema.ts` (export màu, label, transitions hợp lệ).
2. **1 nguồn sự thật cho quyền**: `lib/permissions.ts` export các hàm thuần (`canEditIntern(role)`, `canApprove(role)`...), UI gọi hàm này để ẩn/hiện.
3. **DataTable dùng chung**: Component wrap TanStack Table, nhận columns/data/state từ ngoài, xử lý pagination/sort UI + 5 state.
4. **TanStack Query pattern**: Query key theo pattern `['interns', filters, page]`. `onMutate` cho optimistic update ở thao tác nhẹ, không dùng optimistic cho thao tác yêu cầu lý do/audit.
5. **Form schema nhất quán**: Dùng chung 1 `InternFormSchema` (Zod) cho cả dialog Thêm và Sửa.

### 10.3 Nav & Role Config mẫu
```typescript
// lib/permissions.ts
export type Role = 'admin' | 'hr' | 'mentor' | 'intern';

export const navConfig: Record<Role, NavItem[]> = {
  admin: [...],
  hr: [...],
  mentor: [...],
  intern: [...],
};

export const canEditIntern = (role: Role) => role === 'admin' || role === 'hr';
export const canApprove    = (role: Role) => role === 'admin' || role === 'hr';
export const canEvaluate   = (role: Role) => role === 'mentor';
```

---

## 11. UX Principle quan trọng nhất

> **"Trạng thái và quyền hạn phải luôn nhìn thấy được trước khi hành động được thực hiện — không bao giờ để người dùng đoán."**

1. **Minh bạch quyền hạn**: Người dùng không bao giờ thấy nút hành động mà họ không có quyền thực hiện.
2. **Audit đầy đủ**: Mọi thay đổi trạng thái đều phải rõ ràng: ai đổi, khi nào, vì sao.
3. **Bộ lọc rõ ràng**: Luôn hiển thị chip filter và đếm kết quả, tránh người dùng thao tác nhầm trên tập dữ liệu đã lọc mà không biết.
