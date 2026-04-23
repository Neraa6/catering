"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AnimatedSection from "@/components/ui/animated-section";

const packages = [
  { name: "Paket Hemat", price: "Rp 35.000", desc: "Nasi + 1 Lauk + Es Teh", tag: "Populer" },
  { name: "Paket Keluarga", price: "Rp 150.000", desc: "5 Porsi + 2 Lauk + Sambal", tag: "Best Seller" },
  { name: "Paket Premium", price: "Rp 250.000", desc: "10 Porsi + 3 Lauk + Dessert", tag: "Event" },
];

export default function MenuPackages() {
  return (
    <section id="paket" className="py-20 px-6 max-w-7xl mx-auto">
      <AnimatedSection className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2">Pilih Paket Catering</h2>
        <p className="text-gray-500">Harga transparan, porsi pas, rasa konsisten.</p>
      </AnimatedSection>

      <div className="grid md:grid-cols-3 gap-6">
        {packages.map((pkg, i) => (
          <AnimatedSection key={i} delay={i * 0.15}>
            <Card className="hover:shadow-lg transition-shadow duration-300 border-brand-100">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <Badge className="bg-brand-100 text-brand-700 hover:bg-brand-200">{pkg.tag}</Badge>
                </div>
                <p className="text-2xl font-bold mt-2">{pkg.price}</p>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{pkg.desc}</p>
                <Button className="w-full bg-brand-500 hover:bg-brand-600 text-white">Pesan Paket Ini</Button>
              </CardContent>
            </Card>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
}