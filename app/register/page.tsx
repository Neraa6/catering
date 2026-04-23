"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { UtensilsCrossed, Mail, Lock, User, Phone, MapPin, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_pelanggan: "",
    email: "",
    password: "",
    telepon: "",
    alamat1: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await register(formData);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brown-50 via-brown-100 to-gold-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brown-500 rounded-2xl mb-4 shadow-lg">
            <UtensilsCrossed className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-brown-900 mb-2">
            Bergabung dengan Culiner Yuk!
          </h1>
          <p className="text-brown-600">Nikmati layanan catering premium</p>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border-brown-200 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-serif text-brown-900 text-center">
              Buat Akun Baru
            </CardTitle>
            <CardDescription className="text-center text-brown-600">
              Isi data diri Anda untuk memulai
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nama" className="text-brown-800 font-semibold">
                    Nama Lengkap *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-brown-400" />
                    <Input
                      id="nama"
                      placeholder="Nama lengkap"
                      value={formData.nama_pelanggan}
                      onChange={(e) => setFormData({ ...formData, nama_pelanggan: e.target.value })}
                      className="pl-10 border-brown-200 focus:border-brown-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telepon" className="text-brown-800 font-semibold">
                    Nomor Telepon *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-brown-400" />
                    <Input
                      id="telepon"
                      type="tel"
                      placeholder="081234567890"
                      value={formData.telepon}
                      onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                      className="pl-10 border-brown-200 focus:border-brown-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-brown-800 font-semibold">
                  Email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-brown-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 border-brown-200 focus:border-brown-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alamat" className="text-brown-800 font-semibold">
                  Alamat Lengkap *
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-brown-400" />
                  <Input
                    id="alamat"
                    placeholder="Jl. Contoh No. 123, Kota"
                    value={formData.alamat1}
                    onChange={(e) => setFormData({ ...formData, alamat1: e.target.value })}
                    className="pl-10 border-brown-200 focus:border-brown-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-brown-800 font-semibold">
                  Password *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-brown-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 border-brown-200 focus:border-brown-500"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-brown-400 hover:text-brown-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-brown-500">Minimal 6 karakter</p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-brown-500 hover:bg-brown-600 text-white font-semibold py-6"
              >
                {loading ? "Mendaftar..." : "Daftar Sekarang"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-brown-600">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-brown-500 hover:text-brown-700 font-semibold underline">
                Masuk di sini
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}