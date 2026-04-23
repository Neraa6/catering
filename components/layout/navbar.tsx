"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react"; // <--- 1. Import useEffect & useState

export default function Navbar() {
  const { totalItems } = useCart();
  const router = useRouter();
  
  // 2. State untuk melacak apakah komponen sudah mount di client
  const [isMounted, setIsMounted] = useState(false);

  // 3. Set isMounted menjadi true hanya setelah render di browser
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePesanSekarang = () => {
    if (totalItems > 0) {
      router.push('/checkout');
    } else {
      const element = document.getElementById("paket");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <motion.header
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-md border-b border-brand-100"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          <span className="text-brand-500">Culiner</span> Yuk!
        </Link>
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="/#menu" className="hover:text-brand-500 transition-colors">Menu</Link>
          <Link href="/#paket" className="hover:text-brand-500 transition-colors">Paket Catering</Link>
          <Link href="/#tentang" className="hover:text-brand-500 transition-colors">Tentang</Link>
        </nav>
        <div className="flex gap-3">
          {/* Cart Icon dengan badge */}
          <Link href="/cart" className="relative">
            <Button 
              variant="outline" 
              size="icon" 
              className="border-brand-200 hover:bg-brand-50"
            >
              <ShoppingCart className="h-5 w-5 text-brand-600" />
            </Button>
            
            {/* 4. Hanya render badge jika isMounted = true (Client-side only) */}
            {isMounted && totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-in fade-in zoom-in duration-200">
                {totalItems}
              </span>
            )}
          </Link>
          
          {/* Tombol Pesan Sekarang */}
          <Button 
            variant="default" 
            onClick={handlePesanSekarang}
            className="bg-brand-500 hover:bg-brand-600 text-white"
          >
            Pesan Sekarang
          </Button>
        </div>
      </div>
    </motion.header>
  );
}