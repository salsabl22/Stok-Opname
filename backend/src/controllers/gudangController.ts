import { Request, Response } from 'express';
import prisma from '../db';

// ---- GUDANG ----
export const getGudang = async (req: Request, res: Response) => {
  try {
    const data = await prisma.gudang.findMany({
      include: {
        zonas: {
          include: {
            raks: {
              include: { lokasis: true }
            }
          }
        }
      },
      orderBy: { kode: 'asc' }
    });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createGudang = async (req: Request, res: Response) => {
  try {
    const { kode, nama, alamat, status } = req.body;
    const data = await prisma.gudang.create({ data: { kode: kode.toUpperCase(), nama, alamat, status } });
    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteGudang = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // cascade delete karena sudah dikonfigurasi di schema
    await prisma.gudang.delete({ where: { id } });
    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ---- ZONA ----
export const createZona = async (req: Request, res: Response) => {
  try {
    const { kode, nama, gudangId } = req.body;
    const data = await prisma.zona.create({ data: { kode: kode.toUpperCase(), nama, gudangId } });
    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteZona = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.zona.delete({ where: { id } });
    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ---- RAK ----
export const createRak = async (req: Request, res: Response) => {
  try {
    const { kode, zonaId } = req.body;
    const data = await prisma.rak.create({ data: { kode: kode.toUpperCase(), zonaId } });
    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteRak = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.rak.delete({ where: { id } });
    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ---- LOKASI ----
export const createLokasi = async (req: Request, res: Response) => {
  try {
    const { kode, tipe, rakId } = req.body;
    const data = await prisma.lokasi.create({ data: { kode: kode.toUpperCase(), tipe, rakId } });
    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteLokasi = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.lokasi.delete({ where: { id } });
    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllFlatLocations = async (req: Request, res: Response) => {
  try {
    const lokasis = await prisma.lokasi.findMany({
      include: {
        rak: {
          include: {
            zona: {
              include: { gudang: true }
            }
          }
        }
      }
    });
    const result = lokasis.map((l) => ({
      id: l.id,
      fullPath: [l.rak.zona.gudang.nama, l.rak.zona.nama, l.rak.kode, l.kode].join(' / '),
      kodeLokasi: l.kode,
    }));
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
