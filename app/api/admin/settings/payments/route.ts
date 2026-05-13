import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const payments = await prisma.jenisPembayaran.findMany({
      include: { detail_pembayarans: true },
      orderBy: { created_at: "desc" },
    });

    // ✅ Serialize BigInt ke string
    const serialized = payments.map((p: unknown) => ({
      ...(p as Record<string, unknown>),
      id: (p as { id: bigint }).id.toString(),
      detail_pembayarans: (p as { detail_pembayarans: unknown[] }).detail_pembayarans.map((d: unknown) => ({
        ...(d as Record<string, unknown>),
        id: (d as { id: bigint }).id.toString(),
        id_jenis_pembayaran: (d as { id_jenis_pembayaran: bigint }).id_jenis_pembayaran.toString(),
      })),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("❌ Error fetching payments:", error);
    // ✅ Return array kosong jika error, biar frontend tidak crash
    return NextResponse.json([], { status: 500 });
  }
}