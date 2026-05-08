"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";

// ... (import tetap sama)

export default function SettingsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ metode_pembayaran: "", no_rek: "", tempat_bayar: "" });
  const [activeTab, setActiveTab] = useState("payments");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch("/api/admin/settings/payments");
        
        if (!response.ok) {
          throw new Error("Gagal mengambil data pembayaran");
        }

        // ✅ Cek apakah response benar-benar JSON sebelum di-parse
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          setPayments(data);
        } else {
          console.error("API tidak mengembalikan JSON");
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // ... (rest of the component sama)

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
  {loading ? (
    <p className="text-center text-brown-500 py-4">Loading...</p>
  ) : payments.length === 0 ? (
    <p className="text-center text-brown-400 py-4">Belum ada metode pembayaran.</p>
  ) : (
    payments.map((p) => {
      // ✅ Safe access: cek array dulu sebelum akses index [0]
      const firstDetail = Array.isArray(p.detail_pembayarans) && p.detail_pembayarans.length > 0 
        ? p.detail_pembayarans[0] 
        : null;
      
      // Note: field name di Prisma adalah 'detail_pembayarans' (plural), bukan 'detail_jenis_pembayarans'
      
      return (
        <div key={p.id} className="flex items-center justify-between p-4 bg-white border border-brown-200 rounded-lg">
          <div>
            <p className="font-semibold text-brown-900">{p.metode_pembayaran}</p>
            <p className="text-sm text-brown-600">
              {p.detail_pembayarans?.[0]?.tempat_bayar || "-"} • {" "}
              {firstDetail?.no_rek || "-"}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => handleDelete(p.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    })
  )}
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