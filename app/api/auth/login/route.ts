/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// ✅ Helper: Convert BigInt & Date ke format JSON-safe
function serializeBigInt(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "bigint") {
    return obj.toString();
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }

  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = serializeBigInt(
          (obj as Record<string, unknown>)[key]
        );
      }
    }

    return result;
  }

  return obj;
}

type LoginUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  level: string;
};

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    let user: LoginUser | null = null;

    // ✅ Cari admin/owner/kurir
    const adminUser = await prisma.user.findUnique({
      where: { email },
    });

    if (adminUser) {
      user = {
        id: adminUser.id.toString(),
        name: adminUser.name,
        email: adminUser.email,
        password: adminUser.password,
        level: adminUser.level,
      };
    }

    // ✅ Kalau tidak ada → cari pelanggan
    if (!user) {
      const pelanggan = await prisma.pelanggan.findUnique({
        where: { email },
      });

      if (pelanggan) {
        user = {
          id: pelanggan.id.toString(),
          name: pelanggan.nama_pelanggan,
          email: pelanggan.email,
          password: pelanggan.password,
          level: "pelanggan",
        };
      }
    }

    // ❌ User tidak ditemukan
    if (!user) {
      return NextResponse.json(
        {
          error: "Email atau password salah",
        },
        { status: 401 }
      );
    }

    // ✅ Verifikasi password
    const isValidPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!isValidPassword) {
      return NextResponse.json(
        {
          error: "Email atau password salah",
        },
        { status: 401 }
      );
    }

    // ✅ Hapus password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: serializeBigInt(userWithoutPassword),
    });

  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat login",
      },
      { status: 500 }
    );
  }
}