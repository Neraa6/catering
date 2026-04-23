import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AddToCartButton from "@/components/cart/add-to-cart-button";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PaketDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  const paket = await prisma.paket.findUnique({
    where: { id: BigInt(id) },
  });

  if (!paket) {
    notFound();
  }

  const hargaPerPax = Number(paket.harga_paket) / paket.jumlah_pax;

  return (
    <main className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-20 px-6 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-500">
          <a href="/" className="hover:text-brand-500">Home</a> / 
          <span className="ml-2">Paket</span> / 
          <span className="ml-2 text-brand-500">{paket.nama_paket}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Gambar Paket */}
          <div className="space-y-4">
            <div className="aspect-video bg-gradient-to-br from-brand-100 to-brand-200 rounded-2xl flex items-center justify-center">
              {paket.foto1 ? (
                <img 
                  src={paket.foto1} 
                  alt={paket.nama_paket}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <span className="text-8xl">🍽️</span>
              )}
            </div>
            
            {/* Gallery Thumbnail */}
            <div className="flex gap-2">
              {[paket.foto1, paket.foto2, paket.foto3].filter(Boolean).map((foto, idx) => (
                <div key={idx} className="w-20 h-20 bg-brand-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📷</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info Paket */}
          <div className="space-y-6">
            <div>
              <div className="flex gap-2 mb-3">
                <Badge className="bg-brand-100 text-brand-700">{paket.jenis}</Badge>
                <Badge variant="outline">{paket.kategori.replace('_', ' ')}</Badge>
              </div>
              <h1 className="text-3xl font-bold mb-2">{paket.nama_paket}</h1>
              <p className="text-gray-600">{paket.deskripsi}</p>
            </div>

            <Card className="border-2 border-brand-200">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Harga Paket</span>
                  <span className="text-2xl font-bold text-brand-500">
                    Rp {Number(paket.harga_paket).toLocaleString("id-ID")}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Jumlah Pax</span>
                  <span className="font-semibold">{paket.jumlah_pax} orang</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Harga per Pax</span>
                  <span className="font-semibold text-brand-600">
                    Rp {hargaPerPax.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="pt-4 border-t">
                  <AddToCartButton paket={paket} />
                </div>
              </CardContent>
            </Card>

            {/* Info Tambahan */}
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Siap antar ke lokasi Anda</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Bisa custom menu (hubungi admin)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Pembayaran fleksibel</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}