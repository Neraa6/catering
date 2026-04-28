import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Pastikan route tidak di-cache oleh Next.js
export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  console.log("🚀 [Dashboard API] Starting...");

  try {
    // 1. Test Koneksi Database
    console.log("🔌 [1/4] Testing DB connection...");
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ [1/4] DB Connected.");

    // 2. Ambil Statistik Paralel (Lebih Cepat)
    console.log("📊 [2/4] Fetching stats...");
    const [
      totalOrders,
      totalCustomers,
      totalPackages,
      pendingOrders,
      processingOrders,
      revenueRes,
    ] = await Promise.all([
      prisma.pemesanan.count(),
      prisma.pelanggan.count(),
      prisma.paket.count(),
      prisma.pemesanan.count({ where: { status_pesan: "Menunggu_Konfirmasi" } }),
      prisma.pemesanan.count({ where: { status_pesan: "Sedang_Diproses" } }),
      prisma.pemesanan.aggregate({ _sum: { total_bayar: true } }),
    ]);

    const totalRevenue = Number(revenueRes._sum.total_bayar || 0);
    console.log("✅ [2/4] Stats fetched.");

    // 3. Ambil Pesanan Terbaru
    console.log("📦 [3/4] Fetching recent orders...");
    const rawOrders = await prisma.pemesanan.findMany({
      take: 5,
      orderBy: { tgl_pesan: "desc" },
      include: { pelanggan: { select: { nama_pelanggan: true } } },
    });

    // 4. KONVERSI AMAN (BigInt & Date -> String/Number)
    console.log("🔄 [4/4] Serializing data...");
    const recentOrders = rawOrders.map((o) => ({
      id: o.id.toString(),
      no_resi: o.no_resi,
      tgl_pesan: o.tgl_pesan.toISOString(),
      total_bayar: Number(o.total_bayar),
      status_pesan: o.status_pesan,
      pelanggan: o.pelanggan,
    }));

    console.log(`✅ [Dashboard API] Success in ${Date.now() - start}ms`);
    return NextResponse.json({
      stats: {
        totalOrders,
        totalRevenue,
        totalCustomers,
        totalPackages,
        pendingOrders,
        processingOrders,
      },
      recentOrders,
    });
  } catch (error: any) {
    // 🔴 INI AKAN MUNCUL DI TERMINAL SERVER KAMU
    console.error("❌ [Dashboard API] FAILED:", error.message);
    console.error("📜 Stack:", error.stack?.split("\n").slice(0, 3).join("\n"));
    
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}