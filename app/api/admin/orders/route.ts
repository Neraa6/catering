import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ Helper: Serialize BigInt ke string agar bisa di-JSON
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
            paket: {
              select: {
                nama_paket: true,
                harga_paket: true,
              },
            },
          },
        },
        jenis_bayar: {
          select: {
            metode_pembayaran: true,
          },
        },
      },
    });

    // ✅ Serialize BigInt sebelum return
    const serializedOrders = serializeBigInt(orders);

    // ✅ Pastikan return array, bahkan jika kosong
    return NextResponse.json(serializedOrders || []);
    
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    
    // ✅ Return array kosong saat error, JANGAN return object error
    return NextResponse.json([], { status: 200 });
  }
}