import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import type { Produk } from '../../../types/produk';
import type { StokItem } from '../../../types/persediaan';
import type {
  TransferStokFormErrors,
  TransferStokFormValues,
} from '../../../types/transferStok';
import { EMPTY_TRANSFER_FORM } from '../../../types/transferStok';

interface TransferStokFormModalProps {
  open: boolean;
  produkList: Produk[];
  persediaanList: StokItem[];
  lokasiList: { id: string; fullPath: string; kodeLokasi: string }[];
  onClose: () => void;
  onSubmit: (values: TransferStokFormValues, produk: Produk) => Promise<void>;
}

export default function TransferStokFormModal({
  open,
  produkList,
  persediaanList,
  lokasiList,
  onClose,
  onSubmit,
}: TransferStokFormModalProps) {
  const [values, setValues] = useState<TransferStokFormValues>(EMPTY_TRANSFER_FORM);
  const [errors, setErrors] = useState<TransferStokFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Selected product stock context
  const selectedStok = persediaanList.find((s) => s.produkId === values.produkId);
  const selectedProduk = produkList.find((p) => p.id === values.produkId);

  useEffect(() => {
    if (!open) {
      setValues(EMPTY_TRANSFER_FORM);
      setErrors({});
      setSubmitting(false);
    }
  }, [open]);

  function handleProductChange(produkId: string) {
    const stok = persediaanList.find((s) => s.produkId === produkId);
    setValues((prev) => ({
      ...prev,
      produkId,
      dariGudang: stok?.lokasiPenyimpanan?.split('/')[0]?.trim() || 'Gudang Utama',
      dariLokasi: stok?.lokasiPenyimpanan?.split('/').slice(1).join(' / ').trim() || stok?.lokasiPenyimpanan || '-',
    }));
    if (errors.produkId) {
      setErrors((prev) => ({ ...prev, produkId: undefined }));
    }
  }

  function validate(): boolean {
    const errs: TransferStokFormErrors = {};
    if (!values.produkId) errs.produkId = 'Pilih produk yang akan ditransfer.';
    if (!values.jumlah || Number(values.jumlah) <= 0) {
      errs.jumlah = 'Jumlah harus lebih besar dari 0.';
    } else if (selectedStok && Number(values.jumlah) > selectedStok.jumlahTersedia) {
      errs.jumlah = `Jumlah melebihi stok tersedia (${selectedStok.jumlahTersedia} ${selectedProduk?.satuan}).`;
    }
    if (!values.keGudang.trim()) errs.keGudang = 'Gudang tujuan wajib diisi.';
    if (!values.keLokasi.trim()) errs.keLokasi = 'Lokasi tujuan wajib diisi.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !selectedProduk) return;

    setSubmitting(true);
    try {
      await onSubmit(values, selectedProduk);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses transfer stok.';
      setErrors((prev) => ({ ...prev, general: msg }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Formulir Transfer Stok Antar Gudang / Lokasi"
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Batal
          </button>
          <button type="submit" form="transfer-stok-form" className="btn-primary" disabled={submitting}>
            {submitting ? 'Memproses...' : 'Eksekusi Transfer Stok'}
          </button>
        </div>
      }
    >
      <form id="transfer-stok-form" onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="p-3 rounded-md bg-status-dangerBg text-status-danger text-xs">
            {errors.general}
          </div>
        )}

        {/* Pilih Produk */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Produk <span className="text-status-danger">*</span>
          </label>
          <select
            className="input-field"
            value={values.produkId}
            onChange={(e) => handleProductChange(e.target.value)}
          >
            <option value="">-- Pilih Produk --</option>
            {produkList.map((p) => {
              const stok = persediaanList.find((s) => s.produkId === p.id);
              return (
                <option key={p.id} value={p.id}>
                  {p.namaProduk} ({p.kodeProduk}) — Stok: {stok?.jumlahTersedia ?? 0} {p.satuan}
                </option>
              );
            })}
          </select>
          {errors.produkId && <p className="text-[11px] text-status-danger mt-1">{errors.produkId}</p>}
        </div>

        {/* Stok Context Info */}
        {selectedStok && selectedProduk && (
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Stok Tersedia Saat Ini:</span>
              <span className="font-bold text-slate-800">
                {selectedStok.jumlahTersedia} {selectedProduk.satuan}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Lokasi Asal Terdaftar:</span>
              <span className="font-medium text-slate-700 text-right truncate max-w-xs">
                {selectedStok.lokasiPenyimpanan}
              </span>
            </div>
          </div>
        )}

        {/* Jumlah Transfer */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Jumlah Ditransfer ({selectedProduk?.satuan || 'Unit'}) <span className="text-status-danger">*</span>
          </label>
          <input
            type="number"
            min="1"
            className="input-field"
            placeholder="Masukkan jumlah fisik yang dipindahkan"
            value={values.jumlah}
            onChange={(e) => setValues((v) => ({ ...v, jumlah: e.target.value }))}
          />
          {errors.jumlah && <p className="text-[11px] text-status-danger mt-1">{errors.jumlah}</p>}
        </div>

        {/* Asal vs Tujuan Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div className="space-y-2">
            <h4 className="text-[11px] uppercase font-semibold tracking-wider text-slate-400">Sumber / Asal</h4>
            <div>
              <label className="block text-[11px] text-slate-600 mb-0.5">Gudang Asal</label>
              <input
                type="text"
                className="input-field bg-slate-50"
                value={values.dariGudang}
                onChange={(e) => setValues((v) => ({ ...v, dariGudang: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-0.5">Lokasi Asal</label>
              <input
                type="text"
                className="input-field bg-slate-50"
                value={values.dariLokasi}
                onChange={(e) => setValues((v) => ({ ...v, dariLokasi: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-[11px] uppercase font-semibold tracking-wider text-slate-400">Tujuan Mutasi</h4>
            <div>
              <label className="block text-[11px] text-slate-600 mb-0.5">
                Gudang Tujuan <span className="text-status-danger">*</span>
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Contoh: Gudang Penyangga Cimahi"
                value={values.keGudang}
                onChange={(e) => setValues((v) => ({ ...v, keGudang: e.target.value }))}
              />
              {errors.keGudang && <p className="text-[11px] text-status-danger mt-1">{errors.keGudang}</p>}
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-0.5">
                Lokasi Tujuan <span className="text-status-danger">*</span>
              </label>
              <select
                className="input-field"
                value={values.keLokasi}
                onChange={(e) => setValues((v) => ({ ...v, keLokasi: e.target.value }))}
              >
                <option value="">-- Pilih Lokasi Rak Master --</option>
                {lokasiList.map((loc) => (
                  <option key={loc.id} value={loc.fullPath}>
                    {loc.fullPath}
                  </option>
                ))}
              </select>
              {errors.keLokasi && <p className="text-[11px] text-status-danger mt-1">{errors.keLokasi}</p>}
            </div>
          </div>
        </div>

        {/* Catatan */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Catatan / Alasan Transfer</label>
          <textarea
            rows={2}
            className="input-field resize-none"
            placeholder="Contoh: Penyeimbangan stok antar zona, pemindahan ke buffer rack"
            value={values.catatan || ''}
            onChange={(e) => setValues((v) => ({ ...v, catatan: e.target.value }))}
          />
        </div>
      </form>
    </Modal>
  );
}
