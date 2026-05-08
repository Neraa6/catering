import { PrismaClient, StatusPesan } from '@prisma/client';

const prisma = new PrismaClient();
const SELESAI = "Selesai" as StatusPesan;

async function fixOrderStatus() {
  console.log("🔧 Fixing order status...");

  // Cari semua pengiriman yang sudah Tiba_Ditujuan
  const deliveries = await prisma.pengiriman.findMany({
    where: { status_kirim: "Tiba_Ditujuan" },
    include: {
      pemesanan: {
        select: {
          id: true,
          status_pesan: true,
        },
      },
    },
  });

  let updated = 0;

  for (const delivery of deliveries) {
    // Jika status pesanan belum Selesai, update
    if (delivery.pemesanan.status_pesan !== SELESAI) {
      await prisma.pemesanan.update({
        where: { id: delivery.pemesanan.id },
        data: { status_pesan: SELESAI },
      });
      updated++;
      console.log(`✅ Updated order ${delivery.pemesanan.id}`);
    }
  }

  console.log(`✨ Selesai! ${updated} pesanan diupdate.`);
  await prisma.$disconnect();
}

fixOrderStatus().catch(console.error);