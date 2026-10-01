export interface PermissionItem {
  id: number;
  code: string;
  name: string;
  module: string;
  description?: string;
}

export interface PermissionGroup {
  module: string;
  moduleName: string;
  permissions: PermissionItem[];
}

export interface RoleItem {
  id: number;
  name: string;
  description?: string;
  isSystem: boolean;
  userCount: number;
  permissionCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleDetail {
  id: number;
  name: string;
  description?: string;
  isSystem: boolean;
  userCount: number;
  permissions: PermissionItem[];
  permissionCodes: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissionCodes: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissionCodes: string[];
}

export interface UserPermissionsData {
  username: string;
  role: string;
  permissions: string[];
}
