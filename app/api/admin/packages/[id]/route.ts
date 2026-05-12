import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  await prisma.paket.delete({
    where: { id: BigInt(id) },
  });

  return NextResponse.json({ success: true });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const body = await req.json();

  const pkg = await prisma.paket.update({
    where: { id: BigInt(id) },
    data: {
      ...body,
      harga_paket: BigInt(body.harga_paket),
    },
  });

  return NextResponse.json({
    ...pkg,
    id: pkg.id.toString(),
  });
}