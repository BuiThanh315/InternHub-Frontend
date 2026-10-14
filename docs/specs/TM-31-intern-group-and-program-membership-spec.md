# Specification: Quản Lý Nhóm & Thành Viên Chương Trình Thực Tập (TM-31)

> **Tài liệu Đặc Tả Yêu Cầu Kỹ Thuật (Feature Specification)**  
> **Dự án:** `InternHub` (Backend: `intern-and-program-service`, Frontend: `InternHub-Frontend`)  
> **Mã Ticket:** `TM-31`  
> **Trạng thái:** DRAFT - REVIEW COMPLETED (Đã tinh chỉnh theo phản biện kỹ thuật)  
> **Áp dụng quy tắc:** `spec-driven-development`, `security-and-hardening`, `doubt-driven-development`  

---

## 1. Feature Overview (Tổng Quan Tính Năng)

Cung cấp cho nhân sự (HR) bộ 3 công cụ vận hành thực tập sinh trong từng chương trình:
1. **Chia nhóm thực tập tự động (Auto-Group Assignment):** HR thiết lập số lượng nhóm hoặc số lượng người/nhóm $\rightarrow$ Thuật toán Round-Robin chạy ở **Frontend State** $\rightarrow$ Xem trước dạng Kanban Preview $\rightarrow$ HR kéo-thả tinh chỉnh $\rightarrow$ Bấm "Áp dụng" gửi 1 request lưu DB.
2. **Thêm/Xóa thành viên khỏi nhóm & Giải tán nhóm (Group Operations):**
   - HR có thể thêm/gỡ thủ công intern ra khỏi nhóm (`groupId = null`, vẫn ở lại chương trình, **không tự động rebalance**, hiển thị badge cảnh báo sĩ số).
   - HR có thể **Giải tán nhóm** trong 1 click: Gỡ toàn bộ intern trong nhóm về `groupId = null` và xóa bản ghi nhóm.
3. **Thêm/Gỡ thành viên khỏi chương trình (Program Membership):**
   - Tách 3 nút rõ ràng trên Action Menu: **Chuyển chương trình**, **Chấm dứt thực tập**, và **Gỡ khỏi chương trình** (Add nhầm).
   - Cơ chế bảo vệ **3-Layer Defense** khi gỡ khỏi chương trình + Dialog cảnh báo khi intern đang thuộc một nhóm (tránh làm vỡ sĩ số bất ngờ).
   - Backend validate phòng chống **IDOR** nghiêm ngặt.

---

## 2. Business Rules & Logic Edge Cases (Quy Tắc Nghiệp Vụ)

### 🔴 BR-1: Phạm vi Chia nhóm tự động (Auto-Group Scope)
- **Quy tắc cứng:** Thuật toán "Chia tự động" **CHỈ áp dụng cho các Intern đang thuộc Program nhưng có `groupId = null`** (chưa có nhóm).
- **Tuyệt đối không:** Không tự ý gom các Intern đã có `groupId` vào thuật toán chia lại từ đầu. Nếu HR muốn chia lại toàn bộ, HR phải chủ động giải tán nhóm (qua API DELETE nhóm) trước.
- **Empty state:** Nếu tất cả Intern trong chương trình đều đã có nhóm, nút "Chia tự động" sẽ thông báo: *"Tất cả thực tập sinh trong chương trình này đã được xếp nhóm."*

### 🔴 BR-2: Cảnh báo & Hướng Dẫn Luồng Chuẩn khi Gỡ Intern khỏi Chương trình
- **3-Layer Defense Check:** Chỉ cho phép "Gỡ khỏi chương trình" (reset `programId = null`, `groupId = null`) nếu intern thỏa mãn:
  1. Chưa gán Mentor (`mentorId == null`).
  2. Chưa có đánh giá tuần / đánh giá kết thúc (`InternWeeklyAssessment` count = 0, `InternEvaluation` count = 0).
  3. Trạng thái là `PENDING` hoặc `APPROVED` (chưa ký hợp đồng `INTERNING` / `COMPLETED`).
- **Thông báo lỗi hướng dẫn chuẩn nghiệp vụ (Không chỉ sai hướng):**
  - Nếu intern đã có Mentor: Ném lỗi `400 Bad Request` với message:  
    > *"Thực tập sinh đã được gán Mentor hướng dẫn. Vui lòng dùng chức năng 'Chuyển chương trình' hoặc 'Chấm dứt thực tập' thay vì gỡ trực tiếp."*
  - Nếu intern đã có đánh giá: Ném lỗi `400 Bad Request` với message:  
    > *"Thực tập sinh đã có dữ liệu đánh giá quá trình. Vui lòng dùng chức năng 'Chuyển chương trình' hoặc 'Chấm dứt thực tập' thay vì gỡ trực tiếp."*
- **UX Cảnh báo vỡ nhóm (Confirm Dialog):** Nếu intern đang thuộc 1 nhóm (`groupId != null`), Confirm Dialog hiển thị cảnh báo màu cam/vàng:
  > *"⚠️ Thực tập sinh này đang thuộc Nhóm: **[Tên Nhóm]** (hiện có X/Y thành viên). Gỡ khỏi chương trình sẽ đồng thời xóa thành viên này khỏi nhóm và làm thay đổi sĩ số nhóm."*

### 🟠 BR-3: Phòng chống IDOR ở Backend khi Lưu Nhóm (Security Validation)
- Khi nhận request `POST /api/programs/{id}/groups/batch` hoặc cập nhật nhóm:
  - Backend bắt buộc duyệt toàn bộ `internId` trong payload:
    ```java
    for (Long internId : allInternIdsInPayload) {
        InternProfile intern = internProfileRepository.findById(internId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy TTS: " + internId));
        if (intern.getProgram() == null || !intern.getProgram().getId().equals(programId)) {
            throw new BadRequestException("Intern ID " + internId + " không thuộc chương trình ID " + programId);
        }
    }
    ```
  - Toàn bộ quá trình tạo nhóm & gán intern phải được bọc trong `@Transactional`.

### 🟡 BR-4: Quy Tắc `maxMembers` & Hành Vi Batch Apply
- **Định nghĩa `maxMembers`:** Là **Soft Limit (Giới hạn mềm)**.
  - Khi chia tự động: Round-Robin chia đều sao cho mỗi nhóm $\le \text{maxMembers}$.
  - Khi kéo thả / gán thủ công: Không chặn cứng (không block) mà hiển thị badge cảnh báo màu cam/đỏ `⚠️ 5/4 (Vượt chỉ tiêu)` để HR linh hoạt khi nhóm bị lẻ người.
- **Quy tắc Batch Apply:**
  - Endpoint `POST /api/programs/{id}/groups/batch` là thao tác **Tạo các nhóm mới từ danh sách chia tự động** (Preview Kanban). Mỗi nhóm mới tạo sẽ nhận giá trị `maxMembers` tương ứng trong payload.
  - Nếu HR chỉnh sửa một nhóm đã tồn tại từ trước (qua `PUT /api/programs/{id}/groups/{groupId}`), `maxMembers` của nhóm đó được cập nhật độc lập.

### 🟡 BR-5: Validate Trùng Tên Nhóm Trong Cùng Chương Trình
- Ràng buộc tầng Service / Database: Tên nhóm phải là duy nhất trong cùng một chương trình.
- Thêm Unique Constraint: `UNIQUE KEY uk_group_program_name (program_id, name)`.
- Nếu payload gửi tên nhóm đã tồn tại trong chương trình đó: Trả về lỗi `400 Bad Request` ("Tên nhóm '[Tên]' đã tồn tại trong chương trình này").

---

## 3. Database Schema Design

### 3.1. Bảng mới: `intern_groups`
```sql
CREATE TABLE intern_groups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    program_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    max_members INT NOT NULL DEFAULT 4,
    mentor_id BIGINT NULL,
    mentor_name VARCHAR(100) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NULL,
    CONSTRAINT fk_group_program FOREIGN KEY (program_id) REFERENCES internship_programs(id) ON DELETE CASCADE,
    CONSTRAINT uk_group_program_name UNIQUE (program_id, name),
    INDEX idx_group_program (program_id)
);
```
> **Ghi chú về `ON DELETE CASCADE`:** Thiết kế này an toàn 100% vì theo cơ chế 3-Layer Defense đã có (`DELETE /programs/{id}`), một chương trình chỉ được phép xóa khi ở trạng thái `PLANNING` và có sĩ số = 0 intern. Do đó không bao giờ xảy ra tình trạng xóa chương trình kéo theo xóa mất nhóm đang chứa thực tập sinh.

### 3.2. Cập nhật Bảng: `intern_profiles`
```sql
ALTER TABLE intern_profiles ADD COLUMN group_id BIGINT NULL;
ALTER TABLE intern_profiles ADD CONSTRAINT fk_intern_group FOREIGN KEY (group_id) REFERENCES intern_groups(id) ON DELETE SET NULL;
CREATE INDEX idx_intern_group_program ON intern_profiles (group_id, program_id);
```

---

## 4. REST API Specification

| Phương thức | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/programs/{id}/groups` | `HR, ADMIN, MENTOR` | Lấy danh sách nhóm & thành viên của chương trình |
| `POST` | `/api/programs/{id}/groups` | `HR, ADMIN` | Tạo một nhóm thủ công |
| `PUT` | `/api/programs/{id}/groups/{groupId}` | `HR, ADMIN` | Cập nhật thông tin nhóm (`name`, `maxMembers`, `mentorId`) |
| `DELETE` | `/api/programs/{id}/groups/{groupId}` | `HR, ADMIN` | **Giải tán nhóm:** Set `group_id = null` cho tất cả intern thuộc nhóm, sau đó xóa nhóm |
| `POST` | `/api/programs/{id}/groups/batch` | `HR, ADMIN` | **Áp dụng chia nhóm hàng loạt** từ màn hình Preview Kanban |
| `POST` | `/api/programs/{id}/groups/{groupId}/members/{internId}` | `HR, ADMIN` | Thêm 1 intern vào nhóm |
| `DELETE` | `/api/programs/{id}/groups/{groupId}/members/{internId}` | `HR, ADMIN` | Gỡ 1 intern khỏi nhóm (về `groupId = null`, vẫn ở program) |
| `DELETE` | `/api/programs/{id}/members/{internId}` | `HR, ADMIN` | **Gỡ intern khỏi chương trình** (Add nhầm, 3-layer defense) |

### 4.1. Lấy danh sách nhóm của chương trình
- **Endpoint:** `GET /api/programs/{id}/groups`
- **Quyền:** `hasAnyRole('HR', 'ADMIN', 'MENTOR')`
- **Ghi chú:** Trường `appliedPosition` trong danh sách thành viên chỉ dùng cho mục đích hiển thị tham khảo trên thẻ card Kanban (không dùng trong logic tính toán hay auto-balance).
- **Response `200 OK`:**
```json
{
  "code": 200,
  "message": "Thành công",
  "data": [
    {
      "id": 1,
      "programId": 10,
      "name": "Nhóm 1",
      "maxMembers": 4,
      "memberCount": 3,
      "mentorId": 5,
      "mentorName": "Nguyễn Văn Mentor",
      "members": [
        {
          "id": 101,
          "internCode": "TTS-00101",
          "fullName": "Trần Thị A",
          "appliedPosition": "Frontend Developer",
          "email": "a.tran@gmail.com"
        }
      ]
    }
  ]
}
```

### 4.2. Áp dụng chia nhóm hàng loạt (Batch Apply)
- **Endpoint:** `POST /api/programs/{id}/groups/batch`
- **Quyền:** `hasAnyRole('HR', 'ADMIN')`
- **Request Body:**
```json
{
  "groups": [
    {
      "name": "Nhóm 1",
      "maxMembers": 4,
      "internIds": [101, 102, 103]
    },
    {
      "name": "Nhóm 2",
      "maxMembers": 4,
      "internIds": [104, 105]
    }
  ]
}
```
- **Xử lý Backend:**
  - Bọc trong `@Transactional`.
  - Validate IDOR: Kiểm tra mọi `internId` trong danh sách phải thuộc đúng `programId`. Nếu không, ném `400 Bad Request`.
  - Validate trùng tên nhóm trong cùng Program (BR-5).
  - Tạo mới các `InternGroup` với `maxMembers` tương ứng trong payload và gán `group_id` cho các intern.
- **Response `200 OK`:** Danh sách các nhóm đã tạo thành công.

### 4.3. Gỡ Intern khỏi chương trình (3-Layer Defense)
- **Endpoint:** `DELETE /api/programs/{id}/members/{internId}`
- **Quyền:** `hasAnyRole('HR', 'ADMIN')`
- **Validation:**
  - Nếu `intern.mentorId != null`: Trả `400 Bad Request` với message:  
    > *"Thực tập sinh đã được gán Mentor hướng dẫn. Vui lòng dùng chức năng 'Chuyển chương trình' hoặc 'Chấm dứt thực tập' thay vì gỡ trực tiếp."*
  - Nếu có assessment/evaluation: Trả `400 Bad Request` với message:  
    > *"Thực tập sinh đã có dữ liệu đánh giá quá trình. Vui lòng dùng chức năng 'Chuyển chương trình' hoặc 'Chấm dứt thực tập' thay vì gỡ trực tiếp."*
- **Hành động:** Reset `program_id = null`, `group_id = null`, lưu audit log.

### 4.4. Giải tán nhóm
- **Endpoint:** `DELETE /api/programs/{id}/groups/{groupId}`
- **Quyền:** `hasAnyRole('HR', 'ADMIN')`
- **Xử lý:**
  1. Kiểm tra nhóm thuộc đúng `programId`.
  2. Cập nhật tất cả `InternProfile` có `groupId = :groupId` thành `groupId = null`.
  3. Xóa bản ghi `InternGroup`.
- **Response `200 OK`:** `{"code": 200, "message": "Giải tán nhóm thành công"}`

### 4.5. Thêm / Gỡ thủ công 1 Intern vào/ra nhóm
- **Thêm vào nhóm:** `POST /api/programs/{id}/groups/{groupId}/members/{internId}`
  - Validate intern và nhóm cùng thuộc `programId`.
  - Set `intern.group = targetGroup`.
- **Gỡ khỏi nhóm:** `DELETE /api/programs/{id}/groups/{groupId}/members/{internId}`
  - Set `intern.group = null` (intern vẫn giữ nguyên trong chương trình).

---

## 5. UI/UX Specification (Frontend)

1. **Giao diện Quản Lý Nhóm & Kanban Preview:**
   - Cột "Chưa có nhóm" (Ungrouped Pool): Chứa các thẻ TTS có `groupId = null`.
   - Cột các nhóm: Tên nhóm, badge số lượng `X/Y`, nút xóa nhóm (giải tán), danh sách card TTS.
   - Thao tác kéo-thả trực quan giữa các cột.
   - Nút "Lưu & Áp dụng": Gửi batch payload lên backend.

2. **Action Menu trong `HrInternTable.tsx` (3 nút phân định):**
   - `Chuyển chương trình`: Mở modal điều chuyển.
   - `Gỡ khỏi chương trình`: Mở Confirm Dialog kiểm tra nếu có nhóm thì hiển thị cảnh báo vỡ nhóm.
   - `Chấm dứt thực tập`: Mở Modal đổi status `TERMINATED`.
