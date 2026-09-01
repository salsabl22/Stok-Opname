import { useState, useEffect } from 'react';
import { Users, Shield, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import axios from 'axios';

type AdminTab = 'pengguna' | 'peran' | 'khusus' | 'pengaturan';

const MODULS = ['penerimaan', 'picking', 'packing', 'qc', 'putaway', 'laporan', 'retur', 'pengendalian', 'data_master'];
const AKSI_LIST = ['lihat', 'buat', 'ubah', 'hapus', 'proses', 'setujui', 'export'] as const;

export default function AdministrasiPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('pengguna');
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // User form state
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ username: '', name: '', password: '', roleId: '' });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const [userRes, roleRes] = await Promise.all([
        axios.get('http://localhost:3000/api/admin/users'),
        axios.get('http://localhost:3000/api/admin/roles'),
      ]);
      setUsers(userRes.data);
      setRoles(roleRes.data);
    } catch {
      // ignore errors if routes not ready yet
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleSaveUser() {
    try {
      if (editingUserId) {
        await axios.put(`http://localhost:3000/api/admin/users/${editingUserId}`, userForm);
      } else {
        await axios.post('http://localhost:3000/api/admin/users', userForm);
      }
      setShowUserForm(false);
      setEditingUserId(null);
      setUserForm({ username: '', name: '', password: '', roleId: '' });
      await loadData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Gagal menyimpan user.');
    }
  }

  async function handleDeleteUser(id: string) {
    if (!confirm('Yakin menghapus user ini?')) return;
    try {
      await axios.delete(`http://localhost:3000/api/admin/users/${id}`);
      await loadData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Gagal menghapus user.');
    }
  }

  function handleEditUser(u: any) {
    setUserForm({ username: u.username, name: u.name, password: '', roleId: u.roleId || '' });
    setEditingUserId(u.id);
    setShowUserForm(true);
  }

  async function handleToggleUserPermission(userId: string, modul: string, aksi: string, currentVal: boolean) {
    try {
      const u = users.find(x => x.id === userId);
      const perm = u.permissions?.find((p: any) => p.modul === modul) || { lihat: false, buat: false, ubah: false, hapus: false, proses: false, setujui: false, export: false };
      
      await axios.put(`http://localhost:3000/api/admin/users/${userId}/permissions`, {
        modul,
        ...perm,
        [aksi]: !currentVal
      });
      await loadData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Gagal mengubah permission khusus.');
    }
  }

  return (
    <div className="space-y-4">
      <div className="card">
        {/* Tabs */}
        <div className="flex gap-0 border-b border-surface-border">
          {[
            { id: 'pengguna', label: 'Pengguna & Hak Akses', icon: <Users size={14} /> },
            { id: 'peran', label: 'Peran (Role)', icon: <Shield size={14} /> },
            { id: 'khusus', label: 'Hak Akses Khusus', icon: <Shield size={14} /> },
            { id: 'pengaturan', label: 'Pengaturan', icon: <Shield size={14} /> },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* PENGGUNA TAB */}
        {activeTab === 'pengguna' && (
          <div>
            <div className="p-4 flex justify-between items-center border-b border-surface-border">
              <span className="text-xs text-slate-500">{users.length} pengguna terdaftar</span>
              <button
                type="button"
                className="btn-primary flex items-center gap-1.5 text-xs"
                onClick={() => { setShowUserForm(true); setEditingUserId(null); setUserForm({ username: '', name: '', password: '', roleId: '' }); }}
              >
                <Plus size={14} /> Tambah User
              </button>
            </div>

            {showUserForm && (
              <div className="p-4 border-b border-surface-border bg-blue-50/30">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="label">Username</label>
                    <input className="input-field" value={userForm.username} onChange={e => setUserForm(p => ({ ...p, username: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Nama Lengkap</label>
                    <input className="input-field" value={userForm.name} onChange={e => setUserForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Password {editingUserId && '(kosongkan jika tidak diubah)'}</label>
                    <input className="input-field" type="password" value={userForm.password} onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Role</label>
                    <select className="input-field" value={userForm.roleId} onChange={e => setUserForm(p => ({ ...p, roleId: e.target.value }))}>
                      <option value="">-- Pilih Role --</option>
                      {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button type="button" className="btn-secondary flex items-center gap-1.5 text-xs" onClick={() => setShowUserForm(false)}>
                    <X size={12} /> Batal
                  </button>
                  <button type="button" className="btn-primary flex items-center gap-1.5 text-xs" onClick={handleSaveUser}>
                    <Check size={12} /> Simpan
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="p-4 space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-9 bg-slate-100 rounded-md animate-pulse" />)}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[11px] uppercase text-slate-400 border-b border-surface-border">
                      <th className="px-4 py-2.5">Username</th>
                      <th className="px-4 py-2.5">Nama</th>
                      <th className="px-4 py-2.5">Role</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-surface-border last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-2.5 text-xs font-medium text-slate-800">{u.username}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-600">{u.name}</td>
                        <td className="px-4 py-2.5 text-xs">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 text-indigo-700">
                            {u.role?.name || 'Tidak ada role'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-xs">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {u.isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex justify-end gap-1">
                            <button type="button" className="btn-secondary p-1.5" onClick={() => handleEditUser(u)}>
                              <Pencil size={12} />
                            </button>
                            <button type="button" className="btn-secondary p-1.5 text-red-500" onClick={() => handleDeleteUser(u.id)}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PERAN TAB */}
        {activeTab === 'peran' && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Konfigurasi Hak Akses per Modul</h3>
            {roles.length === 0 ? (
              <p className="text-xs text-slate-400">Belum ada role tersedia.</p>
            ) : (
              roles.map(role => (
                <div key={role.id} className="mb-6">
                  <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wide">{role.name}</h4>
                  <div className="overflow-x-auto border border-surface-border rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50">
                        <tr className="border-b border-surface-border text-[11px] uppercase text-slate-400">
                          <th className="px-3 py-2 font-medium">Modul</th>
                          {AKSI_LIST.map(a => <th key={a} className="px-3 py-2 font-medium text-center">{a}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {MODULS.map(modul => {
                          const perm = role.permissions?.find((p: any) => p.modul === modul || p.modul === 'semua');
                          return (
                            <tr key={modul} className="border-b border-surface-border last:border-0">
                              <td className="px-3 py-2 font-medium text-slate-700 capitalize">{modul.replace('_', ' ')}</td>
                              {AKSI_LIST.map(aksi => (
                                <td key={aksi} className="px-3 py-2 text-center">
                                  {perm?.[aksi] ? (
                                    <Check size={12} className="mx-auto text-green-500" />
                                  ) : (
                                    <X size={12} className="mx-auto text-slate-200" />
                                  )}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* HAK AKSES KHUSUS TAB */}
        {activeTab === 'khusus' && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Hak Akses Khusus (Override per Pengguna)</h3>
            <p className="text-xs text-slate-500 mb-4">Pengaturan ini akan menimpa hak akses dari role pengguna. Centang untuk memberikan akses.</p>
            {users.length === 0 ? (
              <p className="text-xs text-slate-400">Belum ada pengguna tersedia.</p>
            ) : (
              users.map(u => (
                <div key={u.id} className="mb-6">
                  <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wide">{u.name} <span className="text-slate-400 font-normal lowercase">(@{u.username})</span></h4>
                  <div className="overflow-x-auto border border-surface-border rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50">
                        <tr className="border-b border-surface-border text-[11px] uppercase text-slate-400">
                          <th className="px-3 py-2 font-medium">Modul</th>
                          {AKSI_LIST.map(a => <th key={a} className="px-3 py-2 font-medium text-center">{a}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {MODULS.map(modul => {
                          const rolePerm = u.role?.permissions?.find((p: any) => p.modul === modul || p.modul === 'semua');
                          const userPerm = u.permissions?.find((p: any) => p.modul === modul);
                          return (
                            <tr key={modul} className="border-b border-surface-border last:border-0">
                              <td className="px-3 py-2 font-medium text-slate-700 capitalize">{modul.replace('_', ' ')}</td>
                              {AKSI_LIST.map(aksi => {
                                const hasUserPerm = userPerm?.[aksi] !== undefined ? userPerm[aksi] : false;
                                const hasRolePerm = rolePerm?.[aksi] !== undefined ? rolePerm[aksi] : false;
                                const isActive = hasUserPerm || hasRolePerm;
                                const isOverride = hasUserPerm;
                                
                                return (
                                  <td key={aksi} className="px-3 py-2 text-center cursor-pointer hover:bg-slate-50" onClick={() => handleToggleUserPermission(u.id, modul, aksi, isActive)}>
                                    {isActive ? (
                                      <Check size={14} className={`mx-auto ${isOverride ? 'text-blue-500' : 'text-green-500'}`} />
                                    ) : (
                                      <div className="w-3.5 h-3.5 mx-auto border border-slate-300 rounded-sm"></div>
                                    )}
                                  </td>
                                )
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PENGATURAN TAB */}
        {activeTab === 'pengaturan' && (
          <div className="p-8 text-center">
            <Shield size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-600">Pengaturan Sistem</p>
            <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
              Fitur konfigurasi sistem seperti nama perusahaan, timezone, dan setting gudang akan tersedia di sini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
