import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.pemesanan.findMany({
      orderBy: { tgl_pesan: "desc" },
      include: {
        pelanggan: {
          select: {
            nama_pelanggan: true,
            email: true,
            telepon: true,
          },
        },
        detail: {
          include: {
            paket: true,
          },
        },
        jenis_bayar: true,
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}