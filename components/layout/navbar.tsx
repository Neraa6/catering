"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context"; // Import Auth Context
import { ShoppingCart, User, LogOut, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth(); // Ambil data user & fungsi logout
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);

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
      // Update border color ke brown-200 agar sesuai tema baru
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-brown-200 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-serif font-bold tracking-tight text-brown-900">
          Culiner <span className="text-brown-500">Yuk!</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex gap-6 text-sm font-medium text-brown-700">
          <Link href="/#menu" className="hover:text-brown-500 transition-colors">Menu</Link>
          <Link href="/#paket" className="hover:text-brown-500 transition-colors">Paket Catering</Link>
          <Link href="/#tentang" className="hover:text-brown-500 transition-colors">Tentang</Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          
          {/* 1. Cart Icon */}
          <Link href="/cart" className="relative group">
            <Button 
              variant="outline" 
              size="icon" 
              className="border-brown-200 hover:bg-brown-50 hover:border-brown-300 text-brown-600"
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
            
            {isMounted && totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-brown-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold border-2 border-white shadow-sm">
                {totalItems}
              </span>
            )}
          </Link>
          
          {/* 2. User Menu / Login Button */}
          {user ? (
            // Jika Sudah Login: Tampilkan Dropdown Profile
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="border-brown-200 hover:bg-brown-50 hover:border-brown-300 text-brown-600 rounded-full"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-brown-100 shadow-lg">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-brown-900">{user.name}</p>
                    <p className="text-xs leading-none text-brown-500 mt-1">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-brown-100" />
                
                <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer text-brown-700 focus:text-brown-900 focus:bg-brown-50">
                  <User className="mr-2 h-4 w-4" />
                  Profil Saya
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => router.push("/my-orders")} className="cursor-pointer text-brown-700 focus:text-brown-900 focus:bg-brown-50">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Pesanan Saya
                </DropdownMenuItem>

                {user.level === 'admin' && (
                   <DropdownMenuItem onClick={() => router.push("/admin")} className="cursor-pointer text-brown-700 focus:text-brown-900 focus:bg-brown-50">
                   <LayoutDashboard className="mr-2 h-4 w-4" />
                   Admin Panel
                 </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="bg-brown-100" />
                
                <DropdownMenuItem 
                  onClick={logout} 
                  className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Jika Belum Login: Tampilkan Tombol Masuk
            <Link href="/login">
              <Button 
                variant="outline" 
                className="border-brown-200 text-brown-600 hover:bg-brown-50 hover:border-brown-300 hidden sm:flex"
              >
                Masuk
              </Button>
            </Link>
          )}

          {/* 3. Tombol Pesan Sekarang (Primary Action) */}
          <Button 
            onClick={handlePesanSekarang}
            className="bg-brown-500 hover:bg-brown-600 text-white font-semibold shadow-md hover:shadow-lg transition-all"
          >
            Pesan Sekarang
          </Button>
        </div>
      </div>
    </motion.header>
  );
}