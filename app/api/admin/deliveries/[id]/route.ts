import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ Helper: Konversi BigInt & Date ke format aman
function safeSerialize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return obj.toString();
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(safeSerialize);
  if (typeof obj === "object") {
    const res: any = {};
    for (const k in obj) res[k] = safeSerialize(obj[k]);
    return res;
  }
  return obj;
}

// ✅ Next.js 15/16: params wajib Promise
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    // 1. Await params (Wajib di Next.js 15+)
    const { id } = await context.params;
    const body = await req.json();

    console.log("📝 Update delivery ID:", id);
    console.log("📝 Body:", body);

    // 2. Update database
    const updated = await prisma.pengiriman.update({
      where: { id: BigInt(id) },
      data: {
        tgl_kirim: body.tgl_kirim ? new Date(body.tgl_kirim) : null,
        tgl_terima: body.tgl_terima ? new Date(body.tgl_terima) : null,
        status_kirim: body.status_kirim,
      },
    });

    // 3. Serialize BigInt sebelum return JSON
    return NextResponse.json(safeSerialize(updated));
    
  } catch (error: any) {
    console.error(" Error updating delivery:", error);
    return NextResponse.json(
      { error: "Failed to update delivery", details: error.message },
      { status: 500 }
    );
  }
}