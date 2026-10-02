import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';

export interface HasPermissionProps {
  /**
   * Mã đặc quyền đơn lẻ cần kiểm tra (ví dụ 'USER_CREATE')
   */
  code?: string;
  /**
   * Danh sách đặc quyền - chỉ cần thỏa mãn ít nhất 1 mã trong danh sách (OR)
   */
  anyOf?: string[];
  /**
   * Danh sách đặc quyền - bắt buộc thỏa mãn toàn bộ mã trong danh sách (AND)
   */
  allOf?: string[];
  /**
   * Nội dung hiển thị thay thế khi không có quyền (Mặc định là null / không render gì)
   */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Component kiểm soát hiển thị giao diện theo đặc quyền động RBAC.
 * Tự động ẩn các nút bấm, menu hoặc tính năng nhạy cảm nếu người dùng không sở hữu quyền tương ứng.
 */
export const HasPermission: React.FC<HasPermissionProps> = ({
  code,
  anyOf,
  allOf,
  fallback = null,
  children,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  let isAllowed = false;

  if (code) {
    isAllowed = hasPermission(code);
  } else if (anyOf && anyOf.length > 0) {
    isAllowed = hasAnyPermission(...anyOf);
  } else if (allOf && allOf.length > 0) {
    isAllowed = hasAllPermissions(...allOf);
  } else {
    isAllowed = true;
  }

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default HasPermission;
