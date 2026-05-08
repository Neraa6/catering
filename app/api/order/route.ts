import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ Helper: Generate no_resi unik format ORD-YYYY-XXXXX
function generateNoResi(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `ORD-${year}-${random}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pelanggan, items, id_jenis_bayar, total_bayar, tanggal_acara, catatan } = body;

    // 1. Cari atau Buat Pelanggan
    let idPelanggan: bigint;
    const existingPelanggan = await prisma.pelanggan.findUnique({ 
      where: { email: pelanggan.email } 
    });

    if (!existingPelanggan) {
      const newPelanggan = await prisma.pelanggan.create({
        data: {
          nama_pelanggan: pelanggan.nama_pelanggan,
          email: pelanggan.email,
          password: "default123",
          telepon: pelanggan.telepon,
          alamat1: pelanggan.alamat1,
        },
      });
      idPelanggan = newPelanggan.id;
    } else {
      idPelanggan = existingPelanggan.id;
    }

    // 2. Generate No Resi Unik
    let noResi = generateNoResi();
    // ✅ PERBAIKAN: Gunakan `no_resi: noResi` (jangan shorthand { no_resi })
    let exists = await prisma.pemesanan.findUnique({ where: { no_resi: noResi } });
    while (exists) {
      noResi = generateNoResi();
      exists = await prisma.pemesanan.findUnique({ where: { no_resi: noResi } });
    }

    // 3. Simpan ke Database dengan Transaction (Lebih aman)
    const result = await prisma.$transaction(async (tx) => {
      // A. Buat Pesanan
      const pemesanan = await tx.pemesanan.create({
        data: {
          id_pelanggan: idPelanggan,
          id_jenis_bayar: BigInt(id_jenis_bayar),
          no_resi: noResi, // ✅ Sekarang variabel noResi sudah terdefinisi
          tgl_pesan: new Date(),
          status_pesan: "Menunggu_Konfirmasi",
          total_bayar: BigInt(total_bayar),
          detail: {
            create: items.map((item: any) => ({
              id_paket: BigInt(item.id_paket),
              // ✅ quantity DIHAPUS karena tidak ada di PDM
              subtotal: BigInt(item.subtotal),
            })),
          },
        },
      });

      // B. Buat Data Pengiriman Otomatis
      await tx.pengiriman.create({
        data: {
          id_pesan: pemesanan.id,
          id_user: BigInt(1), // ID Admin/Owner default
          status_kirim: "Sedang_Dikirim",
        },
      });

      return { 
        success: true, 
        orderId: pemesanan.id.toString(), 
        noResi: pemesanan.no_resi 
      };
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("🔥 ORDER ERROR:", error.message);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memproses pesanan" },
      { status: 500 }
    );
  }
}