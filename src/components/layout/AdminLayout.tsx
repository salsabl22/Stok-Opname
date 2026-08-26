import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ScrollText,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import type { AuthUser } from "../../types/auth";

interface AdminLayoutProps {
  currentUser: AuthUser;
  onLogout: () => void;
  children: ReactNode;
}

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dasbor", icon: LayoutDashboard },
  { to: "/admin/pengguna", label: "Pengguna & Hak Akses", icon: Users },
  { to: "/admin/peran", label: "Konfigurasi Peran", icon: ShieldCheck },
  { to: "/admin/audit", label: "Riwayat Audit", icon: ScrollText },
];

export function AdminLayout({ currentUser, onLogout, children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Sidebar */}
      <aside
        className={`flex flex-shrink-0 flex-col bg-zodiac-950 text-white
          transition-[width] duration-200 ease-in-out overflow-hidden
          ${isSidebarOpen ? "w-64" : "w-[72px]"}`}
      >
        <div
          className={`flex items-center gap-2.5 px-4 py-6 ${
            isSidebarOpen ? "" : "justify-center px-0"
          }`}
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-accent font-display text-sm font-bold text-zodiac-950">
            W
          </div>
          {isSidebarOpen && (
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold leading-none">
                CrewFlow
              </p>
              <p className="mt-1 truncate text-xs text-zodiac-300">
                Warehouse Mgmt
              </p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={isSidebarOpen ? undefined : label}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                ${isSidebarOpen ? "" : "justify-center"}
                ${
                  isActive
                    ? "bg-zodiac-800 text-white"
                    : "text-zodiac-300 hover:bg-zodiac-800/60 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
              {isSidebarOpen && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Toggle button */}
        <div className="border-t border-zodiac-800 p-3">
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            aria-label={isSidebarOpen ? "Sembunyikan sidebar" : "Tampilkan sidebar"}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
              text-zodiac-300 hover:bg-zodiac-800/60 hover:text-white
              ${isSidebarOpen ? "" : "justify-center"}`}
          >
            {isSidebarOpen ? (
              <>
                <PanelLeftClose className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
                <span className="truncate">Sembunyikan</span>
              </>
            ) : (
              <PanelLeftOpen className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
            )}
          </button>

          <button
            onClick={onLogout}
            title={isSidebarOpen ? undefined : "Keluar"}
            className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
              text-zodiac-300 hover:bg-zodiac-800/60 hover:text-white
              ${isSidebarOpen ? "" : "justify-center"}`}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
            {isSidebarOpen && <span className="truncate">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border-subtle bg-surface px-8 py-4">
          <div />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-zodiac-900">{currentUser.name}</p>
              <p className="text-xs text-zodiac-400">{currentUser.role}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zodiac-100 text-sm font-semibold text-zodiac-700">
              {currentUser.name.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
