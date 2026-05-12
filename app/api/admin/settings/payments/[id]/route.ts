import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  await prisma.jenisPembayaran.delete({
    where: {
      id: BigInt(id),
    },
  });

  return NextResponse.json({
    success: true,
  });
}