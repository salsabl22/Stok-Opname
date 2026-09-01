import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Ruler,
  Truck,
  GitBranch,
  Warehouse,
  ScanLine,
  ShoppingCart,
  PackageCheck,
  ClipboardCheck,
  Archive,
  Boxes,
  RefreshCw,
  PackagePlus,
  MoveRight,
  Send,
  Undo2,
  Scale,
  ArrowRightLeft,
  TrendingUp,
  AlertTriangle,
  Trash2,
  BarChart3,
  Bell,
  Users,
  Shield,
} from 'lucide-react';
import type { NavGroup } from '../../types/nav';

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { label: 'Dasbor', path: '/', icon: LayoutDashboard, implemented: true },
      { label: 'Tugas Saya', path: '/tugas-saya', icon: ClipboardList, implemented: true },
    ],
  },
  {
    title: 'Data Master',
    items: [
      { label: 'Produk', path: '/data-master/produk', icon: Package, implemented: true },
      { label: 'Satuan Barang', path: '/data-master/satuan-barang', icon: Ruler, implemented: true },
      { label: 'Pemasok', path: '/data-master/pemasok', icon: Truck, implemented: true },
      { label: 'Cabang', path: '/data-master/cabang', icon: GitBranch, implemented: true },
      { label: 'Gudang & Lokasi', path: '/data-master/gudang-lokasi', icon: Warehouse, implemented: true },
      { label: 'Barcode', path: '/data-master/barcode', icon: ScanLine, implemented: true },
    ],
  },
  {
    title: 'Barang Masuk',
    items: [
      { label: 'Pesanan Pembelian', path: '/barang-masuk/pesanan-pembelian', icon: ShoppingCart, implemented: true },
      { label: 'Penerimaan', path: '/barang-masuk/penerimaan', icon: PackageCheck, implemented: true },
      { label: 'Pemeriksaan Kualitas', path: '/barang-masuk/pemeriksaan-kualitas', icon: ClipboardCheck, implemented: true },
      { label: 'Penyimpanan', path: '/barang-masuk/penyimpanan', icon: Archive, implemented: true },
    ],
  },
  {
    title: 'Operasional',
    items: [
      { label: 'Persediaan', path: '/operasional/persediaan', icon: Boxes, implemented: true },
      { label: 'Pengisian Ulang', path: '/operasional/pengisian-ulang', icon: RefreshCw, implemented: true },
      { label: 'Transfer Stok', path: '/operasional/transfer-stok', icon: ArrowRightLeft, implemented: true },
      { label: 'Pergerakan Stok', path: '/operasional/pergerakan-stok', icon: TrendingUp, implemented: true },
      { label: 'Packing', path: '/operasional/packing', icon: PackagePlus, implemented: true },
    ],
  },
  {
    title: 'Barang Keluar',
    items: [
      { label: 'Pesanan Cabang', path: '/barang-keluar/pesanan-cabang', icon: ShoppingCart, implemented: true },
      { label: 'Alokasi', path: '/barang-keluar/alokasi', icon: MoveRight, implemented: true },
      { label: 'Pengambilan', path: '/barang-keluar/pengambilan', icon: PackageCheck, implemented: true },
      { label: 'Pengiriman', path: '/barang-keluar/pengiriman', icon: Send, implemented: true },
      { label: 'Retur', path: '/barang-keluar/retur', icon: Undo2, implemented: true },
    ],
  },
  {
    title: 'Pengendalian',
    items: [
      { label: 'Perhitungan Stok', path: '/pengendalian/perhitungan-stok', icon: Scale, implemented: true },
      { label: 'Pengecualian', path: '/pengendalian/pengecualian', icon: AlertTriangle, implemented: true },
      { label: 'Waste', path: '/pengendalian/waste', icon: Trash2, implemented: true },
    ],
  },
  {
    title: 'Laporan & Analitik',
    items: [
      { label: 'Laporan', path: '/laporan', icon: BarChart3, implemented: true },
    ],
  },
  {
    title: 'Sistem',
    items: [
      { label: 'Aktivitas & Notifikasi', path: '/aktivitas', icon: Bell, implemented: true },
      { label: 'Administrasi', path: '/administrasi', icon: Users, implemented: true },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 bg-navy-950 text-slate-300 flex flex-col overflow-y-auto">
      <div className="flex items-center gap-2.5 px-4 h-14 shrink-0 border-b border-white/10">
        <div className="w-8 h-8 rounded-md bg-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
          W
        </div>
        <div className="leading-tight">
          <p className="text-white text-xs font-semibold">WMS WAREHOUSE</p>
          <p className="text-[10px] text-slate-400 tracking-wide">STOK-OPNAME SYSTEM</p>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-4 overflow-y-auto">
        {NAV_GROUPS.map((group, idx) => (
          <div key={idx}>
            {group.title && (
              <p className="px-2.5 mb-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                {group.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                        isActive
                          ? 'bg-brand-600/20 text-brand-400 font-medium border border-brand-500/30'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <item.icon size={14} strokeWidth={2} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-brand-600/30 flex items-center justify-center">
            <Shield size={12} className="text-brand-400" />
          </div>
          <p className="text-[10px] text-slate-500">WMS v2.0 — Full Stack</p>
        </div>
      </div>
    </aside>
  );
}
