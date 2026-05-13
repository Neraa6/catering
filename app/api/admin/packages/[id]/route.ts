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

// ✅ GET: Fetch single package
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const pkg = await prisma.paket.findUnique({
      where: { id: BigInt(id) },
    });

    if (!pkg) {
      return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(serializeBigInt(pkg));
  } catch (error) {
    console.error("❌ Error fetching package:", error);
    return NextResponse.json({ error: "Failed to fetch package" }, { status: 500 });
  }
}

// ✅ PUT: Update package
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nama_paket, jenis, kategori, jumlah_pax, harga_paket, deskripsi } = body;

    const updated = await prisma.paket.update({
      where: { id: BigInt(id) },
      data: {
        nama_paket,
        jenis,
        kategori,
        jumlah_pax: parseInt(jumlah_pax),
        harga_paket: parseInt(harga_paket),
        deskripsi: deskripsi || null,
      },
    });

    return NextResponse.json(serializeBigInt(updated));
  } catch (error: unknown) {
    console.error("❌ Error updating package:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Gagal mengupdate paket" },
      { status: 500 }
    );
  }
}

// ✅ DELETE: Delete package
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.paket.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("❌ Error deleting package:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Gagal menghapus paket" },
      { status: 500 }
    );
  }
}