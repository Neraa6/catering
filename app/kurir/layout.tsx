/* eslint-disable react-hooks/static-components */
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  LogOut,
  User,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export default function KurirLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ✅ Role-based redirect
  useEffect(() => {
    if (!loading) {
      if (!user || user.level !== "kurir") {
        router.replace("/login");
      }
    }
  }, [user, loading, router]);

  // ✅ Loading state
  if (loading || !user || user.level !== "kurir") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brown-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brown-200 border-t-brown-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brown-600">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/kurir" },
    { icon: Truck, label: "Tugas Pengiriman", href: "/kurir/deliveries" },
  ];

  // ✅ Handle logout dengan konfirmasi
  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin logout?")) {
      logout();
    }
  };

  // ✅ Sidebar Content (reusable untuk desktop & mobile)
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-brown-900 text-white">
      {/* Logo + User Info */}
      <div className="p-4 border-b border-brown-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brown-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif font-bold text-base truncate text-white">
              Kurir Panel
            </h1>
            <p className="text-xs text-brown-300 truncate">{user.name}</p>
            {/* ✅ Role Badge */}
            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Kurir
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => {
                router.push(item.href);
                setMobileMenuOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-brown-500 text-white shadow-md"
                  : "text-brown-200 hover:bg-brown-800 hover:text-white",
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate text-white">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ✅ Bottom Section: Lihat Website + Logout */}
      <div className="p-3 border-t border-brown-800 bg-brown-900/50 space-y-1">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-brown-800 hover:text-red-200 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="truncate text-red-300">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brown-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col bg-brown-900 text-white border-r border-brown-800 shadow-xl">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-64 p-0 bg-brown-900 text-white border-r border-brown-800"
        >
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* ✅ Main Content - TANPA HEADER/NAVBAR */}
      <div className={cn("transition-all duration-300", "lg:pl-64")}>
        {/* ✅ HAPUS: <header>...</header> yang lama */}

        {/* Page Content - Full height */}
        <main className="p-4 lg:p-6 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
