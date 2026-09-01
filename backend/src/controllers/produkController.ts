import { Request, Response } from 'express';
import prisma from '../db';

// ============ PRODUK ============
export const getProduk = async (req: Request, res: Response) => {
  try {
    const data = await prisma.produk.findMany({
      include: { satuan: true, satuanPembelian: true, konversiSatuan: true },
      orderBy: { kodeProduk: 'asc' },
    });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduk = async (req: Request, res: Response) => {
  try {
    const { kodeProduk, namaProduk, kategori, satuanId, satuanPembelianId, konversi, minimumStok, status } = req.body;
    
    // Gunakan transaction untuk memastikan Produk dan KonversiSatuan dibuat bersamaan
    const data = await prisma.$transaction(async (tx) => {
      const produk = await tx.produk.create({
        data: { 
          kodeProduk: kodeProduk.toUpperCase(), 
          namaProduk, 
          kategori, 
          satuanId, 
          satuanPembelianId, 
          konversi: Number(konversi), 
          minimumStok: Number(minimumStok), 
          status 
        },
        include: { satuan: true, satuanPembelian: true },
      });

      // Jika ada dua satuan berbeda dan ada nilai konversi, buat record di KonversiSatuan
      if (satuanId && satuanPembelianId && satuanId !== satuanPembelianId && Number(konversi) > 1) {
        await tx.konversiSatuan.create({
          data: {
            produkId: produk.id,
            satuanBesarId: satuanPembelianId,
            satuanKecilId: satuanId,
            nilaiKonversi: Number(konversi)
          }
        });
      }
      
      return produk;
    });

    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProduk = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { kodeProduk, namaProduk, kategori, satuanId, satuanPembelianId, konversi, minimumStok, status } = req.body;
    
    const data = await prisma.$transaction(async (tx) => {
      const produk = await tx.produk.update({
        where: { id },
        data: { 
          kodeProduk: kodeProduk.toUpperCase(), 
          namaProduk, 
          kategori, 
          satuanId, 
          satuanPembelianId, 
          konversi: Number(konversi), 
          minimumStok: Number(minimumStok), 
          status 
        },
        include: { satuan: true, satuanPembelian: true, konversiSatuan: true },
      });

      if (satuanId && satuanPembelianId && satuanId !== satuanPembelianId && Number(konversi) > 1) {
        await tx.konversiSatuan.upsert({
          where: {
            produkId_satuanBesarId_satuanKecilId: {
              produkId: produk.id,
              satuanBesarId: satuanPembelianId,
              satuanKecilId: satuanId
            }
          },
          update: { nilaiKonversi: Number(konversi) },
          create: {
            produkId: produk.id,
            satuanBesarId: satuanPembelianId,
            satuanKecilId: satuanId,
            nilaiKonversi: Number(konversi)
          }
        });
      }

      return produk;
    });
    
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProduk = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.produk.delete({ where: { id } });
    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
