import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ Helper: Konversi BigInt & Date ke format aman
function safeSerialize(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return obj.toString();
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(safeSerialize);

  if (typeof obj === "object") {
    const res: Record<string, unknown> = {};

    for (const k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        res[k] = safeSerialize((obj as Record<string, unknown>)[k]);
      }
    }

    return res;
  }

  return obj;
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const body = await req.json();

    console.log("📝 Update delivery ID:", id);
    console.log("📝 Body:", body);

    const updated = await prisma.pengiriman.update({
      where: { id: BigInt(id) },
      data: {
        tgl_kirim: body.tgl_kirim
          ? new Date(body.tgl_kirim)
          : null,

        tgl_terima: body.tgl_terima
          ? new Date(body.tgl_terima)
          : null,

        status_kirim: body.status_kirim,
      },
    });

    return NextResponse.json(
      safeSerialize(updated)
    );

  } catch (error: unknown) {
    console.error(
      "Error updating delivery:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to update delivery",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}