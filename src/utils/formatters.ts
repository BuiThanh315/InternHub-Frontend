/**
 * Tập trung toàn bộ các hàm tiện ích định dạng dữ liệu trong InternHub-Frontend.
 * Nghiêm cấm format thủ công trực tiếp trong JSX của Component.
 */

/**
 * Định dạng ngày theo chuẩn Việt Nam (DD/MM/YYYY)
 */
export function formatDate(dateInput?: string | Date | null): string {
  if (!dateInput) return '—';
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '—';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '—';
  }
}

/**
 * Định dạng ngày và giờ (HH:mm - DD/MM/YYYY)
 */
export function formatDateTime(dateInput?: string | Date | null): string {
  if (!dateInput) return '—';
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '—';
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${minutes} - ${day}/${month}/${year}`;
  } catch {
    return '—';
  }
}

/**
 * Định dạng số điện thoại Việt Nam (ví dụ: 0901 234 567 hoặc 090 123 4567)
 */
export function formatPhoneNumber(phoneInput?: string | null): string {
  if (!phoneInput) return '—';
  const cleaned = phoneInput.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  return phoneInput;
}

/**
 * Định dạng điểm số GPA (thang 4 hoặc 10)
 */
export function formatScore(score?: number | null, scale: number = 4): string {
  if (score === undefined || score === null || isNaN(score)) return '—';
  return `${score.toFixed(2)} / ${scale.toFixed(1)}`;
}

/**
 * Định dạng tiền tệ Việt Nam Đồng (VNĐ)
 */
export function formatCurrency(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Định dạng dung lượng tệp tin (Bytes ➔ KB ➔ MB)
 */
export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0 || isNaN(bytes)) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

/**
 * Lấy nhãn tiếng Việt cho InternStatus
 */
export function getInternStatusLabel(status?: string): string {
  switch (status) {
    case 'PENDING':
      return 'Chờ phê duyệt';
    case 'APPROVED':
      return 'Đã phê duyệt';
    case 'INTERNING':
      return 'Đang thực tập';
    case 'COMPLETED':
      return 'Đã hoàn thành';
    case 'REJECTED':
      return 'Từ chối tiếp nhận';
    case 'ON_HOLD':
      return 'Tạm hoãn';
    case 'TERMINATED':
      return 'Đã thôi việc';
    default:
      return status || '—';
  }
}

/**
 * Lấy nhãn tiếng Việt cho DocumentStatus
 */
export function getDocumentStatusLabel(status?: string): string {
  switch (status) {
    case 'PENDING_REVIEW':
      return 'Chờ kiểm duyệt';
    case 'APPROVED':
      return 'Đã duyệt';
    case 'REJECTED':
      return 'Yêu cầu nộp lại';
    default:
      return status || '—';
  }
}

/**
 * Lấy nhãn tiếng Việt cho ContractStatus
 */
export function getContractStatusLabel(status?: string): string {
  switch (status) {
    case 'PENDING_SIGNATURE':
      return 'Chờ ký xác nhận';
    case 'PENDING_INTERN_FEEDBACK':
      return 'Thực tập sinh thắc mắc';
    case 'SIGNED':
      return 'Đã ký kết';
    case 'ACTIVE':
      return 'Đang hiệu lực';
    case 'SUPERSEDED':
      return 'Đã được gia hạn';
    case 'EXPIRED':
      return 'Đã hết hạn';
    case 'TERMINATED':
      return 'Đã chấm dứt';
    case 'REJECTED_BY_INTERN':
      return 'Từ chối tiếp nhận';
    default:
      return status || '—';
  }
}

/**
 * Định dạng giờ phút giây (HH:mm:ss hoặc HH:mm)
 */
export function formatTime(dateInput?: string | Date | null, includeSeconds: boolean = true): string {
  if (!dateInput) return '—';
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '—';
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    if (!includeSeconds) return `${hours}:${minutes}`;
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  } catch {
    return '—';
  }
}

/**
 * Lấy nhãn tiếng Việt cho Quiz & Question Difficulty (EASY, MEDIUM, HARD)
 */
export function getDifficultyLabel(diff?: string | null): string {
  switch (diff?.toUpperCase()) {
    case 'EASY':
      return 'Cơ bản';
    case 'MEDIUM':
      return 'Trung bình';
    case 'HARD':
      return 'Nâng cao';
    default:
      return diff || 'Cơ bản';
  }
}

/**
 * Lấy nhãn tiếng Việt cho Danh mục câu hỏi phỏng vấn
 */
export function getQuestionCategoryLabel(cat?: string | null): string {
  switch (cat?.toUpperCase()) {
    case 'TECHNICAL_FOUNDATION':
      return 'Kiến thức nền tảng';
    case 'CODING_LOGIC':
      return 'Tư duy logic & Thuật toán';
    case 'ARCHITECTURE_SYSTEM':
      return 'Kiến trúc & Hệ thống';
    case 'BEHAVIORAL_SCENARIOS':
      return 'Tình huống & Kỹ năng mềm';
    case 'CULTURE_FIT':
      return 'Văn hóa & Động lực';
    default:
      return cat || 'Chuyên môn';
  }
}

/**
 * Lấy nhãn tiếng Việt cho HR Evaluation Status
 */
export function getHrEvaluationStatusLabel(status?: string | null): string {
  switch (status?.toUpperCase()) {
    case 'PENDING_REVIEW':
      return 'Chờ duyệt';
    case 'APPROVED':
      return 'Đã duyệt đạt';
    case 'REJECTED':
      return 'Từ chối';
    default:
      return status || 'Chờ duyệt';
  }
}

/**
 * Lấy nhãn tiếng Việt cho Mission / Task Status
 */
export function getTaskStatusLabel(status?: string | null): string {
  switch (status?.toUpperCase()) {
    case 'TODO':
      return 'Cần làm';
    case 'IN_PROGRESS':
      return 'Đang thực hiện';
    case 'COMPLETED':
      return 'Đã hoàn thành';
    case 'CANCELLED':
      return 'Đã hủy';
    default:
      return status || '—';
  }
}

/**
 * Lấy nhãn tiếng Việt cho AttendanceStatus
 */
export function getAttendanceStatusLabel(status?: string | null): string {
  switch (status) {
    case 'ON_TIME':
      return 'Đúng giờ';
    case 'LATE':
      return 'Đi muộn';
    case 'EARLY_LEAVE':
      return 'Về sớm';
    case 'LATE_AND_EARLY_LEAVE':
      return 'Muộn & Về sớm';
    case 'ABSENT':
      return 'Vắng mặt';
    default:
      return status || 'Chưa vào ca';
  }
}

/**
 * Lấy nhãn tiếng Việt cho SupportRequestStatus
 */
export function getSupportRequestStatusLabel(status?: string | null): string {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return 'Chờ tiếp nhận';
    case 'IN_PROGRESS':
      return 'Đang xử lý';
    case 'RESOLVED':
      return 'Đã giải quyết';
    case 'REJECTED':
      return 'Từ chối hỗ trợ';
    case 'CANCELLED':
      return 'Đã hủy yêu cầu';
    default:
      return status || '—';
  }
}

/**
 * Lấy nhãn tiếng Việt cho DocumentType
 */
export function getDocumentTypeLabel(type?: string | null): string {
  switch (type?.toUpperCase()) {
    case 'ID_CARD':
      return 'Căn cước công dân';
    case 'STUDENT_CARD':
      return 'Thẻ sinh viên';
    case 'DEGREE':
    case 'DIPLOMA':
      return 'Bằng tốt nghiệp';
    case 'TRANSCRIPT':
      return 'Bảng điểm học tập';
    case 'CV':
      return 'Hồ sơ lý lịch (CV)';
    case 'CERTIFICATE':
      return 'Chứng chỉ chuyên môn';
    case 'RECOMMENDATION_LETTER':
      return 'Thư giới thiệu';
    case 'HEALTH_CERTIFICATE':
      return 'Giấy khám sức khỏe';
    default:
      return type || 'Tài liệu khác';
  }
}

/**
 * Lấy nhãn tiếng Việt cho InterviewSessionStatus
 */
export function getInterviewSessionStatusLabel(status?: string | null): string {
  switch (status?.toUpperCase()) {
    case 'INVITED':
      return 'Đã mời phỏng vấn';
    case 'IN_PROGRESS':
      return 'Đang phỏng vấn';
    case 'SUBMITTED':
      return 'Đã hoàn thành';
    case 'EXPIRED':
      return 'Đã hết hạn';
    case 'CANCELLED':
      return 'Đã hủy';
    default:
      return status || '—';
  }
}

/**
 * Lấy nhãn tiếng Việt cho User Role
 */
export function getUserRoleLabel(role?: string | null): string {
  switch (role?.toUpperCase()) {
    case 'ADMIN':
    case 'ROLE_ADMIN':
      return 'Quản trị viên';
    case 'HR':
    case 'ROLE_HR':
      return 'Nhân sự (HR)';
    case 'MENTOR':
    case 'ROLE_MENTOR':
      return 'Người hướng dẫn (Mentor)';
    case 'INTERN':
    case 'ROLE_INTERN':
      return 'Thực tập sinh';
    case 'COORDINATOR':
    case 'ROLE_COORDINATOR':
      return 'Điều phối viên';
    default:
      return role || 'Người dùng';
  }
}

/**
 * Lấy nhãn tiếng Việt cho AllowanceStatus
 */
export function getAllowanceStatusLabel(status?: string | null): string {
  switch (status?.toUpperCase()) {
    case 'DRAFT':
      return 'Bản nháp';
    case 'PENDING':
    case 'PENDING_APPROVAL':
      return 'Chờ phê duyệt';
    case 'APPROVED':
      return 'Đã phê duyệt';
    case 'PAID':
      return 'Đã thanh toán';
    case 'REJECTED':
      return 'Bị từ chối';
    default:
      return status || '—';
  }
}

/**
 * Lấy nhãn tiếng Việt cho ProgramStatus
 */
export function getProgramStatusLabel(status?: string | null): string {
  switch (status?.toUpperCase()) {
    case 'PLANNING':
      return 'Lên kế hoạch';
    case 'OPENING':
    case 'OPEN':
      return 'Đang mở tuyển';
    case 'ONGOING':
      return 'Đang diễn ra';
    case 'COMPLETED':
      return 'Đã kết thúc';
    case 'CANCELLED':
      return 'Đã hủy';
    default:
      return status || '—';
  }
}



