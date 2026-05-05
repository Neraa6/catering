"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ metode_pembayaran: "", no_rek: "", tempat_bayar: "" });
  const [activeTab, setActiveTab] = useState("payments");

  useEffect(() => {
    fetch("/api/admin/settings/payments")
      .then(r => r.json())
      .then(data => { setPayments(data); setLoading(false); });
  }, []);

  const handleAddPayment = async () => {
    await fetch("/api/admin/settings/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ metode_pembayaran: "", no_rek: "", tempat_bayar: "" });
    window.location.reload();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/settings/payments/${id}`, { method: "DELETE" });
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-brown-900">Pengaturan Sistem</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-brown-100 p-1">
          <TabsTrigger value="payments" className="data-[state=active]:bg-brown-500 data-[state=active]:text-white">Metode Pembayaran</TabsTrigger>
          <TabsTrigger value="general" className="data-[state=active]:bg-brown-500 data-[state=active]:text-white">Info Toko</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4 mt-6">
          <Card className="border-brown-200">
            <CardHeader>
              <CardTitle className="text-xl font-serif text-brown-900">Tambah Metode Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <Label>Nama Metode</Label>
                  <Input value={form.metode_pembayaran} onChange={e => setForm({...form, metode_pembayaran: e.target.value})} placeholder="Contoh: Transfer BCA" />
                </div>
                <div className="space-y-2">
                  <Label>No. Rekening</Label>
                  <Input value={form.no_rek} onChange={e => setForm({...form, no_rek: e.target.value})} placeholder="1234567890" />
                </div>
                <div className="space-y-2">
                  <Label>Nama Bank/Tempat</Label>
                  <Input value={form.tempat_bayar} onChange={e => setForm({...form, tempat_bayar: e.target.value})} placeholder="Bank Central Asia" />
                </div>
                <Button onClick={handleAddPayment} className="bg-brown-500 hover:bg-brown-600 w-full">
                  <Plus className="mr-2 h-4 w-4" /> Tambah
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {loading ? <p>Loading...</p> : payments.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-white border border-brown-200 rounded-lg">
                <div>
                  <p className="font-semibold text-brown-900">{p.metode_pembayaran}</p>
                  <p className="text-sm text-brown-600">{p.tempat_bayar} • {p.detail_jenis_pembayarans[0]?.no_rek || "-"}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(p.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="general" className="mt-6">
          <Card className="border-brown-200">
            <CardContent className="p-6 space-y-4">
              <p className="text-brown-600">Fitur pengaturan umum (nama toko, alamat, kontak, logo) akan ditambahkan di update berikutnya.</p>
              <div className="flex gap-4">
                <div className="p-4 bg-brown-50 rounded-lg border border-brown-200 w-32 h-32 flex items-center justify-center text-brown-400">Logo Placeholder</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}