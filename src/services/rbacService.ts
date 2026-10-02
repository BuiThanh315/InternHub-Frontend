import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/endpoints';
import type {
  ApiResponse,
  RoleItem,
  RoleDetail,
  PermissionGroup,
  CreateRoleRequest,
  UpdateRoleRequest,
} from '../types';

export const rbacService = {
  /**
   * Lấy danh sách tất cả các vai trò trong hệ thống kèm thống kê số lượng đặc quyền và tài khoản
   */
  async getAllRoles(signal?: AbortSignal): Promise<RoleItem[]> {
    const response = await apiClient.get<ApiResponse<RoleItem[]>>(
      API_ENDPOINTS.SYSTEM.ROLES,
      { signal }
    );
    return response.data?.data || [];
  },

  /**
   * Lấy thông tin chi tiết một vai trò kèm danh sách đặc quyền được cấp
   */
  async getRoleById(id: number, signal?: AbortSignal): Promise<RoleDetail> {
    const response = await apiClient.get<ApiResponse<RoleDetail>>(
      API_ENDPOINTS.SYSTEM.ROLE_DETAIL(id),
      { signal }
    );
    if (!response.data?.data) {
      throw new Error(`Không tìm thấy thông tin vai trò với mã #${id}`);
    }
    return response.data.data;
  },

  /**
   * Tạo vai trò mới kèm danh mục đặc quyền ban đầu
   */
  async createRole(data: CreateRoleRequest, signal?: AbortSignal): Promise<RoleDetail> {
    const response = await apiClient.post<ApiResponse<RoleDetail>>(
      API_ENDPOINTS.SYSTEM.ROLES,
      data,
      { signal }
    );
    if (!response.data?.data) {
      throw new Error('Tạo vai trò thất bại hoặc dữ liệu phản hồi không hợp lệ');
    }
    return response.data.data;
  },

  /**
   * Cập nhật thông tin và ma trận đặc quyền của vai trò
   */
  async updateRole(
    id: number,
    data: UpdateRoleRequest,
    signal?: AbortSignal
  ): Promise<RoleDetail> {
    const response = await apiClient.put<ApiResponse<RoleDetail>>(
      API_ENDPOINTS.SYSTEM.ROLE_DETAIL(id),
      data,
      { signal }
    );
    if (!response.data?.data) {
      throw new Error('Cập nhật vai trò thất bại hoặc dữ liệu phản hồi không hợp lệ');
    }
    return response.data.data;
  },

  /**
   * Xóa vai trò tùy chỉnh (Bị chặn nếu là vai trò hệ thống hoặc đang có người dùng)
   */
  async deleteRole(id: number, signal?: AbortSignal): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.SYSTEM.ROLE_DETAIL(id), { signal });
  },

  /**
   * Lấy danh mục 17 đặc quyền hệ thống gom nhóm theo 7 Module chức năng
   */
  async getPermissions(signal?: AbortSignal): Promise<PermissionGroup[]> {
    const response = await apiClient.get<ApiResponse<PermissionGroup[]>>(
      API_ENDPOINTS.SYSTEM.PERMISSIONS,
      { signal }
    );
    return response.data?.data || [];
  },
};

export default rbacService;
