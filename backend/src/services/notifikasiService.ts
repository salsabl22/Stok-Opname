import prisma from '../db';

export async function checkStokMinimum() {
  try {
    const inventories = await prisma.inventory.findMany({
      include: {
        produk: true,
      },
    });

    for (const inv of inventories) {
      if (inv.jumlahTersedia < inv.minimumStok) {
        // Cek apakah sudah ada notifikasi yang belum dibaca untuk produk ini
        const existingNotif = await prisma.notification.findFirst({
          where: {
            tipe: 'STOK_RENDAH',
            referensiId: inv.produkId,
            isRead: false,
          },
        });

        if (!existingNotif) {
          await prisma.notification.create({
            data: {
              judul: 'Stok Menipis',
              pesan: `Stok produk ${inv.produk.namaProduk} (${inv.produk.kodeProduk}) menipis. Tersedia: ${inv.jumlahTersedia}, Minimum: ${inv.minimumStok}`,
              tipe: 'STOK_RENDAH',
              referensiId: inv.produkId,
            },
          });
        }
      }
    }
  } catch (error) {
    console.error('Error in checkStokMinimum:', error);
  }
}

export async function checkDeadlineTugas() {
  try {
    const now = new Date();
    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    const tasks = await prisma.task.findMany({
      where: {
        status: {
          notIn: ['SELESAI', 'TERLAMBAT'],
        },
        deadline: {
          not: null,
        },
      },
    });

    for (const task of tasks) {
      if (task.deadline && task.deadline < now) {
        // Tandai terlambat
        await prisma.task.update({
          where: { id: task.id },
          data: { status: 'TERLAMBAT' },
        });

        await prisma.notification.create({
          data: {
            userId: task.assignedTo,
            judul: 'Tugas Terlambat',
            pesan: `Tugas ${task.nomorTugas} telah melewati batas waktu!`,
            tipe: 'DEADLINE',
            referensiId: task.id,
          },
        });
      } else if (task.deadline && task.deadline < oneDayFromNow) {
        // Cek apakah sudah ada notifikasi deadline untuk tugas ini
        const existingNotif = await prisma.notification.findFirst({
          where: {
            tipe: 'DEADLINE',
            referensiId: task.id,
            isRead: false,
          },
        });

        if (!existingNotif) {
          await prisma.notification.create({
            data: {
              userId: task.assignedTo,
              judul: 'Deadline Mendekat',
              pesan: `Tugas ${task.nomorTugas} akan jatuh tempo besok.`,
              tipe: 'DEADLINE',
              referensiId: task.id,
            },
          });
        }
      }
    }
  } catch (error) {
    console.error('Error in checkDeadlineTugas:', error);
  }
}
