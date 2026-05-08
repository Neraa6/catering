import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ Helper: Serialize BigInt & Date
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

// ✅ GET: Fetch profile data
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const pelanggan = await prisma.pelanggan.findUnique({
      where: { email },
      select: {
        nama_pelanggan: true,
        email: true,
        telepon: true,
        alamat1: true,
        alamat2: true,
        alamat3: true,
        tgl_lahir: true,
        kartu_id: true,
        foto: true,
      },
    });

    if (!pelanggan) {
      return NextResponse.json({ error: "Pelanggan not found" }, { status: 404 });
    }

    return NextResponse.json(serializeBigInt(pelanggan));
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

// ✅ PUT: Update profile data
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { email, ...updateData } = body;

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Validasi field wajib
    const required = ["nama_pelanggan", "telepon", "alamat1"];
    for (const field of required) {
      if (!updateData[field]?.trim()) {
        return NextResponse.json(
          { error: `${field.replace("_", " ")} wajib diisi` },
          { status: 400 }
        );
      }
    }

    // Format tanggal jika ada
    const formattedData: any = { ...updateData };
    if (formattedData.tgl_lahir) {
      formattedData.tgl_lahir = new Date(formattedData.tgl_lahir);
    }

    // Update database
    const updated = await prisma.pelanggan.update({
      where: { email },
      data: formattedData,
      select: {
        nama_pelanggan: true,
        email: true,
        telepon: true,
        alamat1: true,
        alamat2: true,
        alamat3: true,
        tgl_lahir: true,
        kartu_id: true,
        foto: true,
      },
    });

    return NextResponse.json(serializeBigInt(updated));
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}