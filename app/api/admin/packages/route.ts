import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const packages = await prisma.paket.findMany({ orderBy: { created_at: "desc" } });
  return NextResponse.json(packages.map(p => ({ ...p, id: p.id.toString() })));
}

export async function POST(req: Request) {
  const body = await req.json();
  const pkg = await prisma.paket.create({
    data: {
      ...body,
      harga_paket: BigInt(body.harga_paket),
    },
  });
  return NextResponse.json({ ...pkg, id: pkg.id.toString() });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, ...data } = body;
  const pkg = await prisma.paket.update({
    where: { id: BigInt(id) },
    data: { ...data, harga_paket: BigInt(data.harga_paket) },
  });
  return NextResponse.json({ ...pkg, id: pkg.id.toString() });
}