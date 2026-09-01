export type TipeMovement =
  | 'penerimaan'
  | 'putaway'
  | 'alokasi'
  | 'pengambilan'
  | 'pengiriman'
  | 'retur_masuk'
  | 'retur_keluar'
  | 'penyesuaian_opname'
  | 'transfer_stok'
  | 'manual_in'
  | 'manual_out';

export interface StockMovement {
  id: string;
  timestamp: string;
  produkId: string;
  produkKode: string;
  produkNama: string;
  jumlah: number;
  satuan: string;
  tipe: TipeMovement;
  sumber: string;
  tujuan: string;
  referensi: string;
  keterangan?: string;
  operator?: string;
}

export const TIPE_MOVEMENT_LABEL: Record<TipeMovement, string> = {
  penerimaan: 'Penerimaan PO',
  putaway: 'Penyimpanan ke Rak',
  alokasi: 'Alokasi Pesanan',
  pengambilan: 'Pengambilan (Picking)',
  pengiriman: 'Pengiriman (Dispatch)',
  retur_masuk: 'Retur Masuk (Restock)',
  retur_keluar: 'Retur Keluar (Pemasok)',
  penyesuaian_opname: 'Penyesuaian Opname',
  transfer_stok: 'Transfer Antar Lokasi',
  manual_in: 'Masuk Manual',
  manual_out: 'Keluar Manual',
};

export const TIPE_MOVEMENT_TONE: Record<TipeMovement, 'success' | 'danger' | 'warning' | 'neutral'> = {
  penerimaan: 'success',
  putaway: 'success',
  alokasi: 'warning',
  pengambilan: 'neutral',
  pengiriman: 'danger',
  retur_masuk: 'success',
  retur_keluar: 'danger',
  penyesuaian_opname: 'warning',
  transfer_stok: 'neutral',
  manual_in: 'success',
  manual_out: 'danger',
};
