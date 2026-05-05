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
import { Calendar, Truck, CheckCircle } from "lucide-react";

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ tgl_kirim: "", tgl_terima: "", status_kirim: "Sedang_Dikirim" });

  useEffect(() => {
    fetch("/api/admin/deliveries").then(r => r.json()).then(d => {
      setDeliveries(d);
      setLoading(false);
    });
  }, []);

  const openEdit = (d: any) => {
    setSelected(d);
    setForm({
      tgl_kirim: d.tgl_kirim ? new Date(d.tgl_kirim).toISOString().split('T')[0] : "",
      tgl_terima: d.tgl_terima ? new Date(d.tgl_terima).toISOString().split('T')[0] : "",
      status_kirim: d.status_kirim,
    });
  };

  const handleUpdate = async () => {
    await fetch(`/api/admin/deliveries/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSelected(null);
    window.location.reload();
  };

  const statusColors: Record<string, string> = {
    Sedang_Dikirim: "bg-blue-100 text-blue-800",
    Tiba_Ditujuan: "bg-green-100 text-green-800",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-brown-900">Manajemen Pengiriman</h1>
      
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
            {loading ? <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow> :
              deliveries.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.pemesanan.no_resi || `#${d.pemesanan.id}`}</TableCell>
                  <TableCell>{d.pemesanan.pelanggan.nama_pelanggan}</TableCell>
                  <TableCell>{d.tgl_kirim ? new Date(d.tgl_kirim).toLocaleDateString("id-ID") : "-"}</TableCell>
                  <TableCell><Badge className={statusColors[d.status_kirim]}>{d.status_kirim.replace(/_/g, " ")}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => openEdit(d)}>Update Status</Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Pengiriman</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Tanggal Kirim</Label>
              <Input type="date" value={form.tgl_kirim} onChange={e => setForm({...form, tgl_kirim: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Tanggal Tiba</Label>
              <Input type="date" value={form.tgl_terima} onChange={e => setForm({...form, tgl_terima: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Status Pengiriman</Label>
              <select className="w-full p-2 border rounded-md" value={form.status_kirim} onChange={e => setForm({...form, status_kirim: e.target.value})}>
                <option value="Sedang_Dikirim">Sedang Dikirim</option>
                <option value="Tiba_Ditujuan">Tiba di Tujuan</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Batal</Button>
            <Button onClick={handleUpdate} className="bg-brown-500 hover:bg-brown-600">Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}