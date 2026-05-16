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
  UtensilsCrossed,
  Globe, // ✅ Icon untuk "Lihat Website"
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

// Menu items base (untuk semua role admin/owner)
const baseMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: ShoppingCart, label: "Pesanan", href: "/admin/orders" },
  { icon: Package, label: "Paket Catering", href: "/admin/packages" },
  { icon: Users, label: "Pelanggan", href: "/admin/customers" },
  { icon: Truck, label: "Pengiriman", href: "/admin/delivery" },
];

// Menu items khusus Admin (Owner tidak bisa akses Settings)
const adminOnlyItems = [
  { icon: Settings, label: "Pengaturan", href: "/admin/settings" },
];

type SidebarContentProps = {
  user: {
    name: string;
    level: string;
    email?: string;
  } | null;
  pathname: string | null;
  router: ReturnType<typeof useRouter>;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onLogout: () => void;
};

function SidebarContent({
  user,
  pathname,
  router,
  setMobileMenuOpen,
  onLogout,
}: SidebarContentProps) {
  if (!user) return null;

  const isAdmin = user.level === "admin";
  const menuItems = [...baseMenuItems, ...(isAdmin ? adminOnlyItems : [])];

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-brown-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brown-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif font-bold text-base truncate text-white">Culiner Yuk!</h1>
            <p className="text-xs text-brown-300 capitalize">{user.level} Panel</p>
          </div>
        </div>
      </div>

      {/* User Info + Role Badge */}
      <div className="p-4 border-b border-brown-800 bg-brown-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brown-500 flex items-center justify-center flex-shrink-0 border-2 border-brown-300">
            <span className="font-semibold text-sm text-white">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate text-white">{user.name}</p>
            <p className="text-xs text-brown-300 truncate">{user.email}</p>
            {/* ✅ Role Badge dipindah ke sini */}
            <span className={cn(
              "inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 text-brown-300",
              isAdmin 
                ? "bg-purple-500/20 border border-purple-500/30" 
                : "bg-gold-500/20 border border-gold-500/30"
            )}>
              {isAdmin ? "Administrator" : "Owner"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
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
                  : "text-brown-200 hover:bg-brown-800 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-semibold text-sm truncate text-white">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ✅ Bottom Section: Lihat Website + Logout */}
      <div className="p-3 border-t border-brown-800 bg-brown-900/50 space-y-1">
        {/* Link ke Website Utama */}
        <button
          onClick={() => {
            router.push("/");
            setMobileMenuOpen(false);
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-brown-200 hover:bg-brown-800 hover:text-white transition-colors"
        >
          <Globe className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold text-sm truncate text-brown-300">Lihat Website</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-brown-800 hover:text-red-200 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold text-sm truncate text-red-300">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ✅ Redirect protection
  useEffect(() => {
    if (!loading) {
      if (!user || (user.level !== "admin" && user.level !== "owner")) {
        router.replace("/login");
      }
    }
  }, [user, loading, router]);

  // ✅ Loading state
  if (loading || !user || (user.level !== "admin" && user.level !== "owner")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brown-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brown-200 border-t-brown-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brown-600">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }
  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin logout?")) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-brown-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-64 lg:flex-col bg-brown-900 text-white border-r border-brown-800 shadow-xl">
        <SidebarContent 
          user={user} 
          pathname={pathname} 
          router={router} 
          setMobileMenuOpen={setMobileMenuOpen}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-brown-900 text-white border-r border-brown-800">
          <SidebarContent 
            user={user} 
            pathname={pathname} 
            router={router} 
            setMobileMenuOpen={setMobileMenuOpen}
            onLogout={handleLogout}
          />
        </SheetContent>
      </Sheet>

      {/* ✅ Main Content - TANPA HEADER/NAVBAR */}
      <div className={cn("transition-all duration-300", "lg:pl-64")}>
        {/* ✅ HAPUS: <header>...</header> yang lama */}
        
        {/* Page Content - Full width */}
        <main className="p-4 lg:p-6 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}