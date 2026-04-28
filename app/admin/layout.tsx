"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Truck, 
  Settings,
  LogOut,
  Menu,
  X,
  UtensilsCrossed
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: ShoppingCart, label: "Pesanan", href: "/admin/orders" },
  { icon: Package, label: "Paket Catering", href: "/admin/packages" },
  { icon: Users, label: "Pelanggan", href: "/admin/customers" },
  { icon: Truck, label: "Pengiriman", href: "/admin/delivery" },
  { icon: Settings, label: "Pengaturan", href: "/admin/settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ✅ Redirect ke home jika bukan admin/owner (pakai useEffect)
  useEffect(() => {
    if (authLoading) return; // Tunggu auth loading selesai
    
    if (user?.level !== "admin" && user?.level !== "owner") {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  // ✅ Tampilkan loading saat cek auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brown-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-brown-200 border-t-brown-500 rounded-full animate-spin" />
          <p className="text-brown-600 text-sm">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  // ✅ Jika sudah loaded tapi bukan admin, return null (akan di-redirect oleh useEffect)
  if (user?.level !== "admin" && user?.level !== "owner") {
    return null;
  }

  return (
    <div className="min-h-screen bg-brown-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-brown-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-brown-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brown-500 rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg">Culiner Yuk!</h1>
              <p className="text-xs text-brown-300">Admin Panel</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-brown-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-brown-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brown-500 flex items-center justify-center">
              <span className="font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{user?.name}</p>
              <p className="text-xs text-brown-300 capitalize">{user?.level}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brown-500 text-white"
                    : "text-brown-200 hover:bg-brown-800 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-brown-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-300 hover:bg-brown-800 hover:text-red-200 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn("transition-all duration-300", sidebarOpen ? "lg:ml-64" : "")}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-brown-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6 text-brown-600" />
            </Button>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="border-brown-200 text-brown-600 hover:bg-brown-50"
              >
                Lihat Website
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}