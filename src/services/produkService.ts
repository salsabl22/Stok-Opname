import axios from 'axios';
import type { Produk, ProdukFormValues } from '../types/produk';

const API_URL = 'http://localhost:3000/api/produk';

function mapProduk(item: any): Produk {
  return {
    id: item.id,
    kodeProduk: item.kodeProduk,
    namaProduk: item.namaProduk,
    kategori: item.kategori,
    satuan: item.satuan?.nama || item.satuan?.kode || item.satuan || '',
    satuanPembelian: item.satuanPembelian?.nama || item.satuanPembelian?.kode || item.satuanPembelian || '',
    konversi: item.konversi,
    minimumStok: item.minimumStok,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function fetchProduk(): Promise<Produk[]> {
  const { data } = await axios.get(API_URL);
  return data.map(mapProduk);
}

export async function isKodeProdukDuplicate(kode: string, excludeId?: string): Promise<boolean> {
  const { data } = await axios.get(API_URL);
  return data.some(
    (item: any) => item.kodeProduk.toLowerCase() === kode.trim().toLowerCase() && item.id !== excludeId,
  );
}

export async function createProduk(values: ProdukFormValues): Promise<Produk> {
  const payload = {
    kodeProduk: values.kodeProduk,
    namaProduk: values.namaProduk,
    kategori: values.kategori,
    satuan: values.satuan,
    satuanPembelian: values.satuanPembelian,
    konversi: values.konversi,
    minimumStok: values.minimumStok,
    status: values.status,
  };
  const { data } = await axios.post(API_URL, payload);
  return mapProduk(data);
}

export async function updateProduk(id: string, values: ProdukFormValues): Promise<Produk> {
  const payload = {
    kodeProduk: values.kodeProduk,
    namaProduk: values.namaProduk,
    kategori: values.kategori,
    satuan: values.satuan,
    satuanPembelian: values.satuanPembelian,
    konversi: values.konversi,
    minimumStok: values.minimumStok,
    status: values.status,
  };
  const { data } = await axios.put(`${API_URL}/${id}`, payload);
  return mapProduk(data);
}

export async function deleteProduk(id: string): Promise<void> {
  await axios.delete(`${API_URL}/${id}`);
}
