import { Request, Response } from 'express';
import prisma from '../db';

// ============ PURCHASE ORDER ============
export const getPurchaseOrders = async (req: Request, res: Response) => {
  try {
    const data = await prisma.purchaseOrder.findMany({
      include: { pemasok: true, items: { include: { produk: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createPurchaseOrder = async (req: Request, res: Response) => {
  try {
    const { pemasokId, items } = req.body;
    const nomorPO = `PO-${Date.now()}`;
    const tanggal = new Date().toISOString().split('T')[0];

    const totalPesanan = items.reduce((sum: number, item: any) => {
      return sum + (Number(item.jumlahPesan) * Number(item.hargaSatuan));
    }, 0);

    const data = await prisma.purchaseOrder.create({
      data: {
        nomorPO,
        tanggal,
        pemasokId,
        totalPesanan,
        status: 'menunggu_pengiriman',
        items: {
          create: items.map((item: any) => ({
            produkId: item.produkId,
            satuan: item.satuan || 'PCS',
            jumlahPesan: Number(item.jumlah || item.jumlahPesan),
            hargaSatuan: Number(item.hargaSatuan),
          }))
        }
      },
      include: { pemasok: true, items: { include: { produk: true } } },
    });
    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePOStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, barangSesuai, jumlahSesuai, catatanSelisih, hasilQC, perluRepack, catatanQC, lokasiPenyimpanan, itemsReceived } = req.body;

    const data = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status,
        barangSesuai,
        jumlahSesuai,
        catatanSelisih,
        hasilQC,
        perluRepack,
        catatanQC,
        lokasiPenyimpanan,
      },
      include: { pemasok: true, items: { include: { produk: true } } },
    });

    // Jika status = disimpan, update inventory
    if (status === 'disimpan') {
      for (const item of data.items) {
        const existing = await prisma.inventory.findFirst({
          where: { produkId: item.produkId, lokasiId: null }
        });

        const jumlahMasuk = item.jumlahDiterima || item.jumlahPesan;

        if (existing) {
          await prisma.inventory.update({
            where: { id: existing.id },
            data: { jumlahTersedia: { increment: jumlahMasuk } }
          });
        } else {
          await prisma.inventory.create({
            data: {
              produkId: item.produkId,
              jumlahTersedia: jumlahMasuk,
              minimumStok: 0,
            }
          });
        }

        // Catat pergerakan stok
        await prisma.stockMovement.create({
          data: {
            produkId: item.produkId,
            tipe: 'MASUK',
            jumlah: jumlahMasuk,
            keterangan: `Penerimaan dari PO: ${data.nomorPO}`,
            referensi: data.id,
          }
        });
      }
    }

    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePurchaseOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.purchaseOrder.delete({ where: { id } });
    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
