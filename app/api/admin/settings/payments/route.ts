import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const payments = await prisma.jenisPembayaran.findMany({
      include: { detail_pembayarans: true },
      orderBy: { created_at: "desc" },
    });

    // ✅ Serialize BigInt ke string
    const serialized = payments.map((p: any) => ({
      ...p,
      id: p.id.toString(),
      detail_pembayarans: p.detail_pembayarans.map((d: any) => ({
        ...d,
        id: d.id.toString(),
        id_jenis_pembayaran: d.id_jenis_pembayaran.toString(),
      })),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("❌ Error fetching payments:", error);
    // ✅ Return array kosong jika error, biar frontend tidak crash
    return NextResponse.json([], { status: 500 });
  }
}