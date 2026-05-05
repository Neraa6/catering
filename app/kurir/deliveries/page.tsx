"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Package, Check, Truck } from "lucide-react";

export default function KurirDeliveries() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/kurir/deliveries").then(r => r.json()).then(d => { setDeliveries(d); setLoading(false); });
  }, []);

  const updateStatus = async (id: string, status: string, bukti?: string) => {
    setUpdating(id);
    await fetch(`/api/kurir/deliveries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status_kirim: status, bukti_foto: bukti || null }),
    });
    setUpdating(null);
    window.location.reload();
  };

  if (loading) return <div className="p-8 text-center">Memuat...</div>;
  if (deliveries.length === 0) return <div className="text-center py-12 text-brown-500">Tidak ada tugas pengiriman.</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-serif font-bold text-brown-900">Tugas Pengiriman</h1>
      {deliveries.map(d => (
        <Card key={d.id} className="border-brown-200">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-brown-900">{d.pemesanan.no_resi || `#${d.pemesanan.id}`}</p>
                <p className="text-sm text-brown-600">{d.pemesanan.pelanggan.nama_pelanggan}</p>
              </div>
              <Badge className={d.status_kirim === "Tiba_Ditujuan" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                {d.status_kirim.replace(/_/g, " ")}
              </Badge>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-brown-500" /><span>{d.pemesanan.pelanggan.alamat1}</span></div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-brown-500" /><span>{d.pemesanan.pelanggan.telepon}</span></div>
            </div>
            <div className="pt-2 flex gap-2">
              {d.status_kirim === "Sedang_Dikirim" && (
                <Button size="sm" onClick={() => updateStatus(d.id, "Tiba_Ditujuan")} disabled={updating === d.id} className="bg-green-600 hover:bg-green-700">
                  <Check className="mr-1 h-4 w-4" /> Tandai Sampai
                </Button>
              )}
              {d.status_kirim === "Menunggu_Kurir" && (
                <Button size="sm" onClick={() => updateStatus(d.id, "Sedang_Dikirim")} disabled={updating === d.id} className="bg-blue-600 hover:bg-blue-700">
                  <Truck className="mr-1 h-4 w-4" /> Mulai Kirim
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}