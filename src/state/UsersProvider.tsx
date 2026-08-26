import { useState, type ReactNode } from "react";
import type { AuthUser } from "../types/auth";
import type { UserPermissionMap } from "../types/permissions";
import { UsersContext } from "./UsersContext";

const INITIAL_USERS: AuthUser[] = [
  { id: "usr-001", name: "Andi Saputra", username: "andi.s", email: "andi.saputra@crewflow.id", role: "Admin Master", status: "Aktif" },
  { id: "usr-002", name: "Rina Wijaya", username: "rina.w", email: "rina.wijaya@crewflow.id", role: "User", status: "Aktif" },
  { id: "usr-003", name: "Budi Santoso", username: "budi.s", email: "budi.santoso@crewflow.id", role: "User", status: "Nonaktif" },
];

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<AuthUser[]>(INITIAL_USERS);
  const [permissions, setPermissions] = useState<UserPermissionMap>({});

  function addOrUpdateUser(user: AuthUser) {
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      return exists ? prev.map((u) => (u.id === user.id ? user : u)) : [...prev, user];
    });
  }

  function deactivateUser(userId: string) {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: "Nonaktif" } : u))
    );
  }

  function setUserPermission(userId: string, featureId: string, granted: boolean) {
    setPermissions((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [featureId]: granted },
    }));
  }

  function setUserPermissionsBulk(userId: string, featureIds: string[], granted: boolean) {
    setPermissions((prev) => {
      const current = { ...prev[userId] };
      featureIds.forEach((id) => {
        current[id] = granted;
      });
      return { ...prev, [userId]: current };
    });
  }

  return (
    <UsersContext.Provider
      value={{
        users,
        addOrUpdateUser,
        deactivateUser,
        permissions,
        setUserPermission,
        setUserPermissionsBulk,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}
