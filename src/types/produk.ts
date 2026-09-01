// Tipe data untuk modul Data Master > Produk
// Flow: Produk -> Input Data Produk -> Validasi -> Database
// Field mengikuti dokumen spesifikasi: Kode Produk, Nama Produk, Kategori,
// Satuan, Satuan Pembelian, Konversi, Minimum Stok, Status.

export type StatusProduk = 'aktif' | 'nonaktif';

export interface Produk {
  id: string;
  kodeProduk: string;
  namaProduk: string;
  kategori: string;
  /** Satuan dasar, mis. PCS — direferensikan dari Data Master Satuan Barang */
  satuan: string;
  /** Satuan pembelian, mis. BAL — direferensikan dari Data Master Satuan Barang */
  satuanPembelian: string;
  /** Nilai konversi dari satuan pembelian ke satuan dasar, contoh: 1 BAL = 20 PCS -> 20 */
  konversi: number;
  minimumStok: number;
  status: StatusProduk;
  createdAt: string;
  updatedAt: string;
}

export interface ProdukFormValues {
  kodeProduk: string;
  namaProduk: string;
  kategori: string;
  satuan: string;
  satuanPembelian: string;
  konversi: string;
  minimumStok: string;
  status: StatusProduk;
}

export interface ProdukFormErrors {
  kodeProduk?: string;
  namaProduk?: string;
  kategori?: string;
  satuan?: string;
  satuanPembelian?: string;
  konversi?: string;
  minimumStok?: string;
}

export const EMPTY_PRODUK_FORM: ProdukFormValues = {
  kodeProduk: '',
  namaProduk: '',
  kategori: '',
  satuan: '',
  satuanPembelian: '',
  konversi: '',
  minimumStok: '',
  status: 'aktif',
};

// Kategori belum menjadi modul Data Master tersendiri di flow map,
// jadi sementara memakai daftar tetap (mock) sampai ada instruksi lanjutan.
export const KATEGORI_PRODUK_OPTIONS = [
  'Makanan Kering',
  'Minuman',
  'Bahan Baku',
  'Kemasan',
  'Lainnya',
];
