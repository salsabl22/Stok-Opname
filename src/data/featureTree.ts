import type { FeatureModule } from "../types/permissions";

function leaves(moduleId: string, labels: string[]) {
  return labels.map((label, index) => ({
    id: `${moduleId}-${index + 1}`,
    label,
  }));
}

export const FEATURE_TREE: FeatureModule[] = [
  {
    id: "dashboard",
    number: 1,
    title: "Dashboard",
    items: leaves("dashboard", [
      "Ringkasan Persediaan",
      "Barang Masuk",
      "Barang Keluar",
      "Pesanan Berjalan",
      "Pekerjaan Tertunda",
      "Peringatan Stok",
      "KPI Gudang",
    ]),
  },
  {
    id: "tugas-saya",
    number: 2,
    title: "Tugas Saya",
    items: leaves("tugas-saya", [
      "Tugas Penerimaan",
      "Tugas Penyimpanan",
      "Tugas Pengambilan",
      "Tugas Packing",
      "Tugas Perhitungan Stok",
      "Tugas Persetujuan",
    ]),
  },
  {
    id: "data-master",
    number: 3,
    title: "Data Master",
    items: leaves("data-master", [
      "Produk",
      "Satuan Barang",
      "Pemasok",
      "Cabang",
      "Gudang",
      "Zona",
      "Rak",
      "Lokasi Penyimpanan",
    ]),
  },
  {
    id: "barang-masuk",
    number: 4,
    title: "Barang Masuk",
    items: leaves("barang-masuk", [
      "Pesanan Pembelian",
      "Penerimaan",
      "Pemindaian Barcode",
      "Pemeriksaan Kualitas",
      "Penyimpanan",
      "Pengemasan Ulang",
    ]),
  },
  {
    id: "operasional",
    number: 5,
    title: "Operasional",
    items: leaves("operasional", [
      "Persediaan",
      "Pengisian Ulang",
      "Pesanan Cabang",
      "Alokasi",
      "Pengambilan",
      "Packing",
      "Pengiriman",
    ]),
  },
  {
    id: "retur",
    number: 6,
    title: "Retur",
    items: leaves("retur", [
      "Pengajuan Retur",
      "Penerimaan Retur",
      "Pemeriksaan Retur",
      "Karantina Retur",
      "Keputusan Retur",
    ]),
  },
  {
    id: "pengendalian",
    number: 7,
    title: "Pengendalian",
    items: leaves("pengendalian", [
      "Perhitungan Stok",
      "Selisih",
      "Penyesuaian Stok",
      "Karantina",
      "Pengecualian",
      "Waste",
    ]),
  },
  {
    id: "laporan-analitik",
    number: 8,
    title: "Laporan & Analitik",
    items: leaves("laporan-analitik", [
      "KPI",
      "Laporan Persediaan",
      "Laporan Barang Masuk",
      "Laporan Barang Keluar",
      "Laporan Retur",
      "Laporan Waste",
      "Laporan Aktivitas",
    ]),
  },
  {
    id: "aktivitas-notifikasi",
    number: 9,
    title: "Aktivitas & Notifikasi",
    items: leaves("aktivitas-notifikasi", [
      "Riwayat Aktivitas",
      "Audit Log",
      "Notifikasi",
    ]),
  },
  {
    id: "administrasi",
    number: 10,
    title: "Administrasi",
    items: leaves("administrasi", [
      "Pengguna & Hak Akses",
      "Peran",
      "Pengaturan",
    ]),
  },
];
