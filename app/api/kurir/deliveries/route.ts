import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ Helper: Serialize BigInt & Date
function serializeBigInt(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return obj.toString();
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === "object") {
    const res: Record<string, unknown> = {};
    for (const k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        res[k] = serializeBigInt((obj as Record<string, unknown>)[k]);
      }
    }
    return res;
  }
  return obj;
}

export async function GET() {
  try {
    const deliveries = await prisma.pengiriman.findMany({
      include: {
        pemesanan: {
          include: {
            pelanggan: {
              select: { nama_pelanggan: true, alamat1: true, telepon: true }
            }
          }
        }
      },
      orderBy: { created_at: "desc" }
    });

    // ✅ Selalu return array yang sudah diserialisasi
    return NextResponse.json(serializeBigInt(deliveries) || []);
  } catch (error) {
    console.error("❌ Error fetching kurir deliveries:", error);
    return NextResponse.json([], { status: 200 });
  }
}