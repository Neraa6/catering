import Navbar from "@/components/layout/navbar";
import Hero from "@/components/sections/hero";
import Footer from "@/components/layout/footer";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AnimatedSection from "@/components/ui/animated-section";
import Link from "next/link";

export default async function Home() {
  // Ambil data paket dari database menggunakan Prisma
  const packages = await prisma.paket.findMany({
    orderBy: {
      created_at: "desc",
    },
  });

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      
      <section id="paket" className="py-20 px-6 max-w-7xl mx-auto">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Menu Catering Kami</h2>
          <p className="text-gray-500">Data langsung dari database.</p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg, i) => (
            <AnimatedSection key={pkg.id.toString()} delay={i * 0.1}>
              <Card className="hover:shadow-lg transition-shadow duration-300 border-brand-100 h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{pkg.nama_paket}</CardTitle>
                    <Badge variant="secondary">{pkg.jenis}</Badge>
                  </div>
                  {/* Format harga dari BigInt ke Rupiah */}
                  <p className="text-2xl font-bold mt-2 text-brand-500">
                    Rp {Number(pkg.harga_paket).toLocaleString("id-ID")}
                  </p>
                  <p className="text-xs text-gray-400">
                    Kategori: {pkg.kategori.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {pkg.jumlah_pax} Pax • Rp {(Number(pkg.harga_paket) / pkg.jumlah_pax).toLocaleString("id-ID")}/pax
                  </p>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-end space-y-3">
                  <p className="text-gray-600 line-clamp-2 text-sm">{pkg.deskripsi}</p>
                  
                  <div className="flex gap-2 pt-2">
                    {/* Tombol Lihat Detail */}
                    <Link href={`/paket/${pkg.id.toString()}`} className="flex-1">
                      <Button variant="outline" className="w-full border-brand-200 text-brand-600 hover:bg-brand-50">
                        Lihat Detail
                      </Button>
                    </Link>
                    
                    {/* Tombol Pesan */}
                    <Link href={`/paket/${pkg.id.toString()}`} className="flex-1">
                      <Button className="w-full bg-brand-500 hover:bg-brand-600 text-brown">
                        Pesan Paket Ini
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
          
          {packages.length === 0 && (
            <p className="text-center text-gray-500 col-span-3">
              Belum ada data paket. Silakan insert data via Prisma Studio.
            </p>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}