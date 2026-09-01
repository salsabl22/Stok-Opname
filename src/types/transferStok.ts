export type StatusTransfer = 'draft' | 'proses' | 'selesai' | 'dibatalkan';

export interface TransferStok {
  id: string;
  nomorTransfer: string;
  tanggal: string;
  produkId: string;
  produkKode: string;
  produkNama: string;
  jumlah: number;
  satuan: string;
  dariGudang: string;
  dariLokasi: string;
  keGudang: string;
  keLokasi: string;
  status: StatusTransfer;
  catatan?: string;
  operator: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransferStokFormValues {
  produkId: string;
  jumlah: string;
  dariGudang: string;
  dariLokasi: string;
  keGudang: string;
  keLokasi: string;
  catatan?: string;
}

export interface TransferStokFormErrors {
  produkId?: string;
  jumlah?: string;
  dariGudang?: string;
  dariLokasi?: string;
  keGudang?: string;
  keLokasi?: string;
  general?: string;
}

export const EMPTY_TRANSFER_FORM: TransferStokFormValues = {
  produkId: '',
  jumlah: '',
  dariGudang: '',
  dariLokasi: '',
  keGudang: '',
  keLokasi: '',
  catatan: '',
};

export const STATUS_TRANSFER_LABEL: Record<StatusTransfer, string> = {
  draft: 'Draft',
  proses: 'Dalam Proses',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
};

export const STATUS_TRANSFER_TONE: Record<StatusTransfer, 'success' | 'danger' | 'warning' | 'neutral'> = {
  draft: 'neutral',
  proses: 'warning',
  selesai: 'success',
  dibatalkan: 'danger',
};
