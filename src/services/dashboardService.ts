import axios from 'axios';
import type { StokItem } from '../types/persediaan';
import type { StockMovement } from '../types/stockMovement';
import type { UserTask } from '../types/task';

export interface DashboardMetrics {
  totalSKU: number;
  totalFisikStok: number;
  totalStokDialokasikan: number;
  totalStokBebas: number;
  totalProdukMenipis: number;
  poMenungguKedatangan: number;
  poMenungguQC: number;
  poSiapDisimpan: number;
  soMenungguAlokasi: number;
  soSiapDiambil: number;
  soSiapPacking: number;
  soSiapKirim: number;
  returMenunggu: number;
  opnameMenungguInvestigasi: number;
  opnameMenungguPersetujuan: number;
  totalTugasTertunda: number;
  akurasiOpnamePersen: number;
  lowStockItems: StokItem[];
  recentMovements: StockMovement[];
  pendingTasks: UserTask[];
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const { data } = await axios.get('http://localhost:3000/api/dashboard');

  const { summary, recentMovements, lowStockItems } = data;

  return {
    totalSKU: summary.totalProduk || 0,
    totalFisikStok: summary.totalStokTersedia || 0,
    totalStokDialokasikan: summary.totalStokDialokasikan || 0,
    totalStokBebas: Math.max(0, (summary.totalStokTersedia || 0) - (summary.totalStokDialokasikan || 0)),
    totalProdukMenipis: (lowStockItems || []).length,
    poMenungguKedatangan: 0,
    poMenungguQC: 0,
    poSiapDisimpan: 0,
    soMenungguAlokasi: 0,
    soSiapDiambil: 0,
    soSiapPacking: 0,
    soSiapKirim: 0,
    returMenunggu: 0,
    opnameMenungguInvestigasi: 0,
    opnameMenungguPersetujuan: 0,
    totalTugasTertunda: summary.pendingTasks || 0,
    akurasiOpnamePersen: 100,
    lowStockItems: (lowStockItems || []).map((item: any) => ({
      id: item.id,
      produkId: item.produkId,
      produkKode: item.produk?.kodeProduk || '',
      produkNama: item.produk?.namaProduk || '',
      satuan: 'PCS',
      jumlahTersedia: item.jumlahTersedia,
      jumlahDialokasikan: item.jumlahDialokasikan,
      minimumStok: item.minimumStok,
      lokasiPenyimpanan: '-',
      updatedAt: item.updatedAt,
    })),
    recentMovements: (recentMovements || []).map((m: any) => ({
      id: m.id,
      produkId: m.produkId,
      produkKode: m.produk?.kodeProduk || '',
      produkNama: m.produk?.namaProduk || '',
      jumlah: m.jumlah,
      satuan: 'PCS',
      tipe: m.tipe.toLowerCase(),
      sumber: m.lokasiAsal || '-',
      tujuan: m.lokasiTujuan || '-',
      referensi: m.referensi || '-',
      keterangan: m.keterangan || '',
      timestamp: m.createdAt,
    })),
    pendingTasks: [],
  };
}
