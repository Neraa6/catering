import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
          id: pelanggan.id.toString(),
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

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat login" },
      { status: 500 }
    );
  }
}