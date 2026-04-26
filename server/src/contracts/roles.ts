export type PermissionDto = {
  key: string;
  label: string;
  description?: string;
  category?: string;
};

export type RoleDto = {
  id: string;
  name: string;
  description?: string;
  permissions: PermissionDto[];
  locked?: boolean;
};

export type RolePermissionUpdateRequest = {
  permissionKeys: string[];
  reason?: string;
};

export type RolePermissionUpdateResponse = {
  role: RoleDto;
  changedPermissionKeys: string[];
};
