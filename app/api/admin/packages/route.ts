import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ Helper: Serialize BigInt ke string
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return obj.toString();
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === "object") {
    const res: any = {};
    for (const k in obj) res[k] = serializeBigInt(obj[k]);
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

    // Validasi field wajib
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
      package: serializeBigInt(newPackage)
    });
  } catch (error: any) {
    console.error("❌ Error creating package:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menambah paket" },
      { status: 500 }
    );
  }
}

// ✅ PUT: Update package
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nama_paket, jenis, kategori, jumlah_pax, harga_paket, deskripsi } = body;

    const updated = await prisma.paket.update({
      where: { id: BigInt(id) },
      data: {  // ✅ Jangan lupa key "data:" di sini juga!
        nama_paket,
        jenis,
        kategori,
        jumlah_pax: parseInt(jumlah_pax),
        harga_paket: parseInt(harga_paket),
        deskripsi: deskripsi || null,
      },
    });

    return NextResponse.json(serializeBigInt(updated));
  } catch (error: any) {
    console.error("❌ Error updating package:", error);
    return NextResponse.json(
      { error: error.message || "Gagal mengupdate paket" },
      { status: 500 }
    );
  }
}

// ✅ DELETE: Delete package
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await prisma.paket.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Error deleting package:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menghapus paket" },
      { status: 500 }
    );
  }
}