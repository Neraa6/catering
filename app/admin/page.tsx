"use client";

import { useEffect, useState } from "react";
import { 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp, 
  DollarSign,
  Clock,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
  const [stats, setStats] = useState(INITIAL_STATS);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/dashboard");
      if (!response.ok) throw new Error("Gagal memuat data dashboard");
      
      const data = await response.json();
      
      // 🛡️ Safe state update: fallback ke INITIAL_STATS jika undefined
      setStats(data.stats || INITIAL_STATS);
      setRecentOrders(data.recentOrders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan jaringan");
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
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
      value: `Rp ${(stats?.totalRevenue ?? 0 / 1000000).toFixed(1)}Jt`,
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

  // 🛡️ Loading & Error States
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
        <p>{error}</p>
        <Button onClick={fetchDashboardData} variant="outline" className="mt-4 border-red-300 text-red-700 hover:bg-red-100">
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-brown-900">Dashboard</h1>
        <p className="text-brown-600 mt-1">Selamat datang di panel admin Culiner Yuk!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-brown-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-brown-600">
                {stat.title}
              </CardTitle>
              <div className={`${stat.color} p-2 rounded-lg`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brown-900">{stat.value}</div>
              <p className="text-xs text-brown-500 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                {stat.trend} dari bulan lalu
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-brown-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-brown-600">Pesanan Pending</p>
                <p className="text-2xl font-bold text-brown-900">{stats.pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brown-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-brown-600">Sedang Diproses</p>
                <p className="text-2xl font-bold text-brown-900">{stats.processingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brown-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-brown-600">Pesanan Selesai</p>
                <p className="text-2xl font-bold text-brown-900">
                  {(stats.totalOrders || 0) - stats.pendingOrders - stats.processingOrders}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border-brown-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-serif text-brown-900">Pesanan Terbaru</CardTitle>
          <Link href="/admin/orders">
            <Button variant="outline" size="sm" className="border-brown-200">
              Lihat Semua
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Resi</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.length > 0 ? (
                recentOrders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.no_resi || `#${order.id}`}</TableCell>
                    <TableCell>{order.pelanggan?.nama_pelanggan || "Unknown"}</TableCell>
                    <TableCell>
                      {new Date(order.tgl_pesan).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell className="font-semibold text-brown-600">
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
        </CardContent>
      </Card>
    </div>
  );
}