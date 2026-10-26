# Kế Hoạch Triển Khai: Candidate Workspace & Tinh Giản Bảng Tuyển Dụng

> **Mục tiêu:** Loại bỏ hoàn toàn sự rườm rà của 8-9 nút icon/đường dẫn phân tán trên từng dòng bảng dữ liệu "Hồ sơ đăng ký chờ tiếp nhận", chuyển toàn bộ các dịch vụ (Xem CV, Thẩm định AI, Phỏng vấn AI, Bộ câu hỏi, Tiếp nhận, Từ chối, Ghim, So sánh) vào một **Slide-over Candidate Workspace** tập trung, hiện đại, chuyên nghiệp.

---

## 1. Khảo Sát Hiện Trạng & Đánh Giá Tái Sử Dụng Mã Nguồn (Mandatory Survey)

### 1.1. Hiện trạng bảng dữ liệu (`ApplicationsTab.tsx`)
- Trên mỗi dòng của bảng dữ liệu hiện có tới **8 nút icon nhỏ vuông** trong cột "THAO TÁC":
  1. `Bookmark` (Ghim ưu tiên)
  2. `Scale` (So sánh 2 CV)
  3. `Eye` (Xem chi tiết hồ sơ)
  4. `MessageSquareQuote` (Xem câu hỏi phỏng vấn AI)
  5. `Calendar` (Mời phỏng vấn AI)
  6. `Sparkles` (Phiếu đánh giá phỏng vấn AI)
  7. `UserCheck` (Tiếp nhận vào kỳ)
  8. `UserX` (Từ chối hồ sơ)
  - Thêm 1 icon `Sparkles` trong cột "Đánh giá AI".
- **Vấn đề:** 
  - Giao diện bị loãng và rối mắt (icon soup), mật độ tương tác quá dày đặc trên từng dòng bảng.
  - Người dùng khó nhớ ý nghĩa từng icon và dễ bấm nhầm.
  - Các service xử lý phân tán qua nhiều modal popup rời rạc thay vì một luồng làm việc nhất quán.

### 1.2. Đánh giá tái sử dụng (Reuse Evaluation)
- **Tái sử dụng 100% logic & service Backend:**
  - `internService.submitDecision(id, { decision, rejectionReason })`: Tiếp nhận / Từ chối hồ sơ.
  - `aiScreening.triggerBatch([intern.id])`: Kích hoạt thẩm định AI trực tiếp cho ứng viên.
  - `useBatchAiScreening`: Hook quản lý kết quả thẩm định AI theo thời gian thực.
  - `aiService.getInternEvaluation(intern.id)` & `AiScreeningDossierTab`: Thành phần hiển thị chi tiết điểm số, kỹ năng, rủi ro thẩm định AI.
  - `aiInterviewService`: Quản lý phiên phỏng vấn và kết quả phỏng vấn AI.
  - `CreateInterviewScheduleModal`: Modal tạo lịch và gửi thư mời phỏng vấn AI trực tuyến.
  - `InterviewQuestionModal`: Modal sinh câu hỏi phỏng vấn theo JD chương trình và hồ sơ ứng viên.
  - `CvComparisonModal`: Modal so sánh song song 2 CV khi chọn từ toolbar hoặc workspace.
- **Tái sử dụng mô hình thiết kế Drawer:** Kế thừa phong cách Slide-over Drawer hiện đại từ `EvaluationDossierDrawer.tsx` và `MentorInternDetailDrawer.tsx` với backdrop blur, smooth slide-in animation, tab navigation và sticky action header/footer.

---

## 2. Thiết Kế Kiến Trúc: Candidate Workspace (Slide-over Drawer)

### 2.1. Component `CandidateWorkspaceDrawer`
- **Vị trí:** `src/pages/hr/programs/workspace/components/CandidateWorkspaceDrawer/CandidateWorkspaceDrawer.tsx` (và `.module.css`, `.types.ts`).
- **Cấu trúc giao diện:**
  1. **Header:** 
     - Avatar ký tự viết tắt, Họ tên ứng viên, Nguồn hồ sơ (`Trường liên kết` / `Ứng viên tự do`), Trạng thái CV (`Có CV` / `Chưa có CV`).
     - Nút ghim nhanh (Bookmark toggle), nút chọn so sánh (Compare toggle), nút đóng (X).
  2. **Top/Sticky Action Bar (Quyết định tuyển sinh):**
     - Nút **[Tiếp nhận vào kỳ]** (Primary Success): Thực hiện tiếp nhận vào kỳ thực tập.
     - Nút **[Từ chối hồ sơ]** (Danger Outline): Mở dialog nhập lý do từ chối (có gợi ý lý do từ chối của AI nếu có).
  3. **Tab Navigation (3 phân hệ dịch vụ):**
     - **Tab 1: 📄 Hồ sơ & CV (Profile & Document Service):**
       - Thông tin chi tiết: Email, Số điện thoại, Trường ĐH, Chuyên ngành, GPA, Ngày nộp đơn.
       - Xem trước / Mở file CV PDF đính kèm.
     - **Tab 2: 🤖 Thẩm định AI (AI Screening Service):**
       - Điểm khớp lệnh (% Match score), Khuyến nghị AI (Phù hợp / Cân nhắc / Chưa đạt).
       - Phân tích kỹ năng: Điểm mạnh, điểm yếu / khoảng trống kỹ năng, cảnh báo rủi ro.
       - Nút bấm: "Quét thẩm định AI ngay" (nếu chưa quét hoặc muốn thẩm định lại).
     - **Tab 3: 🎙️ Phỏng vấn AI (AI Interview Service):**
       - Sinh / Xem bộ câu hỏi phỏng vấn AI theo hồ sơ ứng viên.
       - Nút bấm: "Mời phỏng vấn AI trực tuyến" (mở modal lên lịch).
       - Phiếu đánh giá phỏng vấn AI (nếu ứng viên đã hoàn thành buổi phỏng vấn).
  4. **Footer:** Các thông tin metadata thời gian tạo, cập nhật lần cuối.

### 2.2. Tinh giản bảng dữ liệu `ApplicationsTab.tsx`
- **Cột "THAO TÁC":**
  - Xóa bỏ toàn bộ 8 nút icon nhỏ (`Bookmark`, `Scale`, `Eye`, `MessageSquareQuote`, `Calendar`, `Sparkles`, `UserCheck`, `UserX`).
  - Thay bằng **một nút bấm duy nhất**: 
    `<Button variant="primary" size="sm" onClick={() => setSelectedCandidate(intern)}>Xử lý hồ sơ</Button>`
- **Cột "ĐÁNH GIÁ AI":**
  - Bỏ icon `Sparkles` phụ nằm cạnh badge.
  - Chỉ giữ lại badge điểm số AI thanh lịch (`75% · Phù hợp`, `-- Chưa quét`). Bấm vào badge hoặc bấm "Xử lý hồ sơ" đều mở thẳng Candidate Workspace tab Thẩm định AI.
- **Hàng bảng dữ liệu:**
  - Hỗ trợ hover rõ ràng, người dùng có thể click vào bất kỳ đâu trên dòng ứng viên để mở nhanh Candidate Workspace.
