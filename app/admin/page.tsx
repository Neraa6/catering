"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { 
  ShoppingCart, Package, Users, TrendingUp, DollarSign, Clock, CheckCircle, BarChart3, Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import Link from "next/link";

const INITIAL_STATS = {
  totalOrders: 0,
  totalRevenue: 0,
  totalCustomers: 0,
  totalPackages: 0,
  pendingOrders: 0,
  processingOrders: 0,
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(INITIAL_STATS);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwner = user?.level === "owner";
  const isAdmin = user?.level === "admin";

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/dashboard");
      if (!response.ok) throw new Error("Gagal memuat data dashboard");

      const data = await response.json();
      setStats(data.stats || INITIAL_STATS);
      setRecentOrders(data.recentOrders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan jaringan");
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleExportReport = () => {
    // Placeholder: nanti integrasi dengan library seperti 'xlsx' atau 'jspdf'
    alert("Fitur export laporan akan segera hadir! 📊");
  };

  const statCards = [
    {
      title: "Total Pesanan",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      color: "bg-blue-500",
      trend: "+12%",
    },
    {
      title: "Pendapatan",
      value: `Rp ${((stats?.totalRevenue ?? 0) / 1000000).toFixed(1)}Jt`,
      icon: DollarSign,
      color: "bg-green-500",
      trend: "+8%",
    },
    {
      title: "Pelanggan",
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      color: "bg-purple-500",
      trend: "+15%",
    },
    {
      title: "Paket Catering",
      value: stats?.totalPackages ?? 0,
      icon: Package,
      color: "bg-brown-500",
      trend: "+3",
    },
  ];

  const orderStatusColors: Record<string, string> = {
    Menunggu_Konfirmasi: "bg-yellow-100 text-yellow-800",
    Sedang_Diproses: "bg-blue-100 text-blue-800",
    Menunggu_Kurir: "bg-purple-100 text-purple-800",
    Selesai: "bg-green-100 text-green-800",
  };

  // 🛡️ Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-8 h-8 border-4 border-brown-200 border-t-brown-600 rounded-full animate-spin" />
        <p className="text-brown-600">Memuat dashboard...</p>
      </div>
    );
  }

  // 🛡️ Error State
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
      {/* Header dengan Role-Specific Actions */}
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
        
        {/* Owner Only: Export Button */}
        {isOwner && (
          <Button 
            onClick={handleExportReport}
            variant="outline" 
            className="border-brown-200 text-brown-700 hover:bg-brown-50"
          >
            <Download className="mr-2 h-4 w-4" /> Export Laporan
          </Button>
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
              <p className="text-xs text-brown-500 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="hidden sm:inline">{stat.trend} dari bulan lalu</span>
                <span className="sm:hidden">{stat.trend}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Owner Only: Revenue Chart Section */}
      {isOwner && (
        <Card className="border-brown-200 bg-gradient-to-r from-brown-50 to-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-serif text-brown-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-brown-500" />
                Grafik Pendapatan Bulanan
              </CardTitle>
              <Badge variant="secondary" className="text-xs">2026</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex flex-col items-center justify-center text-brown-400 border border-dashed border-brown-300 rounded-lg bg-white/50">
              <BarChart3 className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm font-medium">Chart Area</p>
              <p className="text-xs mt-1">Integrasi Recharts/Chart.js akan ditambahkan</p>
            </div>
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
                  {Math.max(0, (stats.totalOrders || 0) - stats.pendingOrders - stats.processingOrders)}
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
          {/* Desktop Table */}
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
                  recentOrders.map((order: any) => (
                    <TableRow key={order.id}>
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
              recentOrders.map((order: any) => (
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