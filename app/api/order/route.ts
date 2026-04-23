import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
          password: "default123", // User bisa reset password nanti
          telepon: pelanggan.telepon,
          alamat1: pelanggan.alamat1,
        },
      });
      idPelanggan = newPelanggan.id;
    } else {
      idPelanggan = existingPelanggan.id;
    }

    // 2. Buat pemesanan
    const pemesanan = await prisma.pemesanan.create({
      data: {
        id_pelanggan: idPelanggan,
        id_jenis_bayar: BigInt(id_jenis_bayar),
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

    return NextResponse.json({
      success: true,
      orderId: pemesanan.id.toString(),
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