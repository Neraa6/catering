import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email diperlukan" }, { status: 400 });
    }

    const profile = await prisma.pelanggan.findUnique({
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

    if (!profile) {
      return NextResponse.json({ error: "Profil tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      ...profile,
      tgl_lahir: profile.tgl_lahir?.toISOString(),
    });
  } catch (error) {
    console.error("❌ Profile GET error:", error);
    return NextResponse.json({ error: "Gagal memuat profil" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { email, ...updateData } = body;

    if (!email) {
      return NextResponse.json({ error: "Email diperlukan" }, { status: 400 });
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
    const formattedData: Record<string, unknown> = { ...updateData };
    if (formattedData.tgl_lahir && typeof formattedData.tgl_lahir === "string") {
      formattedData.tgl_lahir = new Date(formattedData.tgl_lahir);
    }

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

    return NextResponse.json({
      ...updated,
      tgl_lahir: updated.tgl_lahir?.toISOString(),
    });
  } catch (error) {
    console.error("❌ Profile PUT error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Gagal memperbarui profil" },
      { status: 500 }
    );
  }
}