import axios from 'axios';
import type { KondisiBarangRetur, Retur, ReturFormValues } from '../types/retur';

const BASE = 'http://localhost:3000/api/operasional';

function mapRetur(item: any): Retur {
  return {
    id: item.id,
    nomorRetur: item.nomorRetur,
    tanggal: item.createdAt,
    sumber: item.soId ? 'cabang' : 'internal',
    cabangId: item.cabangId,
    cabangNama: item.cabang?.nama || '',
    items: (item.items || []).map((it: any) => ({
      id: it.id,
      produkId: it.produkId,
      produkKode: '',
      produkNama: '',
      satuan: it.satuan,
      jumlah: it.jumlah,
    })),
    alasan: item.alasan,
    status: item.status as any,
    kondisiBarang: item.kondisi as any,
    catatanPemeriksaan: item.catatan || '',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function fetchAllRetur(): Promise<Retur[]> {
  const { data } = await axios.get(`${BASE}/retur`);
  return data.map(mapRetur);
}

export async function createRetur(
  values: ReturFormValues,
  _meta: { cabangNama?: string; poNomor?: string; pemasokNama?: string },
  produkList: { id: string; kodeProduk: string; namaProduk: string; satuan: string }[],
): Promise<Retur> {
  const items = values.items.map((it) => {
    const produk = produkList.find((p) => p.id === it.produkId)!;
    return {
      produkId: produk.id,
      satuan: produk.satuan,
      jumlah: Number(it.jumlah),
    };
  });

  const cabangId = values.sumber === 'cabang' ? values.cabangId : (await axios.get('http://localhost:3000/api/cabang')).data[0]?.id || 'dummy';

  const { data } = await axios.post(`${BASE}/retur`, {
    soId: values.sumber === 'cabang' ? values.cabangId : null,
    cabangId,
    alasan: values.alasan,
    items,
  });
  return mapRetur(data);
}

export async function prosesPenerimaanRetur(id: string, sesuai: boolean, _catatan?: string): Promise<Retur> {
  const { data } = await axios.put(`${BASE}/retur/${id}/status`, {
    status: sesuai ? 'diterima' : 'diajukan',
  });
  return mapRetur(data);
}

export async function prosesPemeriksaanRetur(
  id: string,
  kondisi: KondisiBarangRetur,
  catatan?: string,
): Promise<Retur> {
  let status = 'diperiksa';
  if (kondisi === 'baik') status = 'kembali_ke_stok';
  else if (kondisi === 'rusak') status = 'karantina';
  else status = 'waste';

  const { data } = await axios.put(`${BASE}/retur/${id}/status`, {
    status,
    kondisi,
    catatan,
  });
  return mapRetur(data);
}
