export interface MeetingSchedule {
  id: number;
  title: string;
  description?: string;
  meetingType: 'ONLINE' | 'OFFLINE';
  locationOrUrl?: string;
  startTime: string;
  endTime?: string;
  creatorId: number;
  creatorName: string;
  creatorRole: string;
  internProfileId?: number;
  internUserId: number;
  internName?: string;
  internEmail?: string;
  status: 'SCHEDULED' | 'UPDATED' | 'CANCELLED' | 'COMPLETED';
  provider?: 'GOOGLE_MEET' | 'JITSI' | 'CUSTOM_MANUAL';
  joinUrl?: string;
  externalEventId?: string;
  sequenceNumber?: number;
  reminderSent?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMeetingRequest {
  title: string;
  description?: string;
  meetingType: 'ONLINE' | 'OFFLINE';
  locationOrUrl?: string;
  startTime: string;
  endTime?: string;
  internProfileId: number;
}

export interface UpdateMeetingRequest {
  title: string;
  description?: string;
  meetingType: 'ONLINE' | 'OFFLINE';
  locationOrUrl?: string;
  startTime: string;
  endTime?: string;
}
