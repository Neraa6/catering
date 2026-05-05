import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const customers = await prisma.pelanggan.findMany({ orderBy: { created_at: "desc" } });
  return NextResponse.json(customers.map(c => ({ ...c, id: c.id.toString() })));
}