"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Eye } from "lucide-react";

// ✅ 1. DEFINISIKAN INTERFACE CUSTOMER
interface Customer {
  id: string;
  nama_pelanggan: string;
  email: string;
  telepon: string;
  alamat1: string;
  alamat2?: string;
  alamat3?: string;
  created_at: string;
}

export default function CustomersPage() {
  // ✅ 2. GUNAKAN TYPE YANG SPESIFIK
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);

  // ✅ 3. FETCH DENGAN ERROR HANDLING YANG AMAN
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/admin/customers");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        setCustomers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Error fetching customers:", err);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // ✅ 4. FILTER TANPA TYPE CASTING
  const filtered = customers.filter((c) =>
    c.nama_pelanggan.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ 5. HELPER DATE AMAN (fallback jika created_at kosong/invalid)
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "-" : date.toLocaleDateString("id-ID");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-brown-900">Data Pelanggan</h1>
        <div className="relative w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-brown-400" />
          <Input
            placeholder="Cari nama/email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-brown-200"
          />
        </div>
      </div>

      <div className="rounded-lg border border-brown-200 bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-brown-50">
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telepon</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead>Tgl Daftar</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-brown-500">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-brown-500">
                  Tidak ada pelanggan ditemukan
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.nama_pelanggan}</TableCell>
                  <TableCell className="text-brown-600">{c.email}</TableCell>
                  <TableCell>{c.telepon}</TableCell>
                  <TableCell className="max-w-xs truncate">{c.alamat1}</TableCell>
                  <TableCell>{formatDate(c.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => setSelected(c)}
                      className="text-brown-500 hover:text-brown-700 transition-colors"
                      aria-label={`Lihat detail ${c.nama_pelanggan}`}
                    >
                      <Eye className="h-4 w-4 inline" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Pelanggan</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <p>
                <span className="font-semibold text-brown-700">Nama:</span>{" "}
                {selected.nama_pelanggan}
              </p>
              <p>
                <span className="font-semibold text-brown-700">Email:</span>{" "}
                {selected.email}
              </p>
              <p>
                <span className="font-semibold text-brown-700">Telepon:</span>{" "}
                {selected.telepon}
              </p>
              <p>
                <span className="font-semibold text-brown-700">Alamat:</span>{" "}
                {selected.alamat1}
              </p>
              <p>
                <span className="font-semibold text-brown-700">Bergabung:</span>{" "}
                {selected.created_at
                  ? new Date(selected.created_at).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "-"}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}