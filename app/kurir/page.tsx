"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, CheckCircle, Clock, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function KurirDashboard() {
  const [stats, setStats] = useState({ pending: 0, delivering: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/kurir/stats").then(r => r.json()).then(d => { setStats(d); setLoading(false); });
  }, []);

  if (loading) return <div className="p-8 text-center text-brown-600">Memuat data...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif font-bold text-brown-900">Dashboard Kurir</h1>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="border-brown-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-brown-600">Menunggu Pickup</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-brown-900 flex items-center gap-2"><Clock className="text-yellow-500" /> {stats.pending}</div></CardContent></Card>
        <Card className="border-brown-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-brown-600">Sedang Dikirim</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-brown-900 flex items-center gap-2"><Truck className="text-blue-500" /> {stats.delivering}</div></CardContent></Card>
        <Card className="border-brown-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-brown-600">Selesai Hari Ini</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-brown-900 flex items-center gap-2"><CheckCircle className="text-green-500" /> {stats.completed}</div></CardContent></Card>
      </div>
      <Card className="border-brown-200">
        <CardHeader><CardTitle className="text-lg font-serif text-brown-900">Tugas Hari Ini</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-8 text-brown-400 border border-dashed border-brown-300 rounded-lg">
            <Package className="mx-auto h-8 w-8 mb-2" />
            <p>Belum ada tugas pengiriman. Menunggu assignment dari Admin.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}