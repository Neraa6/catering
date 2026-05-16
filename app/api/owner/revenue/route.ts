import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

    const monthlyData = await Promise.all(
      Array.from({ length: 12 }, async (_, index) => {
        const month = index + 1;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const orders = await prisma.pemesanan.findMany({
          where: {
            tgl_pesan: {
              gte: startDate,
              lte: endDate,
            },
            status_pesan: {
              in: ["Selesai", "Sedang_Diproses", "Menunggu_Konfirmasi"],
            },
          },
          select: {
            total_bayar: true,
          },
        });

        const revenue = orders.reduce((sum, order) => sum + Number(order.total_bayar), 0);
        const orderCount = orders.length;

        return {
          month,
          revenue,
          orders: orderCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        labels: monthlyData.map((d) => monthNames[d.month - 1]),
        revenue: monthlyData.map((d) => d.revenue),
        orders: monthlyData.map((d) => d.orders),
      },
    });
  } catch (error) {
    console.error("Revenue API error:", error);
    return NextResponse.json({ error: "Failed to fetch revenue" }, { status: 500 });
  }
}