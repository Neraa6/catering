"use client";

import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useCart as useCartType } from "@/contexts/cart-context";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartType();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    telepon: "",
    alamat: "",
    tanggal_acara: "",
    catatan: "",
    metode_pembayaran: "Transfer BCA",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pelanggan: {
            nama_pelanggan: formData.nama,
            email: formData.email,
            telepon: formData.telepon,
            alamat1: formData.alamat,
          },
          items: items.map((item) => ({
            id_paket: item.id,
            quantity: item.quantity,
            subtotal: item.harga_paket * item.quantity,
          })),
          id_jenis_bayar: 1, // Default BCA, nanti bisa dipilih
          total_bayar: totalPrice,
          tanggal_acara: formData.tanggal_acara,
          catatan: formData.catatan,
        }),
      });

      const result = await response.json();

      if (result.success) {
        clearCart();
        router.push(`/order-success?id=${result.orderId}`);
      } else {
        alert("Terjadi kesalahan: " + result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat memproses pesanan");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-20 px-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout Pesanan</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form Data */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Informasi Pemesan</h2>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nama">Nama Lengkap *</Label>
                      <Input
                        id="nama"
                        required
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="telepon">Nomor Telepon *</Label>
                      <Input
                        id="telepon"
                        required
                        value={formData.telepon}
                        onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                        placeholder="081234567890"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tanggal_acara">Tanggal Acara *</Label>
                      <Input
                        id="tanggal_acara"
                        type="date"
                        required
                        value={formData.tanggal_acara}
                        onChange={(e) => setFormData({ ...formData, tanggal_acara: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="alamat">Alamat Lengkap *</Label>
                    <Textarea
                      id="alamat"
                      required
                      value={formData.alamat}
                      onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                      placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan, Kecamatan, Kota"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="catatan">Catatan Pesanan (Opsional)</Label>
                    <Textarea
                      id="catatan"
                      value={formData.catatan}
                      onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                      placeholder="Contoh: Jangan terlalu pedas, ada alergi seafood, dll"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Metode Pembayaran</h2>
                  <div className="space-y-3">
                    {["Transfer BCA", "Transfer Mandiri", "COD (Cash on Delivery)"].map((method) => (
                      <label
                        key={method}
                        className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name="metode_pembayaran"
                          value={method}
                          checked={formData.metode_pembayaran === method}
                          onChange={(e) => setFormData({ ...formData, metode_pembayaran: e.target.value })}
                          className="h-4 w-4"
                        />
                        <span>{method}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-bold">Ringkasan Pesanan</h2>
                  
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.nama_paket} x{item.quantity}</span>
                        <span className="font-semibold">
                          Rp {(item.harga_paket * item.quantity).toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ongkos Kirim</span>
                      <span className="text-green-600">Gratis</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total</span>
                      <span className="text-brand-500">Rp {totalPrice.toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-500 hover:bg-brand-600 text-white h-12 text-lg"
                  >
                    {loading ? "Memproses..." : "Bayar Sekarang"}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Dengan memesan, Anda menyetujui syarat & ketentuan
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </main>
  );
}