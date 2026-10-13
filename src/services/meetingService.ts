import { apiClient } from './api';
import type { MeetingSchedule, CreateMeetingRequest, UpdateMeetingRequest } from '../types/meeting.types';

const API_BASE = '/api/v1/meetings';

export const meetingService = {
  async getMyMeetings(): Promise<MeetingSchedule[]> {
    const res = await apiClient.get<{ code: number; data: MeetingSchedule[] }>(`${API_BASE}/my-schedules`);
    return res.data.data || [];
  },

  async getMeetingsByIntern(internUserId: number): Promise<MeetingSchedule[]> {
    const res = await apiClient.get<{ code: number; data: MeetingSchedule[] }>(`${API_BASE}/intern/${internUserId}`);
    return res.data.data || [];
  },

  async getMeetingById(id: number): Promise<MeetingSchedule> {
    const res = await apiClient.get<{ code: number; data: MeetingSchedule }>(`${API_BASE}/${id}`);
    return res.data.data;
  },

  async createMeeting(data: CreateMeetingRequest): Promise<MeetingSchedule> {
    const res = await apiClient.post<{ code: number; data: MeetingSchedule }>(API_BASE, data);
    return res.data.data;
  },

  async updateMeeting(id: number, data: UpdateMeetingRequest): Promise<MeetingSchedule> {
    const res = await apiClient.put<{ code: number; data: MeetingSchedule }>(`${API_BASE}/${id}`, data);
    return res.data.data;
  },

  async cancelMeeting(id: number): Promise<MeetingSchedule> {
    const res = await apiClient.patch<{ code: number; data: MeetingSchedule }>(`${API_BASE}/${id}/cancel`, {});
    return res.data.data;
  },
};
