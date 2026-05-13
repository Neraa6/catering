import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// ✅ Helper: Serialize BigInt & Date
// ✅ Helper function dengan unknown
function serializeBigInt(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === "bigint") return obj.toString();
  if (obj instanceof Date) return obj.toISOString();
  
  if (Array.isArray(obj)) {
    return obj.map(item => serializeBigInt(item));
  }
  
  if (typeof obj === "object" && obj !== null) {
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

// ✅ Di dalam PUT function (app/api/customer/profile/route.ts)
export async function PUT(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const { email, ...updateData } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Validasi field wajib dengan type guard
    const required = ["nama_pelanggan", "telepon", "alamat1"] as const;
    for (const field of required) {
      const value = updateData[field];
      if (typeof value !== "string" || !value.trim()) {
        return NextResponse.json(
          { error: `${field.replace("_", " ")} wajib diisi` },
          { status: 400 }
        );
      }
    }

    // ✅ Gunakan unknown + type assertion saat perlu akses properti
    const formattedData: Record<string, unknown> = { ...updateData };
    
    // Format tanggal dengan type guard
    if (formattedData.tgl_lahir) {
      const tgl = formattedData.tgl_lahir;
      if (typeof tgl === "string") {
        formattedData.tgl_lahir = new Date(tgl);
      }
    }

    // ✅ Untuk Prisma, gunakan type assertion ke Prisma.PelangganUpdateInput
    const updated = await prisma.pelanggan.update({
      where: { email },
      data: formattedData as Prisma.PelangganUpdateInput, // 👈 Type assertion untuk Prisma
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
  } catch (error: unknown) {
    // ✅ Handle error dengan type guard
    const message = error instanceof Error 
      ? error.message 
      : "Failed to update profile";
    
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}