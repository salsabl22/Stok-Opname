import { createContext, useContext } from "react";
import type { AuthUser } from "../types/auth";
import type { UserPermissionMap } from "../types/permissions";

export interface UsersContextValue {
  users: AuthUser[];
  addOrUpdateUser: (user: AuthUser) => void;
  deactivateUser: (userId: string) => void;
  permissions: UserPermissionMap;
  setUserPermission: (userId: string, featureId: string, granted: boolean) => void;
  setUserPermissionsBulk: (userId: string, featureIds: string[], granted: boolean) => void;
}

export const UsersContext = createContext<UsersContextValue | undefined>(undefined);

export function useUsers() {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsers must be used within a UsersProvider");
  }
  return context;
}
