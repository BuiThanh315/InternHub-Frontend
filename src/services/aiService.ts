import { apiClient, getInMemoryAccessToken } from './api';
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

export interface PromptTemplateData {
  id: number;
  templateCode: string;
  templateName: string;
  featureGroup: string;
  promptType: string;
  version: number;
  templateContent: string;
  description?: string;
  availableVariables: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpsertPromptTemplatePayload {
  templateName: string;
  templateContent: string;
  description?: string;
  availableVariables?: string[];
  createNewVersion?: boolean;
}

export interface PreviewPromptTemplatePayload {
  templateContent: string;
  sampleVariables?: Record<string, unknown>;
}

export interface PreviewPromptTemplateResponse {
  resolvedPrompt: string;
  detectedVariables: string[];
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

  /**
   * Gọi SSE Streaming Chat (AI-17) - Nhận text từng chunk theo thời gian thực
   */
  streamChat: async (
    sessionId: string,
    message: string,
    callbacks: {
      onChunk: (chunk: string) => void;
      onDone?: () => void;
      onError?: (err: Error) => void;
    },
    signal?: AbortSignal
  ): Promise<void> => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
    const url = `${API_BASE_URL}/api/ai/chat/stream`;

    let token = getInMemoryAccessToken();
    if (!token) {
      try {
        const { authService } = await import('./authService');
        token = await authService.refreshToken();
      } catch (e) {
        console.warn('Không thể tự động khôi phục access token:', e);
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ sessionId, message }),
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let detailedMsg = `Lỗi kết nối AI (${response.status}): ${response.statusText}`;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed && parsed.message) {
            detailedMsg = parsed.message;
          }
        } catch {
          if (errorText && errorText.length < 150) {
            detailedMsg = errorText;
          }
        }
        throw new Error(detailedMsg);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Trình duyệt không hỗ trợ đọc Stream phản hồi.');
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // Giữ lại phần chưa hoàn tất của dòng cuối cùng
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue; // bỏ qua heartbeat/comment

          if (trimmed.startsWith('data:')) {
            const dataStr = trimmed.slice(5).trim();
            if (dataStr === '[DONE]') {
              callbacks.onDone?.();
              return;
            }
            try {
              // Parse JSON nếu backend gửi format { chunk: '...' } hoặc parse thô
              let chunkText = dataStr;
              try {
                const parsed = JSON.parse(dataStr);
                if (typeof parsed === 'string') {
                  chunkText = parsed;
                } else if (parsed && typeof parsed.chunk === 'string') {
                  chunkText = parsed.chunk;
                } else if (parsed && typeof parsed.text === 'string') {
                  chunkText = parsed.text;
                }
              } catch {
                // Giữ nguyên text thuần
              }
              callbacks.onChunk(chunkText);
            } catch (parseErr: any) {
              console.warn('Lỗi xử lý SSE chunk:', parseErr);
            }
          }
        }
      }

      callbacks.onDone?.();
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      callbacks.onError?.(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
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

  /**
   * Ghim hoặc bỏ ghim ứng viên tiềm năng (AI-18)
   */
  async toggleCandidateBookmark(
    programId: number | string,
    internId: number | string,
    notes?: string,
    signal?: AbortSignal
  ): Promise<boolean> {
    const response = await apiClient.post(
      API_ENDPOINTS.AI.BOOKMARK_TOGGLE,
      { programId, internId, notes },
      { signal }
    );
    return response.data?.data ?? false;
  },

  /**
   * Lấy danh sách ID các ứng viên đã được ghim trong một kỳ thực tập (AI-18)
   */
  async getBookmarkedInternIds(
    programId: number | string,
    signal?: AbortSignal
  ): Promise<number[]> {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.AI.BOOKMARKS_BY_PROGRAM(programId),
        { signal }
      );
      return response.data?.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Lấy toàn bộ danh sách Prompt Templates và các phiên bản đã lưu (AI-19)
   */
  async getPromptTemplates(featureGroup?: string, signal?: AbortSignal): Promise<PromptTemplateData[]> {
    const response = await apiClient.get(API_ENDPOINTS.AI.PROMPT_TEMPLATES, {
      params: featureGroup ? { featureGroup } : undefined,
      signal,
    });
    return response.data?.data || [];
  },

  /**
   * Lấy lịch sử các phiên bản của một Prompt Template (AI-19 Version History)
   */
  async getPromptTemplateVersions(code: string, signal?: AbortSignal): Promise<PromptTemplateData[]> {
    const response = await apiClient.get(
      API_ENDPOINTS.AI.PROMPT_TEMPLATE_DETAIL(code) + '/versions',
      { signal }
    );
    return response.data?.data || [];
  },

  /**
   * Cập nhật / tạo mới phiên bản Prompt Template (AI-19)
   */
  async updatePromptTemplate(
    code: string,
    payload: UpsertPromptTemplatePayload,
    signal?: AbortSignal
  ): Promise<PromptTemplateData> {
    const response = await apiClient.put(
      API_ENDPOINTS.AI.PROMPT_TEMPLATE_DETAIL(code),
      payload,
      { signal }
    );
    return response.data?.data;
  },

  /**
   * Kích hoạt phiên bản lịch sử của một Prompt Template (AI-19 Rollback)
   */
  async activatePromptTemplateVersion(
    code: string,
    version: number,
    signal?: AbortSignal
  ): Promise<PromptTemplateData> {
    const response = await apiClient.post(
      API_ENDPOINTS.AI.PROMPT_TEMPLATE_ACTIVATE(code, version),
      {},
      { signal }
    );
    return response.data?.data;
  },

  /**
   * Thử nghiệm giải phóng biến và xem trước kết quả Prompt (AI-19 Dry-run Preview)
   */
  async previewPromptTemplate(
    payload: PreviewPromptTemplatePayload,
    signal?: AbortSignal
  ): Promise<PreviewPromptTemplateResponse> {
    const response = await apiClient.post(
      API_ENDPOINTS.AI.PROMPT_TEMPLATE_PREVIEW,
      payload,
      { signal }
    );
    return response.data?.data;
  },
};
