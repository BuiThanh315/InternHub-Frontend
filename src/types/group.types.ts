export interface GroupMember {
  id: number;
  internCode: string;
  fullName: string;
  appliedPosition?: string;
  email: string;
  phone: string;
}

export interface InternGroup {
  id: number;
  programId: number;
  name: string;
  maxMembers: number;
  memberCount: number;
  mentorId?: number;
  mentorName?: string;
  members: GroupMember[];
}

export interface CreateGroupPayload {
  name: string;
  maxMembers?: number;
  mentorId?: number;
}

export interface BatchGroupItem {
  name: string;
  maxMembers: number;
  internIds: number[];
}

export interface BatchApplyGroupsPayload {
  groups: BatchGroupItem[];
}
