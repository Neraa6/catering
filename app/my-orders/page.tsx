"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Clock, CheckCircle, Truck, AlertCircle } from "lucide-react";
import Link from "next/link";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  Menunggu_Konfirmasi: { label: "Menunggu Konfirmasi", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  Sedang_Diproses: { label: "Sedang Diproses", color: "bg-blue-100 text-blue-800", icon: Package },
  Menunggu_Kurir: { label: "Menunggu Kurir", color: "bg-purple-100 text-purple-800", icon: Truck },
  Selesai: { label: "Selesai", color: "bg-green-100 text-green-800", icon: CheckCircle },
  Dibatalkan: { label: "Dibatalkan", color: "bg-red-100 text-red-800", icon: AlertCircle },
};

export default function MyOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Redirect jika belum login atau bukan pelanggan
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login?redirect=/my-orders");
      } else if (user.level !== "pelanggan") {
        router.push("/");
      }
    }
  }, [user, loading, router]);

  // ✅ Fetch order history dengan error handling
  useEffect(() => {
    const fetchOrders = async () => {
      if (user?.level === "pelanggan" && user?.email) {
        try {
          const response = await fetch(`/api/customer/orders?email=${encodeURIComponent(user.email)}`);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          const data = await response.json();
          
          // ✅ VALIDASI: Pastikan data adalah array
          if (Array.isArray(data)) {
            setOrders(data);
            setError(null);
          } else if (data?.error) {
            setError(data.error);
            setOrders([]);
          } else {
            // Fallback jika format tidak sesuai
            setOrders([]);
          }
        } catch (err) {
          console.error("Error fetching orders:", err);
          setError("Gagal memuat riwayat pesanan");
          setOrders([]);
        } finally {
          setFetching(false);
        }
      }
    };
    
    fetchOrders();
  }, [user]);

  // ✅ Loading state
  if (loading || fetching) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto text-center">
          <div className="w-8 h-8 border-4 border-brown-200 border-t-brown-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brown-600">Memuat riwayat pesanan...</p>
        </div>
        <Footer />
      </main>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-semibold text-red-800">Gagal memuat data</p>
                <p className="text-sm text-red-600">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 border-red-300 text-red-700"
                  onClick={() => window.location.reload()}
                >
                  Coba Lagi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-brown-50">
      <Navbar />
      
      <div className="pt-24 pb-20 px-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-brown-900">Riwayat Pesanan</h1>
            <p className="text-brown-600 mt-1">Lihat status dan detail pesanan Anda</p>
          </div>
          <Link href="/#paket">
            <Button className="bg-brown-500 hover:bg-brown-600 text-white">
              Pesan Lagi
            </Button>
          </Link>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card className="border-brown-200">
            <CardContent className="p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-brown-300 mb-4" />
              <h3 className="text-lg font-semibold text-brown-900 mb-2">Belum Ada Pesanan</h3>
              <p className="text-brown-600 mb-6">Yuk, mulai pesan catering untuk acara Anda!</p>
              <Link href="/#paket">
                <Button className="bg-brown-500 hover:bg-brown-600 text-white">
                  Lihat Paket Catering
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* ✅ SAFE MAP: orders sudah dipastikan array */}
            {orders.map((order) => {
              const status = statusConfig[order.status_pesan] || statusConfig.Menunggu_Konfirmasi;
              const StatusIcon = status.icon;
              
              return (
                <Card key={order.id} className="border-brown-200 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-brown-900">
                            {order.no_resi || `#${order.id}`}
                          </span>
                          <Badge className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-brown-600">
                          {new Date(order.tgl_pesan).toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-brown-700">
                          Rp {Number(order.total_bayar).toLocaleString("id-ID")}
                        </p>
                        <p className="text-xs text-brown-500">
                          {order.detail?.length || 0} item
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* Order Items Preview */}
                    <div className="space-y-2 mb-4">
                      {order.detail?.slice(0, 2).map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-brown-700">{item.paket?.nama_paket}</span>
                          <span className="text-brown-500">
                            {item.quantity}x • Rp {Number(item.subtotal).toLocaleString("id-ID")}
                          </span>
                        </div>
                      ))}
                      {order.detail?.length > 2 && (
                        <p className="text-xs text-brown-500 italic">
                          +{order.detail.length - 2} item lainnya
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-brown-100">
                      <Button variant="outline" size="sm" className="border-brown-200">
                        Lihat Detail
                      </Button>
                      {order.status_pesan === "Menunggu_Konfirmasi" && (
                        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                          Batalkan Pesanan
                        </Button>
                      )}
                      {order.bukti_pembayaran && (
                        <a 
                          href={order.bukti_pembayaran} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-brown-500 hover:text-brown-700 underline"
                        >
                          Lihat Bukti Bayar
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}