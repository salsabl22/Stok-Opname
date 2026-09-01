import axios from 'axios';
import type { StokItem } from '../types/persediaan';

const BASE = 'http://localhost:3000/api/operasional';

function mapInventory(item: any): StokItem {
  return {
    id: item.id,
    produkId: item.produkId,
    produkKode: item.produk?.kodeProduk || '',
    produkNama: item.produk?.namaProduk || '',
    satuan: item.produk?.satuan?.nama || 'PCS',
    batchNomor: item.batch?.nomorBatch || undefined,
    jumlahTersedia: item.jumlahTersedia,
    jumlahDialokasikan: item.jumlahDialokasikan,
    jumlahKarantina: item.jumlahKarantina,
    jumlahWaste: item.jumlahWaste,
    minimumStok: item.minimumStok || item.produk?.minimumStok || 0,
    lokasiPenyimpanan: item.lokasi
      ? [item.lokasi.rak?.zona?.gudang?.nama, item.lokasi.rak?.zona?.nama, item.lokasi.rak?.kode, item.lokasi.kode].filter(Boolean).join(' / ')
      : '-',
    updatedAt: item.updatedAt,
  };
}

export async function fetchPersediaan(): Promise<StokItem[]> {
  const { data } = await axios.get(`${BASE}/inventory`);
  return data.map(mapInventory);
}

export async function fetchStokByProduk(produkId: string): Promise<StokItem | undefined> {
  const { data } = await axios.get(`${BASE}/inventory`);
  const found = data.find((item: any) => item.produkId === produkId);
  return found ? mapInventory(found) : undefined;
}

export async function isStokCukup(produkId: string, jumlah: number): Promise<boolean> {
  const item = await fetchStokByProduk(produkId);
  if (!item) return false;
  return item.jumlahTersedia - item.jumlahDialokasikan >= jumlah;
}

export async function alokasikanStok(_produkId: string, _jumlah: number): Promise<boolean> {
  // Handled by SO status update
  return true;
}

export async function konfirmasiPengambilanStok(_produkId: string, _jumlah: number): Promise<void> {
  // Handled by SO status update
}

export async function batalkanAlokasiStok(_produkId: string, _jumlah: number): Promise<void> {
  // Handled by SO status update
}

export async function tambahStok(_produkId: string, _jumlah: number): Promise<void> {
  // Handled by PO flow
}

export async function sesuaikanStokSelisih(_produkId: string, _selisih: number): Promise<void> {
  // Handled by Stock Adjustment
}

export async function updateLokasiStok(_produkId: string, _lokasiPenyimpanan: string): Promise<void> {
  // Handled by Inventory API
}
