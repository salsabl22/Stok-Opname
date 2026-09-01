import axios from 'axios';
import type { PesananCabang, PesananCabangFormValues } from '../types/pesananCabang';

const BASE = 'http://localhost:3000/api/operasional';

function mapSO(item: any): PesananCabang {
  return {
    id: item.id,
    nomorPesanan: item.nomorSO,
    tanggal: item.tanggal,
    cabangId: item.cabangId,
    cabangNama: item.cabang?.nama || '',
    items: (item.items || []).map((it: any) => ({
      id: it.id,
      produkId: it.produkId,
      produkKode: it.produk?.kodeProduk || '',
      produkNama: it.produk?.namaProduk || '',
      satuan: it.satuan,
      jumlahDipesan: it.jumlahPesan,
      jumlahDiambil: it.jumlahPick || 0,
    })),
    status: item.status as any,
    catatan: item.catatan || '',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function fetchAllPesananCabang(): Promise<PesananCabang[]> {
  const { data } = await axios.get(`${BASE}/sales-order`);
  return data.map(mapSO);
}

export async function fetchPesananCabangByStatus(statuses: PesananCabang['status'][]): Promise<PesananCabang[]> {
  const { data } = await axios.get(`${BASE}/sales-order`);
  return data.filter((so: any) => statuses.includes(so.status)).map(mapSO);
}

export async function createPesananCabang(
  values: PesananCabangFormValues,
  _cabangNama: string,
  produkList: { id: string; kodeProduk: string; namaProduk: string; satuan: string }[],
): Promise<PesananCabang> {
  const items = values.items.map((it) => {
    const produk = produkList.find((p) => p.id === it.produkId)!;
    return {
      produkId: produk.id,
      satuan: produk.satuan,
      jumlahPesan: Number(it.jumlah),
    };
  });

  const { data } = await axios.post(`${BASE}/sales-order`, {
    cabangId: values.cabangId,
    items,
    catatan: '',
  });
  return mapSO(data);
}

export async function prosesAlokasi(id: string): Promise<PesananCabang> {
  const { data } = await axios.put(`${BASE}/sales-order/${id}/status`, { status: 'dialokasikan' });
  return mapSO(data);
}

export async function prosesPengambilan(
  id: string,
  sudahSesuai: boolean,
  _items: any,
  _catatanPengecualian?: string,
): Promise<PesananCabang> {
  const status = sudahSesuai ? 'picking' : 'draft';
  const { data } = await axios.put(`${BASE}/sales-order/${id}/status`, { status });
  return mapSO(data);
}

export async function prosesPacking(id: string): Promise<PesananCabang> {
  const { data } = await axios.put(`${BASE}/sales-order/${id}/status`, { status: 'packing' });
  return mapSO(data);
}

export async function simpanHasilPacking(
  id: string,
  packingResults: { soItemId: string; satuanKemasan: string; jumlahKemasan: number; sisaJumlah: number }[]
): Promise<PesananCabang> {
  await axios.post(`${BASE}/sales-order/${id}/packing`, { packingResults });
  const all = await fetchAllPesananCabang();
  return all.find((so) => so.id === id)!;
}

export const selesaikanPacking = prosesPacking;

export async function prosesPengiriman(
  id: string,
  _kurir: string,
  _nomorResi: string,
  berhasil: boolean,
): Promise<PesananCabang> {
  const status = berhasil ? 'dikirim' : 'dialokasikan';
  const { data } = await axios.put(`${BASE}/sales-order/${id}/status`, { status });
  return mapSO(data);
}

export const cobaAlokasiUlang = async (id: string) => prosesAlokasi(id);

export const validasiStokUntukPesanan = async (
  items: { produkId: string; jumlah: number }[],
): Promise<{ produkId: string; cukup: boolean; sisaStok?: number }[]> => {
  const { data } = await axios.get(`${BASE}/inventory`);
  return items.map((it) => {
    const inv = data.find((d: any) => d.produkId === it.produkId);
    const tersedia = inv ? inv.jumlahTersedia - inv.jumlahDialokasikan : 0;
    return { produkId: it.produkId, cukup: tersedia >= it.jumlah, sisaStok: tersedia };
  });
};
