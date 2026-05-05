import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const deliveries = await prisma.pengiriman.findMany({
      include: { 
        pemesanan: { 
          include: { 
            pelanggan: { 
              select: { 
                nama_pelanggan: true, 
                alamat1: true, 
                telepon: true 
              } 
            } 
          } 
        } 
      },
      orderBy: { created_at: "desc" }
    });

    // Konversi BigInt ke string agar bisa di-JSON.stringify
    return NextResponse.json(
      deliveries.map(d => ({ 
        ...d, 
        id: d.id.toString(),
        pemesanan: {
          ...d.pemesanan,
          id: d.pemesanan.id.toString()
        }
      })),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    return NextResponse.json(
      { error: "Failed to fetch deliveries", success: false },
      { status: 500 }
    );
  }
}