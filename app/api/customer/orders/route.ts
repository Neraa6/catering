import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ Helper: Serialize BigInt & Date ke JSON-safe
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return obj.toString();
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === "object") {
    const result: any = {};
    for (const key in obj) {
      result[key] = serializeBigInt(obj[key]);
    }
    return result;
  }
  return obj;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Cari pelanggan berdasarkan email
    const pelanggan = await prisma.pelanggan.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!pelanggan) {
      // ✅ Return array kosong, bukan error object, biar frontend tidak crash
      return NextResponse.json([]);
    }

    // Ambil semua pesanan pelanggan
    const orders = await prisma.pemesanan.findMany({
      where: { id_pelanggan: pelanggan.id },
      orderBy: { tgl_pesan: "desc" },
      include: {
        detail: {
          include: {
            paket: {
              select: {
                nama_paket: true,
                foto1: true,
              },
            },
          },
        },
        jenis_bayar: {
          select: { metode_pembayaran: true },
        },
      },
    });

    // ✅ Serialize semua BigInt sebelum return
    const serializedOrders = serializeBigInt(orders);

    // ✅ Pastikan selalu return array
    return NextResponse.json(serializedOrders || []);
    
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    // ✅ Return array kosong saat error, biar frontend tidak crash
    return NextResponse.json([]);
  }
}