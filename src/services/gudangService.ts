import axios from 'axios';
import type { Gudang, GudangFormValues, LokasiPenyimpanan, Rak, Zona } from '../types/gudang';

const API_URL = 'http://localhost:3000/api/gudang';

function mapGudang(item: any): Gudang {
  return {
    id: item.id,
    kodeGudang: item.kode,
    namaGudang: item.nama,
    alamat: item.alamat || '',
    status: item.status,
    createdAt: item.createdAt,
  };
}

// ---- GUDANG ----
export async function fetchGudang(): Promise<Gudang[]> {
  const { data } = await axios.get(API_URL);
  return data.map(mapGudang);
}

export async function isKodeGudangDuplicate(kode: string, excludeId?: string): Promise<boolean> {
  const { data } = await axios.get(API_URL);
  return data.some(
    (item: any) => item.kode.toLowerCase() === kode.trim().toLowerCase() && item.id !== excludeId,
  );
}

export async function createGudang(values: GudangFormValues): Promise<Gudang> {
  const { data } = await axios.post(API_URL, {
    kode: values.kodeGudang,
    nama: values.namaGudang,
    alamat: values.alamat,
    status: values.status,
  });
  return mapGudang(data);
}

export async function deleteGudang(id: string): Promise<void> {
  await axios.delete(`${API_URL}/${id}`);
}

// ---- ZONA ----
export async function fetchZonaByGudang(gudangId: string): Promise<Zona[]> {
  const { data } = await axios.get(API_URL);
  const gudang = data.find((g: any) => g.id === gudangId);
  return (gudang?.zonas || []).map((z: any) => ({
    id: z.id,
    gudangId: z.gudangId,
    kodeZona: z.kode,
    namaZona: z.nama,
    createdAt: z.createdAt,
  }));
}

export async function isKodeZonaDuplicate(gudangId: string, kode: string): Promise<boolean> {
  const zonas = await fetchZonaByGudang(gudangId);
  return zonas.some((z) => z.kodeZona.toLowerCase() === kode.trim().toLowerCase());
}

export async function createZona(gudangId: string, kode: string, nama: string): Promise<Zona> {
  const { data } = await axios.post(`${API_URL}/zona`, { kode, nama, gudangId });
  return {
    id: data.id,
    gudangId: data.gudangId,
    kodeZona: data.kode,
    namaZona: data.nama,
    createdAt: data.createdAt,
  };
}

export async function deleteZona(id: string): Promise<void> {
  await axios.delete(`${API_URL}/zona/${id}`);
}

// ---- RAK ----
export async function fetchRakByZona(zonaId: string): Promise<Rak[]> {
  // Fetch all, filter by zonaId
  const { data } = await axios.get(API_URL);
  const allZonas = data.flatMap((g: any) => g.zonas || []);
  const zona = allZonas.find((z: any) => z.id === zonaId);
  return (zona?.raks || []).map((r: any) => ({
    id: r.id,
    zonaId: r.zonaId,
    kodeRak: r.kode,
    namaRak: r.kode,
    createdAt: r.createdAt,
  }));
}

export async function isKodeRakDuplicate(zonaId: string, kode: string): Promise<boolean> {
  const raks = await fetchRakByZona(zonaId);
  return raks.some((r) => r.kodeRak.toLowerCase() === kode.trim().toLowerCase());
}

export async function createRak(zonaId: string, kode: string, _nama: string): Promise<Rak> {
  const { data } = await axios.post(`${API_URL}/rak`, { kode, zonaId });
  return {
    id: data.id,
    zonaId: data.zonaId,
    kodeRak: data.kode,
    namaRak: data.kode,
    createdAt: data.createdAt,
  };
}

export async function deleteRak(id: string): Promise<void> {
  await axios.delete(`${API_URL}/rak/${id}`);
}

// ---- LOKASI ----
export async function fetchLokasiByRak(rakId: string): Promise<LokasiPenyimpanan[]> {
  const { data } = await axios.get(API_URL);
  const allRaks = data.flatMap((g: any) => g.zonas?.flatMap((z: any) => z.raks || []) || []);
  const rak = allRaks.find((r: any) => r.id === rakId);
  return (rak?.lokasis || []).map((l: any) => ({
    id: l.id,
    rakId: l.rakId,
    kodeLokasi: l.kode,
    namaLokasi: l.kode,
    createdAt: l.createdAt,
  }));
}

export async function isKodeLokasiDuplicate(rakId: string, kode: string): Promise<boolean> {
  const lokasis = await fetchLokasiByRak(rakId);
  return lokasis.some((l) => l.kodeLokasi.toLowerCase() === kode.trim().toLowerCase());
}

export async function createLokasi(rakId: string, kode: string, _nama: string): Promise<LokasiPenyimpanan> {
  const { data } = await axios.post(`${API_URL}/lokasi`, { kode, tipe: 'PICKING', rakId });
  return {
    id: data.id,
    rakId: data.rakId,
    kodeLokasi: data.kode,
    namaLokasi: data.kode,
    createdAt: data.createdAt,
  };
}

export async function deleteLokasi(id: string): Promise<void> {
  await axios.delete(`${API_URL}/lokasi/${id}`);
}

// ---- FLAT LOCATIONS ----
export async function fetchAllFlatLocations(): Promise<{ id: string; fullPath: string; kodeLokasi: string }[]> {
  const { data } = await axios.get(`${API_URL}/flat-locations`);
  return data;
}
