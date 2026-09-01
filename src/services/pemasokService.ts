import axios from 'axios';
import type { Pemasok, PemasokFormValues } from '../types/pemasok';

const API_URL = 'http://localhost:3000/api/pemasok';

function mapPemasok(item: any): Pemasok {
  return {
    id: item.id,
    kodePemasok: item.kode,
    namaPemasok: item.nama,
    kontak: item.kontak || '',
    email: item.email || '',
    alamat: item.alamat || '',
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function fetchPemasok(): Promise<Pemasok[]> {
  const { data } = await axios.get(API_URL);
  return data.map(mapPemasok);
}

export async function isKodePemasokDuplicate(kode: string, excludeId?: string): Promise<boolean> {
  const { data } = await axios.get(API_URL);
  return data.some(
    (item: any) => item.kode.toLowerCase() === kode.trim().toLowerCase() && item.id !== excludeId,
  );
}

export async function createPemasok(values: PemasokFormValues): Promise<Pemasok> {
  const { data } = await axios.post(API_URL, {
    kode: values.kodePemasok,
    nama: values.namaPemasok,
    kontak: values.kontak,
    telepon: '',
    email: values.email,
    alamat: values.alamat,
    status: values.status,
  });
  return mapPemasok(data);
}

export async function updatePemasok(id: string, values: PemasokFormValues): Promise<Pemasok> {
  const { data } = await axios.put(`${API_URL}/${id}`, {
    kode: values.kodePemasok,
    nama: values.namaPemasok,
    kontak: values.kontak,
    telepon: '',
    email: values.email,
    alamat: values.alamat,
    status: values.status,
  });
  return mapPemasok(data);
}

export async function deletePemasok(id: string): Promise<void> {
  await axios.delete(`${API_URL}/${id}`);
}
