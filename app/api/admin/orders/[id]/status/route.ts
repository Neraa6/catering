import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json();

    const { id } = await context.params;

    const order = await prisma.pemesanan.update({
      where: { id: BigInt(id) },
      data: { status_pesan: status },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order status:", error);

    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}