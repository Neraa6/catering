import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ Helper: Serialize BigInt
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

// ✅ Next.js 15/16: params adalah Promise
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    console.log("📝 Admin update delivery ID:", id);
    console.log("📝 Body:", body);

    // ✅ Gunakan transaction untuk update delivery DAN pesanan
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update status pengiriman
      const updatedDelivery = await tx.pengiriman.update({
        where: { id: BigInt(id) },
        data: {
          tgl_kirim: body.tgl_kirim ? new Date(body.tgl_kirim) : null,
          tgl_terima: body.tgl_terima ? new Date(body.tgl_terima) : null,
          status_kirim: body.status_kirim,
        },
      });

      // ✅ 2. Jika status = Tiba_Ditujuan, update status pesanan jadi Selesai
      if (body.status_kirim === "Tiba_Ditujuan") {
        await tx.pemesanan.update({
          where: { id: updatedDelivery.id_pesan },
          data: {
            status_pesan: "Selesai",
          },
        });
        console.log("✅ Status pesanan diupdate menjadi Selesai");
      }

      return updatedDelivery;
    });

    console.log("✅ Updated successfully:", result);

    return NextResponse.json(serializeBigInt(result));
  } catch (error: unknown) {
    console.error("❌ Error updating delivery:", error);
    return NextResponse.json(
      { error: "Failed to update delivery", details: (error as Error).message },
      { status: 500 }
    );
  }
}