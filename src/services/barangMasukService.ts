import axios from 'axios';
import type { HasilQC, PesananPembelian, PesananPembelianFormValues } from '../types/barangMasuk';

const API_URL = 'http://localhost:3000/api/purchase-order';

function mapPO(item: any): PesananPembelian {
  return {
    id: item.id,
    nomorPO: item.nomorPO,
    tanggal: item.tanggal,
    pemasokId: item.pemasokId,
    pemasokNama: item.pemasok?.nama || '',
    items: (item.items || []).map((poi: any) => ({
      id: poi.id,
      produkId: poi.produkId,
      produkKode: poi.produk?.kodeProduk || '',
      produkNama: poi.produk?.namaProduk || '',
      satuan: poi.satuan,
      jumlahPesan: poi.jumlahPesan,
      jumlahDiterima: poi.jumlahDiterima,
      hargaSatuan: poi.hargaSatuan,
    })),
    totalPesanan: item.totalPesanan,
    status: item.status,
    barangSesuai: item.barangSesuai ?? undefined,
    jumlahSesuai: item.jumlahSesuai ?? undefined,
    catatanSelisih: item.catatanSelisih ?? undefined,
    hasilQC: item.hasilQC ?? undefined,
    perluRepack: item.perluRepack ?? undefined,
    catatanQC: item.catatanQC ?? undefined,
    lokasiPenyimpanan: item.lokasiPenyimpanan ?? undefined,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function fetchAllPO(): Promise<PesananPembelian[]> {
  const { data } = await axios.get(API_URL);
  return data.map(mapPO);
}

export async function fetchPOByStatus(statuses: PesananPembelian['status'][]): Promise<PesananPembelian[]> {
  const { data } = await axios.get(API_URL);
  return data.filter((po: any) => statuses.includes(po.status)).map(mapPO);
}

export async function createPesananPembelian(
  values: PesananPembelianFormValues,
  _pemasokNama: string,
  produkList: { id: string; kodeProduk: string; namaProduk: string; satuan: string }[],
): Promise<PesananPembelian> {
  const items = values.items.map((it) => {
    const produk = produkList.find((p) => p.id === it.produkId)!;
    return {
      produkId: produk.id,
      satuan: produk.satuan,
      jumlahPesan: Number(it.jumlah),
      hargaSatuan: Number(it.hargaSatuan),
    };
  });

  const { data } = await axios.post(API_URL, { pemasokId: values.pemasokId, items });
  return mapPO(data);
}

export async function tandaiBarangDatang(id: string): Promise<void> {
  await axios.put(`${API_URL}/${id}/status`, { status: 'barang_datang' });
}

export async function prosesPenerimaan(
  id: string,
  barangSesuai: boolean,
  jumlahDiterimaPerItem: Record<string, number>,
): Promise<PesananPembelian> {
  const { data } = await axios.put(`${API_URL}/${id}/status`, {
    status: barangSesuai ? 'menunggu_qc' : 'pengecualian',
    barangSesuai,
    jumlahSesuai: Object.values(jumlahDiterimaPerItem).every((v) => v === v),
  });
  return mapPO(data);
}

export async function prosesQC(
  id: string,
  hasilQC: HasilQC,
  perluRepack: boolean,
  catatanQC?: string,
): Promise<PesananPembelian> {
  let nextStatus: string;
  if (hasilQC === 'rusak') nextStatus = 'karantina';
  else if (hasilQC === 'ditolak') nextStatus = 'retur';
  else nextStatus = perluRepack ? 'perlu_repack' : 'siap_penyimpanan';

  const { data } = await axios.put(`${API_URL}/${id}/status`, {
    status: nextStatus,
    hasilQC,
    perluRepack,
    catatanQC,
  });
  return mapPO(data);
}

export async function tandaiRepackSelesai(id: string): Promise<void> {
  await axios.put(`${API_URL}/${id}/status`, { status: 'siap_penyimpanan' });
}

export async function simpanKeGudang(id: string, lokasiPenyimpanan: string): Promise<void> {
  await axios.put(`${API_URL}/${id}/status`, { status: 'disimpan', lokasiPenyimpanan });
}
