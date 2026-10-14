import { apiClient } from './api';

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
};
