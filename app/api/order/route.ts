import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ Helper: Generate no_resi unik format ORD-YYYY-XXXXX
function generateNoResi(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000); // 5 digit random
  return `ORD-${year}-${random}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pelanggan, items, id_jenis_bayar, total_bayar, tanggal_acara, catatan } = body;

    // 1. Buat atau cari pelanggan
    let existingPelanggan = await prisma.pelanggan.findUnique({
      where: { email: pelanggan.email },
    });

    let idPelanggan: bigint;

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

    // ✅ 2. Generate no_resi unik
    let noResi = generateNoResi();
    
    // Pastikan no_resi belum dipakai (collision check)
    let exists = await prisma.pemesanan.findUnique({ where: { no_resi } });
    while (exists) {
      noResi = generateNoResi();
      exists = await prisma.pemesanan.findUnique({ where: { no_resi } });
    }

    // 3. Buat pemesanan dengan no_resi
    const pemesanan = await prisma.pemesanan.create({
      data: {
        id_pelanggan: idPelanggan,
        id_jenis_bayar: BigInt(id_jenis_bayar),
        no_resi: noResi, // ✅ Auto-generated
        tgl_pesan: new Date(),
        status_pesan: "Menunggu_Konfirmasi",
        total_bayar: BigInt(total_bayar),
        detail: {
          create: items.map((item: any) => ({
            id_paket: BigInt(item.id_paket),
            quantity: item.quantity,
            subtotal: BigInt(item.subtotal),
          })),
        },
      },
      include: {
        detail: true,
      },
    });

    // ✅ 4. Auto-create entri pengiriman (Menunggu_Kurir)
    await prisma.pengiriman.create({
      data: {
        id_pesan: pemesanan.id,
        id_user: BigInt(1), // Default admin, nanti bisa di-assign ke kurir
        status_kirim: "Sedang_Dikirim",
      },
    });

    return NextResponse.json({
      success: true,
      orderId: pemesanan.id.toString(),
      noResi: pemesanan.no_resi, // ✅ Return no_resi ke frontend
      message: "Pesanan berhasil dibuat",
    });
  } catch (error) {
    console.error("Order error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memproses pesanan" },
      { status: 500 }
    );
  }
}