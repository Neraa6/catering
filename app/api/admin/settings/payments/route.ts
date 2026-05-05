import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const payments = await prisma.jenisPembayaran.findMany({
    include: { detail_pembayarans: true },
    orderBy: { created_at: "desc" }
  });
  return NextResponse.json(payments.map(p => ({ ...p, id: p.id.toString() })));
}

export async function POST(req: Request) {
  const body = await req.json();
  const payment = await prisma.jenisPembayaran.create({
    data: {
      metode_pembayaran: body.metode_pembayaran,
      detail_pembayarans: {
        create: {
          no_rek: body.no_rek,
          tempat_bayar: body.tempat_bayar,
        }
      }
    }
  });
  return NextResponse.json({ ...payment, id: payment.id.toString() });
}