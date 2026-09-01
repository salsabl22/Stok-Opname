import { useState, useEffect, useMemo } from 'react';
import { Download, FileText, Table, RefreshCcw, TrendingUp, Package, ArrowDown, ArrowUp } from 'lucide-react';
import axios from 'axios';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';

type Tipelaporan = 'persediaan' | 'barang_masuk' | 'barang_keluar' | 'retur' | 'aktivitas';

const LAPORAN_TABS: { id: Tipelaporan; label: string; icon: React.ReactNode }[] = [
  { id: 'persediaan', label: 'Persediaan', icon: <Package size={15} /> },
  { id: 'barang_masuk', label: 'Barang Masuk (PO)', icon: <ArrowDown size={15} /> },
  { id: 'barang_keluar', label: 'Barang Keluar (SO)', icon: <ArrowUp size={15} /> },
  { id: 'retur', label: 'Retur', icon: <RefreshCcw size={15} /> },
  { id: 'aktivitas', label: 'Aktivitas', icon: <TrendingUp size={15} /> },
];

export default function LaporanPage() {
  const [activeTab, setActiveTab] = useState<Tipelaporan>('persediaan');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterMulai, setFilterMulai] = useState('');
  const [filterSampai, setFilterSampai] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  async function loadData(tab: Tipelaporan) {
    setLoading(true);
    setError(null);
    try {
      let url = 'http://localhost:3000/api';
      if (tab === 'persediaan') url += '/operasional/inventory';
      else if (tab === 'barang_masuk') url += '/purchase-order';
      else if (tab === 'barang_keluar') url += '/operasional/sales-order';
      else if (tab === 'retur') url += '/operasional/retur';
      else if (tab === 'aktivitas') url += '/activities';
      const { data: result } = await axios.get(url);
      setData(result);
    } catch {
      setError('Gagal memuat data laporan.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab]);

  const columns = useMemo(() => {
    switch (activeTab) {
      case 'persediaan':
        return [
          { header: 'Kode Produk', key: 'kodeProduk' },
          { header: 'Nama Produk', key: 'namaProduk' },
          { header: 'Tersedia', key: 'jumlahTersedia' },
          { header: 'Dialokasikan', key: 'jumlahDialokasikan' },
          { header: 'Karantina', key: 'jumlahKarantina' },
          { header: 'Waste', key: 'jumlahWaste' },
          { header: 'Min. Stok', key: 'minimumStok' },
        ];
      case 'barang_masuk':
        return [
          { header: 'Nomor PO', key: 'nomorPO' },
          { header: 'Tanggal', key: 'tanggal' },
          { header: 'Pemasok', key: 'pemasokNama' },
          { header: 'Total', key: 'totalPesanan' },
          { header: 'Status', key: 'status' },
        ];
      case 'barang_keluar':
        return [
          { header: 'Nomor SO', key: 'nomorSO' },
          { header: 'Tanggal', key: 'tanggal' },
          { header: 'Cabang', key: 'cabangNama' },
          { header: 'Status', key: 'status' },
        ];
      case 'retur':
        return [
          { header: 'Nomor Retur', key: 'nomorRetur' },
          { header: 'Alasan', key: 'alasan' },
          { header: 'Status', key: 'status' },
          { header: 'Kondisi', key: 'kondisi' },
        ];
      case 'aktivitas':
        return [
          { header: 'User', key: 'userName' },
          { header: 'Aksi', key: 'aksi' },
          { header: 'Modul', key: 'modul' },
          { header: 'Detail', key: 'detail' },
          { header: 'Waktu', key: 'createdAt' },
        ];
      default:
        return [];
    }
  }, [activeTab]);

  const flatData = useMemo(() => {
    return data.map((item) => {
      if (activeTab === 'persediaan') {
        return {
          kodeProduk: item.produk?.kodeProduk || '-',
          namaProduk: item.produk?.namaProduk || '-',
          jumlahTersedia: item.jumlahTersedia,
          jumlahDialokasikan: item.jumlahDialokasikan,
          jumlahKarantina: item.jumlahKarantina,
          jumlahWaste: item.jumlahWaste,
          minimumStok: item.minimumStok,
        };
      }
      if (activeTab === 'barang_masuk') {
        return { ...item, pemasokNama: item.pemasok?.nama || '-' };
      }
      if (activeTab === 'barang_keluar') {
        return { ...item, cabangNama: item.cabang?.nama || '-' };
      }
      if (activeTab === 'aktivitas') {
        return {
          ...item,
          userName: item.user?.name || '-',
          createdAt: new Date(item.createdAt).toLocaleString('id-ID'),
        };
      }
      return item;
    });
  }, [data, activeTab]);

  const filteredData = useMemo(() => {
    return flatData.filter(item => {
      // Filter Status
      if (filterStatus !== 'all' && item.status !== undefined) {
         if (item.status !== filterStatus) return false;
      }
      // Filter Tanggal
      if (filterMulai || filterSampai) {
         const dateStr = item.tanggal || item.createdAt;
         if (dateStr) {
           const d = new Date(dateStr);
           if (filterMulai && d < new Date(filterMulai)) return false;
           if (filterSampai) {
             const endD = new Date(filterSampai);
             endD.setHours(23, 59, 59, 999);
             if (d > endD) return false;
           }
         }
      }
      return true;
    });
  }, [flatData, filterStatus, filterMulai, filterSampai]);

  const activeLabel = LAPORAN_TABS.find(t => t.id === activeTab)?.label || '';

  const handleExportPDF = () => {
    exportToPDF(`Laporan ${activeLabel}`, columns, filteredData);
  };

  const handleExportExcel = () => {
    exportToExcel(`Laporan ${activeLabel}`, columns, filteredData);
  };

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Transaksi PO', value: activeTab === 'barang_masuk' ? filteredData.length : '-' },
          { label: 'Total Transaksi SO', value: activeTab === 'barang_keluar' ? filteredData.length : '-' },
          { label: 'Total Retur', value: activeTab === 'retur' ? filteredData.length : '-' },
          { label: 'Total Item', value: filteredData.length },
        ].map(kpi => (
          <div key={kpi.label} className="card p-4">
            <div className="text-2xl font-bold text-slate-800">{kpi.value}</div>
            <div className="text-xs text-slate-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        {/* Tabs */}
        <div className="flex gap-0 border-b border-surface-border overflow-x-auto">
          {LAPORAN_TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 border-b border-surface-border">
          <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
            <div className="flex gap-2 items-center">
               <label className="text-xs text-slate-500">Mulai:</label>
               <input type="date" className="input-field text-xs py-1.5 px-2" value={filterMulai} onChange={e => setFilterMulai(e.target.value)} />
            </div>
            <div className="flex gap-2 items-center">
               <label className="text-xs text-slate-500">Sampai:</label>
               <input type="date" className="input-field text-xs py-1.5 px-2" value={filterSampai} onChange={e => setFilterSampai(e.target.value)} />
            </div>
            {activeTab !== 'persediaan' && activeTab !== 'aktivitas' && (
              <div className="flex gap-2 items-center">
                 <label className="text-xs text-slate-500">Status:</label>
                 <select className="input-field text-xs py-1.5 px-2" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="all">Semua Status</option>
                    <option value="draft">Draft</option>
                    <option value="dikirim">Dikirim</option>
                    <option value="selesai">Selesai</option>
                 </select>
              </div>
            )}
            <span className="text-xs text-slate-500 border-l border-slate-200 pl-3">{filteredData.length} item ditemukan</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={loading || filteredData.length === 0}
              className="btn-secondary flex items-center gap-1.5 text-xs"
            >
              <FileText size={14} />
              Export PDF
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={loading || filteredData.length === 0}
              className="btn-secondary flex items-center gap-1.5 text-xs"
            >
              <Download size={14} />
              Export Excel
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-6 space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-9 rounded-md bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-500 mb-3">{error}</p>
            <button type="button" className="btn-secondary" onClick={() => loadData(activeTab)}>
              <RefreshCcw size={14} /> Coba Lagi
            </button>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-12 text-center">
            <Table size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">Tidak ada data untuk laporan ini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-surface-border">
                  {columns.map(col => (
                    <th key={col.key} className="px-4 py-2.5 font-medium">{col.header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, i) => (
                  <tr key={i} className="border-b border-surface-border last:border-0 hover:bg-slate-50/60">
                    {columns.map(col => (
                      <td key={col.key} className="px-4 py-2.5 text-xs text-slate-700">
                        {row[col.key] ?? '-'}
                      </td>
                    ))}
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
