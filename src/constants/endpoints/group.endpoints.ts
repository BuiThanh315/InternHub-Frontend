export const GROUP_ENDPOINTS = {
  LIST: (programId: number) => `/api/programs/${programId}/groups`,
  CREATE: (programId: number) => `/api/programs/${programId}/groups`,
  UPDATE: (programId: number, groupId: number) => `/api/programs/${programId}/groups/${groupId}`,
  DISBAND: (programId: number, groupId: number) => `/api/programs/${programId}/groups/${groupId}`,
  BATCH: (programId: number) => `/api/programs/${programId}/groups/batch`,
  ADD_MEMBER: (programId: number, groupId: number, internId: number) =>
    `/api/programs/${programId}/groups/${groupId}/members/${internId}`,
  REMOVE_MEMBER: (programId: number, groupId: number, internId: number) =>
    `/api/programs/${programId}/groups/${groupId}/members/${internId}`,
  REMOVE_PROGRAM_MEMBER: (programId: number, internId: number) =>
    `/api/programs/${programId}/members/${internId}`,
};
