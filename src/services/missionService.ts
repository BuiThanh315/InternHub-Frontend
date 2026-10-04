import axios from 'axios';
import { apiClient, AppError } from './api';
import { MISSION_ENDPOINTS } from '../constants/endpoints';
import type {
  ApiResponse,
  MentorProgramResponse,
  AssigneeResponse,
  MissionBoardResponse,
  MissionBoardDetailResponse,
  MissionItemResponse,
  CreateMissionBoardRequest,
  UpdateMissionBoardRequest,
  CreateMissionItemRequest,
  UpdateMissionItemRequest,
  UpdateItemStatusRequest,
  InternKanbanBoardResponse,
  UpdateKanbanStatusRequest,
  InternMissionFilterParams,
  PageResponse,
  BoardStatus,
} from '../types';

const isCancelError = (error: any): boolean =>
  axios.isCancel(error) ||
  error?.name === 'CanceledError' ||
  error?.name === 'AbortError' ||
  error?.code === 'ERR_CANCELED' ||
  error?.message === 'canceled';

const handleServiceError = (error: any, fallbackMessage: string): never => {
  if (isCancelError(error)) {
    throw error;
  }
  if (error instanceof AppError) throw error;
  throw new AppError(error.message || fallbackMessage);
};

export const missionService = {
  /**
   * Lấy danh sách các Chương trình thực tập mà Mentor đăng nhập đang phụ trách
   */
  async getMyMentoredPrograms(signal?: AbortSignal): Promise<MentorProgramResponse[]> {
    try {
      const response = await apiClient.get<ApiResponse<MentorProgramResponse[]>>(
        MISSION_ENDPOINTS.MENTOR_PROGRAMS,
        { signal }
      );
      return response.data.data ?? [];
    } catch (error: any) {
      return handleServiceError(error, 'Lỗi khi tải danh sách chương trình phụ trách');
    }
  },

  /**
   * Lấy danh sách Thực tập sinh trong Chương trình để Mentor chọn khi giao việc
   */
  async getProgramInterns(programId: number, signal?: AbortSignal): Promise<AssigneeResponse[]> {
    try {
      const response = await apiClient.get<ApiResponse<AssigneeResponse[]>>(
        MISSION_ENDPOINTS.PROGRAM_INTERNS(programId),
        { signal }
      );
      return response.data.data ?? [];
    } catch (error: any) {
      return handleServiceError(error, 'Lỗi khi tải danh sách thực tập sinh');
    }
  },

  /**
   * Lấy danh sách Bảng nhiệm vụ của một Chương trình
   */
  async getBoardsByProgram(programId: number, signal?: AbortSignal): Promise<MissionBoardResponse[]> {
    try {
      const response = await apiClient.get<ApiResponse<MissionBoardResponse[]>>(
        MISSION_ENDPOINTS.PROGRAM_BOARDS(programId),
        { signal }
      );
      return response.data.data ?? [];
    } catch (error: any) {
      return handleServiceError(error, 'Lỗi khi tải danh sách bảng nhiệm vụ');
    }
  },

  /**
   * Xem chi tiết Bảng nhiệm vụ kèm tất cả công việc con (Mission Items)
   */
  async getBoardDetail(boardId: number, signal?: AbortSignal): Promise<MissionBoardDetailResponse> {
    try {
      const response = await apiClient.get<ApiResponse<MissionBoardDetailResponse>>(
        MISSION_ENDPOINTS.BOARD_DETAIL(boardId),
        { signal }
      );
      return response.data.data;
    } catch (error: any) {
      return handleServiceError(error, 'Lỗi khi tải chi tiết bảng nhiệm vụ');
    }
  },

  /**
   * Tạo Bảng nhiệm vụ mới
   */
  async createBoard(payload: CreateMissionBoardRequest): Promise<MissionBoardResponse> {
    try {
      const response = await apiClient.post<ApiResponse<MissionBoardResponse>>(
        MISSION_ENDPOINTS.BOARDS,
        payload
      );
      return response.data.data;
    } catch (error: any) {
      return handleServiceError(error, 'Lỗi khi tạo bảng nhiệm vụ');
    }
  },

  /**
   * Cập nhật thông tin Bảng nhiệm vụ
   */
  async updateBoard(boardId: number, payload: UpdateMissionBoardRequest): Promise<MissionBoardResponse> {
    try {
      const response = await apiClient.put<ApiResponse<MissionBoardResponse>>(
        MISSION_ENDPOINTS.BOARD_DETAIL(boardId),
        payload
      );
      return response.data.data;
    } catch (error: any) {
      return handleServiceError(error, 'Lỗi khi cập nhật bảng nhiệm vụ');
    }
  },

  /**
   * Cập nhật trạng thái Bảng nhiệm vụ (ACTIVE / ARCHIVED)
   */
  async updateBoardStatus(boardId: number, status: BoardStatus): Promise<MissionBoardResponse> {
    try {
      const response = await apiClient.patch<ApiResponse<MissionBoardResponse>>(
        MISSION_ENDPOINTS.BOARD_STATUS(boardId),
        null,
        { params: { status } }
      );
      return response.data.data;
    } catch (error: any) {
      return handleServiceError(error, 'Lỗi khi cập nhật trạng thái bảng');
    }
  },

  /**
   * Xóa Bảng nhiệm vụ (xóa cả các công việc con)
   */
  async deleteBoard(boardId: number): Promise<void> {
    try {
      await apiClient.delete(MISSION_ENDPOINTS.BOARD_DETAIL(boardId));
    } catch (error: any) {
      return handleServiceError(error, 'Lỗi khi xóa bảng nhiệm vụ');
    }
  },

  /**
   * Tạo mục công việc chi tiết trong Bảng nhiệm vụ
   */
  async createItem(boardId: number, payload: CreateMissionItemRequest): Promise<MissionItemResponse> {
    try {
      const response = await apiClient.post<ApiResponse<MissionItemResponse>>(
        MISSION_ENDPOINTS.BOARD_ITEMS(boardId),
        payload
      );
      return response.data.data;
    } catch (error: any) {
      return handleServiceError(error, 'Lỗi khi tạo công việc chi tiết');
    }
  },

  /**
   * Cập nhật nội dung mục công việc chi tiết
   */
  async updateItem(itemId: number, payload: UpdateMissionItemRequest): Promise<MissionItemResponse> {
    try {
      const response = await apiClient.put<ApiResponse<MissionItemResponse>>(
        MISSION_ENDPOINTS.ITEMS(itemId),
        payload
      );
      return response.data.data;
    } catch (error: any) {
      return handleServiceError(error, 'Lỗi khi cập nhật công việc chi tiết');
    }
  },

  /**
   * Cập nhật trạng thái công việc (Chờ xử lý -> Đang thực hiện -> Hoàn thành)
   */
  async updateItemStatus(itemId: number, payload: UpdateItemStatusRequest): Promise<MissionItemResponse> {
    try {
      const response = await apiClient.patch<ApiResponse<MissionItemResponse>>(
        MISSION_ENDPOINTS.ITEM_STATUS(itemId),
        payload
      );
      return response.data.data;
    } catch (error: any) {
      return handleServiceError(error, 'Lỗi khi cập nhật trạng thái công việc');
    }
  },

  /**
   * Xóa mục công việc chi tiết
   */
  async deleteItem(itemId: number): Promise<void> {
    try {
      await apiClient.delete(MISSION_ENDPOINTS.ITEMS(itemId));
    } catch (error: any) {
      return handleServiceError(error, 'Lỗi khi xóa công việc chi tiết');
    }
  },

  /**
   * TM-20: Lấy bảng Kanban nhiệm vụ cá nhân của Thực tập sinh đang đăng nhập (3 cột: Chưa làm, Đang làm, Hoàn thiện)
   */
  async getMyMissionKanban(signal?: AbortSignal): Promise<InternKanbanBoardResponse> {
    try {
      const response = await apiClient.get<ApiResponse<InternKanbanBoardResponse>>(
        MISSION_ENDPOINTS.MY_KANBAN,
        { signal }
      );
      return response.data.data;
    } catch (error: any) {
      return handleServiceError(error, 'Lỗi khi tải bảng nhiệm vụ cá nhân');
    }
  },

  /**
   * TM-20: Lấy danh sách nhiệm vụ cá nhân phân trang của Thực tập sinh
   */
  async getMyMissionItems(
    params?: InternMissionFilterParams & { page?: number; size?: number },
    signal?: AbortSignal
  ): Promise<PageResponse<MissionItemResponse>> {
    try {
      const response = await apiClient.get<ApiResponse<PageResponse<MissionItemResponse>>>(
        MISSION_ENDPOINTS.MY_MISSIONS,
        { params, signal }
      );
      return response.data.data;
    } catch (error: any) {
      return handleServiceError(error, 'Lỗi khi tải danh sách nhiệm vụ cá nhân');
    }
  },

  /**
   * TM-20: Xem chi tiết một mục nhiệm vụ (kèm thông tin nộp bài và phân công)
   */
  async getMissionItemDetail(itemId: number, signal?: AbortSignal): Promise<MissionItemResponse> {
    try {
      const response = await apiClient.get<ApiResponse<MissionItemResponse>>(
        MISSION_ENDPOINTS.ITEMS(itemId),
        { signal }
      );
      return response.data.data;
    } catch (error: any) {
      return handleServiceError(error, 'Lỗi khi tải chi tiết nhiệm vụ');
    }
  },

  /**
   * TM-20: Thực tập sinh cập nhật trạng thái nhiệm vụ trên bảng Kanban (TODO <-> IN_PROGRESS <-> COMPLETED)
   */
  async updateMyMissionStatus(
    itemId: number,
    payload: UpdateKanbanStatusRequest
  ): Promise<MissionItemResponse> {
    try {
      const response = await apiClient.patch<ApiResponse<MissionItemResponse>>(
        MISSION_ENDPOINTS.ITEM_STATUS(itemId),
        payload
      );
      return response.data.data;
    } catch (error: any) {
      return handleServiceError(error, 'Lỗi khi cập nhật trạng thái nhiệm vụ');
    }
  },
};
