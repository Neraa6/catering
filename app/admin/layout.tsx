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
  UtensilsCrossed} from "lucide-react";
import { Button } from "@/components/ui/button";
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

      {/* User Info */}
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

      {/* Logout Button in Sidebar */}
      <div className="p-3 border-t border-brown-800 bg-brown-900/50">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-brown-800 hover:text-red-200 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>Logout</span>
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

  const isAdmin = user.level === "admin";

  // ✅ Handle logout function
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

      {/* Main Content Wrapper */}
      <div className={cn("transition-all duration-300", "lg:pl-64")}>
        
        {/* ✅ Top Bar dengan Logout Button */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-brown-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Trigger */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden hover:bg-brown-100"
              >
                <Menu className="h-6 w-6 text-brown-600" />
              </Button>
              
              {/* Mobile Title */}
              <h1 className="text-lg font-serif font-semibold text-brown-900 lg:hidden">
                Culiner Admin
              </h1>
            </div>
            
            {/* Right Actions */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Role Badge */}
              <span className={cn(
                "hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border",
                isAdmin 
                  ? "bg-purple-50 text-purple-700 border-purple-200" 
                  : "bg-gold-50 text-gold-700 border-gold-200"
              )}>
                {isAdmin ? "Administrator" : "Owner"}
              </span>

              {/* Link ke Website Utama */}
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex border-brown-200 text-brown-600 hover:bg-brown-50 hover:text-brown-900"
              >
                <UtensilsCrossed className="mr-2 h-4 w-4" />
                Lihat Website
              </Button>
              
              {/* Mobile Icon Link */}
              <Button
                onClick={() => router.push("/")}
                variant="ghost"
                size="icon"
                className="lg:hidden text-brown-600 hover:bg-brown-100"
              >
                <UtensilsCrossed className="h-5 w-5" />
              </Button>

              {/* ✅ TOMBOL LOGOUT DI HEADER */}
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Logout"
              >
                <LogOut className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
              
              {/* User Avatar */}
              <div className="w-8 h-8 rounded-full bg-brown-500 flex items-center justify-center text-white text-sm font-semibold border-2 border-brown-300">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}