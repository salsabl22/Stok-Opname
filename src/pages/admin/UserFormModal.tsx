import { useState, type FormEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import type { AuthUser, Role, UserFormAction, UserStatus } from "../../types/auth";

interface UserFormModalProps {
  action: UserFormAction;
  initialUser: AuthUser | null;
  onSave: (user: AuthUser) => void;
  onClose: () => void;
}

interface FormValues {
  name: string;
  username: string;
  email: string;
  password: string;
  role: Role;
  status: UserStatus;
}

interface FormErrors {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildInitialValues(user: AuthUser | null): FormValues {
  return {
    name: user?.name ?? "",
    username: user?.username ?? "",
    email: user?.email ?? "",
    password: "",
    role: user?.role ?? "User",
    status: user?.status ?? "Aktif",
  };
}

function validate(values: FormValues, isEditMode: boolean): FormErrors {
  const errors: FormErrors = {};

  if (values.name.trim().length < 3) {
    errors.name = "Nama minimal 3 karakter.";
  }
  if (values.username.trim().length < 3) {
    errors.username = "Username minimal 3 karakter.";
  }
  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Format email tidak valid.";
  }
  if (!isEditMode && values.password.length < 6) {
    errors.password = "Password minimal 6 karakter.";
  } else if (isEditMode && values.password.length > 0 && values.password.length < 6) {
    errors.password = "Password minimal 6 karakter, atau kosongkan jika tidak diubah.";
  }

  return errors;
}

export function UserFormModal({
  action,
  initialUser,
  onSave,
  onClose,
}: UserFormModalProps) {
  const isEditMode = action === "ubah";
  const [values, setValues] = useState<FormValues>(() => buildInitialValues(initialUser));
  const [errors, setErrors] = useState<FormErrors>({});
  const [pendingUser, setPendingUser] = useState<AuthUser | null>(null);

  const title = action === "tambah" ? "Tambah Pengguna" : "Ubah Pengguna";

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function buildUserPayload(): AuthUser {
    return {
      id: initialUser?.id ?? `usr-${crypto.randomUUID().slice(0, 8)}`,
      name: values.name.trim(),
      username: values.username.trim(),
      email: values.email.trim(),
      role: values.role,
      status: values.status,
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validate(values, isEditMode);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    const userPayload = buildUserPayload();

    if (isEditMode) {
      setPendingUser(userPayload);
      return;
    }

    onSave(userPayload);
  }

  if (pendingUser && initialUser) {
    return (
      <ConfirmEditDialog
        before={initialUser}
        after={pendingUser}
        onConfirm={() => onSave(pendingUser)}
        onCancel={() => setPendingUser(null)}
      />
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-form-title"
      className="fixed inset-0 z-40 flex items-center justify-center bg-zodiac-950/50 px-4"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl"
      >
        <h2 id="user-form-title" className="font-display text-base font-semibold text-zodiac-900">
          {title}
        </h2>

        <div className="mt-5 flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
          <Input
            label="Nama Lengkap"
            value={values.name}
            onChange={(e) => updateField("name", e.target.value)}
            error={errors.name}
            placeholder="cth. Andi Saputra"
          />
          <Input
            label="Username"
            value={values.username}
            onChange={(e) => updateField("username", e.target.value)}
            error={errors.username}
            placeholder="cth. andi.s"
          />
          <Input
            label="Email"
            type="email"
            value={values.email}
            onChange={(e) => updateField("email", e.target.value)}
            error={errors.email}
            placeholder="cth. andi.s@crewflow.id"
            autoComplete="email"
          />
          <Input
            label={isEditMode ? "Password Baru" : "Password"}
            type="password"
            value={values.password}
            onChange={(e) => updateField("password", e.target.value)}
            error={errors.password}
            placeholder={isEditMode ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"}
            autoComplete="new-password"
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="role-select" className="text-sm font-medium text-zodiac-700">
              Peran
            </label>
            <select
              id="role-select"
              value={values.role}
              onChange={(e) => updateField("role", e.target.value as Role)}
              className="w-full rounded-lg border border-zodiac-200 px-3.5 py-2.5 text-sm text-zodiac-900
                focus:outline-none focus:ring-2 focus:ring-zodiac-500 focus:border-transparent"
            >
              <option value="Admin Master">Admin Master</option>
              <option value="User">User</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="status-select" className="text-sm font-medium text-zodiac-700">
              Status
            </label>
            <select
              id="status-select"
              value={values.status}
              onChange={(e) => updateField("status", e.target.value as UserStatus)}
              className="w-full rounded-lg border border-zodiac-200 px-3.5 py-2.5 text-sm text-zodiac-900
                focus:outline-none focus:ring-2 focus:ring-zodiac-500 focus:border-transparent"
            >
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit">{isEditMode ? "Lanjutkan" : "Simpan"}</Button>
        </div>
      </form>
    </div>
  );
}

interface ConfirmEditDialogProps {
  before: AuthUser;
  after: AuthUser;
  onConfirm: () => void;
  onCancel: () => void;
}

const FIELD_LABELS: { key: keyof AuthUser; label: string }[] = [
  { key: "name", label: "Nama" },
  { key: "username", label: "Username" },
  { key: "email", label: "Email" },
  { key: "role", label: "Peran" },
  { key: "status", label: "Status" },
];

function ConfirmEditDialog({ before, after, onConfirm, onCancel }: ConfirmEditDialogProps) {
  const changedFields = FIELD_LABELS.filter(({ key }) => before[key] !== after[key]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-edit-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-zodiac-950/50 px-4"
    >
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl">
        <h2 id="confirm-edit-title" className="font-display text-base font-semibold text-zodiac-900">
          Simpan perubahan untuk {before.name}?
        </h2>

        {changedFields.length > 0 ? (
          <div className="mt-4 flex flex-col gap-2 rounded-lg bg-zodiac-50/60 p-3.5">
            {changedFields.map(({ key, label }) => (
              <div key={key} className="text-sm">
                <span className="font-medium text-zodiac-700">{label}: </span>
                <span className="text-zodiac-400 line-through">{String(before[key])}</span>
                <span className="mx-1.5 text-zodiac-300">&rarr;</span>
                <span className="text-zodiac-900">{String(after[key])}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-zodiac-500">
            Tidak ada perubahan data selain password.
          </p>
        )}

        <p className="mt-4 text-sm text-zodiac-500">
          Pastikan perubahan di atas sudah benar sebelum disimpan.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Periksa Kembali
          </Button>
          <Button onClick={onConfirm}>Ya, Simpan</Button>
        </div>
      </div>
    </div>
  );
}
