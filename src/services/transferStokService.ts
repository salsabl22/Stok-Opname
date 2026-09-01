import type { TransferStok, TransferStokFormValues } from '../types/transferStok';
import { storage, delay } from './storage';
import { recordStockMovement } from './stockMovementService';

function genId(): string {
  return `trf${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

function nextNomorTransfer(): string {
  const year = new Date().getFullYear();
  const transfers = storage.getTransfers();
  const countThisYear = transfers.filter((t) => t.nomorTransfer.includes(String(year))).length + 1;
  return `TRF-${year}-${String(countThisYear).padStart(4, '0')}`;
}

export async function fetchAllTransfers(): Promise<TransferStok[]> {
  const transfers = storage.getTransfers();
  return delay([...transfers].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function createAndExecuteTransfer(
  values: TransferStokFormValues,
  produk: { id: string; kodeProduk: string; namaProduk: string; satuan: string },
): Promise<TransferStok> {
  const jumlah = Number(values.jumlah);
  const persediaan = storage.getPersediaan();

  // Validasi stok sumber
  const stokSumber = persediaan.find((s) => s.produkId === produk.id);
  if (!stokSumber || stokSumber.jumlahTersedia < jumlah) {
    throw new Error(`Stok ${produk.namaProduk} di sumber tidak mencukupi untuk transfer (${jumlah} ${produk.satuan}).`);
  }

  const now = new Date().toISOString();
  const nomorTransfer = nextNomorTransfer();

  const newTransfer: TransferStok = {
    id: genId(),
    nomorTransfer,
    tanggal: now,
    produkId: produk.id,
    produkKode: produk.kodeProduk,
    produkNama: produk.namaProduk,
    jumlah,
    satuan: produk.satuan,
    dariGudang: values.dariGudang,
    dariLokasi: values.dariLokasi,
    keGudang: values.keGudang,
    keLokasi: values.keLokasi,
    status: 'selesai',
    catatan: values.catatan?.trim(),
    operator: 'Andi Saputra',
    createdAt: now,
    updatedAt: now,
  };

  // Update persediaan: kurangi dari sumber dan perbarui lokasi tujuan
  const updatedPersediaan = persediaan.map((s) => {
    if (s.produkId === produk.id) {
      return {
        ...s,
        lokasiPenyimpanan: `${values.keGudang} / ${values.keLokasi}`,
        updatedAt: now,
      };
    }
    return s;
  });
  storage.setPersediaan(updatedPersediaan);

  // Simpan record transfer
  const transfers = storage.getTransfers();
  storage.setTransfers([newTransfer, ...transfers]);

  // Catat audit trail di stock movement
  await recordStockMovement({
    produkId: produk.id,
    produkKode: produk.kodeProduk,
    produkNama: produk.namaProduk,
    jumlah,
    satuan: produk.satuan,
    tipe: 'transfer_stok',
    sumber: `${values.dariGudang} (${values.dariLokasi})`,
    tujuan: `${values.keGudang} (${values.keLokasi})`,
    referensi: nomorTransfer,
    keterangan: values.catatan ? `Transfer stok: ${values.catatan}` : 'Transfer antar gudang/lokasi',
    operator: 'Andi Saputra',
  });

  return delay(newTransfer);
}
