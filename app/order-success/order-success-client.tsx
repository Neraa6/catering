// app/order-success/order-success-client.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Package, Truck } from "lucide-react";
import Link from "next/link";

export default function OrderSuccessClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const noResi = searchParams.get("noResi");

  return (
    <main className="min-h-screen bg-brown-50">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 max-w-2xl mx-auto text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-serif font-bold text-brown-900 mb-4">
          Pesanan Berhasil Dibuat!
        </h1>
        <p className="text-brown-600 mb-2">
          Terima kasih telah memesan di Culiner Yuk
        </p>
        
        <Card className="bg-white border-brown-200 mt-6 mb-8">
          <CardContent className="p-4">
            <p className="text-sm text-brown-500 mb-1">Nomor Pesanan / No. Resi</p>
            <p className="text-2xl font-bold text-brown-700 font-mono tracking-wider">
              {noResi || `#${orderId}`}
            </p>
            <p className="text-xs text-brown-400 mt-1">
              Simpan nomor ini untuk tracking pesanan
            </p>
          </CardContent>
        </Card>

        <div className="bg-white rounded-xl p-6 mb-8 text-left border border-brown-200 shadow-sm">
          <h2 className="font-serif font-semibold text-brown-900 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-brown-500" />
            Langkah Selanjutnya:
          </h2>
          <ol className="space-y-3 text-sm text-brown-600">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brown-100 text-brown-700 flex items-center justify-center flex-shrink-0 font-semibold text-xs">1</span>
              <span>Tim kami akan menghubungi Anda via WhatsApp/Email untuk konfirmasi</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brown-100 text-brown-700 flex items-center justify-center flex-shrink-0 font-semibold text-xs">2</span>
              <span>Konfirmasi ketersediaan tanggal & detail acara</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brown-100 text-brown-700 flex items-center justify-center flex-shrink-0 font-semibold text-xs">3</span>
              <span>Lakukan pembayaran sesuai metode yang dipilih</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brown-100 text-brown-700 flex items-center justify-center flex-shrink-0 font-semibold text-xs">4</span>
              <span>Pesanan diproses dan dikirim ke lokasi Anda</span>
            </li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full border-brown-200 text-brown-700 hover:bg-brown-50">
              Kembali ke Home
            </Button>
          </Link>
          <Link href="/my-orders" className="flex-1 sm:flex-none">
            <Button className="w-full bg-brown-500 hover:bg-brown-600 text-white">
              <Truck className="mr-2 h-4 w-4" />
              Lacak Pesanan
            </Button>
          </Link>
        </div>
        
        <div className="mt-8 pt-6 border-t border-brown-200">
          <p className="text-sm text-brown-500">
            Butuh bantuan? Hubungi kami:{" "}
            <a href="tel:+6281234567890" className="text-brown-700 hover:underline font-medium">
              0812-3456-7890
            </a>
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}