import { apiClient } from './api';
import { GROUP_ENDPOINTS } from '../constants/endpoints/group.endpoints';
import type { ApiResponse } from '../types/common.types';
import type {
  InternGroup,
  CreateGroupPayload,
  BatchApplyGroupsPayload,
} from '../types/group.types';

export const groupService = {
  getGroups: async (programId: number): Promise<InternGroup[]> => {
    const res = await apiClient.get<ApiResponse<InternGroup[]>>(
      GROUP_ENDPOINTS.LIST(programId)
    );
    return res.data.data;
  },

  createGroup: async (
    programId: number,
    payload: CreateGroupPayload
  ): Promise<InternGroup> => {
    const res = await apiClient.post<ApiResponse<InternGroup>>(
      GROUP_ENDPOINTS.CREATE(programId),
      payload
    );
    return res.data.data;
  },

  updateGroup: async (
    programId: number,
    groupId: number,
    payload: CreateGroupPayload
  ): Promise<InternGroup> => {
    const res = await apiClient.put<ApiResponse<InternGroup>>(
      GROUP_ENDPOINTS.UPDATE(programId, groupId),
      payload
    );
    return res.data.data;
  },

  disbandGroup: async (programId: number, groupId: number): Promise<void> => {
    await apiClient.delete(GROUP_ENDPOINTS.DISBAND(programId, groupId));
  },

  batchApplyGroups: async (
    programId: number,
    payload: BatchApplyGroupsPayload
  ): Promise<InternGroup[]> => {
    const res = await apiClient.post<ApiResponse<InternGroup[]>>(
      GROUP_ENDPOINTS.BATCH(programId),
      payload
    );
    return res.data.data;
  },

  addMember: async (
    programId: number,
    groupId: number,
    internId: number
  ): Promise<void> => {
    await apiClient.post(
      GROUP_ENDPOINTS.ADD_MEMBER(programId, groupId, internId)
    );
  },

  removeMember: async (
    programId: number,
    groupId: number,
    internId: number
  ): Promise<void> => {
    await apiClient.delete(
      GROUP_ENDPOINTS.REMOVE_MEMBER(programId, groupId, internId)
    );
  },

  removeInternFromProgram: async (
    programId: number,
    internId: number
  ): Promise<void> => {
    await apiClient.delete(
      GROUP_ENDPOINTS.REMOVE_PROGRAM_MEMBER(programId, internId)
    );
  },
};
