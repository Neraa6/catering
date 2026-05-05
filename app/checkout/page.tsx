"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import BuktiBayarUpload from "@/components/upload/bukti-bayar-upload";
import { Upload, CheckCircle, AlertCircle, CreditCard, Truck, Banknote } from "lucide-react";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [buktiUrl, setBuktiUrl] = useState<string>("");
  const [step, setStep] = useState<1 | 2 | 3>(1); // Multi-step form: 1=Data, 2=Payment, 3=Review
  
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    telepon: "",
    alamat: "",
    tanggal_acara: "",
    catatan: "",
    metode_pembayaran: "Transfer BCA",
  });

  // ✅ Auto-fill form jika user sudah login (pelanggan)
  useEffect(() => {
    if (user?.level === "pelanggan") {
      setFormData(prev => ({
        ...prev,
        nama: user.name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  // ✅ Redirect jika cart kosong
  useEffect(() => {
    if (items.length === 0 && !loading) {
      router.replace("/cart");
    }
  }, [items.length, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi bukti upload untuk transfer bank
    if (formData.metode_pembayaran !== "COD (Cash on Delivery)" && !buktiUrl) {
      alert("Silakan upload bukti transfer terlebih dahulu");
      return;
    }

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
          id_jenis_bayar: formData.metode_pembayaran.includes("BCA") ? 1 : 
                         formData.metode_pembayaran.includes("Mandiri") ? 2 : 3,
          total_bayar: totalPrice,
          tanggal_acara: formData.tanggal_acara,
          catatan: formData.catatan,
          metode_pembayaran: formData.metode_pembayaran,
          bukti_pembayaran: buktiUrl, // ✅ Kirim URL bukti ke backend
        }),
      });

      const result = await response.json();

      if (result.success) {
        clearCart();
        // ✅ Redirect dengan no_resi yang baru digenerate
        router.push(`/order-success?id=${result.orderId}&noResi=${result.noResi}`);
      } else {
        alert("Terjadi kesalahan: " + (result.error || "Gagal memproses pesanan"));
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3) as 1 | 2 | 3);
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1) as 1 | 2 | 3);

  const isTransferMethod = formData.metode_pembayaran !== "COD (Cash on Delivery)";

  if (items.length === 0 && !loading) {
    return null; // Redirect handled by useEffect
  }

  return (
    <main className="min-h-screen bg-brown-50">
      <Navbar />
      
      <div className="pt-24 pb-20 px-4 lg:px-6 max-w-6xl mx-auto">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step >= s ? "bg-brown-500 text-white" : "bg-brown-200 text-brown-600"
              }`}>
                {step > s ? <CheckCircle className="h-5 w-5" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-12 lg:w-24 h-1 mx-2 rounded ${step > s ? "bg-brown-500" : "bg-brown-200"}`} />
              )}
            </div>
          ))}
        </div>

        <h1 className="text-2xl lg:text-3xl font-serif font-bold text-brown-900 text-center mb-8">
          {step === 1 ? "Informasi Pemesan" : step === 2 ? "Metode Pembayaran" : "Konfirmasi Pesanan"}
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* STEP 1: Data Pemesan */}
              {step === 1 && (
                <Card className="border-brown-200">
                  <CardHeader>
                    <CardTitle className="text-xl font-serif text-brown-900">Data Diri</CardTitle>
                    <CardDescription className="text-brown-600">
                      Isi informasi kontak dan alamat pengiriman
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nama" className="text-brown-800">Nama Lengkap *</Label>
                        <Input
                          id="nama"
                          required
                          value={formData.nama}
                          onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                          placeholder="Sesuai KTP"
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
                          placeholder="nama@email.com"
                          className="border-brown-200 focus:border-brown-500"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="telepon" className="text-brown-800">Nomor WhatsApp *</Label>
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
                          min={new Date().toISOString().split("T")[0]}
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
                        placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos"
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
                        placeholder="Contoh: Jangan terlalu pedas, ada alergi seafood, permintaan khusus, dll"
                        rows={2}
                        className="border-brown-200 focus:border-brown-500"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* STEP 2: Pembayaran */}
              {step === 2 && (
                <div className="space-y-6">
                  <Card className="border-brown-200">
                    <CardHeader>
                      <CardTitle className="text-xl font-serif text-brown-900">Metode Pembayaran</CardTitle>
                      <CardDescription className="text-brown-600">
                        Pilih metode pembayaran yang paling nyaman untuk Anda
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { id: "Transfer BCA", icon: Banknote, desc: "Transfer ke rekening BCA" },
                        { id: "Transfer Mandiri", icon: Banknote, desc: "Transfer ke rekening Mandiri" },
                        { id: "COD (Cash on Delivery)", icon: Truck, desc: "Bayar tunai saat pesanan tiba" },
                      ].map((method) => (
                        <label
                          key={method.id}
                          className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            formData.metode_pembayaran === method.id
                              ? "border-brown-500 bg-brown-50"
                              : "border-brown-200 hover:border-brown-300 hover:bg-brown-50/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="metode_pembayaran"
                            value={method.id}
                            checked={formData.metode_pembayaran === method.id}
                            onChange={(e) => setFormData({ ...formData, metode_pembayaran: e.target.value })}
                            className="mt-1 h-4 w-4 text-brown-500 border-brown-300 focus:ring-brown-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <method.icon className="h-5 w-5 text-brown-600" />
                              <span className="font-semibold text-brown-900">{method.id}</span>
                            </div>
                            <p className="text-sm text-brown-600 mt-1">{method.desc}</p>
                          </div>
                        </label>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Upload Bukti Transfer - Hanya untuk metode transfer */}
                  {isTransferMethod && (
                    <Card className="border-brown-200 bg-green-50/50">
                      <CardHeader>
                        <CardTitle className="text-lg font-serif text-brown-900 flex items-center gap-2">
                          <Upload className="h-5 w-5 text-green-600" />
                          Upload Bukti Pembayaran
                        </CardTitle>
                        <CardDescription className="text-brown-600">
                          Upload screenshot/foto bukti transfer untuk verifikasi
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <BuktiBayarUpload onUploadComplete={setBuktiUrl} />
                        {!buktiUrl && (
                          <p className="text-xs text-amber-700 bg-amber-100 p-3 rounded-lg mt-3 flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            Bukti pembayaran wajib diupload sebelum melanjutkan ke konfirmasi
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Info Rekening - Dynamic berdasarkan metode */}
                  {isTransferMethod && (
                    <Card className="border-brown-200">
                      <CardContent className="p-4 bg-brown-50 rounded-lg">
                        <p className="text-sm font-semibold text-brown-800 mb-2">
                          {formData.metode_pembayaran.includes("BCA") ? "Rekening BCA" : "Rekening Mandiri"}
                        </p>
                        <div className="space-y-1 text-sm text-brown-700">
                          <p><span className="font-medium">No. Rekening:</span> {formData.metode_pembayaran.includes("BCA") ? "1234-5678-90" : "9876-5432-10"}</p>
                          <p><span className="font-medium">Atas Nama:</span> PT Culiner Yuk Indonesia</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* STEP 3: Review & Konfirmasi */}
              {step === 3 && (
                <Card className="border-brown-200">
                  <CardHeader>
                    <CardTitle className="text-xl font-serif text-brown-900">Review Pesanan</CardTitle>
                    <CardDescription className="text-brown-600">
                      Periksa kembali detail pesanan sebelum konfirmasi
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Ringkasan Data */}
                    <div className="space-y-3 p-4 bg-brown-50 rounded-lg">
                      <h4 className="font-semibold text-brown-800">📋 Data Pemesan</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-brown-600">Nama:</span>
                        <span className="font-medium text-brown-900">{formData.nama}</span>
                        <span className="text-brown-600">Email:</span>
                        <span className="font-medium text-brown-900">{formData.email}</span>
                        <span className="text-brown-600">Telepon:</span>
                        <span className="font-medium text-brown-900">{formData.telepon}</span>
                        <span className="text-brown-600">Tanggal:</span>
                        <span className="font-medium text-brown-900">{new Date(formData.tanggal_acara).toLocaleDateString("id-ID")}</span>
                      </div>
                    </div>

                    {/* Ringkasan Pembayaran */}
                    <div className="space-y-3 p-4 bg-brown-50 rounded-lg">
                      <h4 className="font-semibold text-brown-800">💳 Pembayaran</h4>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-brown-600">Metode:</span>
                        <Badge className="bg-brown-100 text-brown-800">{formData.metode_pembayaran}</Badge>
                      </div>
                      {isTransferMethod && buktiUrl && (
                        <div className="flex items-center gap-2 text-sm text-green-700">
                          <CheckCircle className="h-4 w-4" />
                          <span>Bukti pembayaran telah diupload</span>
                        </div>
                      )}
                    </div>

                    {/* Terms */}
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs text-amber-800">
                        <strong>Perhatian:</strong> Dengan mengklik "Bayar Sekarang", Anda menyetujui Syarat & Ketentuan layanan Culiner Yuk. Pesanan akan diproses setelah pembayaran diverifikasi.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary - Sticky Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-brown-200 shadow-lg">
                <CardHeader className="bg-brown-100/50 border-b border-brown-200">
                  <CardTitle className="text-lg font-serif text-brown-900">Ringkasan Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="p-4 lg:p-6 space-y-4">
                  {/* Items */}
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-brown-300">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">🍱</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-brown-900 truncate">{item.nama_paket}</p>
                          <p className="text-xs text-brown-600">{item.quantity}x {item.jumlah_pax} Pax</p>
                        </div>
                        <p className="text-sm font-semibold text-brown-700 whitespace-nowrap">
                          Rp {(item.harga_paket * item.quantity).toLocaleString("id-ID")}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-2 pt-3 border-t border-brown-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-brown-600">Subtotal</span>
                      <span className="font-medium">Rp {totalPrice.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-brown-600">Ongkos Kirim</span>
                      <span className="font-medium text-green-600">Gratis</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-brown-200">
                      <span className="text-brown-900">Total</span>
                      <span className="text-brown-500">Rp {totalPrice.toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="space-y-3 pt-4">
                    {step > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="w-full border-brown-300 text-brown-700 hover:bg-brown-50"
                      >
                        ← Kembali
                      </Button>
                    )}
                    
                    {step < 3 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="w-full bg-brown-500 hover:bg-brown-600 text-white h-12 font-semibold"
                      >
                        Lanjut {step === 1 ? "ke Pembayaran" : "ke Konfirmasi"} →
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={loading || (isTransferMethod && !buktiUrl)}
                        className="w-full bg-brown-500 hover:bg-brown-600 text-white h-12 font-semibold disabled:opacity-50"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Memproses...
                          </span>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-5 w-5" />
                            Bayar Sekarang
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <p className="text-xs text-brown-500 text-center">
                    🔒 Pembayaran aman & terenkripsi
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