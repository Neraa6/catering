import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const deliveries = await prisma.pengiriman.findMany({
    include: {
      pemesanan: {
        include: { pelanggan: { select: { nama_pelanggan: true } } }
      }
    },
    orderBy: { created_at: "desc" }
  });
  return NextResponse.json(deliveries.map(d => ({
    ...d,
    id: d.id.toString(),
    pemesanan: { ...d.pemesanan, id: d.pemesanan.id.toString() }
  })));
}