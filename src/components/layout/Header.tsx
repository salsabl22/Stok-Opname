import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut } from 'lucide-react';
import axios from 'axios';
import { NAV_GROUPS } from './Sidebar';
import { resolveBreadcrumb } from '../../utils/breadcrumb';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const breadcrumb = resolveBreadcrumb(location.pathname, NAV_GROUPS);
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchUnread() {
      try {
        const { data } = await axios.get(`http://localhost:3000/api/notifications?userId=${user?.id || ''}`);
        const count = data.filter((n: any) => !n.isRead).length;
        setUnreadCount(count);
      } catch {
        // silence
      }
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [user?.id]);

  // Resolve user role label
  const roleLabel = (() => {
    const role = (user as any)?.role;
    if (typeof role === 'string') return role === 'ADMIN_MASTER' ? 'Administrator' : role;
    if (role?.name) return role.name;
    return 'Staf';
  })();

  return (
    <header className="h-14 shrink-0 bg-white border-b border-surface-border flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="leading-tight">
        {breadcrumb.group && (
          <p className="text-[11px] text-slate-400">{breadcrumb.group}</p>
        )}
        <h1 className="text-sm font-semibold text-slate-800">{breadcrumb.label}</h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifikasi"
          onClick={() => navigate('/aktivitas')}
          className="relative w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Bell size={17} strokeWidth={2} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2.5 pl-4 border-l border-surface-border">
          <div className="w-8 h-8 rounded-full bg-brand-600 text-white text-xs font-semibold flex items-center justify-center uppercase">
            {user?.name ? user.name.substring(0, 2) : 'U'}
          </div>
          <div className="leading-tight">
            <p className="text-xs font-medium text-slate-800">{user?.name || 'Guest'}</p>
            <p className="text-[11px] text-slate-400">{roleLabel}</p>
          </div>
          <button
            onClick={logout}
            className="ml-2 text-slate-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
