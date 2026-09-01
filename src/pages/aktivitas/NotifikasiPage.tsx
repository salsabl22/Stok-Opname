import { useState, useEffect } from 'react';
import { Bell, CheckCircle, RefreshCcw, AlertTriangle, Package, ClipboardList } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

export default function NotifikasiPage() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'notifikasi' | 'aktivitas' | 'audit'>('notifikasi');
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const [notifRes, actRes] = await Promise.all([
        axios.get(`http://localhost:3000/api/notifications?userId=${user?.id || ''}`),
        axios.get('http://localhost:3000/api/activities'),
      ]);
      setNotifs(notifRes.data);
      setActivities(actRes.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleMarkRead(id: string) {
    await axios.put(`http://localhost:3000/api/notifications/${id}/read`);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }

  async function handleMarkAllRead() {
    const unread = notifs.filter(n => !n.isRead);
    await Promise.all(unread.map(n => axios.put(`http://localhost:3000/api/notifications/${n.id}/read`)));
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
  }

  const unreadCount = notifs.filter(n => !n.isRead).length;

  const TIPE_ICON: Record<string, React.ReactNode> = {
    TUGAS_BARU: <ClipboardList size={14} className="text-blue-500" />,
    STOK_RENDAH: <AlertTriangle size={14} className="text-amber-500" />,
    EXCEPTION: <AlertTriangle size={14} className="text-red-500" />,
    RETUR_MASUK: <RefreshCcw size={14} className="text-purple-500" />,
    APPROVAL: <CheckCircle size={14} className="text-green-500" />,
  };

  return (
    <div className="space-y-4">
      <div className="card">
        {/* Tabs */}
        <div className="flex gap-0 border-b border-surface-border">
          {[
            { id: 'notifikasi', label: `Notifikasi${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
            { id: 'aktivitas', label: 'Riwayat Aktivitas' },
            { id: 'audit', label: 'Audit Log' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <div className="ml-auto flex items-center pr-4 gap-2">
            {activeTab === 'notifikasi' && unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-brand-600 hover:underline"
              >
                Tandai semua dibaca
              </button>
            )}
            <button type="button" onClick={loadData} className="text-slate-400 hover:text-slate-600">
              <RefreshCcw size={14} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 rounded-md bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : activeTab === 'notifikasi' ? (
          notifs.length === 0 ? (
            <div className="p-12 text-center">
              <Bell size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm text-slate-500">Tidak ada notifikasi</p>
            </div>
          ) : (
            <ul className="divide-y divide-surface-border">
              {notifs.map(n => (
                <li
                  key={n.id}
                  className={`flex items-start gap-3 p-4 transition-colors ${!n.isRead ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                >
                  <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                    {TIPE_ICON[n.tipe] || <Bell size={14} className="text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs font-medium ${!n.isRead ? 'text-slate-800' : 'text-slate-600'}`}>
                        {n.judul}
                      </p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{n.pesan}</p>
                  </div>
                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n.id)}
                      className="flex-shrink-0 text-[10px] text-brand-600 hover:underline mt-1"
                    >
                      Tandai dibaca
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )
        ) : (
          /* Aktivitas / Audit Log */
          activities.length === 0 ? (
            <div className="p-12 text-center">
              <Package size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm text-slate-500">Belum ada aktivitas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-surface-border">
                    <th className="px-4 py-2.5 font-medium">User</th>
                    <th className="px-4 py-2.5 font-medium">Aksi</th>
                    <th className="px-4 py-2.5 font-medium">Modul</th>
                    {activeTab === 'audit' && <th className="px-4 py-2.5 font-medium">Sebelum</th>}
                    {activeTab === 'audit' && <th className="px-4 py-2.5 font-medium">Sesudah</th>}
                    <th className="px-4 py-2.5 font-medium">Detail</th>
                    <th className="px-4 py-2.5 font-medium">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map(a => (
                    <tr key={a.id} className="border-b border-surface-border last:border-0 hover:bg-slate-50/60">
                      <td className="px-4 py-2.5 text-xs font-medium text-slate-800">{a.user?.name || '-'}</td>
                      <td className="px-4 py-2.5 text-xs">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
                          {a.aksi}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-600">{a.modul}</td>
                      {activeTab === 'audit' && (
                        <>
                          <td className="px-4 py-2.5 text-[10px] text-slate-500 max-w-[120px] truncate">
                            {a.dataSebelum || '-'}
                          </td>
                          <td className="px-4 py-2.5 text-[10px] text-slate-500 max-w-[120px] truncate">
                            {a.dataSesudah || '-'}
                          </td>
                        </>
                      )}
                      <td className="px-4 py-2.5 text-xs text-slate-500">{a.detail || '-'}</td>
                      <td className="px-4 py-2.5 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(a.createdAt).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
