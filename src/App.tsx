import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/Login";
import { AdminLayout } from "./components/layout/AdminLayout";
import { UserAccessPage } from "./pages/admin/UserAccess";
import { RoleConfigPage } from "./pages/admin/RoleConfig";
import { UsersProvider } from "./state/UsersProvider";
import type { AuthUser } from "./types/auth";

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  if (!currentUser) {
    return <LoginPage onLoginSuccess={setCurrentUser} />;
  }

  return (
    <UsersProvider>
      <BrowserRouter>
        <AdminLayout currentUser={currentUser} onLogout={() => setCurrentUser(null)}>
          <Routes>
            <Route path="/" element={<Navigate to="/admin/pengguna" replace />} />
            <Route path="/admin/dashboard" element={<DashboardPlaceholder />} />
            <Route path="/admin/pengguna" element={<UserAccessPage />} />
            <Route path="/admin/peran" element={<RoleConfigPage />} />
            <Route path="/admin/audit" element={<AuditPlaceholder />} />
          </Routes>
        </AdminLayout>
      </BrowserRouter>
    </UsersProvider>
  );
}

function DashboardPlaceholder() {
  return (
    <p className="text-sm text-zodiac-400">
      Dashboard ringkasan persediaan &mdash; akan diisi oleh modul Operasional.
    </p>
  );
}

function AuditPlaceholder() {
  return (
    <p className="text-sm text-zodiac-400">
      Riwayat audit konfigurasi akan tampil di sini.
    </p>
  );
}