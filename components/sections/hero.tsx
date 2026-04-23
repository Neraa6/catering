"use client";
import { Button } from "@/components/ui/button";
import AnimatedSection from "@/components/ui/animated-section";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

  const scrollToPackages = () => {
    // Scroll ke section paket
    const element = document.getElementById("paket");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <AnimatedSection direction="left" delay={0.1}>
          <span className="inline-block px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-semibold mb-4">
            🍽️ Catering Premium & Higienis
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Rasakan <span className="text-brand-500">Cita Rasa</span> Terbaik untuk Setiap Momen
          </h1>
          <p className="text-gray-600 mb-8 max-w-md">
            Pesan catering berkualitas untuk acara kantor, pernikahan, atau kumpul keluarga. Fresh, cepat, dan bisa dikustomisasi.
          </p>
          <div className="flex gap-3">
            <Button 
              size="lg" 
              onClick={scrollToPackages}
              className="bg-brand-500 hover:bg-brand-600 text-white"
            >
              Lihat Menu <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-brand-200"
              onClick={() => router.push('/contact')} // Bisa buat halaman kontak nanti
            >
              Konsultasi Gratis
            </Button>
          </div>
        </AnimatedSection>

        <AnimatedSection direction="right" delay={0.2}>
          <motion.div
            whileHover={{ scale: 1.02, rotate: -1 }}
            whileTap={{ scale: 0.98 }}
            className="relative rounded-2xl overflow-hidden shadow-xl border border-brand-100 bg-white p-2"
          >
            <div className="aspect-[4/3] bg-gradient-to-br from-brand-100 to-sage-500 rounded-xl flex items-center justify-center">
              <span className="text-6xl">🍛</span>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white p-3 rounded-lg shadow-md border border-brand-50">
              <p className="text-xs font-semibold text-gray-500">Rating Pelanggan</p>
              <p className="text-lg font-bold text-brand-500">⭐ 4.9/5</p>
            </div>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}