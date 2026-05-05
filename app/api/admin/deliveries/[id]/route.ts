import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = await prisma.pengiriman.update({
    where: { id: BigInt(params.id) },
    data: {
      tgl_kirim: body.tgl_kirim ? new Date(body.tgl_kirim) : null,
      tgl_terima: body.tgl_terima ? new Date(body.tgl_terima) : null,
      status_kirim: body.status_kirim,
    },
  });
  return NextResponse.json({ ...updated, id: updated.id.toString() });
}