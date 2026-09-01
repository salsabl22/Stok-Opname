import prisma from '../src/db';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Start seeding...');

  // --- Konstanta Modul ---
  const modules = [
    'dashboard',
    'tugas_saya',
    'data_master',
    'barang_masuk',
    'operasional',
    'barang_keluar',
    'stock_opname',
    'laporan',
    'pengaturan_sistem'
  ];

  // Fungsi helper untuk generate full permissions
  const generatePermissions = (allowedModules: string[], actions: { lihat?: boolean, buat?: boolean, ubah?: boolean, hapus?: boolean, proses?: boolean, setujui?: boolean, export?: boolean }) => {
    return allowedModules.map(modul => ({
      modul,
      lihat: actions.lihat ?? false,
      buat: actions.buat ?? false,
      ubah: actions.ubah ?? false,
      hapus: actions.hapus ?? false,
      proses: actions.proses ?? false,
      setujui: actions.setujui ?? false,
      export: actions.export ?? false,
    }));
  };

  // 1. Roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER ADMIN' },
    update: {},
    create: {
      name: 'SUPER ADMIN',
      description: 'Super Administrator',
      permissions: {
        create: [
          { modul: 'semua', lihat: true, buat: true, ubah: true, hapus: true, proses: true, setujui: true, export: true }
        ]
      }
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrator Operasional',
      permissions: {
        create: generatePermissions(modules, { lihat: true, buat: true, ubah: true, hapus: true, proses: true, setujui: true, export: true })
      }
    },
  });

  const supervisorRole = await prisma.role.upsert({
    where: { name: 'SUPERVISOR' },
    update: {},
    create: {
      name: 'SUPERVISOR',
      description: 'Supervisor Gudang',
      permissions: {
        create: generatePermissions(modules, { lihat: true, buat: true, ubah: true, hapus: false, proses: true, setujui: true, export: true })
      }
    },
  });

  const staffRole = await prisma.role.upsert({
    where: { name: 'STAFF' },
    update: {},
    create: {
      name: 'STAFF',
      description: 'Staf Gudang / Operator',
      permissions: {
        create: generatePermissions(['dashboard', 'tugas_saya', 'barang_masuk', 'operasional', 'barang_keluar', 'stock_opname'], { lihat: true, buat: true, ubah: true, hapus: false, proses: true, setujui: false, export: false })
      }
    },
  });

  // 2. Users (dengan password hashed)
  const hashPassword = (password: string) => bcrypt.hashSync(password, 10);

  await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: { roleId: superAdminRole.id, password: hashPassword('admin') },
    create: {
      username: 'superadmin',
      name: 'Super Admin',
      password: hashPassword('admin'),
      roleId: superAdminRole.id,
    },
  });
  console.log(`Created user: superadmin`);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { roleId: adminRole.id, password: hashPassword('admin') },
    create: {
      username: 'admin',
      name: 'Admin WMS',
      password: hashPassword('admin'),
      roleId: adminRole.id,
    },
  });
  console.log(`Created user: admin`);

  await prisma.user.upsert({
    where: { username: 'supervisor' },
    update: { roleId: supervisorRole.id, password: hashPassword('supervisor') },
    create: {
      username: 'supervisor',
      name: 'Spv Gudang',
      password: hashPassword('supervisor'),
      roleId: supervisorRole.id,
    },
  });
  console.log(`Created user: supervisor`);

  await prisma.user.upsert({
    where: { username: 'user' },
    update: { roleId: staffRole.id, password: hashPassword('user') },
    create: {
      username: 'user',
      name: 'Staf Lapangan',
      password: hashPassword('user'),
      roleId: staffRole.id,
    },
  });
  console.log(`Created user: user`);

  // 3. Satuan Barang Dasar & Kemasan
  const pcs = await prisma.satuanBarang.upsert({
    where: { kode: 'PCS' },
    update: {},
    create: { kode: 'PCS', nama: 'Pieces', deskripsi: 'Satuan dasar satuan terkecil' },
  });
  const box = await prisma.satuanBarang.upsert({
    where: { kode: 'BOX' },
    update: {},
    create: { kode: 'BOX', nama: 'Box', deskripsi: 'Kemasan isi 10 PCS' },
  });
  const bal = await prisma.satuanBarang.upsert({
    where: { kode: 'BAL' },
    update: {},
    create: { kode: 'BAL', nama: 'Bal', deskripsi: 'Kemasan isi 20 PCS' },
  });

  // 4. Dummy Kategori
  const kategori = 'Makanan Ringan';

  // 5. Dummy Produk
  const produkA = await prisma.produk.upsert({
    where: { kodeProduk: 'PRD-001' },
    update: {},
    create: {
      kodeProduk: 'PRD-001',
      namaProduk: 'Keripik Kentang Original',
      kategori: kategori,
      satuanId: pcs.id,
      satuanPembelianId: bal.id,
      konversi: 20, // deprecated field tapi diisi sementara
      minimumStok: 100,
    }
  });

  // 6. Konversi
  await prisma.konversiSatuan.upsert({
    where: {
      produkId_satuanBesarId_satuanKecilId: {
        produkId: produkA.id,
        satuanBesarId: bal.id,
        satuanKecilId: pcs.id,
      }
    },
    update: {},
    create: {
      produkId: produkA.id,
      satuanBesarId: bal.id,
      satuanKecilId: pcs.id,
      nilaiKonversi: 20, // 1 BAL = 20 PCS
    }
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
