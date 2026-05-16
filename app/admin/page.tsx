/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { 
  ShoppingCart, Package, Users, TrendingUp, DollarSign, Clock, CheckCircle, BarChart3, Download, Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import RevenueChart from "@/components/dashboard/revenue-chart";
import { exportToExcel, exportToPDF, type ReportData, type ReportStats, type ReportOrder } from "@/lib/export-report";
import Link from "next/link";

// ✅ Interface untuk stats
interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalPackages: number;
  pendingOrders: number;
  processingOrders: number;
}

// ✅ Interface untuk order
interface DashboardOrder {
  id: string;
  no_resi?: string;
  tgl_pesan: string;
  total_bayar: number;
  status_pesan: string;
  pelanggan?: {
    nama_pelanggan: string;
  };
}

const INITIAL_STATS: DashboardStats = {
  totalOrders: 0,
  totalRevenue: 0,
  totalCustomers: 0,
  totalPackages: 0,
  pendingOrders: 0,
  processingOrders: 0,
};

// ✅ Type guard untuk stats
function isValidStats(data: unknown): data is DashboardStats {
  return (
    typeof data === "object" &&
    data !== null &&
    "totalOrders" in data &&
    typeof (data as DashboardStats).totalOrders === "number"
  );
}

// ✅ Type guard untuk orders array
function isValidOrdersArray(data: unknown): data is DashboardOrder[] {
  return Array.isArray(data) && data.every((item) => typeof item === "object" && item !== null && "id" in item);
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS);
  const [recentOrders, setRecentOrders] = useState<DashboardOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [exportLoading, setExportLoading] = useState(false);

  const isOwner = user?.level === "owner";
  const isAdmin = user?.level === "admin";

  const fetchDashboardData = async () => {
  setLoading(true);
  setError(null);

  try {
    // ✅ Tentukan endpoint berdasarkan role
    const endpoint = isOwner ? "/api/owner/dashboard" : "/api/admin/dashboard";
    console.log(`🔍 Fetching from: ${endpoint}`); // Debug log
    
    const response = await fetch(endpoint);
    
    // ✅ Baca response text dulu untuk debug
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error ${response.status}:`, errorText);
      
      let errorMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorText;
      } catch {}
      
      throw new Error(`Gagal memuat data: ${response.status} - ${errorMessage}`);
    }

    const data: unknown = await response.json();
    console.log("✅ API Response:", data); // Debug log
    
    // ✅ Type-safe parsing
    if (typeof data === "object" && data !== null) {
      const statsData = (data as { stats?: unknown }).stats;
      const ordersData = (data as { recentOrders?: unknown }).recentOrders;
      
      if (isValidStats(statsData)) {
        console.log("✅ Stats parsed:", statsData);
        setStats(statsData);
      } else {
        console.warn("⚠️ Stats parsing failed:", statsData);
      }
      
      if (isValidOrdersArray(ordersData)) {
        console.log("✅ Orders parsed:", ordersData.length, "items");
        setRecentOrders(ordersData);
      } else {
        console.warn("⚠️ Orders parsing failed:", ordersData);
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan jaringan";
    setError(message);
    console.error("❌ Dashboard fetch error:", err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ✅ Export dengan type-safe data preparation
  const handleExportReport = async (format: "excel" | "pdf") => {
    try {
      setExportLoading(true);
      
      // ✅ Prepare data dengan type assertion yang aman
      const reportData: ReportData = {
        stats: { ...stats },
        role: isOwner ? "owner" : "admin",
        orders: recentOrders.map((order): ReportOrder => ({
          no_resi: order.no_resi || `#${order.id}`,
          pelanggan: order.pelanggan?.nama_pelanggan || "Unknown",
          tanggal: new Date(order.tgl_pesan).toLocaleDateString("id-ID"),
          total: Number(order.total_bayar),
          status: order.status_pesan,
        })),
      };

      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `Laporan_Culiner_${reportData.role}_${timestamp}`;

      if (format === "excel") {
        await exportToExcel(reportData, filename);
      } else {
        await exportToPDF(reportData, filename);
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Gagal export laporan. Silakan coba lagi.");
    } finally {
      setExportLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Pesanan",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "bg-blue-500",
    },
    {
      title: "Pendapatan",
      value: `Rp ${(stats.totalRevenue / 1000000).toFixed(1)}Jt`,
      icon: DollarSign,
      color: "bg-green-500",
      ownerOnly: true,
    },
    {
      title: "Pelanggan",
      value: stats.totalCustomers,
      icon: Users,
      color: "bg-purple-500",
    },
    {
      title: "Paket Catering",
      value: stats.totalPackages,
      icon: Package,
      color: "bg-brown-500",
    },
  ].filter((card) => !card.ownerOnly || isOwner);

  const orderStatusColors: Record<string, string> = {
    Menunggu_Konfirmasi: "bg-yellow-100 text-yellow-800",
    Sedang_Diproses: "bg-blue-100 text-blue-800",
    Menunggu_Kurir: "bg-purple-100 text-purple-800",
    Selesai: "bg-green-100 text-green-800",
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-8 h-8 border-4 border-brown-200 border-t-brown-600 rounded-full animate-spin" />
        <p className="text-brown-600">Memuat dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <p className="font-semibold">Gagal memuat data:</p>
        <p className="text-sm mt-1">{error}</p>
        <Button onClick={fetchDashboardData} variant="outline" className="mt-4 border-red-300 text-red-700 hover:bg-red-100">
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-brown-900">
            {isOwner ? "Owner Dashboard" : "Admin Dashboard"}
          </h1>
          <p className="text-brown-600 mt-1">
            {isOwner 
              ? "Overview performa bisnis & laporan keuangan Culiner Yuk" 
              : "Selamat datang di panel admin Culiner Yuk!"}
          </p>
        </div>
        
        {/* Export Buttons - Owner Only */}
        {isOwner && (
          <div className="flex gap-2">
            <Button 
              onClick={() => handleExportReport("excel")}
              disabled={exportLoading}
              variant="outline" 
              className="border-brown-200 text-brown-700 hover:bg-brown-50"
            >
              <Download className="mr-2 h-4 w-4" /> Excel
            </Button>
            <Button 
              onClick={() => handleExportReport("pdf")}
              disabled={exportLoading}
              variant="outline" 
              className="border-brown-200 text-brown-700 hover:bg-brown-50"
            >
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-brown-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-xs lg:text-sm font-medium text-brown-600">
                {stat.title}
              </CardTitle>
              <div className={`${stat.color} p-2 rounded-lg`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-lg lg:text-2xl font-bold text-brown-900">{stat.value}</div>
              {stat.ownerOnly && (
                <p className="text-xs text-brown-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="hidden sm:inline">{stat.ownerOnly} dari bulan lalu</span>
                  <span className="sm:hidden">{stat.ownerOnly}</span>
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart - Owner Only */}
      {isOwner && (
        <Card className="border-brown-200 bg-gradient-to-r from-brown-50 to-white">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-brown-500" />
                <CardTitle className="text-lg font-serif text-brown-900">Grafik Pendapatan Bulanan</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-brown-500" />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-1.5 border border-brown-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brown-500"
                >
                  {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RevenueChart year={selectedYear} />
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-brown-200">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="p-2 lg:p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 lg:h-6 lg:w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs lg:text-sm text-brown-600">Pesanan Pending</p>
                <p className="text-xl lg:text-2xl font-bold text-brown-900">{stats.pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brown-200">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="p-2 lg:p-3 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs lg:text-sm text-brown-600">Sedang Diproses</p>
                <p className="text-xl lg:text-2xl font-bold text-brown-900">{stats.processingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brown-200">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="p-2 lg:p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs lg:text-sm text-brown-600">Pesanan Selesai</p>
                <p className="text-xl lg:text-2xl font-bold text-brown-900">
                  {Math.max(0, stats.totalOrders - stats.pendingOrders - stats.processingOrders)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card className="border-brown-200">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 lg:p-6">
          <CardTitle className="text-lg font-serif text-brown-900">Pesanan Terbaru</CardTitle>
          <Link href="/admin/orders">
            <Button variant="outline" size="sm" className="w-full sm:w-auto border-brown-200">
              Lihat Semua
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-brown-50">
                  <TableHead className="font-semibold">No. Resi</TableHead>
                  <TableHead className="font-semibold">Pelanggan</TableHead>
                  <TableHead className="font-semibold">Tanggal</TableHead>
                  <TableHead className="font-semibold text-right">Total</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-brown-50">
                      <TableCell className="font-medium">{order.no_resi || `#${order.id}`}</TableCell>
                      <TableCell>{order.pelanggan?.nama_pelanggan || "Unknown"}</TableCell>
                      <TableCell>{new Date(order.tgl_pesan).toLocaleDateString("id-ID")}</TableCell>
                      <TableCell className="font-semibold text-brown-700 text-right">
                        Rp {Number(order.total_bayar).toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <Badge className={orderStatusColors[order.status_pesan] || "bg-gray-100"}>
                          {order.status_pesan.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-brown-500 py-8">
                      Belum ada pesanan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-brown-100">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-brown-900 truncate">
                        {order.no_resi || `#${order.id}`}
                      </p>
                      <p className="text-sm text-brown-600">{order.pelanggan?.nama_pelanggan || "Unknown"}</p>
                    </div>
                    <Badge className={orderStatusColors[order.status_pesan] || "bg-gray-100"}>
                      {order.status_pesan.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-brown-500">Tanggal</span>
                      <span className="font-medium">{new Date(order.tgl_pesan).toLocaleDateString("id-ID")}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-brown-500">Total</span>
                      <span className="font-semibold text-brown-700">
                        Rp {Number(order.total_bayar).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-brown-500">Belum ada pesanan.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}