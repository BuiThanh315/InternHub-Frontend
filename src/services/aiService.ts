import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/endpoints';
import type {
  BatchScreeningRequest,
  BatchJobCreatedResponse,
  BatchJobStatusResponse,
  ScreeningResultDto,
} from '../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface ChatResponseData {
  reply: string;
}

export interface QuickPromptsData {
  isActive: boolean;
  botName: string;
  quickPrompts: string[];
}

export interface AiConfigData {
  provider: string;
  modelName: string;
  hasApiKey: boolean;
  maskedApiKey: string;
  temperature: number;
  maxTokens: number;
  systemInstruction: string;
  quickPrompts: string[];
  isActive: boolean;
}

export interface UpdateAiConfigRequest {
  provider: string;
  modelName: string;
  apiKey?: string;
  temperature: number;
  maxTokens: number;
  systemInstruction?: string;
  quickPrompts?: string[];
  isActive: boolean;
}

export const aiService = {
  // TTS Chatbot APIs (AI model generation can take 10-30s, increase timeout to 60s)
  chat: async (sessionId: string, message: string) => {
    const res = await apiClient.post<{ code: number; message: string; data: ChatResponseData }>(
      '/api/ai/chat',
      { sessionId, message },
      { timeout: 60000 }
    );
    return res.data.data;
  },

  getQuickPrompts: async () => {
    const res = await apiClient.get<{ code: number; message: string; data: QuickPromptsData }>('/api/ai/prompts');
    return res.data.data;
  },

  clearSession: async (sessionId: string) => {
    await apiClient.delete(`/api/ai/chat/sessions/${sessionId}`);
  },

  // Admin APIs
  getAdminConfig: async () => {
    const res = await apiClient.get<{ code: number; message: string; data: AiConfigData }>('/api/ai/admin/config');
    return res.data.data;
  },

  updateAdminConfig: async (payload: UpdateAiConfigRequest) => {
    const res = await apiClient.put<{ code: number; message: string; data: AiConfigData }>('/api/ai/admin/config', payload);
    return res.data.data;
  },

  // Batch Screening APIs (TM-103)
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
