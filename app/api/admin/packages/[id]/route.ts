import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.paket.delete({ where: { id: BigInt(params.id) } });
  return NextResponse.json({ success: true });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const pkg = await prisma.paket.update({
    where: { id: BigInt(params.id) },
    data: { ...body, harga_paket: BigInt(body.harga_paket) },
  });
  return NextResponse.json({ ...pkg, id: pkg.id.toString() });
}