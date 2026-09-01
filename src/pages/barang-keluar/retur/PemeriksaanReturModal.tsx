import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import type { KondisiBarangRetur, Retur } from '../../../types/retur';

interface PemeriksaanReturModalProps {
  open: boolean;
  retur: Retur | null;
  onClose: () => void;
  onSubmit: (kondisi: KondisiBarangRetur, catatan?: string) => Promise<void>;
}

const KONDISI_OPTIONS: { value: KondisiBarangRetur; label: string; hint: string; tone: string }[] = [
  {
    value: 'baik',
    label: 'Baik',
    hint: 'Stok akan dikembalikan ke Persediaan.',
    tone: 'border-status-success text-status-success bg-status-successBg',
  },
  {
    value: 'rusak',
    label: 'Rusak',
    hint: 'Barang akan dipindahkan ke Karantina.',
    tone: 'border-status-danger text-status-danger bg-status-dangerBg',
  },
  {
    value: 'ditolak',
    label: 'Ditolak',
    hint: 'Barang akan diretur balik ke Pemasok.',
    tone: 'border-status-danger text-status-danger bg-status-dangerBg',
  },
];

export default function PemeriksaanReturModal({ open, retur, onClose, onSubmit }: PemeriksaanReturModalProps) {
  const [kondisi, setKondisi] = useState<KondisiBarangRetur | ''>('');
  const [catatan, setCatatan] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setKondisi('');
    setCatatan('');
    setError(null);
  }, [open]);

  if (!retur) return null;

  async function handleSubmit() {
    if (!kondisi) {
      setError('Pilih kondisi barang terlebih dahulu.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(kondisi, catatan.trim() || undefined);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  const selected = KONDISI_OPTIONS.find((o) => o.value === kondisi);

  return (
    <Modal
      title={`Periksa Retur — ${retur.nomorRetur}`}
      open={open}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Batal
          </button>
          <button type="button" className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Memproses...' : 'Simpan Hasil Periksa'}
          </button>
        </>
      }
    >
      <div className="space-y-3.5">
        {error && (
          <div className="text-xs text-status-danger bg-status-dangerBg rounded-md px-3 py-2">{error}</div>
        )}

        <div>
          <label className="label-field">Kondisi Barang</label>
          <div className="grid grid-cols-3 gap-2">
            {KONDISI_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`px-2 py-2 rounded-md text-xs font-medium border transition-colors ${
                  kondisi === opt.value ? opt.tone : 'border-surface-border text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => setKondisi(opt.value)}
                disabled={submitting}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {selected && <p className="text-[11px] text-slate-500 mt-1.5">{selected.hint}</p>}
        </div>

        <div>
          <label className="label-field">
            Catatan Pemeriksaan <span className="text-slate-400 font-normal">(opsional)</span>
          </label>
          <textarea
            className="input-field resize-none"
            rows={2}
            placeholder="Catatan hasil pemeriksaan..."
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            disabled={submitting}
          />
        </div>
      </div>
    </Modal>
  );
}
