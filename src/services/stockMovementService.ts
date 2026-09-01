import type { StockMovement, TipeMovement } from '../types/stockMovement';
import { storage, delay } from './storage';

function genId(): string {
  return `mv${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export async function fetchStockMovements(): Promise<StockMovement[]> {
  const movements = storage.getMovements();
  return delay([...movements].sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
}

export async function recordStockMovement(params: {
  produkId: string;
  produkKode: string;
  produkNama: string;
  jumlah: number;
  satuan: string;
  tipe: TipeMovement;
  sumber: string;
  tujuan: string;
  referensi: string;
  keterangan?: string;
  operator?: string;
}): Promise<StockMovement> {
  const newMovement: StockMovement = {
    id: genId(),
    timestamp: new Date().toISOString(),
    produkId: params.produkId,
    produkKode: params.produkKode,
    produkNama: params.produkNama,
    jumlah: params.jumlah,
    satuan: params.satuan,
    tipe: params.tipe,
    sumber: params.sumber,
    tujuan: params.tujuan,
    referensi: params.referensi,
    keterangan: params.keterangan,
    operator: params.operator || 'Andi Saputra',
  };

  const movements = storage.getMovements();
  storage.setMovements([newMovement, ...movements]);
  return delay(newMovement);
}
