import type { MissionItemStatus, MissionPriority } from './mission.types';

export interface MissionItemSyncEvent {
  eventId: string;
  action: 'STATUS_CHANGED' | 'ITEM_CREATED' | 'ITEM_UPDATED' | 'ITEM_DELETED';
  itemId: number;
  boardId?: number;
  programId?: number;
  title: string;
  description?: string;
  previousStatus?: MissionItemStatus;
  newStatus?: MissionItemStatus;
  priority?: MissionPriority;
  dueDate?: string;
  assigneeIds?: number[];
  submissionUrl?: string;
  completionNote?: string;
  actorId?: number;
  actorName?: string;
  actorRole?: 'MENTOR' | 'INTERN' | 'HR' | 'ADMIN';
  version?: number;
  timestamp: string;
}

export interface TaskActorPresence {
  itemId: number;
  actorName: string;
  actorRole: string;
  actionText: string;
  timestamp: number;
}
