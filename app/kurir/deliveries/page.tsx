"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Package, Check, Truck } from "lucide-react";

export default function KurirDeliveries() {
  // ✅ 1. Inisialisasi sebagai array kosong
  const [deliveries, setDeliveries] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await fetch("/api/kurir/deliveries");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        // ✅ 2. Validasi: pastikan data adalah array
        if (Array.isArray(data)) {
          setDeliveries(data);
        } else {
          console.warn("⚠️ API tidak mengembalikan array:", data);
          setDeliveries([]);
        }
      } catch (err) {
        console.error("Error fetching deliveries:", err);
        setDeliveries([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveries();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const response = await fetch(`/api/kurir/deliveries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status_kirim: status }),
      });
      if (!response.ok) throw new Error("Gagal update status");
      window.location.reload();
    } catch (err) {
      alert("Gagal update: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-brown-600">Memuat tugas...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-serif font-bold text-brown-900">Tugas Pengiriman</h1>
      
      {/* ✅ 3. Safe Mapping: cek Array.isArray dulu */}
      {Array.isArray(deliveries) && deliveries.length > 0 ? (
        deliveries.map((d: unknown) => (
          <Card key={(d as { id: string }).id} className="border-brown-200">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-brown-900">{(d as { pemesanan?: { no_resi?: string; id?: string } }).pemesanan?.no_resi || `#${(d as { pemesanan?: { id?: string } }).pemesanan?.id}`}</p>
                  <p className="text-sm text-brown-600">{(d as { pemesanan?: { pelanggan?: { nama_pelanggan?: string } } }).pemesanan?.pelanggan?.nama_pelanggan}</p>
                </div>
                <Badge className={(d as { status_kirim?: string }).status_kirim === "Tiba_Ditujuan" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                  {(d as { status_kirim?: string }).status_kirim?.replace(/_/g, " ")}
                </Badge>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-brown-500 flex-shrink-0" />
                  <span>{(d as { pemesanan?: { pelanggan?: { alamat1?: string } } }).pemesanan?.pelanggan?.alamat1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-brown-500 flex-shrink-0" />
                  <span>{(d as { pemesanan?: { pelanggan?: { telepon?: string } } }).pemesanan?.pelanggan?.telepon}</span>
                </div>
              </div>
              <div className="pt-2 flex gap-2">
                {(d as { status_kirim?: string }).status_kirim === "Menunggu_Kurir" && (
                  <Button 
                    size="sm" 
                    onClick={() => updateStatus((d as { id: string }).id, "Sedang_Dikirim")} 
                    disabled={updating === (d as { id: string }).id}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Truck className="mr-1 h-4 w-4" /> Mulai Kirim
                  </Button>
                )}
                {(d as { status_kirim?: string }).status_kirim === "Sedang_Dikirim" && (
                  <Button 
                    size="sm" 
                    onClick={() => updateStatus((d as { id: string }).id, "Tiba_Ditujuan")} 
                    disabled={updating === (d as { id: string }).id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="mr-1 h-4 w-4" /> Tandai Sampai
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-12 text-brown-500 bg-white rounded-lg border border-brown-200">
          <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>Tidak ada tugas pengiriman saat ini.</p>
        </div>
      )}
    </div>
  );
}