"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { UtensilsCrossed, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(formData.email, formData.password);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brown-50 via-brown-100 to-gold-100 flex items-center justify-center px-4 py-12">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A67B5B' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brown-500 rounded-2xl mb-4 shadow-lg">
            <UtensilsCrossed className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-brown-900 mb-2">
            Culiner Yuk!
          </h1>
          <p className="text-brown-600">Premium Catering Service</p>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border-brown-200 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-serif text-brown-900 text-center">
              Selamat Datang Kembali
            </CardTitle>
            <CardDescription className="text-center text-brown-600">
              Masuk ke akun Anda untuk melanjutkan pesanan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-brown-800 font-semibold">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-brown-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 border-brown-200 focus:border-brown-500 focus:ring-brown-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-brown-800 font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-brown-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 border-brown-200 focus:border-brown-500 focus:ring-brown-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-brown-400 hover:text-brown-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-brown-500 hover:bg-brown-600 text-white font-semibold py-6"
              >
                {loading ? "Memproses..." : "Masuk"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-brown-600">
              Belum punya akun?{" "}
              <Link href="/register" className="text-brown-500 hover:text-brown-700 font-semibold underline">
                Daftar Sekarang
              </Link>
            </div>

            {/* Demo Accounts */}
            <div className="mt-6 p-4 bg-brown-50 rounded-lg border border-brown-200">
              <p className="text-xs text-brown-600 font-semibold mb-2 text-center">Demo Account:</p>
              <div className="text-xs text-brown-500 space-y-1">
                <p><strong>Admin:</strong> admin@culineryuk.com / admin123</p>
                <p><strong>User:</strong> budi@email.com / user123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}