import type { StatusRetur } from '../types/retur';

export const STATUS_RETUR_LABEL: Record<StatusRetur, string> = {
  menunggu_pengiriman_gudang: 'Menunggu Diterima Gudang',
  menunggu_pemeriksaan: 'Menunggu Pemeriksaan',
  pengecualian: 'Pengecualian',
  kembali_persediaan: 'Kembali ke Persediaan',
  karantina: 'Karantina',
  retur_pemasok: 'Retur ke Pemasok',
};

export const STATUS_RETUR_TONE: Record<StatusRetur, 'success' | 'danger' | 'warning' | 'neutral'> = {
  menunggu_pengiriman_gudang: 'neutral',
  menunggu_pemeriksaan: 'warning',
  pengecualian: 'danger',
  kembali_persediaan: 'success',
  karantina: 'danger',
  retur_pemasok: 'danger',
};
