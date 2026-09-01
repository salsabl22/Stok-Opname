import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowRight,
  ClipboardList,
  CheckCircle2,
  Boxes,
  RefreshCcw,
  ArrowUpRight,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { fetchDashboardMetrics, type DashboardMetrics } from '../services/dashboardService';
import Badge from '../components/ui/Badge';
import { TIPE_MOVEMENT_LABEL, TIPE_MOVEMENT_TONE } from '../types/stockMovement';
import { PRIORITAS_TUGAS_TONE } from '../types/task';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboardMetrics();
      setMetrics(data);
    } catch {
      setError('Gagal memuat data ringkasan dasbor.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !metrics) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm font-medium text-slate-700">{error || 'Terjadi kesalahan'}</p>
        <button type="button" className="btn-secondary mt-3 inline-flex items-center gap-1.5" onClick={loadData}>
          <RefreshCcw size={14} />
          Muat Ulang
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* HEADER BANNER */}
      <div className="card p-5 bg-gradient-to-r from-navy-900 to-navy-800 text-white border-0 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Operasional Aktif
            </span>
            <span className="text-xs text-slate-300">WMS Pusat Distribusi</span>
          </div>
          <h1 className="text-lg font-bold text-white mt-1">Pusat Kendali Pergudangan & Stock Opname</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Pantau arus logistik, saldo persediaan real-time, dan status tugas gudang hari ini.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors flex items-center gap-1.5 backdrop-blur-sm"
            onClick={loadData}
          >
            <RefreshCcw size={13} />
            Refresh Data
          </button>
          <button
            type="button"
            className="px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white shadow transition-colors flex items-center gap-1.5"
            onClick={() => navigate('/pengendalian/perhitungan-stok')}
          >
            <ClipboardList size={13} />
            Stock Opname
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total SKU & Fisik */}
        <div className="card p-4 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Persediaan</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Boxes size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">{metrics.totalFisikStok.toLocaleString()}</span>
            <span className="text-xs font-medium text-slate-500">unit fisik</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{metrics.totalSKU} SKU Aktif</span>
            <span className="text-emerald-600 font-medium">{metrics.totalStokBebas} Bebas Alokasi</span>
          </div>
        </div>

        {/* Peringatan Stok Menipis */}
        <div className="card p-4 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Peringatan Stok</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{metrics.totalProdukMenipis}</span>
            <span className="text-xs font-medium text-slate-500">SKU di bawah minimum</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Perlu Pengisian Ulang</span>
            <button
              type="button"
              className="text-amber-600 hover:text-amber-700 font-medium hover:underline inline-flex items-center gap-0.5"
              onClick={() => navigate('/operasional/pengisian-ulang')}
            >
              Lihat Detail <ArrowRight size={10} />
            </button>
          </div>
        </div>

        {/* Pekerjaan Tertunda */}
        <div className="card p-4 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tugas Operasional</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ClipboardList size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">{metrics.totalTugasTertunda}</span>
            <span className="text-xs font-medium text-slate-500">tugas aktif</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Antrean Hari Ini</span>
            <button
              type="button"
              className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline inline-flex items-center gap-0.5"
              onClick={() => navigate('/tugas-saya')}
            >
              Buka Tugas Saya <ArrowRight size={10} />
            </button>
          </div>
        </div>

        {/* Akurasi Stock Opname */}
        <div className="card p-4 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Akurasi Stock Opname</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{metrics.akurasiOpnamePersen}%</span>
            <span className="text-xs font-medium text-slate-500">tingkat kecocokan</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{metrics.opnameMenungguPersetujuan} butuh approval</span>
            <button
              type="button"
              className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline inline-flex items-center gap-0.5"
              onClick={() => navigate('/pengendalian/perhitungan-stok')}
            >
              Kelola Opname <ArrowRight size={10} />
            </button>
          </div>
        </div>
      </div>

      {/* PIPELINE LOGISTIK WMS (INBOUND & OUTBOUND) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pipeline Barang Masuk */}
        <div className="card p-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
                <ArrowDownLeft size={16} />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-800">Alur Barang Masuk (Inbound)</h3>
                <p className="text-[11px] text-slate-400">Status pesanan pembelian dari vendor</p>
              </div>
            </div>
            <button
              type="button"
              className="text-xs text-slate-600 hover:text-navy-900 font-medium flex items-center gap-1"
              onClick={() => navigate('/barang-masuk/pesanan-pembelian')}
            >
              Lihat PO <ArrowRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5 mt-3.5">
            <div
              className="p-3 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => navigate('/barang-masuk/penerimaan')}
            >
              <span className="text-[11px] text-slate-500 block">Menunggu Kedatangan</span>
              <span className="text-lg font-bold text-slate-800 mt-1 block">{metrics.poMenungguKedatangan}</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">PO dalam perjalanan</span>
            </div>
            <div
              className="p-3 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => navigate('/barang-masuk/pemeriksaan-kualitas')}
            >
              <span className="text-[11px] text-slate-500 block">Menunggu QC</span>
              <span className="text-lg font-bold text-amber-600 mt-1 block">{metrics.poMenungguQC}</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Uji fisik & kualitas</span>
            </div>
            <div
              className="p-3 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => navigate('/barang-masuk/penyimpanan')}
            >
              <span className="text-[11px] text-slate-500 block">Siap Penyimpanan</span>
              <span className="text-lg font-bold text-emerald-600 mt-1 block">{metrics.poSiapDisimpan}</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Putaway ke lokasi rak</span>
            </div>
          </div>
        </div>

        {/* Pipeline Barang Keluar */}
        <div className="card p-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                <ArrowUpRight size={16} />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-800">Alur Barang Keluar (Outbound)</h3>
                <p className="text-[11px] text-slate-400">Status pesanan cabang & pengiriman</p>
              </div>
            </div>
            <button
              type="button"
              className="text-xs text-slate-600 hover:text-navy-900 font-medium flex items-center gap-1"
              onClick={() => navigate('/barang-keluar/pesanan-cabang')}
            >
              Lihat Pesanan <ArrowRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-3.5">
            <div
              className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors text-center"
              onClick={() => navigate('/barang-keluar/alokasi')}
            >
              <span className="text-[10px] text-slate-500 block truncate">Alokasi</span>
              <span className="text-base font-bold text-slate-800 mt-0.5 block">{metrics.soMenungguAlokasi}</span>
              <span className="text-[9px] text-slate-400 block truncate">Butuh Kuota</span>
            </div>
            <div
              className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors text-center"
              onClick={() => navigate('/barang-keluar/pengambilan')}
            >
              <span className="text-[10px] text-slate-500 block truncate">Picking</span>
              <span className="text-base font-bold text-indigo-600 mt-0.5 block">{metrics.soSiapDiambil}</span>
              <span className="text-[9px] text-slate-400 block truncate">Ambil di Rak</span>
            </div>
            <div
              className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors text-center"
              onClick={() => navigate('/operasional/packing')}
            >
              <span className="text-[10px] text-slate-500 block truncate">Packing</span>
              <span className="text-base font-bold text-amber-600 mt-0.5 block">{metrics.soSiapPacking}</span>
              <span className="text-[9px] text-slate-400 block truncate">Pengemasan</span>
            </div>
            <div
              className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors text-center"
              onClick={() => navigate('/barang-keluar/pengiriman')}
            >
              <span className="text-[10px] text-slate-500 block truncate">Pengiriman</span>
              <span className="text-base font-bold text-emerald-600 mt-0.5 block">{metrics.soSiapKirim}</span>
              <span className="text-[9px] text-slate-400 block truncate">Siap Kirim</span>
            </div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN SECTION: PERINGATAN STOK MENIPIS & TUGAS OPERASIONAL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card: Peringatan Stok Menipis */}
        <div className="card">
          <div className="flex items-center justify-between p-4 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-500" />
              <h3 className="text-xs font-semibold text-slate-800">Peringatan Stok Menipis</h3>
            </div>
            <button
              type="button"
              className="text-xs text-slate-500 hover:text-navy-900 font-medium"
              onClick={() => navigate('/operasional/persediaan')}
            >
              Lihat Semua Stok
            </button>
          </div>

          {metrics.lowStockItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-1.5" />
              Seluruh SKU berada dalam batas aman persediaan.
            </div>
          ) : (
            <div className="divide-y divide-surface-border">
              {metrics.lowStockItems.map((item) => (
                <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-800">{item.produkNama}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({item.produkKode})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">{item.lokasiPenyimpanan}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <span className="text-xs font-bold text-amber-600">
                        {item.jumlahTersedia} {item.satuan}
                      </span>
                      <span className="text-[10px] text-slate-400 block">Min: {item.minimumStok}</span>
                    </div>
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-medium text-slate-700 transition-colors"
                      onClick={() => navigate('/operasional/pengisian-ulang')}
                    >
                      Restock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card: Tugas Operasional Hari Ini */}
        <div className="card">
          <div className="flex items-center justify-between p-4 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-indigo-500" />
              <h3 className="text-xs font-semibold text-slate-800">Tugas Gudang Tertunda</h3>
            </div>
            <button
              type="button"
              className="text-xs text-slate-500 hover:text-navy-900 font-medium"
              onClick={() => navigate('/tugas-saya')}
            >
              Lihat Semua Tugas
            </button>
          </div>

          {metrics.pendingTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-1.5" />
              Tidak ada tugas tertunda saat ini. Semua operasional selesai!
            </div>
          ) : (
            <div className="divide-y divide-surface-border">
              {metrics.pendingTasks.map((task) => (
                <div key={task.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800">{task.judul}</span>
                      <Badge tone={PRIORITAS_TUGAS_TONE[task.prioritas]}>{task.prioritas}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate max-w-xs">{task.deskripsi}</p>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary text-[11px] py-1 px-2.5"
                    onClick={() => navigate(task.targetUrl)}
                  >
                    Kerjakan
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RECENT STOCK MOVEMENTS AUDIT TRAIL */}
      <div className="card">
        <div className="flex items-center justify-between p-4 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <TrendingUp size={15} className="text-blue-500" />
            <h3 className="text-xs font-semibold text-slate-800">Histori Pergerakan Stok Terbaru</h3>
          </div>
          <button
            type="button"
            className="text-xs text-slate-500 hover:text-navy-900 font-medium"
            onClick={() => navigate('/operasional/pergerakan-stok')}
          >
            Buka Buku Ledger Pergerakan
          </button>
        </div>

        {metrics.recentMovements.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">Belum ada aktivitas mutasi stok tercatat.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-surface-border bg-slate-50/50">
                  <th className="px-4 py-2.5 font-medium">Waktu</th>
                  <th className="px-4 py-2.5 font-medium">Tipe Mutasi</th>
                  <th className="px-4 py-2.5 font-medium">Produk</th>
                  <th className="px-4 py-2.5 font-medium">Jumlah</th>
                  <th className="px-4 py-2.5 font-medium">Sumber &rarr; Tujuan</th>
                  <th className="px-4 py-2.5 font-medium">Referensi</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentMovements.map((m) => (
                  <tr key={m.id} className="border-b border-surface-border last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(m.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })},{' '}
                      {new Date(m.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={TIPE_MOVEMENT_TONE[m.tipe]}>{TIPE_MOVEMENT_LABEL[m.tipe]}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-medium text-slate-800">
                      {m.produkNama} <span className="text-slate-400 font-normal">({m.produkKode})</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-slate-700">
                      {m.jumlah} {m.satuan}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">
                      <span className="text-slate-500">{m.sumber}</span> &rarr;{' '}
                      <span className="font-medium text-slate-700">{m.tujuan}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-mono text-slate-500">{m.referensi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-28 rounded-lg bg-slate-100 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-slate-100 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-44 rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-44 rounded-lg bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}
