import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/endpoints';
import type {
  BatchScreeningRequest,
  BatchJobCreatedResponse,
  BatchJobStatusResponse,
  ScreeningResultDto,
} from '../types';

export const aiService = {
  /**
   * Khởi tạo tác vụ thẩm định hồ sơ hàng loạt bằng AI
   */
  async startBatchScreening(
    request: BatchScreeningRequest,
    signal?: AbortSignal
  ): Promise<BatchJobCreatedResponse> {
    const response = await apiClient.post(API_ENDPOINTS.AI.BATCH, request, { signal });
    return response.data?.data;
  },

  /**
   * Kiểm tra tiến độ và kết quả của Batch Job
   */
  async getBatchJobStatus(
    jobId: string,
    signal?: AbortSignal
  ): Promise<BatchJobStatusResponse> {
    const response = await apiClient.get(API_ENDPOINTS.AI.JOB_STATUS(jobId), { signal });
    return response.data?.data;
  },

  /**
   * Lấy kết quả đánh giá AI chi tiết của một thực tập sinh
   */
  async getInternEvaluation(
    internId: number,
    signal?: AbortSignal
  ): Promise<ScreeningResultDto | null> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AI.INTERN_EVALUATION(internId), { signal });
      return response.data?.data;
    } catch (err: any) {
      if (err?.response?.status === 404 || err?.statusCode === 404) {
        return null;
      }
      throw err;
    }
  },
};
