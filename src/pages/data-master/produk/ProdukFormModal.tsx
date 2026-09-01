import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import type { Produk, ProdukFormErrors, ProdukFormValues } from '../../../types/produk';
import { EMPTY_PRODUK_FORM, KATEGORI_PRODUK_OPTIONS } from '../../../types/produk';
import { isProdukFormValid, validateProdukForm } from '../../../utils/validateProduk';
import { fetchSatuanBarang } from '../../../services/satuanBarangService';
import type { SatuanBarang } from '../../../types/satuanBarang';

interface ProdukFormModalProps {
  open: boolean;
  editingItem: Produk | null;
  onClose: () => void;
  onSubmit: (values: ProdukFormValues) => Promise<void>;
}

export default function ProdukFormModal({
  open,
  editingItem,
  onClose,
  onSubmit,
}: ProdukFormModalProps) {
  const [values, setValues] = useState<ProdukFormValues>(EMPTY_PRODUK_FORM);
  const [errors, setErrors] = useState<ProdukFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [satuanOptions, setSatuanOptions] = useState<SatuanBarang[]>([]);
  const [loadingSatuan, setLoadingSatuan] = useState(false);

  const isEdit = Boolean(editingItem);

  useEffect(() => {
    if (!open) return;
    if (editingItem) {
      setValues({
        kodeProduk: editingItem.kodeProduk,
        namaProduk: editingItem.namaProduk,
        kategori: editingItem.kategori,
        satuan: editingItem.satuan,
        satuanPembelian: editingItem.satuanPembelian,
        konversi: String(editingItem.konversi),
        minimumStok: String(editingItem.minimumStok),
        status: editingItem.status,
      });
    } else {
      setValues(EMPTY_PRODUK_FORM);
    }
    setErrors({});
    setSubmitError(null);

    setLoadingSatuan(true);
    fetchSatuanBarang()
      .then((data) => setSatuanOptions(data.filter((s) => s.status === 'aktif')))
      .finally(() => setLoadingSatuan(false));
  }, [open, editingItem]);

  function handleChange<K extends keyof ProdukFormValues>(key: K, value: ProdukFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setSubmitError(null);
    const validationErrors = await validateProdukForm(values, editingItem?.id);
    setErrors(validationErrors);
    if (!isProdukFormValid(validationErrors)) return;

    setSubmitting(true);
    try {
      await onSubmit(values);
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title={isEdit ? 'Edit Produk' : 'Tambah Produk'}
      open={open}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Batal
          </button>
          <button type="button" className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </>
      }
    >
      <div className="space-y-3.5 max-h-[65vh] overflow-y-auto pr-1">
        {submitError && (
          <div className="text-xs text-status-danger bg-status-dangerBg rounded-md px-3 py-2">
            {submitError}
          </div>
        )}

        <div>
          <label className="label-field">Kode Produk</label>
          <input
            type="text"
            className="input-field"
            placeholder="Contoh: FOOD-001"
            value={values.kodeProduk}
            onChange={(e) => handleChange('kodeProduk', e.target.value)}
            disabled={submitting}
          />
          {errors.kodeProduk && <p className="text-[11px] text-status-danger mt-1">{errors.kodeProduk}</p>}
        </div>

        <div>
          <label className="label-field">Nama Produk</label>
          <input
            type="text"
            className="input-field"
            placeholder="Contoh: Makanan X"
            value={values.namaProduk}
            onChange={(e) => handleChange('namaProduk', e.target.value)}
            disabled={submitting}
          />
          {errors.namaProduk && <p className="text-[11px] text-status-danger mt-1">{errors.namaProduk}</p>}
        </div>

        <div>
          <label className="label-field">Kategori</label>
          <select
            className="input-field"
            value={values.kategori}
            onChange={(e) => handleChange('kategori', e.target.value)}
            disabled={submitting}
          >
            <option value="">Pilih kategori</option>
            {KATEGORI_PRODUK_OPTIONS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          {errors.kategori && <p className="text-[11px] text-status-danger mt-1">{errors.kategori}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Satuan</label>
            <select
              className="input-field"
              value={values.satuan}
              onChange={(e) => handleChange('satuan', e.target.value)}
              disabled={submitting || loadingSatuan}
            >
              <option value="">Pilih satuan</option>
              {satuanOptions.map((s) => (
                <option key={s.id} value={s.kodeSatuan}>
                  {s.kodeSatuan}
                </option>
              ))}
            </select>
            {errors.satuan && <p className="text-[11px] text-status-danger mt-1">{errors.satuan}</p>}
          </div>

          <div>
            <label className="label-field">Satuan Pembelian</label>
            <select
              className="input-field"
              value={values.satuanPembelian}
              onChange={(e) => handleChange('satuanPembelian', e.target.value)}
              disabled={submitting || loadingSatuan}
            >
              <option value="">Pilih satuan</option>
              {satuanOptions.map((s) => (
                <option key={s.id} value={s.kodeSatuan}>
                  {s.kodeSatuan}
                </option>
              ))}
            </select>
            {errors.satuanPembelian && (
              <p className="text-[11px] text-status-danger mt-1">{errors.satuanPembelian}</p>
            )}
          </div>
        </div>
        {satuanOptions.length === 0 && !loadingSatuan && (
          <p className="text-[11px] text-status-warning bg-status-warningBg rounded-md px-3 py-2">
            Belum ada data Satuan Barang aktif. Tambahkan dulu di menu Data Master &gt; Satuan Barang.
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">
              Konversi{' '}
              <span className="text-slate-400 font-normal">
                (1 {values.satuanPembelian || '?'} = ? {values.satuan || '?'})
              </span>
            </label>
            <input
              type="number"
              min={0}
              step="any"
              className="input-field"
              placeholder="Contoh: 20"
              value={values.konversi}
              onChange={(e) => handleChange('konversi', e.target.value)}
              disabled={submitting}
            />
            {errors.konversi && <p className="text-[11px] text-status-danger mt-1">{errors.konversi}</p>}
          </div>

          <div>
            <label className="label-field">Minimum Stok</label>
            <input
              type="number"
              min={0}
              step="any"
              className="input-field"
              placeholder="Contoh: 30"
              value={values.minimumStok}
              onChange={(e) => handleChange('minimumStok', e.target.value)}
              disabled={submitting}
            />
            {errors.minimumStok && (
              <p className="text-[11px] text-status-danger mt-1">{errors.minimumStok}</p>
            )}
          </div>
        </div>

        <div>
          <label className="label-field">Status</label>
          <select
            className="input-field"
            value={values.status}
            onChange={(e) => handleChange('status', e.target.value as 'aktif' | 'nonaktif')}
            disabled={submitting}
          >
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}
