import { Request, Response } from 'express';
import prisma from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'wms-super-secret-key-2026';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        role: {
          include: {
            permissions: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Akun dinonaktifkan. Silakan hubungi administrator.' });
    }

    const roleName = user.role?.name || 'USER';
    
    // Generate JWT Token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: roleName },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: roleName,
        permissions: user.role?.permissions || []
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: { permissions: true }
        }
      }
    });

    if (!user || !user.isActive) return res.status(401).json({ message: 'User tidak valid atau dinonaktifkan' });
    
    res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role?.name || 'USER',
        permissions: user.role?.permissions || []
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};
