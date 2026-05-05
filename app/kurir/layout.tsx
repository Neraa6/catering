"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, Truck, LogOut, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export default function KurirLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ✅ Role-based redirect dengan useEffect
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

  // ✅ Sidebar Content (reusable untuk desktop & mobile)
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-brown-900 text-white">
      {/* Logo */}
      <div className="p-4 border-b border-brown-800 flex items-center gap-3">
        <div className="w-10 h-10 bg-brown-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="font-serif font-bold text-base truncate">Kurir Panel</h1>
          <p className="text-xs text-brown-300 truncate">{user.name}</p>
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
                  ? "bg-brown-500 text-white"
                  : "text-brown-200 hover:bg-brown-800 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout di Sidebar (bawah) */}
      <div className="p-3 border-t border-brown-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-brown-800 hover:text-red-200 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  // ✅ Handler logout dengan konfirmasi (opsional tapi recommended)
  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin logout?")) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-brown-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col bg-brown-900 text-white border-r border-brown-800">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-brown-900 text-white border-r border-brown-800">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* ✅ TOP BAR DENGAN LOGOUT BUTTON */}
        <header className="sticky top-0 z-30 bg-white border-b border-brown-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            {/* Mobile Menu Trigger + Title */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-6 w-6 text-brown-600" />
              </Button>
              <h1 className="text-lg font-semibold text-brown-900 lg:hidden">
                Kurir Dashboard
              </h1>
            </div>
            
            {/* ✅ Right Side: Logout + User Info */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* 🔴 Tombol Logout di Header */}
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Logout</span>
              </Button>
              
              {/* User Avatar + Name */}
              <div className="flex items-center gap-2">
                <span className="hidden md:inline text-sm text-brown-600 truncate max-w-[120px]">
                  {user.name}
                </span>
                <div className="w-8 h-8 rounded-full bg-brown-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}