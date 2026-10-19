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

export interface FeatureProfileData {
  featureKey: string;
  featureName: string;
  description?: string;
  modelName: string;
  temperature: number;
  maxTokens: number;
  rateLimitPerMinute?: number;
  dailyQuota?: number;
  systemInstruction?: string;
  quickPrompts?: string[];
  isActive: boolean;
  updatedAt?: string;
}

export interface GlobalConfigData {
  provider: string;
  apiKeyLast4?: string;
  maskedApiKey?: string;
  hasApiKey: boolean;
  isActive: boolean;
  updatedAt?: string;
}

export interface AiKeyVaultItem {
  id: number;
  keyName: string;
  provider: string;
  maskedKey: string;
  priority: number;
  status: 'ACTIVE' | 'COOLDOWN' | 'DISABLED';
  cooldownSecondsRemaining: number;
  failureCount: number;
  lastUsedAt?: string;
  createdAt?: string;
}

export interface AddKeyVaultPayload {
  keyName: string;
  provider?: string;
  apiKey: string;
  priority?: number;
}

export interface AiMultiConfigResponse {
  globalConfig: GlobalConfigData;
  profiles: FeatureProfileData[];
}

export interface UpdateFeatureProfilePayload {
  modelName: string;
  temperature: number;
  maxTokens: number;
  rateLimitPerMinute?: number;
  dailyQuota?: number;
  systemInstruction?: string;
  quickPrompts?: string[];
  isActive: boolean;
}

export interface TestProfileResult {
  success: boolean;
  featureKey: string;
  modelName: string;
  temperature: number;
  latencyMs: number;
  output?: string;
  errorMessage?: string;
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

  // Multi-Profile AI Config APIs (AI-09)
  getMultiConfig: async () => {
    const res = await apiClient.get<AiMultiConfigResponse>('/api/v1/ai/admin/multi-config');
    return res.data;
  },

  updateGlobalKey: async (apiKey: string) => {
    await apiClient.put('/api/v1/ai/admin/multi-config/global-key', { apiKey });
  },

  updateProfile: async (featureKey: string, payload: UpdateFeatureProfilePayload) => {
    const res = await apiClient.put<FeatureProfileData>(`/api/v1/ai/admin/multi-config/profiles/${featureKey}`, payload);
    return res.data;
  },

  testProfile: async (featureKey: string, testPrompt: string) => {
    const res = await apiClient.post<TestProfileResult>(
      `/api/v1/ai/admin/multi-config/profiles/${featureKey}/test`,
      { testPrompt },
      { timeout: 60000 }
    );
    return res.data;
  },

  // Legacy Admin APIs
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

  /**
   * Lấy danh sách khóa trong Key Vault (AI-10)
   */
  async getVaultKeys(signal?: AbortSignal): Promise<AiKeyVaultItem[]> {
    const response = await apiClient.get(API_ENDPOINTS.AI.VAULT, { signal });
    return response.data?.data || [];
  },

  /**
   * Thêm một khóa mới vào Key Vault (AI-10)
   */
  async addVaultKey(payload: AddKeyVaultPayload, signal?: AbortSignal): Promise<AiKeyVaultItem> {
    const response = await apiClient.post(API_ENDPOINTS.AI.VAULT, payload, { signal });
    return response.data?.data;
  },

  /**
   * Kiểm tra kết nối thử nghiệm một khóa trong Vault (AI-10)
   */
  async testVaultKey(id: number | string, signal?: AbortSignal): Promise<any> {
    const response = await apiClient.post(API_ENDPOINTS.AI.VAULT_TEST(id), {}, { signal });
    return response.data?.data;
  },

  /**
   * Cập nhật thông tin cấu hình một khóa trong Vault (AI-10)
   */
  async updateVaultKey(
    id: number | string,
    payload: { keyName?: string; priority?: number; status?: string },
    signal?: AbortSignal
  ): Promise<AiKeyVaultItem> {
    const response = await apiClient.put(API_ENDPOINTS.AI.VAULT_DETAIL(id), payload, { signal });
    return response.data?.data;
  },

  /**
   * Xóa một khóa khỏi Key Vault (AI-10)
   */
  async deleteVaultKey(id: number | string, signal?: AbortSignal): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.AI.VAULT_DETAIL(id), { signal });
  },
};
