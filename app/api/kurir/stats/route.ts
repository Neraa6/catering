import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Hitung statistik pengiriman
    const [pending, delivering, completed] = await Promise.all([
      prisma.pengiriman.count({ where: { status_kirim: "Menunggu_Kurir" } }),
      prisma.pengiriman.count({ where: { status_kirim: "Sedang_Dikirim" } }),
      prisma.pengiriman.count({ where: { status_kirim: "Tiba_Ditujuan" } }),
    ]);

    return NextResponse.json({ 
      pending, 
      delivering, 
      completed,
      success: true 
    });
  } catch (error) {
    console.error("Error fetching kurir stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics", success: false },
      { status: 500 }
    );
  }
}