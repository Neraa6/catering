import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.jenisPembayaran.delete({ where: { id: BigInt(params.id) } });
  return NextResponse.json({ success: true });
}