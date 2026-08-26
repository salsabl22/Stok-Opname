export type Role = "Admin Master" | "User";

export type UserStatus = "Aktif" | "Nonaktif";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  status: UserStatus;
}

export interface UserFormValues {
  name: string;
  username: string;
  email: string;
  password: string;
  role: Role;
  status: UserStatus;
}

export interface FeaturePermission {
  featureId: string;
  featureName: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface RoleConfiguration {
  role: Role;
  permissions: FeaturePermission[];
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
  status: "success" | "warning";
}

export type UserFormAction = "tambah" | "ubah" | "nonaktifkan";
