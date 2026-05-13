"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { AlertCircle } from "lucide-react";
interface Pelanggan {
  id: string;
  nama_pelanggan: string;
  email: string;
  telepon: string;
  alamat1: string;
  alamat2?: string;
  alamat3?: string;
}

interface Pemesanan {
  id: string;
  no_resi: string;
  pelanggan: Pelanggan;
  // tambahkan field lain jika perlu
}

interface Delivery {
  no_resi: string;
  id: string;
  status_kirim: string;
  tgl_kirim?: Date | string;
  tgl_terima?: Date | string;
  bukti_foto?: string;
  pemesanan?: Pemesanan;
  id_pesan: string;
}

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Delivery | null>(null);
  const [form, setForm] = useState({ tgl_kirim: "", tgl_terima: "", status_kirim: "Sedang_Dikirim" });

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await fetch("/api/admin/deliveries");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // ✅ Cek content-type
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response bukan JSON");
        }

        const data = await response.json();
        
        // ✅ Validasi: pastikan array
        if (Array.isArray(data)) {
          setDeliveries(data);
          setError(null);
        } else {
          console.warn("⚠️ API return bukan array:", data);
          setDeliveries([]);
        }
      } catch (err) {
        console.error("Error fetching deliveries:", err);
        setError("Gagal memuat data pengiriman");
        setDeliveries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  const openEdit = (d: Delivery) => {
    setSelected(d);
    setForm({
      tgl_kirim: d.tgl_kirim ? new Date(d.tgl_kirim).toISOString().split('T')[0] : "",
      tgl_terima: d.tgl_terima ? new Date(d.tgl_terima).toISOString().split('T')[0] : "",
      status_kirim: d.status_kirim,
    });
  };

const handleUpdate = async () => {
  if (!selected) return;
  
  try {
    const response = await fetch(`/api/admin/deliveries/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tgl_kirim: form.tgl_kirim || null,
        tgl_terima: form.tgl_terima || null,
        status_kirim: form.status_kirim,
      }),
    });

    if (!response.ok) {
      // ✅ Baca response sebagai text dulu untuk debug
      const raw = await response.text();
      console.error("❌ Server raw response:", raw);
      
      // Coba parse JSON jika memungkinkan
      let errorMsg = `HTTP ${response.status}`;
      try {
        const parsed = JSON.parse(raw);
        errorMsg = parsed.details || parsed.error || errorMsg;
      } catch {}
      
      throw new Error(errorMsg);
    }

    await response.json();
    alert("✅ Status berhasil diupdate!");
    setSelected(null);
    window.location.reload();
  } catch (err: unknown) {
    console.error("❌ Update failed:", err);
    alert("Gagal update: " + (err as Error).message);
  }
};
  const statusColors: Record<string, string> = {
    Sedang_Dikirim: "bg-blue-100 text-blue-800",
    Tiba_Ditujuan: "bg-green-100 text-green-800",
    Menunggu_Kurir: "bg-yellow-100 text-yellow-800",
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-brown-600">
        <div className="w-8 h-8 border-4 border-brown-200 border-t-brown-500 rounded-full animate-spin mx-auto mb-4"></div>
        Memuat data pengiriman...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <div>
          <p className="font-semibold text-red-800">Gagal memuat data</p>
          <p className="text-sm text-red-600">{error}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif font-bold text-brown-900">Manajemen Pengiriman</h1>
      
      <div className="rounded-lg border border-brown-200 bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-brown-50">
            <TableRow>
              <TableHead>No. Resi</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Tgl Kirim</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-brown-500">
                  Tidak ada data pengiriman
                </TableCell>
              </TableRow>
            ) : (
              deliveries.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">
                    {d.no_resi || `#${d.pemesanan?.id}`}
                  </TableCell>
                  <TableCell>{d.pemesanan?.pelanggan?.nama_pelanggan || "-"}</TableCell>
                  <TableCell>
                    {d.tgl_kirim ? new Date(d.tgl_kirim).toLocaleDateString("id-ID") : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[d.status_kirim] || "bg-gray-100"}>
                      {d.status_kirim?.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => openEdit(d)}>
                      Update Status
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Update Status */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Pengiriman</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Tanggal Kirim</Label>
              <Input 
                type="date" 
                value={form.tgl_kirim} 
                onChange={e => setForm({...form, tgl_kirim: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Tanggal Tiba</Label>
              <Input 
                type="date" 
                value={form.tgl_terima} 
                onChange={e => setForm({...form, tgl_terima: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Status Pengiriman</Label>
              <select 
                className="w-full p-2 border rounded-md" 
                value={form.status_kirim} 
                onChange={e => setForm({...form, status_kirim: e.target.value})}
              >
                <option value="Menunggu_Kurir">Menunggu Kurir</option>
                <option value="Sedang_Dikirim">Sedang Dikirim</option>
                <option value="Tiba_Ditujuan">Tiba di Tujuan</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Batal</Button>
            <Button onClick={handleUpdate} className="bg-brown-500 hover:bg-brown-600">
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}