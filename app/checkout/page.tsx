"use client"; // ✅ WAJIB: File ini hanya jalan di client

import { useState, useEffect } from "react";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false); // ✅ State untuk cek hydration
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    telepon: "",
    alamat: "",
    tanggal_acara: "",
    catatan: "",
    metode_pembayaran: "Transfer BCA",
  });

  // ✅ 1. Tandai bahwa komponen sudah mount di client
  useEffect(() => {
    setIsClient(true);
    
    // ✅ 2. Auto-fill form jika user sudah login
    if (user) {
      setFormData(prev => ({
        ...prev,
        nama: user.name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  // ✅ 3. Redirect jika cart kosong (hanya di client)
  useEffect(() => {
    if (isClient && items.length === 0) {
      router.push("/cart");
    }
  }, [isClient, items.length, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isClient) return; // Mencegah submit saat belum hydrate
    
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
          id_jenis_bayar: 1, // Default BCA
          total_bayar: totalPrice,
          tanggal_acara: formData.tanggal_acara,
          catatan: formData.catatan,
        }),
      });

      const result = await response.json();

      if (result.success) {
        clearCart();
        // ✅ Tambahkan noResi ke URL
        router.push(`/order-success?id=${result.orderId}&noResi=${result.noResi}`);
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
  // Tambah state untuk cek profil
const [profileComplete, setProfileComplete] = useState<boolean | null>(null);

// Tambah useEffect untuk cek kelengkapan profil
useEffect(() => {
  const checkProfile = async () => {
    if (user?.email) {
      try {
        const res = await fetch(`/api/customer/profile?email=${encodeURIComponent(user.email)}`);
        const data = await res.json();
        const required = ["nama_pelanggan", "telepon", "alamat1"];
        const complete = required.every((f: string) => data?.[f]?.trim());
        setProfileComplete(complete);
      } catch {
        setProfileComplete(false);
      }
    }
  };
  if (user?.level === "pelanggan") checkProfile();
}, [user]);

// Tambah blocking UI jika profil belum lengkap
if (user?.level === "pelanggan" && profileComplete === false) {
  return (
    <main className="min-h-screen bg-brown-50">
      <Navbar />
      <div className="pt-32 pb-20 px-6 max-w-2xl mx-auto text-center">
        <AlertCircle className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-brown-900 mb-2">Lengkapi Profil Terlebih Dahulu</h2>
        <p className="text-brown-600 mb-6">
          Anda harus mengisi Nama, Nomor Telepon, dan Alamat Utama sebelum bisa memesan.
        </p>
        <Button onClick={() => router.push("/profile")} className="bg-brown-500 hover:bg-brown-600 text-white">
          Ke Halaman Profil
        </Button>
      </div>
      <Footer />
    </main>
  );
}

  // ✅ 4. Render Loading/Null saat server-side untuk mencegah mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brown-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brown-200 border-t-brown-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brown-600">Memuat halaman checkout...</p>
        </div>
      </div>
    );
  }

  // ✅ 5. Validasi cart setelah client mount
  if (items.length === 0) {
    return null; // Redirect handled by useEffect
  }

  return (
    // ✅ 6. suppressHydrationWarning untuk mencegah error pada nilai dinamis
    <main className="min-h-screen bg-brown-50" suppressHydrationWarning={true}>
      <Navbar />
      
      <div className="pt-24 pb-20 px-4 lg:px-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-brown-900 mb-8">Checkout Pesanan</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form Data */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-brown-200">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold mb-4 text-brown-900">Informasi Pemesan</h2>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nama" className="text-brown-800">Nama Lengkap *</Label>
                      <Input
                        id="nama"
                        required
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        placeholder="Masukkan nama lengkap"
                        className="border-brown-200 focus:border-brown-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-brown-800">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                        className="border-brown-200 focus:border-brown-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telepon" className="text-brown-800">Nomor Telepon *</Label>
                      <Input
                        id="telepon"
                        type="tel"
                        required
                        value={formData.telepon}
                        onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                        placeholder="081234567890"
                        className="border-brown-200 focus:border-brown-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tanggal_acara" className="text-brown-800">Tanggal Acara *</Label>
                      <Input
                        id="tanggal_acara"
                        type="date"
                        required
                        value={formData.tanggal_acara}
                        onChange={(e) => setFormData({ ...formData, tanggal_acara: e.target.value })}
                        className="border-brown-200 focus:border-brown-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alamat" className="text-brown-800">Alamat Lengkap *</Label>
                    <Textarea
                      id="alamat"
                      required
                      value={formData.alamat}
                      onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                      placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan, Kecamatan, Kota"
                      rows={3}
                      className="border-brown-200 focus:border-brown-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="catatan" className="text-brown-800">Catatan Pesanan (Opsional)</Label>
                    <Textarea
                      id="catatan"
                      value={formData.catatan}
                      onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                      placeholder="Contoh: Jangan terlalu pedas, ada alergi seafood, dll"
                      rows={2}
                      className="border-brown-200 focus:border-brown-500"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-brown-200">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 text-brown-900">Metode Pembayaran</h2>
                  <div className="space-y-3">
                    {["Transfer BCA", "Transfer Mandiri", "COD (Cash on Delivery)"].map((method) => (
                      <label
                        key={method}
                        className="flex items-center gap-3 p-3 border border-brown-200 rounded-lg cursor-pointer hover:bg-brown-50 transition-colors"
                      >
                        <input
                          type="radio"
                          name="metode_pembayaran"
                          value={method}
                          checked={formData.metode_pembayaran === method}
                          onChange={(e) => setFormData({ ...formData, metode_pembayaran: e.target.value })}
                          className="h-4 w-4 accent-brown-500"
                        />
                        <span className="text-brown-700">{method}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24 border-brown-200 shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-bold text-brown-900">Ringkasan Pesanan</h2>
                  
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm text-brown-700">
                        <span>{item.nama_paket} x{item.quantity}</span>
                        <span className="font-semibold">
                          Rp {(item.harga_paket * item.quantity).toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-brown-200 space-y-2">
                    <div className="flex justify-between text-sm text-brown-600">
                      <span>Subtotal</span>
                      <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-sm text-brown-600">
                      <span>Ongkos Kirim</span>
                      <span className="text-green-600">Gratis</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-brown-200 text-brown-900">
                      <span>Total</span>
                      <span className="text-brown-500">Rp {totalPrice.toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brown-500 hover:bg-brown-600 text-white h-12 text-lg font-semibold shadow-md"
                  >
                    {loading ? "Memproses..." : "Bayar Sekarang"}
                  </Button>

                  <p className="text-xs text-brown-500 text-center">
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