import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, ArrowRightLeft, RefreshCcw } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import { ToastContainer } from '../../../components/ui/Toast';
import { useToast } from '../../../utils/useToast';
import TransferStokFormModal from './TransferStokFormModal';
import { fetchAllTransfers, createAndExecuteTransfer } from '../../../services/transferStokService';
import { fetchProduk } from '../../../services/produkService';
import { fetchPersediaan } from '../../../services/persediaanService';
import { fetchAllFlatLocations } from '../../../services/gudangService';
import type { TransferStok, TransferStokFormValues } from '../../../types/transferStok';
import type { Produk } from '../../../types/produk';
import type { StokItem } from '../../../types/persediaan';
import { STATUS_TRANSFER_LABEL, STATUS_TRANSFER_TONE } from '../../../types/transferStok';

export default function TransferStokPage() {
  const [data, setData] = useState<TransferStok[]>([]);
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [persediaanList, setPersediaanList] = useState<StokItem[]>([]);
  const [lokasiList, setLokasiList] = useState<{ id: string; fullPath: string; kodeLokasi: string }[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const { toasts, showToast, dismissToast } = useToast();

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [transfers, produks, stocks, locs] = await Promise.all([
        fetchAllTransfers(),
        fetchProduk(),
        fetchPersediaan(),
        fetchAllFlatLocations(),
      ]);
      setData(transfers);
      setProdukList(produks);
      setPersediaanList(stocks);
      setLokasiList(locs);
    } catch {
      setError('Gagal memuat riwayat transfer stok.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((t) => {
      const q = searchTerm.toLowerCase();
      return (
        t.nomorTransfer.toLowerCase().includes(q) ||
        t.produkNama.toLowerCase().includes(q) ||
        t.produkKode.toLowerCase().includes(q) ||
        t.dariGudang.toLowerCase().includes(q) ||
        t.keGudang.toLowerCase().includes(q) ||
        (t.catatan ?? '').toLowerCase().includes(q)
      );
    });
  }, [data, searchTerm]);

  async function handleFormSubmit(values: TransferStokFormValues, produk: Produk) {
    await createAndExecuteTransfer(values, produk);
    await loadData();
    showToast('success', `Transfer stok ${produk.namaProduk} berhasil dieksekusi.`);
  }

  return (
    <div className="space-y-4">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-surface-border">
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nomor transfer, produk, atau gudang..."
              className="input-field pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <button type="button" className="btn-secondary py-2" onClick={loadData}>
              <RefreshCcw size={14} />
            </button>
            <button type="button" className="btn-primary" onClick={() => setFormOpen(true)}>
              <Plus size={14} />
              Transfer Stok Baru
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-4 space-y-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 rounded-md bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-slate-700">{error}</p>
            <button type="button" className="btn-secondary mt-3 inline-flex items-center gap-1.5" onClick={loadData}>
              <RefreshCcw size={14} /> Coba Lagi
            </button>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <ArrowRightLeft size={20} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-700">Belum ada riwayat transfer stok</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Buat transfer stok untuk memindahkan kuantitas fisik antar gudang atau lokasi rak.
            </p>
            <button type="button" className="btn-primary mt-4" onClick={() => setFormOpen(true)}>
              <Plus size={14} />
              Transfer Stok Baru
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-surface-border bg-slate-50/50">
                  <th className="px-4 py-2.5 font-medium">No. Transfer</th>
                  <th className="px-4 py-2.5 font-medium">Tanggal</th>
                  <th className="px-4 py-2.5 font-medium">Produk</th>
                  <th className="px-4 py-2.5 font-medium">Jumlah</th>
                  <th className="px-4 py-2.5 font-medium">Dari (Asal)</th>
                  <th className="px-4 py-2.5 font-medium">Ke (Tujuan)</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Petugas</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((t) => (
                  <tr key={t.id} className="border-b border-surface-border last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 text-xs font-mono font-medium text-slate-800">{t.nomorTransfer}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(t.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-medium text-slate-800">
                      {t.produkNama} <span className="text-slate-400 font-normal">({t.produkKode})</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-bold text-slate-800">
                      {t.jumlah} {t.satuan}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-600 max-w-xs truncate">
                      {t.dariGudang} ({t.dariLokasi})
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-600 max-w-xs truncate">
                      {t.keGudang} ({t.keLokasi})
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={STATUS_TRANSFER_TONE[t.status]}>{STATUS_TRANSFER_LABEL[t.status]}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{t.operator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TransferStokFormModal
        open={formOpen}
        produkList={produkList}
        persediaanList={persediaanList}
        lokasiList={lokasiList}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
