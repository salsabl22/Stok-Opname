import axios from 'axios';
import type { SatuanBarang, SatuanBarangFormValues } from '../types/satuanBarang';

const API_URL = 'http://localhost:3000/api/satuan-barang';

export async function fetchSatuanBarang(): Promise<SatuanBarang[]> {
  const { data } = await axios.get(API_URL);
  return data.map((item: any) => {
    // Ekstrak deskripsi (contoh: "Dasar: PCS, Konversi: 20")
    let dasar = '-';
    let konv = 1;
    if (item.deskripsi) {
      const parts = item.deskripsi.split(',');
      if (parts.length === 2) {
        dasar = parts[0].replace('Dasar:', '').trim();
        konv = Number(parts[1].replace('Konversi:', '').trim());
      }
    }
    
    return {
      id: item.id,
      kodeSatuan: item.kode,
      namaSatuan: item.nama,
      satuanDasar: dasar,
      nilaiKonversi: konv || 1,
      status: item.isActive ? 'aktif' : 'nonaktif',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  });
}

export async function isKodeSatuanDuplicate(kode: string, excludeId?: string): Promise<boolean> {
  const { data } = await axios.get(API_URL);
  return data.some(
    (item: any) => item.kode.toLowerCase() === kode.trim().toLowerCase() && item.id !== excludeId,
  );
}

export async function createSatuanBarang(values: SatuanBarangFormValues): Promise<SatuanBarang> {
  // Map dari format form Frontend (kodeSatuan, namaSatuan, satuanDasar, nilaiKonversi, status)
  // Ke format backend Prisma (kode, nama, deskripsi, isActive)
  // Catatan: Karena Prisma Schema lebih sederhana, kita mapping sebagian properties
  const payload = {
    kode: values.kodeSatuan.trim().toUpperCase(),
    nama: values.namaSatuan.trim(),
    deskripsi: `Dasar: ${values.satuanDasar}, Konversi: ${values.nilaiKonversi}`,
    isActive: values.status === 'aktif',
  };
  const { data } = await axios.post(API_URL, payload);
  
  // Mapping back ke frontend format sementara agar UI tidak pecah
  return {
    id: data.id,
    kodeSatuan: data.kode,
    namaSatuan: data.nama,
    satuanDasar: values.satuanDasar,
    nilaiKonversi: Number(values.nilaiKonversi),
    status: data.isActive ? 'aktif' : 'nonaktif',
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function updateSatuanBarang(
  id: string,
  values: SatuanBarangFormValues,
): Promise<SatuanBarang> {
  const payload = {
    kode: values.kodeSatuan.trim().toUpperCase(),
    nama: values.namaSatuan.trim(),
    deskripsi: `Dasar: ${values.satuanDasar}, Konversi: ${values.nilaiKonversi}`,
    isActive: values.status === 'aktif',
  };
  const { data } = await axios.put(`${API_URL}/${id}`, payload);
  
  return {
    id: data.id,
    kodeSatuan: data.kode,
    namaSatuan: data.nama,
    satuanDasar: values.satuanDasar,
    nilaiKonversi: Number(values.nilaiKonversi),
    status: data.isActive ? 'aktif' : 'nonaktif',
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function setSatuanBarangStatus(
  id: string,
  status: 'aktif' | 'nonaktif',
): Promise<void> {
  // Hanya fetch data existing, lalu update status
  const { data: existingData } = await axios.get(API_URL);
  const target = existingData.find((d: any) => d.id === id);
  if (!target) return;
  
  await axios.put(`${API_URL}/${id}`, { ...target, isActive: status === 'aktif' });
}

export async function deleteSatuanBarang(id: string): Promise<void> {
  await axios.delete(`${API_URL}/${id}`);
}
