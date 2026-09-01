import { Request, Response } from 'express';
import prisma from '../db';
import { generateDocNumber } from '../utils/docNumberUtil';

// ============ TASK ============
export const getTasks = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const where = userId ? { assignedTo: userId as string } : {};
    const data = await prisma.task.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const { jenis, referensiId, deskripsi, prioritas, assignedTo, deadline, catatan } = req.body;
    const nomorTugas = await generateDocNumber('TSK', 'Task', 'nomorTugas');

    const data = await prisma.task.create({
      data: { 
        nomorTugas,
        jenis, 
        referensiId, 
        deskripsi, 
        prioritas: prioritas || 'NORMAL', 
        assignedTo, 
        deadline: deadline ? new Date(deadline) : null, 
        status: assignedTo ? 'DITUGASKAN' : 'MENUNGGU',
        catatan
      },
      include: { user: true },
    });

    // Buat notifikasi untuk user yang ditugaskan
    if (assignedTo) {
      await prisma.notification.create({
        data: {
          userId: assignedTo,
          judul: 'Tugas Baru',
          pesan: `Anda mendapat tugas baru: ${deskripsi}`,
          tipe: 'TUGAS_BARU',
          referensiId: data.id
        }
      });
    }

    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, catatan } = req.body;

    const currentTask = await prisma.task.findUnique({ where: { id } });
    if (!currentTask) return res.status(404).json({ message: 'Tugas tidak ditemukan' });

    const updateData: any = { status };
    if (catatan) updateData.catatan = catatan;

    if (status === 'DIKERJAKAN' && !currentTask.waktuMulai) {
      updateData.waktuMulai = new Date();
    } else if (status === 'SELESAI') {
      if (!currentTask.waktuMulai) updateData.waktuMulai = new Date();
      updateData.waktuSelesai = new Date();
    }

    const data = await prisma.task.update({
      where: { id },
      data: updateData,
      include: { user: true },
    });

    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ============ NOTIFICATION ============
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const where = userId ? { OR: [{ userId: userId as string }, { userId: null }] } : {};
    const data = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ============ ACTIVITY LOG ============
export const getActivities = async (req: Request, res: Response) => {
  try {
    const data = await prisma.activityLog.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ============ DASHBOARD ============
export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const [
      totalProduk,
      totalPemasok,
      totalCabang,
      totalPO,
      totalSO,
      totalRetur,
      inventoryItems,
      recentMovements,
      pendingTasks,
      lowStockItems,
    ] = await Promise.all([
      prisma.produk.count({ where: { status: 'aktif' } }),
      prisma.pemasok.count({ where: { status: 'aktif' } }),
      prisma.cabang.count({ where: { status: 'aktif' } }),
      prisma.purchaseOrder.count(),
      prisma.salesOrder.count(),
      prisma.retur.count(),
      prisma.inventory.findMany({ include: { produk: true } }),
      prisma.stockMovement.findMany({
        include: { produk: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.task.count({ where: { status: { notIn: ['SELESAI', 'TERLAMBAT'] } } }),
      prisma.inventory.findMany({
        include: { produk: true },
        take: 100, // Ambil secukupnya, filter di memory
      }),
    ]);

    const totalStokTersedia = inventoryItems.reduce((sum, item) => sum + item.jumlahTersedia, 0);
    const totalStokDialokasikan = inventoryItems.reduce((sum, item) => sum + item.jumlahDialokasikan, 0);
    
    // Low stock: item yang jumlahTersedia <= minimumStok produknya
    const lowStockFiltered = lowStockItems.filter(item => 
      item.jumlahTersedia <= (item.minimumStok || (item.produk as any)?.minimumStok || 0)
    ).slice(0, 10);

    res.json({
      summary: {
        totalProduk,
        totalPemasok,
        totalCabang,
        totalPO,
        totalSO,
        totalRetur,
        totalStokTersedia,
        totalStokDialokasikan,
        pendingTasks,
      },
      recentMovements,
      lowStockItems: lowStockFiltered,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
