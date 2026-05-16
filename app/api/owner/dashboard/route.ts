// app/api/owner/dashboard/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [
      totalOrders, totalCustomers, totalPackages,
      pendingOrders, processingOrders, revenueRes,
    ] = await Promise.all([
      prisma.pemesanan.count(),
      prisma.pelanggan.count(),
      prisma.paket.count(),
      prisma.pemesanan.count({ where: { status_pesan: "Menunggu_Konfirmasi" } }),
      prisma.pemesanan.count({ where: { status_pesan: "Sedang_Diproses" } }),
      prisma.pemesanan.aggregate({ _sum: { total_bayar: true } }),
    ]);

    const rawOrders = await prisma.pemesanan.findMany({
      take: 5,
      orderBy: { tgl_pesan: "desc" },
      include: { pelanggan: { select: { nama_pelanggan: true } } },
    });

    const recentOrders = rawOrders.map((o) => ({
      id: o.id?.toString() || "0",
      no_resi: o.no_resi || `#${o.id?.toString() || "0"}`,
      tgl_pesan: o.tgl_pesan instanceof Date ? o.tgl_pesan.toISOString() : new Date().toISOString(),
      total_bayar: o.total_bayar != null ? Number(o.total_bayar) : 0,
      status_pesan: o.status_pesan || "Unknown",
      pelanggan: o.pelanggan ? { nama_pelanggan: o.pelanggan.nama_pelanggan || "Unknown" } : { nama_pelanggan: "Unknown" },
    }));

    return NextResponse.json({
      stats: {
        totalOrders,
        totalRevenue: Number(revenueRes._sum.total_bayar) || 0,
        totalCustomers,
        totalPackages,
        pendingOrders,
        processingOrders,
      },
      recentOrders,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("❌ Owner Dashboard API Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}