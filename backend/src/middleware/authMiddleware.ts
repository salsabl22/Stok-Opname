import { Request, Response, NextFunction } from 'express';
import prisma from '../db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'wms-super-secret-key-2026';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized. Token tidak ditemukan.' });
    }

    const token = authHeader.split(' ')[1];
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Sesi telah berakhir atau token tidak valid. Silakan login kembali.' });
    }

    const userId = decoded.userId;

    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      include: {
        role: {
          include: { permissions: true }
        }
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User tidak valid atau tidak aktif.' });
    }

    (req as any).user = user;
    next();
  } catch (error: any) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat verifikasi auth.' });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const roleName = user.role?.name;
    if (!roleName || !allowedRoles.includes(roleName)) {
      return res.status(403).json({ message: 'Forbidden. Hak akses ditolak.' });
    }

    next();
  };
};

export const requirePermission = (modul: string, aksi: 'lihat' | 'buat' | 'ubah' | 'hapus' | 'proses' | 'setujui' | 'export') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (user.role?.name === 'ADMIN_MASTER') {
      return next(); // Admin Master bebas akses
    }

    const permissions = user.role?.permissions || [];
    
    // Cari permission spesifik modul atau wildcard 'semua'
    const perm = permissions.find((p: any) => p.modul === modul || p.modul === 'semua');
    
    if (!perm || !perm[aksi]) {
      return res.status(403).json({ message: `Forbidden. Anda tidak memiliki akses '${aksi}' untuk modul '${modul}'.` });
    }

    next();
  };
};
