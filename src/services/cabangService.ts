import axios from 'axios';
import type { Cabang, CabangFormValues } from '../types/cabang';

const API_URL = 'http://localhost:3000/api/cabang';

function mapCabang(item: any): Cabang {
  return {
    id: item.id,
    kodeCabang: item.kode,
    namaCabang: item.nama,
    alamat: item.alamat || '',
    telepon: item.telepon || '',
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function fetchCabang(): Promise<Cabang[]> {
  const { data } = await axios.get(API_URL);
  return data.map(mapCabang);
}

export async function isKodeCabangDuplicate(kode: string, excludeId?: string): Promise<boolean> {
  const { data } = await axios.get(API_URL);
  return data.some(
    (item: any) => item.kode.toLowerCase() === kode.trim().toLowerCase() && item.id !== excludeId,
  );
}

export async function createCabang(values: CabangFormValues): Promise<Cabang> {
  const { data } = await axios.post(API_URL, {
    kode: values.kodeCabang,
    nama: values.namaCabang,
    alamat: values.alamat,
    telepon: values.telepon,
    status: values.status,
  });
  return mapCabang(data);
}

export async function updateCabang(id: string, values: CabangFormValues): Promise<Cabang> {
  const { data } = await axios.put(`${API_URL}/${id}`, {
    kode: values.kodeCabang,
    nama: values.namaCabang,
    alamat: values.alamat,
    telepon: values.telepon,
    status: values.status,
  });
  return mapCabang(data);
}

export async function deleteCabang(id: string): Promise<void> {
  await axios.delete(`${API_URL}/${id}`);
}
