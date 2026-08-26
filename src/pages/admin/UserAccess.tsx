import { useState } from "react";
import { UserPlus, Pencil, UserX } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Toast } from "../../components/ui/Toast";
import { UserFormModal } from "./UserFormModal";
import { useUsers } from "../../state/UsersContext";
import type { AuthUser, UserFormAction } from "../../types/auth";

export function UserAccessPage() {
  const { users, addOrUpdateUser, deactivateUser } = useUsers();
  const [activeAction, setActiveAction] = useState<UserFormAction | null>(null);
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function openAction(action: UserFormAction, user: AuthUser | null = null) {
    setSelectedUser(user);
    setActiveAction(action);
  }

  function closeModal() {
    setActiveAction(null);
    setSelectedUser(null);
  }

  function handleSaveUser(user: AuthUser) {
    addOrUpdateUser(user);
    setToastMessage(
      activeAction === "tambah" ? "Pengguna baru berhasil ditambahkan." : "Perubahan pengguna disimpan."
    );
    closeModal();
  }

  function handleDeactivate(user: AuthUser) {
    deactivateUser(user.id);
    setToastMessage(`Akses ${user.name} telah dinonaktifkan.`);
    closeModal();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-zodiac-900">
            Pengguna & Hak Akses
          </h1>
          <p className="mt-1 text-sm text-zodiac-400">
            Kelola akun pengguna dan status akses ke sistem CrewFlow.
          </p>
        </div>
        <Button onClick={() => openAction("tambah")}>
          <UserPlus className="h-4 w-4" strokeWidth={2} />
          Tambah User
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-zodiac-50/50 text-xs uppercase tracking-wide text-zodiac-400">
              <th className="px-5 py-3 font-medium">Nama</th>
              <th className="px-5 py-3 font-medium">Username</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Peran</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border-subtle last:border-0">
                <td className="px-5 py-3.5 font-medium text-zodiac-900">{user.name}</td>
                <td className="px-5 py-3.5 text-zodiac-500">{user.username}</td>
                <td className="px-5 py-3.5 text-zodiac-500">{user.email}</td>
                <td className="px-5 py-3.5 text-zodiac-500">{user.role}</td>
                <td className="px-5 py-3.5">
                  <Badge tone={user.status === "Aktif" ? "success" : "neutral"}>
                    {user.status}
                  </Badge>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openAction("ubah", user)}
                      aria-label={`Ubah ${user.name}`}
                      className="rounded-lg p-2 text-zodiac-400 hover:bg-zodiac-50 hover:text-zodiac-700"
                    >
                      <Pencil className="h-4 w-4" strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => openAction("nonaktifkan", user)}
                      disabled={user.status === "Nonaktif"}
                      aria-label={`Nonaktifkan ${user.name}`}
                      className="rounded-lg p-2 text-zodiac-400 hover:bg-[--color-danger-bg] hover:text-[--color-danger] disabled:opacity-30"
                    >
                      <UserX className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeAction && activeAction !== "nonaktifkan" && (
        <UserFormModal
          action={activeAction}
          initialUser={selectedUser}
          onSave={handleSaveUser}
          onClose={closeModal}
        />
      )}

      {activeAction === "nonaktifkan" && selectedUser && (
        <ConfirmDeactivateDialog
          user={selectedUser}
          onConfirm={() => handleDeactivate(selectedUser)}
          onCancel={closeModal}
        />
      )}

      {toastMessage && (
        <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}
    </div>
  );
}

function ConfirmDeactivateDialog({
  user,
  onConfirm,
  onCancel,
}: {
  user: AuthUser;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-center justify-center bg-zodiac-950/50 px-4"
    >
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl">
        <h2 className="font-display text-base font-semibold text-zodiac-900">
          Nonaktifkan {user.name}?
        </h2>
        <p className="mt-2 text-sm text-zodiac-500">
          Pengguna ini tidak akan bisa masuk ke sistem sampai diaktifkan kembali.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Batal
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Nonaktifkan
          </Button>
        </div>
      </div>
    </div>
  );
}
