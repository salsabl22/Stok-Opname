import axios from 'axios';
import type { PrioritasTugas, StatusTugas, TipeTugas, UserTask } from '../types/task';

const BASE = 'http://localhost:3000/api';

function mapTask(item: any): UserTask {
  return {
    id: item.id,
    nomorTugas: item.id.slice(0, 8).toUpperCase(),
    tipe: item.jenis.toLowerCase() as TipeTugas,
    judul: item.deskripsi,
    deskripsi: item.deskripsi,
    referensiId: item.referensiId || '',
    referensiNomor: item.referensiId || '',
    status: item.status === 'belum_dimulai' ? 'tertunda' : item.status === 'sedang_dikerjakan' ? 'dalam_proses' : 'selesai',
    prioritas: (item.prioritas || 'NORMAL').toLowerCase() as PrioritasTugas,
    assignee: item.user?.name || 'Tidak Ditugaskan',
    targetUrl: '/',
    createdAt: item.createdAt,
    waktuSelesai: item.status === 'selesai' ? item.updatedAt : undefined,
  };
}

export async function fetchAllTasks(): Promise<UserTask[]> {
  const { data } = await axios.get(`${BASE}/tasks`);
  return data.map(mapTask);
}

export async function createTask(params: {
  tipe: TipeTugas;
  judul: string;
  deskripsi: string;
  referensiId: string;
  referensiNomor: string;
  prioritas?: PrioritasTugas;
  assignee?: string;
  targetUrl: string;
}): Promise<UserTask> {
  const { data } = await axios.post(`${BASE}/tasks`, {
    jenis: params.tipe.toUpperCase(),
    deskripsi: params.deskripsi,
    prioritas: (params.prioritas || 'sedang').toUpperCase(),
    referensiId: params.referensiId,
  });
  return mapTask(data);
}

export async function updateTaskStatus(id: string, status: StatusTugas): Promise<UserTask> {
  const beStatus = status === 'tertunda' ? 'belum_dimulai' : status === 'dalam_proses' ? 'sedang_dikerjakan' : 'selesai';
  const { data } = await axios.put(`${BASE}/tasks/${id}/status`, { status: beStatus });
  return mapTask(data);
}

export async function completeTaskByRef(_referensiId: string): Promise<void> {
  // Handled by individual task status updates
}
