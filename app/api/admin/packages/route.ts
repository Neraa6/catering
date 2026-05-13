import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ Helper: Serialize BigInt ke string
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

// ✅ GET: Fetch all packages
export async function GET() {
  try {
    const packages = await prisma.paket.findMany({
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(serializeBigInt(packages) || []);
  } catch (error) {
    console.error("❌ Error fetching packages:", error);
    return NextResponse.json([], { status: 200 });
  }
}

// ✅ POST: Create new package
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama_paket, jenis, kategori, jumlah_pax, harga_paket, deskripsi, foto1, foto2, foto3 } = body;

    if (!nama_paket || !jenis || !kategori || !jumlah_pax || !harga_paket) {
      return NextResponse.json(
        { error: "Field nama, jenis, kategori, jumlah pax, dan harga wajib diisi" },
        { status: 400 }
      );
    }

    // ✅ PERBAIKAN: Tambah key "data:" di sini!
    const newPackage = await prisma.paket.create({
      data: {  // 👈 INI YANG TADI HILANG!
        nama_paket,
        jenis, // Enum: 'Prasmanan' | 'Box'
        kategori, // Enum: 'Pernikahan' | 'Selamatan' | dll
        jumlah_pax: parseInt(jumlah_pax),
        harga_paket: parseInt(harga_paket),
        deskripsi: deskripsi || null,
        foto1: foto1 || null,
        foto2: foto2 || null,
        foto3: foto3 || null,
      },
    });

    return NextResponse.json({ 
  success: true, 
  package: serializeBigInt(newPackage) as Record<string, unknown>
});
  } catch (error: unknown) {
    console.error("❌ Error creating package:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Gagal menambah paket" },
      { status: 500 }
    );
  }
}