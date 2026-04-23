"use client";

import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  return (
    <main className="min-h-screen">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 max-w-2xl mx-auto text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Pesanan Berhasil Dibuat!</h1>
        <p className="text-gray-600 mb-2">
          Terima kasih telah memesan di Culiner Yuk
        </p>
        <p className="text-gray-600 mb-8">
          Nomor pesanan Anda: <span className="font-bold text-brand-500">#{orderId}</span>
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
          <h2 className="font-semibold mb-2">Langkah Selanjutnya:</h2>
          <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
            <li>Tim kami akan menghubungi Anda via WhatsApp/Email</li>
            <li>Konfirmasi ketersediaan tanggal acara</li>
            <li>Pembayaran sesuai metode yang dipilih</li>
            <li>Pesanan diproses dan dikirim</li>
          </ol>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button variant="outline">Kembali ke Home</Button>
          </Link>
          <Link href={`/order/${orderId}`}>
            <Button className="bg-brand-500 hover:bg-brand-600 text-white">
              Lihat Detail Pesanan
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}