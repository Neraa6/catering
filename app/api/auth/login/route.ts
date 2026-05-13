import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// ✅ Helper: Convert BigInt & Date ke format JSON-safe
function serializeBigInt(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return obj.toString();
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = serializeBigInt((obj as Record<string, unknown>)[key]);
      }
    }
    return result;
  }
  return obj;
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Cek di tabel users (admin/owner/kurir)
    let user = await prisma.user.findUnique({ where: { email } });

    // 2. Jika tidak ada, cek di tabel pelanggan
    if (!user) {
      const pelanggan = await prisma.pelanggan.findUnique({ where: { email } });

      if (pelanggan) {
        // ⚠️ PENTING: Konversi id ke string manual di sini
        user = {
  id: pelanggan.id.toString(),
  name: pelanggan.nama_pelanggan,
  email: pelanggan.email,
  password: pelanggan.password,
  level: "pelanggan" as const,
} as any; 
      }
    }

    // 3. User tidak ditemukan
    if (!user) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // 4. Verifikasi password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // 5. Hapus password & serialize data
    const { password: _, ...userWithoutPassword } = user;
    const serializedUser = serializeBigInt(userWithoutPassword);

    // ✅ Response sukses dengan field 'level' yang jelas
    return NextResponse.json({
      success: true,
      user: serializedUser, // Akan mengandung: { id, name, email, level }
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat login" },
      { status: 500 }
    );
  }
}