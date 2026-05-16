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

    // 2. Ambil Statistik Paralel
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

    const totalRevenue = Number(revenueRes._sum.total_bayar) || 0;
    console.log("✅ [2/4] Stats fetched.");

    // 3. Ambil Pesanan Terbaru dengan null-safe handling
    console.log("📦 [3/4] Fetching recent orders...");
    const rawOrders = await prisma.pemesanan.findMany({
      take: 5,
      orderBy: { tgl_pesan: "desc" },
      include: { 
        pelanggan: { 
          select: { 
            nama_pelanggan: true,
            email: true, // Optional: kalau mau ditampilkan
          }, 
        }, 
      },
    });
    console.log(`✅ [3/4] Found ${rawOrders.length} orders.`);

    // 4. KONVERSI AMAN dengan null checks
    console.log("🔄 [4/4] Serializing data...");
    const recentOrders = rawOrders.map((o) => {
      // ✅ Null-safe date conversion
      const tglPesan = o.tgl_pesan instanceof Date 
        ? o.tgl_pesan.toISOString() 
        : o.tgl_pesan || new Date().toISOString();
      
      // ✅ Null-safe BigInt conversion
      const totalBayar = o.total_bayar != null 
        ? Number(o.total_bayar) 
        : 0;

      return {
        id: o.id?.toString() || "unknown",
        no_resi: o.no_resi || `#${o.id?.toString() || "0"}`,
        tgl_pesan: tglPesan,
        total_bayar: totalBayar,
        status_pesan: o.status_pesan || "Unknown",
        pelanggan: o.pelanggan 
          ? { nama_pelanggan: o.pelanggan.nama_pelanggan || "Unknown" }
          : { nama_pelanggan: "Unknown" },
      };
    });

    const duration = Date.now() - start;
    console.log(`✅ [Dashboard API] Success in ${duration}ms`);
    
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
  } catch (error: unknown) {
    // 🔴 Detailed error logging
    const err = error as Error;
    console.error("❌ [Dashboard API] FAILED:", err.message);
    console.error("📜 Stack:", err.stack?.split("\n").slice(0, 5).join("\n"));
    
    // ✅ Log Prisma-specific errors
    if (err.message?.includes("Prisma")) {
      console.error("💡 Prisma Error Tips:");
      console.error("   - Cek .env: DATABASE_URL sudah benar?");
      console.error("   - Cek schema: Field 'pemesanan', 'pelanggan', dll ada?");
      console.error("   - Jalankan: npx prisma db push");
    }

    return NextResponse.json(
      { 
        error: err.message || "Internal Server Error",
        // ✅ Tambah detail error di development saja
        ...(process.env.NODE_ENV === "development" && {
          details: err.stack,
          hint: "Check terminal for detailed logs",
        }),
      },
      { status: 500 }
    );
  }
}