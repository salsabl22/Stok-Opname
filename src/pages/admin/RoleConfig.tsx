import { useMemo, useState } from "react";
import { ChevronDown, ShieldAlert, ShieldCheck, UserCircle2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Toast } from "../../components/ui/Toast";
import { useUsers } from "../../state/UsersContext";
import { FEATURE_TREE } from "../../data/featureTree";

export function RoleConfigPage() {
  const { users, permissions, setUserPermission, setUserPermissionsBulk } = useUsers();

  const configurableUsers = useMemo(
    () => users.filter((user) => user.role !== "Admin Master"),
    [users]
  );

  const [selectedUserId, setSelectedUserId] = useState<string>(
    configurableUsers[0]?.id ?? ""
  );
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(
    FEATURE_TREE[0]?.id ?? null
  );
  const [toast, setToast] = useState<{ message: string; tone: "success" | "danger" } | null>(
    null
  );

  const selectedUser = configurableUsers.find((u) => u.id === selectedUserId);
  const userPermissions = selectedUserId ? permissions[selectedUserId] ?? {} : {};

  function toggleModule(moduleId: string) {
    setExpandedModuleId((current) => (current === moduleId ? null : moduleId));
  }

  function toggleFeature(featureId: string) {
    if (!selectedUserId) return;
    const current = userPermissions[featureId] ?? false;
    setUserPermission(selectedUserId, featureId, !current);
  }

  function toggleAllInModule(featureIds: string[], granted: boolean) {
    if (!selectedUserId) return;
    setUserPermissionsBulk(selectedUserId, featureIds, granted);
  }

  function countGranted(featureIds: string[]) {
    return featureIds.filter((id) => userPermissions[id]).length;
  }

  function isConfigurationValid() {
    if (!selectedUserId) return false;
    return Object.values(userPermissions).some(Boolean);
  }

  function handleSaveConfiguration() {
    if (!selectedUser) {
      setToast({ message: "Pilih pengguna terlebih dahulu sebelum menyimpan.", tone: "danger" });
      return;
    }

    if (!isConfigurationValid()) {
      setToast({
        message: `${selectedUser.name} belum memiliki akses fitur apa pun. Centang minimal satu fitur.`,
        tone: "danger",
      });
      return;
    }

    setToast({
      message: `Konfigurasi hak akses untuk ${selectedUser.name} berhasil disimpan.`,
      tone: "success",
    });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-xl font-semibold text-zodiac-900">
          Konfigurasi Peran & Hak Akses
        </h1>
        <p className="mt-1 text-sm text-zodiac-400">
          Pilih pengguna, lalu tentukan fitur yang boleh mereka akses. Admin Master
          otomatis memiliki akses penuh dan tidak perlu dikonfigurasi.
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-border-subtle bg-surface p-5">
        <label htmlFor="user-select" className="text-sm font-medium text-zodiac-700">
          Pilih Pengguna
        </label>
        <div className="mt-2 flex items-center gap-3">
          <UserCircle2 className="h-9 w-9 flex-shrink-0 text-zodiac-300" strokeWidth={1.5} />
          <select
            id="user-select"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full max-w-sm rounded-lg border border-zodiac-200 px-3.5 py-2.5 text-sm text-zodiac-900
              focus:outline-none focus:ring-2 focus:ring-zodiac-500 focus:border-transparent"
          >
            <option value="" disabled>
              Pilih username&hellip;
            </option>
            {configurableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username} &mdash; {user.name}
              </option>
            ))}
          </select>
        </div>
        {configurableUsers.length === 0 && (
          <p className="mt-3 text-sm text-zodiac-400">
            Belum ada pengguna non-admin. Tambahkan pengguna terlebih dahulu di
            halaman "Pengguna & Hak Akses".
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {FEATURE_TREE.map((module) => {
          const featureIds = module.items.map((item) => item.id);
          const grantedCount = countGranted(featureIds);
          const isExpanded = expandedModuleId === module.id;
          const allGranted = grantedCount === featureIds.length;

          return (
            <div
              key={module.id}
              className="overflow-hidden rounded-xl border border-border-subtle bg-surface"
            >
              <button
                type="button"
                onClick={() => toggleModule(module.id)}
                disabled={!selectedUserId}
                aria-expanded={isExpanded}
                className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-zodiac-50/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-zodiac-800 text-sm font-semibold text-white">
                    {module.number}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-zodiac-900">{module.title}</p>
                    <p className="text-xs text-zodiac-400">
                      {grantedCount} dari {featureIds.length} fitur diizinkan
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-zodiac-400 transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  strokeWidth={2}
                />
              </button>

              {isExpanded && (
                <div className="border-t border-border-subtle bg-zodiac-50/40 px-5 py-4">
                  <div className="mb-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => toggleAllInModule(featureIds, !allGranted)}
                      className="text-xs font-medium text-zodiac-600 hover:text-zodiac-900 hover:underline"
                    >
                      {allGranted ? "Batalkan semua" : "Pilih semua"}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {module.items.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-2.5 rounded-lg bg-surface px-3 py-2.5 text-sm text-zodiac-700 shadow-sm"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(userPermissions[item.id])}
                          onChange={() => toggleFeature(item.id)}
                          className="h-4 w-4 rounded border-zodiac-300 text-zodiac-800 focus:ring-zodiac-500"
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-border-subtle bg-surface px-5 py-4">
        <div className="flex items-center gap-2 text-sm text-zodiac-500">
          {isConfigurationValid() ? (
            <>
              <ShieldCheck className="h-4 w-4 text-[--color-success]" strokeWidth={2} />
              Konfigurasi siap disimpan.
            </>
          ) : (
            <>
              <ShieldAlert className="h-4 w-4 text-[--color-warning]" strokeWidth={2} />
              Pilih pengguna dan centang minimal satu fitur.
            </>
          )}
        </div>
        <Button onClick={handleSaveConfiguration} disabled={!selectedUserId}>
          Simpan Konfigurasi
        </Button>
      </div>

      {toast && (
        <Toast message={toast.message} tone={toast.tone} onDismiss={() => setToast(null)} />
      )}
    </div>
  );
}
