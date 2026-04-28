import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// ✅ Helper function untuk convert BigInt ke string
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === "bigint") {
    return obj.toString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }
  
  if (typeof obj === "object") {
    const result: any = {};
    for (const key in obj) {
      result[key] = serializeBigInt(obj[key]);
    }
    return result;
  }
  
  return obj;
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Check for admin/user in users table
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // If not found, check pelanggan table
    if (!user) {
      const pelanggan = await prisma.pelanggan.findUnique({
        where: { email },
      });

      if (pelanggan) {
        user = {
          id: pelanggan.id, // Masih BigInt, nanti di-serialize
          name: pelanggan.nama_pelanggan,
          email: pelanggan.email,
          password: pelanggan.password,
          level: "pelanggan" as const,
        };
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // ✅ Hapus password DAN serialize BigInt sebelum response
    const { password: _, ...userWithoutPassword } = user;
    const serializedUser = serializeBigInt(userWithoutPassword);

    return NextResponse.json({
      success: true,
      user: serializedUser,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat login" },
      { status: 500 }
    );
  }
}