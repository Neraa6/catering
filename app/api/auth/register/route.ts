import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { nama_pelanggan, email, password, telepon, alamat1 } = await request.json();

    // Check if email already exists
    const existingUser = await prisma.pelanggan.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new pelanggan
    const pelanggan = await prisma.pelanggan.create({
      data: {
        nama_pelanggan,
        email,
        password: hashedPassword,
        telepon,
        alamat1,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil",
      userId: pelanggan.id.toString(),
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat registrasi" },
      { status: 500 }
    );
  }
}