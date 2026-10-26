export type ProctoringEventType =
  | 'TAB_BLUR'
  | 'WINDOW_MINIMIZE'
  | 'PASTE_DETECTED'
  | 'WEBCAM_LOST'
  | 'MIC_LOST'
  | 'MULTIPLE_DISPLAYS'
  | 'HEARTBEAT_TIMEOUT';

export type ProctoringSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'DISQUALIFIED';

export interface ProctoringAlertEvent {
  eventId: string;
  sessionId: number;
  scheduleId: number;
  candidateId?: number;
  candidateName: string;
  candidateEmail: string;
  eventType: ProctoringEventType;
  severity: ProctoringSeverity;
  strikeCount: number;
  maxStrikes: number;
  details?: string;
  timestamp: string;
}

export interface CandidateLiveProctoringState {
  sessionId: number;
  candidateName: string;
  candidateEmail: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'DISQUALIFIED' | 'OFFLINE';
  cameraActive: boolean;
  micActive: boolean;
  networkQuality: 'EXCELLENT' | 'GOOD' | 'POOR' | 'DISCONNECTED';
  strikeCount: number;
  maxStrikes: number;
  lastEvent?: ProctoringAlertEvent;
  lastHeartbeat: string;
}
