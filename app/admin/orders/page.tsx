"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Order {
  id: string | number;
  no_resi?: string;
  pelanggan?: {
    nama_pelanggan: string;
    telepon: string;
  };
  tgl_pesan: string;
  total_bayar: number;
  status_pesan: string;
}

// Status Colors Mapping
const statusColors: Record<string, string> = {
  Menunggu_Konfirmasi: "bg-yellow-100 text-yellow-800",
  Sedang_Diproses: "bg-blue-100 text-blue-800",
  Menunggu_Kurir: "bg-purple-100 text-purple-800",
  Selesai: "bg-green-100 text-green-800",
};

export default function OrdersPage() {
  // 🔥 FIX: Gunakan type Order[] dan default value []
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders");
      const data = await response.json();

      // 🔥 FIX: Cek apakah data benar-benar Array sebelum di-set
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        console.error("Data API bukan array:", data);
      }
    } catch (error) {
      console.error("Gagal ambil pesanan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      try {
        const response = await fetch("/api/admin/orders");
        const data = await response.json();

        if (!mounted) return;

        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          console.error("Data API bukan array:", data);
        }
      } catch (error) {
        if (mounted) {
          console.error("Gagal ambil pesanan:", error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      mounted = false;
    };
  }, []);

  // 🔥 FIX: Pastikan orders selalu array saat di-filter
  const safeOrders = Array.isArray(orders) ? orders : [];
  
  const filteredOrders = safeOrders.filter((order) => {
    const name = order.pelanggan?.nama_pelanggan || "";
    const resi = String(order.no_resi ?? order.id ?? "");
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           resi.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brown-900">Manajemen Pesanan</h1>
          <p className="text-brown-600 mt-1">Kelola semua pesanan catering</p>
        </div>
        <Button onClick={fetchOrders} variant="outline" className="border-brown-200">
          Refresh Data
        </Button>
      </div>

      <Card className="border-brown-200">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-xl font-serif text-brown-900">Daftar Pesanan</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-brown-400" />
              <Input
                placeholder="Cari nama atau resi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-brown-200"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brown-500" />
            </div>
          ) : (
            <div className="rounded-md border border-brown-100">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resi</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium font-mono text-xs">
                          #{order.no_resi || order.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold">{order.pelanggan?.nama_pelanggan}</span>
                            <span className="text-xs text-gray-500">{order.pelanggan?.telepon}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(order.tgl_pesan).toLocaleDateString("id-ID", {
                            day: "2-digit", month: "short", year: "numeric"
                          })}
                        </TableCell>
                        <TableCell className="font-semibold text-brown-600">
                          Rp {Number(order.total_bayar).toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[order.status_pesan] || "bg-gray-100"}>
                            {order.status_pesan.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 text-brown-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                        {searchTerm ? "Tidak ada pesanan ditemukan." : "Belum ada data pesanan."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}