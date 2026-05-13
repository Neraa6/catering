"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  name: string;
  email: string;
  level: "admin" | "owner" | "kurir" | "pelanggan";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

interface RegisterData {
  nama_pelanggan: string;
  email: string;
  password: string;
  telepon: string;
  alamat1: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("culiner-user");
    if (storedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 1. Simpan user ke state & localStorage
        setUser(data.user);
        localStorage.setItem("culiner-user", JSON.stringify(data.user));
        
        // 2. ✅ ROLE-BASED REDIRECT LOGIC
        const userLevel = data.user.level;
        
        if (userLevel === "kurir") {
          router.push("/kurir");
        } else if (userLevel === "admin" || userLevel === "owner") {
          router.push("/admin");
        } else {
          // pelanggan atau default
          router.push("/");
        }
        
        return true;
      } else {
        alert(data.error || "Login gagal");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Terjadi kesalahan saat login");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Registrasi berhasil! Silakan login.");
        router.push("/login");
        return true;
      } else {
        alert(result.error || "Registrasi gagal");
        return false;
      }
    } catch (error) {
      console.error("Register error:", error);
      alert("Terjadi kesalahan saat registrasi");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("culiner-user");
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}