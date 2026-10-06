import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/endpoints';
import type {
  DepartmentResponse,
  ProgramDetailResponse,
  ProgramSummaryResponse,
  CreateProgramRequest,
  UpdateProgramRequest,
  ChangeProgramStatusRequest,
  ProgramFilterRequest,
  PageResponse,
} from '../types';

export const programService = {
  /**
   * Lấy danh mục tất cả phòng ban
   */
  async getDepartments(signal?: AbortSignal): Promise<DepartmentResponse[]> {
    const response = await apiClient.get(API_ENDPOINTS.PROGRAM.DEPARTMENTS, { signal });
    return response.data?.data || [];
  },

  /**
   * Lấy dữ liệu tổng quan năng lực tiếp nhận & điều phối phòng ban (Department Capacity Overview)
   */
  async getCapacityOverview(signal?: AbortSignal): Promise<import('../types').DepartmentCapacityOverview> {
    const response = await apiClient.get(API_ENDPOINTS.PROGRAM.CAPACITY_OVERVIEW, { signal });
    return response.data?.data;
  },

  /**
   * Cập nhật chỉ tiêu kế hoạch thực tập của phòng ban (Soft quota)
   */
  async updateDepartmentQuota(id: number, plannedCapacityQuota: number): Promise<void> {
    await apiClient.put(API_ENDPOINTS.PROGRAM.UPDATE_QUOTA(id), { plannedCapacityQuota });
  },

  /**
   * Lấy danh sách các chương trình thực tập đang mở tuyển (dành cho ứng viên & Card Frontend)
   */
  async getOpenPrograms(signal?: AbortSignal): Promise<ProgramSummaryResponse[]> {
    const response = await apiClient.get(API_ENDPOINTS.PROGRAM.OPEN_LIST, { signal });
    return response.data?.data || [];
  },

  /**
   * Tìm kiếm & lọc danh sách chương trình thực tập (phân trang)
   */
  async getPrograms(
    params?: ProgramFilterRequest,
    signal?: AbortSignal
  ): Promise<PageResponse<ProgramDetailResponse>> {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.keyword?.trim()) cleanParams.keyword = params.keyword.trim();
      if (params.departmentId !== undefined && params.departmentId !== null) cleanParams.departmentId = params.departmentId;
      if (params.status?.trim()) cleanParams.status = params.status.trim();
      if (params.isHistorical !== undefined && params.isHistorical !== null) cleanParams.isHistorical = params.isHistorical;
      if (params.startDateFrom?.trim()) cleanParams.startDateFrom = params.startDateFrom.trim();
      if (params.startDateTo?.trim()) cleanParams.startDateTo = params.startDateTo.trim();
      if (params.page !== undefined) cleanParams.page = params.page;
      if (params.size !== undefined) cleanParams.size = params.size;
      if (params.sort?.trim()) cleanParams.sort = params.sort.trim();
    }

    const response = await apiClient.get(API_ENDPOINTS.PROGRAM.LIST, { params: cleanParams, signal });
    const raw = response.data?.data;
    const items: ProgramDetailResponse[] = raw?.items || raw?.content || [];

    return {
      items,
      content: items,
      currentPage: raw?.currentPage ?? raw?.pageNumber ?? 0,
      pageNumber: raw?.currentPage ?? raw?.pageNumber ?? 0,
      pageSize: raw?.pageSize ?? 10,
      totalItems: raw?.totalItems ?? raw?.totalElements ?? items.length,
      totalElements: raw?.totalItems ?? raw?.totalElements ?? items.length,
      totalPages: raw?.totalPages ?? 1,
      isFirst: raw?.isFirst ?? true,
      isLast: raw?.isLast ?? raw?.last ?? true,
      last: raw?.isLast ?? raw?.last ?? true,
      hasNext: raw?.hasNext ?? false,
      hasPrevious: raw?.hasPrevious ?? false,
    };
  },

  /**
   * Lấy chi tiết chương trình thực tập theo ID
   */
  async getProgramById(
    id: number,
    signal?: AbortSignal
  ): Promise<ProgramDetailResponse | ProgramSummaryResponse> {
    const response = await apiClient.get(API_ENDPOINTS.PROGRAM.GET_BY_ID(id), { signal });
    return response.data?.data;
  },

  /**
   * Tạo mới chương trình thực tập (hỗ trợ cả Live và Historical)
   */
  async createProgram(
    request: CreateProgramRequest,
    signal?: AbortSignal
  ): Promise<ProgramDetailResponse> {
    const response = await apiClient.post(API_ENDPOINTS.PROGRAM.CREATE, request, { signal });
    return response.data?.data;
  },

  /**
   * Cập nhật thông tin chương trình thực tập
   */
  async updateProgram(
    id: number,
    request: UpdateProgramRequest,
    signal?: AbortSignal
  ): Promise<ProgramDetailResponse> {
    const response = await apiClient.put(API_ENDPOINTS.PROGRAM.UPDATE(id), request, { signal });
    return response.data?.data;
  },

  /**
   * Chuyển đổi trạng thái chương trình (PLANNING, OPEN, ONGOING, CLOSED, CANCELLED)
   */
  async changeStatus(
    id: number,
    request: ChangeProgramStatusRequest,
    signal?: AbortSignal
  ): Promise<ProgramDetailResponse> {
    const response = await apiClient.patch(API_ENDPOINTS.PROGRAM.CHANGE_STATUS(id), request, { signal });
    return response.data?.data;
  },

  /**
   * Đóng / Mở cổng nhận hồ sơ nhanh
   */
  async toggleRecruitment(
    id: number,
    signal?: AbortSignal
  ): Promise<ProgramDetailResponse> {
    const response = await apiClient.patch(
      API_ENDPOINTS.PROGRAM.TOGGLE_RECRUITMENT(id),
      null,
      { signal }
    );
    return response.data?.data;
  },

  /**
   * Xóa chương trình thực tập (chỉ ADMIN và status == PLANNING, count == 0)
   */
  async deleteProgram(
    id: number,
    signal?: AbortSignal
  ): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PROGRAM.DELETE(id), { signal });
  },
};

export default programService;
