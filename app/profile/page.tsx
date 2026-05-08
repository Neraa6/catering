"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Mail, Phone, MapPin, Calendar, IdCard, Upload, CheckCircle, AlertCircle } from "lucide-react";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    nama_pelanggan: "",
    email: "",
    telepon: "",
    alamat1: "",
    alamat2: "",
    alamat3: "",
    tgl_lahir: "",
    kartu_id: "",
    foto: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // ✅ Redirect jika belum login atau bukan pelanggan
  useEffect(() => {
    if (!authLoading && (!user || user.level !== "pelanggan")) {
      router.push("/login?redirect=/profile");
    }
  }, [user, authLoading, router]);

  // ✅ Fetch data profil saat mount
  useEffect(() => {
    if (user?.email) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/customer/profile?email=${encodeURIComponent(user!.email)}`);
      const data = await response.json();
      
      if (response.ok && data) {
        setFormData({
          nama_pelanggan: data.nama_pelanggan || "",
          email: data.email || "",
          telepon: data.telepon || "",
          alamat1: data.alamat1 || "",
          alamat2: data.alamat2 || "",
          alamat3: data.alamat3 || "",
          tgl_lahir: data.tgl_lahir ? new Date(data.tgl_lahir).toISOString().split('T')[0] : "",
          kartu_id: data.kartu_id || "",
          foto: data.foto || "",
        });
        
        // ✅ Cek kelengkapan data (field wajib)
        const required = ["nama_pelanggan", "telepon", "alamat1"];
        const complete = required.every(field => data[field]?.trim());
        setIsComplete(complete);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email,
          ...formData,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "✅ Data profil berhasil diperbarui!" });
        fetchProfile(); // Refresh data
      } else {
        setMessage({ type: "error", text: result.error || "Gagal memperbarui profil" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan koneksi" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Reset message saat user mulai edit
    if (message) setMessage(null);
  };

  // ✅ Loading state
  if (authLoading || !user) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto text-center">
          <div className="w-8 h-8 border-4 border-brown-200 border-t-brown-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brown-600">Memuat profil...</p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brown-50">
      <Navbar />
      
      <div className="pt-24 pb-20 px-4 lg:px-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-brown-900">Profil Saya</h1>
          <p className="text-brown-600 mt-1">Lengkapi data diri untuk pengalaman belanja yang lebih baik</p>
        </div>

        {/* Status Kelengkapan */}
        <Alert className={`mb-6 ${isComplete ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
          {isComplete ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          )}
          <AlertDescription className={isComplete ? "text-green-800" : "text-yellow-800"}>
            {isComplete 
              ? "✅ Profil Anda sudah lengkap! Anda bisa langsung checkout." 
              : "⚠️ Lengkapi data wajib (Nama, Telepon, Alamat) untuk bisa memesan."}
          </AlertDescription>
        </Alert>

        {/* Form Profile */}
        <Card className="border-brown-200">
          <CardHeader>
            <CardTitle className="text-xl font-serif text-brown-900">Data Diri</CardTitle>
            <CardDescription>Isi informasi berikut dengan benar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Message Alert */}
              {message && (
                <Alert className={message.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                  <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              {/* Nama & Email */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nama" className="text-brown-800 font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" /> Nama Lengkap *
                  </Label>
                  <Input
                    id="nama"
                    required
                    value={formData.nama_pelanggan}
                    onChange={(e) => handleChange("nama_pelanggan", e.target.value)}
                    placeholder="Sesuai KTP"
                    className="border-brown-200 focus:border-brown-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-brown-800 font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    disabled
                    value={formData.email}
                    className="bg-gray-50 border-brown-200 cursor-not-allowed"
                  />
                  <p className="text-xs text-brown-500">Email tidak dapat diubah</p>
                </div>
              </div>

              {/* Telepon & Tgl Lahir */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telepon" className="text-brown-800 font-semibold flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Nomor Telepon *
                  </Label>
                  <Input
                    id="telepon"
                    type="tel"
                    required
                    value={formData.telepon}
                    onChange={(e) => handleChange("telepon", e.target.value)}
                    placeholder="081234567890"
                    className="border-brown-200 focus:border-brown-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tgl_lahir" className="text-brown-800 font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Tanggal Lahir
                  </Label>
                  <Input
                    id="tgl_lahir"
                    type="date"
                    value={formData.tgl_lahir}
                    onChange={(e) => handleChange("tgl_lahir", e.target.value)}
                    className="border-brown-200 focus:border-brown-500"
                  />
                </div>
              </div>

              {/* Alamat Lengkap */}
              <div className="space-y-2">
                <Label htmlFor="alamat1" className="text-brown-800 font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Alamat Utama *
                </Label>
                <Input
                  id="alamat1"
                  required
                  value={formData.alamat1}
                  onChange={(e) => handleChange("alamat1", e.target.value)}
                  placeholder="Jl. Contoh No. 123, Kelurahan, Kecamatan"
                  className="border-brown-200 focus:border-brown-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alamat2" className="text-brown-700">Alamat Tambahan (Opsional)</Label>
                  <Input
                    id="alamat2"
                    value={formData.alamat2}
                    onChange={(e) => handleChange("alamat2", e.target.value)}
                    placeholder="RT/RW, Landmark"
                    className="border-brown-200 focus:border-brown-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alamat3" className="text-brown-700">Kota / Kabupaten</Label>
                  <Input
                    id="alamat3"
                    value={formData.alamat3}
                    onChange={(e) => handleChange("alamat3", e.target.value)}
                    placeholder="Contoh: Jakarta Selatan"
                    className="border-brown-200 focus:border-brown-500"
                  />
                </div>
              </div>

              {/* Kartu ID & Foto */}
              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-brown-200">
                <div className="space-y-2">
                  <Label htmlFor="kartu_id" className="text-brown-800 font-semibold flex items-center gap-2">
                    <IdCard className="h-4 w-4" /> No. KTP / ID Card
                  </Label>
                  <Input
                    id="kartu_id"
                    value={formData.kartu_id}
                    onChange={(e) => handleChange("kartu_id", e.target.value)}
                    placeholder="Nomor identitas"
                    className="border-brown-200 focus:border-brown-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-brown-800 font-semibold flex items-center gap-2">
                    <Upload className="h-4 w-4" /> Foto Profil
                  </Label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-brown-200 flex items-center justify-center text-brown-600 font-semibold">
                      {formData.nama_pelanggan?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <Button type="button" variant="outline" size="sm" className="border-brown-200" disabled>
                      Upload (Coming Soon)
                    </Button>
                  </div>
                  <p className="text-xs text-brown-500">Foto opsional, akan diaktifkan segera</p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex gap-3">
                <Button 
                  type="submit" 
                  disabled={loading || !isComplete}
                  className="bg-brown-500 hover:bg-brown-600 text-white px-6"
                >
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.back()}
                  className="border-brown-200"
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </main>
  );
}