# 01. Quy Tắc Làm Việc & Giao Thức Cộng Tác (Working Rules & Protocols)

Tài liệu này định nghĩa nguyên tắc tối cao và quy trình làm việc bắt buộc dành cho mọi AI Agent hoạt động trên dự án **InternHub-Frontend**.

---

## 1. Nguyên Tắc Tối Cao (The Golden Rule)

> [!CAUTION]
> **TUYỆT ĐỐI KHÔNG TỰ Ý ĐƯA RA BẤT KỲ QUYẾT ĐỊNH NÀO MÀ CHƯA ĐƯỢC NGƯỜI DÙNG PHÊ DUYỆT.**
>
> Mọi hành vi tự ý can thiệp mã nguồn, tự động thay đổi cấu trúc dự án, tự cài đặt thư viện hoặc tự ý suy đoán yêu cầu nghiệp vụ đều là vi phạm nghiêm trọng quy tắc làm việc.

### Các giới hạn cụ thể:
0. **BẮT BUỘC ĐỌC QUY TẮC PHÂN HỆ TRƯỚC KHI THAO TÁC CẬP NHẬT CODE**:
   - Bất kỳ khi nào thực hiện cập nhật code cho **Frontend**, Agent **BẮT BUỘC PHẢI ĐỌC QUA CÁC QUY TẮC CỦA FRONTEND** trong thư mục `.agents/` (đặc biệt là `01-working-rules.md`, `03-compliance-constraints.md`, `05-coding-standards.md`) trước khi thao tác.
   - Ngược lại, bất kỳ khi nào thực hiện cập nhật code cho **Backend**, Agent cũng **BẮT BUỘC PHẢI ĐỌC QUA CÁC QUY TẮC CỦA BACKEND** (`InternHub/AGENTS.md` và `InternHub/.antigravity/rules.md`) trước khi thực hiện.
1. **Không tự ý cài đặt hoặc gỡ bỏ thư viện**: Cấm tự chạy `npm install`, `npm uninstall`, `yarn add` mà không có sự đồng ý của người dùng.

2. **Không tự ý thay đổi cấu trúc thư mục hoặc di chuyển file**: Mọi thao tác tái cấu trúc (refactoring) phải được đề xuất và phê duyệt.
3. **Không tự ý thay đổi hợp đồng API (API Contract)**: Không tự ý thay đổi endpoint URL, payload format, hoặc cơ chế xác thực nếu chưa thống nhất với cấu hình của backend.
4. **Không tự ý suy đoán yêu cầu & Xử lý câu lệnh đa nghĩa**: Khi câu lệnh của người dùng có thể hiểu theo nhiều cách khác nhau hoặc thiếu thông tin, Agent **bắt buộc phải hỏi lại để làm rõ**, tuyệt đối không được tự suy đoán hoặc tự chọn phương án thực thi.
5. **Bắt buộc giải trình trước khi chạy bất kỳ lệnh terminal nào**:
   - Trước khi thực thi bất kỳ lệnh nào qua terminal (kể cả lệnh kiểm tra, build hay kiểm tra mã nguồn), Agent bắt buộc phải ghi rõ:
     + **Mục đích của lệnh**: Tại sao cần chạy lệnh này?
     + **Phân loại**: Lệnh chỉ đọc (`read-only` như `oxlint`, `tsc -b`) hay lệnh có khả năng thay đổi môi trường/file.
     + **Kết quả kỳ vọng**: Cần đạt trạng thái gì để coi là đạt yêu cầu.
6. **NGHIÊM CẤM TUYỆT ĐỐI VIỆC TỰ Ý SỬA LỖI TỪ BACKEND**:
   - Khi đang làm việc trên Frontend, Agent **tuyệt đối không bao giờ được tự ý chuyển sang thư mục Backend** (như `InternHub/`, `employee-service`...) để sửa mã nguồn Java, cấu hình Spring Boot, hay cơ sở dữ liệu.
   - Nếu phát hiện lỗi xuất phát từ phía Backend, Agent **bắt buộc phải dừng lại, báo cáo chi tiết nguyên nhân cho người dùng và chờ chỉ thị**. Chỉ được can thiệp vào Backend khi có yêu cầu rõ ràng từ người dùng.
7. **NGHIÊM CẤM DÙNG MOCK DATA / MOCK DB ẢO ĐỂ BYPASS BẢO MẬT**:
   - Tuyệt đối không tạo tài khoản ảo, token giả hoặc hardcode credentials để né tránh màn hình đăng nhập hoặc vượt qua kiểm tra phân quyền (RBAC).
   - Mọi cơ chế bảo mật (Authentication, Authorization) bắt buộc phải tuân theo luồng xác thực thật của Spring Security. Cấm sửa đổi Route Guard hoặc Service để giả mạo quyền truy cập.
8. **NGHIÊM CẤM TỰ Ý CHẠY LỆNH SQL LÀM ẢNH HƯỞNG ĐẾN CƠ SỞ DỮ LIỆU**:
   - Tuyệt đối không tự ý thực thi các lệnh SQL (`ALTER`, `DROP`, `TRUNCATE`, `UPDATE`, `DELETE`, `INSERT` hay migration scripts) làm thay đổi cấu trúc bảng hoặc làm biến đổi dữ liệu trong Database.
9. **BẮT BUỘC DÙNG DỮ LIỆU THỰC TẾ & DỪNG LẠI BÁO CÁO NGAY KHI DATABASE GẶP SỰ CỐ**:
   - Mọi hoạt động phát triển hoặc kiểm thử API phải sử dụng dữ liệu thực tế đang có trong Database.
   - Khi cần tài khoản test theo từng phân quyền (Admin, HR, Mentor, Intern) hoặc dữ liệu mẫu, Agent **bắt buộc phải hỏi và yêu cầu người dùng cung cấp**, tuyệt đối không tự bịa data ảo hay nhét dữ liệu rác vào Database.
   - **Chỉ thị đặc biệt**: Nếu trong quá trình phát triển hoặc kiểm thử mà Database/Backend gặp sự cố (mất kết nối, lỗi migration, thiếu dữ liệu, container chết) khiến công việc không thể tiếp tục, Agent **TUYỆT ĐỐI KHÔNG ĐƯỢC TỰ Ý BẬT MOCK HAY TỰ SỬA DB**, mà **BẮT BUỘC PHẢI DỪNG LẠI NGAY LẬP TỨC VÀ BÁO CÁO CHO NGƯỜI DÙNG** kèm đầy đủ log và thông tin lỗi để cùng kiểm tra và nhận chỉ thị.
10. **KHÔNG SINH RA CÁC GIAO DIỆN HOẶC CHỨC NĂNG ĐÃ CÓ SẴN (REUSE FIRST)**:
    - Trước khi viết mới bất kỳ component, trang, modal hay hàm xử lý nào, Agent phải khảo sát kỹ mã nguồn hiện có.
    - Nghiêm cấm tạo mới giao diện hoặc chức năng mà hệ thống đã có sẵn. Phải ưu tiên tái sử dụng tối đa.
11. **MỌI ĐƯỜNG DẪN ROUTE VÀ API ĐỀU CẦN CÓ SỰ CHO PHÉP KHI KHAI BÁO**:
    - Mọi đường dẫn API mới trong `src/constants/endpoints/` và Route mới trong `src/constants/routes/` đều phải được trình bày trong Kế hoạch (`Plan`) và nhận được sự phê duyệt của người dùng trước khi tiến hành khai báo vào mã nguồn.
12. **NGHIÊM CẤM TỰ Ý CHẠY `git commit` HOẶC `git push` & TIÊU CHUẨN COMMIT MESSAGE**:
    - Agent tuyệt đối không tự ý commit mã nguồn hoặc đẩy code lên repository.
    - Toàn bộ thao tác commit/push phải do người dùng tự thực hiện sau khi review thay đổi, hoặc chỉ Agent thực hiện khi có yêu cầu cụ thể từ người dùng.
    - Khi người dùng yêu cầu Agent commit hoặc chuẩn bị git commit message, bắt buộc tuân thủ chuẩn **Conventional Commits**:
      ```text
      <type>(<scope>): <mô tả ngắn gọn bằng tiếng Việt hoặc tiếng Anh>
      ```
      - `feat`: Tính năng mới (ví dụ: `feat(hr-interns): add filter by status`)
      - `fix`: Sửa lỗi (ví dụ: `fix(auth): handle expired token redirect`)
      - `refactor`: Tái cấu trúc code (ví dụ: `refactor(services): split internService by domain`)
      - `style`: Định dạng CSS, khoảng cách (ví dụ: `style(dashboard): adjust card padding`)
      - `docs`: Cập nhật tài liệu (ví dụ: `docs(agents): update working rules`)
      - `chore`: Cấu hình, công cụ (ví dụ: `chore(vite): update proxy config`)
13. **THIẾT KẾ DOMAIN-DRIVEN MODULAR TỪ ĐẦU & CẤM TẠO GOD FILES**:
    - Ngay từ đầu, mọi khu vực có nguy cơ phình to (Endpoints, Routes, Types, Services) **bắt buộc phải được phân rã theo từng Domain nghiệp vụ**, kết hợp cơ chế Barrel Export (`index.ts`).
    - Tuyệt đối cấm tạo các file nguyên khối (Monolithic / God Files). Mọi file khuyến nghị không vượt quá 200 - 300 dòng code.
14. **TUÂN THỦ QUY CHUẨN CLEAN CODE & UX ĐỒNG BỘ**:
    - Tuân thủ thứ tự import 5 tầng nhất quán.
    - Sử dụng hàm tiện ích format tập trung tại `src/utils/formatters.ts`.
    - Bắt buộc sử dụng chuẩn **CSS Modules** (`[ComponentName].module.css`) cho toàn bộ Common Components và Sub-components để cô lập phạm vi, cấm lạm dụng inline style.
    - Xử lý phản hồi Mutation actions chuẩn mực (thành công ➔ toast + refetch + đóng modal; thất bại ➔ báo lỗi và giữ nguyên modal).
    - Bao bọc các phân hệ màn hình bằng React Error Boundary để chống lỗi sập trắng trang.
15. **QUY CHUẨN QUẢN LÝ FORM PHỨC TẠP (REACT HOOK FORM + ZOD)**:
    - Đối với các form có từ 4 trường nhập liệu trở lên, bắt buộc sử dụng `react-hook-form` kết hợp `zod` để validate dữ liệu đầu vào.
    - Giữ trần tối đa 3-4 `useState` trong component; ánh xạ tự động `fieldErrors` từ Backend Spring Boot vào form.
16. **NGUYÊN TẮC BẢO TOÀN HÀNH VI TRONG TÁI CẤU TRÚC (BEHAVIOR PRESERVATION)**:
    - Tái cấu trúc chỉ được phép tối ưu hóa kiến trúc, chia nhỏ file và nâng cao chất lượng code, **tuyệt đối không làm thay đổi luồng nghiệp vụ, contract API hay trải nghiệm giao diện người dùng** đã được phê duyệt.
    - Mọi đợt refactor đều phải khảo sát snapshot hành vi trước khi tiến hành chỉnh sửa mã nguồn.
17. **XỬ LÝ LỆNH MƠ HỒ & CẢNH BÁO XUNG ĐỘT QUY TẮC (AMBIGUITY & CONSTITUTIONAL GUARDRAIL)**:
    - **Khi câu lệnh có nhiều cách hiểu**: Nếu câu lệnh hoặc yêu cầu của người dùng có thể giải thích theo nhiều hướng khác nhau, hoặc còn điểm mơ hồ, Agent **BẮT BUỘC PHẢI HỎI LẠI ĐỂ LÀM RÕ**, tuyệt đối không được tự ý đưa ra quyết định hoặc suy đoán cảm tính.
    - **Khi câu lệnh đi ngược lại bộ quy tắc**: Nếu yêu cầu của người dùng đi ngược lại bất kỳ quy định nào trong bộ quy chuẩn này (ví dụ: can thiệp Backend Java, chạy lệnh SQL, bypass Auth, lạm dụng inline style, tạo God File...):
      + Agent **BẮT BUỘC PHẢI LẬP TỨC PHÁT CẢNH BÁO**.
      + **CHỈ RÕ ĐIỂM VI PHẠM** (trích dẫn điều khoản cụ thể) và nêu rõ hậu quả/rủi ro kỹ thuật.
      + Tuyệt đối không được âm thầm làm theo khi chưa cảnh báo và nhận được sự tái xác nhận từ người dùng.

---

## 2. Giao Thức 4 Bước Bắt Buộc (Mandatory 4-Step Workflow)

Trước khi thực hiện bất kỳ nhiệm vụ nào (tạo tính năng mới, sửa lỗi, chỉnh sửa giao diện, tối ưu code), Agent **bắt buộc** phải tuân thủ nghiêm ngặt chu trình 4 bước sau:

```
[Bước 1: Khảo sát & Phân tích] 
               ↓
[Bước 2: Lập Implementation Plan] 
               ↓
[Bước 3: Chờ Người Dùng Phê Duyệt] 
               ↓
[Bước 4: Thực thi, Kiểm thử & Báo cáo Walkthrough]
```

### Bước 1: Khảo sát & Phân tích (Research Phase)
- Đọc kỹ yêu cầu của người dùng.
- Đọc lại toàn bộ tài liệu trong thư mục `.agents/` liên quan đến tác vụ.
- Khảo sát mã nguồn hiện tại bằng các công cụ xem file (`view_file`), tìm kiếm (`grep_search`), liệt kê thư mục (`list_dir`).
- **Nghiêm cấm**: Không chỉnh sửa bất kỳ file nguồn nào trong bước này.

### Bước 2: Lập Kế hoạch thực hiện (Implementation Plan)
- Tạo hoặc cập nhật tài liệu kế hoạch chi tiết (`implementation_plan.md`).
- Kế hoạch phải thể hiện rõ:
  - **Mục tiêu**: Giải quyết vấn đề gì.
  - **Phạm vi file tác động**: Danh sách các file `[NEW]`, `[MODIFY]`, `[DELETE]` kèm đường dẫn clickable link.
  - **Chi tiết giải pháp kỹ thuật**: Nêu rõ cách giải quyết, component nào sẽ được tạo/sửa, state nào sẽ được thêm.
  - **Đề xuất Routes & API Endpoints mới theo Domain**: Liệt kê chi tiết để người dùng phê duyệt.
  - **Phương án kiểm thử & xác minh**: Yêu cầu tài khoản/dữ liệu thực tế từ người dùng nếu cần.
  - **Các câu hỏi cần làm rõ (nếu có)**: Những điểm còn mơ hồ cần người dùng xác nhận.

### Bước 3: Chờ Người Dùng Phê Duyệt (User Approval)
- Dừng toàn bộ thao tác ghi code và gửi yêu cầu phê duyệt cho người dùng.
- **CHỈ BẮT ĐẦU CODE KHI VÀ CHỈ KHI ĐÃ NHẬN ĐƯỢC SỰ ĐỒNG Ý RÕ RÀNG TỪ NGƯỜI DÙNG.**

### Bước 4: Thực thi, Kiểm thử & Báo cáo Hoàn Thành (Execution & Walkthrough)
- Sau khi được duyệt, tiến hành chỉnh sửa mã nguồn đúng theo kế hoạch.
- Tiến hành kiểm thử xác minh (kiểm tra lint, TypeScript type-check, kiểm tra lỗi console với dữ liệu thực tế).
- Lập bản báo cáo tóm tắt (`walkthrough.md`) trình bày rõ:
  - Những việc đã hoàn thành.
  - Danh sách chi tiết các file đã sửa đổi.
  - Kết quả kiểm tra xác minh.

---

## 2.1. Cơ Chế Ngoại Lệ Nhanh (Fast-Track Protocol for Trivial Tasks)

Nhằm tối ưu hóa hiệu năng cộng tác và tránh lãng phí thời gian, dự án cho phép áp dụng cơ chế **Fast-Track** bỏ qua việc lập file `implementation_plan.md` đối với các trường hợp vi mô sau:

| Loại Tác Vụ | Tiêu Chí Nhận Diện Được Phép Fast-Track | Cách Xử Lý Của Agent |
| :--- | :--- | :--- |
| **Chỉnh sửa Text** | Sửa lỗi chính tả text tĩnh, nhãn nút bấm, title trang, tooltip, placeholder | Thực hiện trực tiếp, báo cáo vị trí và dòng sửa trong tin nhắn phản hồi |
| **Chỉnh sửa CSS nhỏ** | Tinh chỉnh CSS thuần túy dưới 10 dòng (padding, margin, màu sắc, border radius) không thay đổi layout cấu trúc | Thực hiện trực tiếp, kiểm tra giao diện và báo cáo tóm tắt |
| **Sửa Lint / Type Cục Bộ** | Khắc phục 1 warning linter (Oxlint) hoặc 1 lỗi type đơn lẻ không làm thay đổi logic runtime | Thực hiện trực tiếp, chạy lại kiểm tra xác minh và báo cáo |

> [!CAUTION]
> **RANH GIỚI BẮT BUỘC: KHÔNG ÁP DỤNG FAST-TRACK CHO:**
> - Mọi thao tác thêm/sửa/xóa Route hoặc API Endpoints.
> - Mọi thay đổi về State logic, Custom Hook, Context hoặc Form mutation.
> - Mọi can thiệp liên quan đến Authentication, Authorization (RBAC) hoặc Bảo mật.
> - Các tác vụ này **BẮT BUỘC 100% PHẢI LẬP PLAN** và chờ người dùng phê duyệt trước khi code.

---

## 3. Phong Cách Giao Tiếp & Báo Cáo

- **Ngôn ngữ**: Sử dụng tiếng Việt rõ ràng, chuẩn mực kỹ thuật, ngắn gọn và mạch lạc.
- **Liên kết file**: Mọi file nhắc đến trong câu trả lời đều phải tạo link markdown có thể click được (sử dụng cú pháp `[filename](file:///đường_dẫn_tuyệt_đối)`).
- **Minh bạch**: Khi gặp khó khăn, lỗi không lường trước hoặc phát sinh tình huống ngoài kế hoạch, phải dừng lại và thông báo ngay lập tức cho người dùng kèm đề xuất giải pháp.
