import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import authRoutes from './routes/authRoutes';
import satuanBarangRoutes from './routes/satuanBarangRoutes';
import produkRoutes from './routes/produkRoutes';
import pemasokRoutes from './routes/pemasokRoutes';
import cabangRoutes from './routes/cabangRoutes';
import gudangRoutes from './routes/gudangRoutes';
import purchaseOrderRoutes from './routes/purchaseOrderRoutes';
import operasionalRoutes from './routes/operasionalRoutes';
import pengendalianRoutes from './routes/pengendalianRoutes';
import taskRoutes from './routes/taskRoutes';
import adminRoutes from './routes/adminRoutes';
import { checkStokMinimum, checkDeadlineTugas } from './services/notifikasiService';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// === API Routes ===
app.use('/api/auth', authRoutes);

// Data Master
app.use('/api/satuan-barang', satuanBarangRoutes);
app.use('/api/produk', produkRoutes);
app.use('/api/pemasok', pemasokRoutes);
app.use('/api/cabang', cabangRoutes);
app.use('/api/gudang', gudangRoutes);

// Barang Masuk
app.use('/api/purchase-order', purchaseOrderRoutes);

// Operasional (Inventory, SO, Retur, Movement)
app.use('/api/operasional', operasionalRoutes);

// Pengendalian
app.use('/api/pengendalian', pengendalianRoutes);

// Tugas, Notifikasi, Dashboard
app.use('/api', taskRoutes);

// Administrasi (User & Role)
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`[WMS Server] Berjalan di http://localhost:${port}`);
  
  // Scheduled jobs for notifications
  setInterval(() => {
    checkStokMinimum().catch(console.error);
    checkDeadlineTugas().catch(console.error);
  }, 1000 * 60 * 5); // Run every 5 minutes
});
