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
    case 'SIGNED':
      return 'Đã ký kết';
    case 'EXPIRED':
      return 'Đã hết hạn';
    case 'TERMINATED':
      return 'Đã chấm dứt';
    default:
      return status || '—';
  }
}
