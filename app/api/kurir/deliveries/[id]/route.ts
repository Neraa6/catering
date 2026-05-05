import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = await prisma.pengiriman.update({
    where: { id: BigInt(params.id) },
    data: { status_kirim: body.status_kirim, bukti_foto: body.bukti_foto }
  });
  return NextResponse.json({ ...updated, id: updated.id.toString() });
}