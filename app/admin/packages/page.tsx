"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

// ✅ 1. DEFINISIKAN INTERFACE Package DI SINI
interface Package {
  id: string;
  nama_paket: string;
  jenis: "Box" | "Prasmanan";
  kategori: "Pernikahan" | "Selamatan" | "Ulang_Tahun" | "Studi_Tour" | "Rapat";
  jumlah_pax: number;
  harga_paket: number;
  deskripsi?: string;
  foto1?: string;
  foto2?: string;
  foto3?: string;
}

// ✅ 2. Interface untuk form (tanpa id karena form tidak butuh id)
type PackageForm = Omit<Package, "id">;

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // ✅ 3. Gunakan type PackageForm untuk form
  const [form, setForm] = useState<PackageForm>({
    nama_paket: "",
    jenis: "Box",
    kategori: "Rapat",
    jumlah_pax: 50,
    harga_paket: 0,
    deskripsi: "",
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch("/api/admin/packages");
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const data = await res.json();
      setPackages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Fetch packages error:", err);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId 
      ? `/api/admin/packages/${editingId}`
      : "/api/admin/packages";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Gagal menyimpan paket");
      }

      setDialogOpen(false);
      setEditingId(null);
      fetchPackages();
    } catch (err: unknown) {
      // ✅ 4. Ganti `any` jadi `unknown` + type guard
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      alert("❌ Error: " + message);
    }
  };

  // ✅ 5. Ganti `pkg: any` jadi `pkg: Package`
  const handleEdit = (pkg: Package) => {
    setEditingId(pkg.id);
    setForm({
      nama_paket: pkg.nama_paket,
      jenis: pkg.jenis,
      kategori: pkg.kategori,
      jumlah_pax: pkg.jumlah_pax,
      harga_paket: pkg.harga_paket,
      deskripsi: pkg.deskripsi || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus paket ini?")) return;
    
    try {
      const res = await fetch(`/api/admin/packages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus paket");
      fetchPackages();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      alert("❌ Error: " + message);
    }
  };

  const filtered = packages.filter((p) =>
    p.nama_paket.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-brown-900">Paket Catering</h1>
        <Button 
          onClick={() => { 
            setEditingId(null); 
            setForm({ nama_paket: "", jenis: "Box", kategori: "Rapat", jumlah_pax: 50, harga_paket: 0, deskripsi: "" }); 
            setDialogOpen(true); 
          }} 
          className="bg-brown-500 hover:bg-brown-600"
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah Paket
        </Button>
      </div>

      <div className="relative w-80">
        <Search className="absolute left-3 top-3 h-4 w-4 text-brown-400" />
        <Input 
          placeholder="Cari paket..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="pl-10 border-brown-200" 
        />
      </div>

      <div className="rounded-lg border border-brown-200 bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-brown-50">
            <TableRow>
              <TableHead>Nama Paket</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Pax</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-brown-500">Loading...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-brown-500">Tidak ada paket ditemukan</TableCell>
              </TableRow>
            ) : (
              filtered.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">{pkg.nama_paket}</TableCell>
                  <TableCell><Badge variant="secondary">{pkg.jenis}</Badge></TableCell>
                  <TableCell className="text-sm text-brown-600">{pkg.kategori.replace('_', ' ')}</TableCell>
                  <TableCell>{pkg.jumlah_pax}</TableCell>
                  <TableCell className="font-semibold text-brown-700">Rp {Number(pkg.harga_paket).toLocaleString("id-ID")}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(pkg)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(pkg.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Paket" : "Tambah Paket Baru"}</DialogTitle>
            <DialogDescription className="sr-only">
              Form untuk {editingId ? "mengedit" : "menambahkan"} paket catering
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Paket</Label>
                <Input required value={form.nama_paket} onChange={e => setForm({...form, nama_paket: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Jenis</Label>
                <Select value={form.jenis} onValueChange={v => setForm({...form, jenis: v as Package["jenis"]})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Box">Box</SelectItem>
                    <SelectItem value="Prasmanan">Prasmanan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={form.kategori} onValueChange={v => setForm({...form, kategori: v as Package["kategori"]})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Pernikahan", "Selamatan", "Ulang_Tahun", "Studi_Tour", "Rapat"].map(k => (
                      <SelectItem key={k} value={k}>{k.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Jumlah Pax</Label>
                <Input type="number" required min="1" value={form.jumlah_pax} onChange={e => setForm({...form, jumlah_pax: Number(e.target.value)})} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Harga Paket (Rp)</Label>
              <Input type="number" required min="0" value={form.harga_paket} onChange={e => setForm({...form, harga_paket: Number(e.target.value)})} />
            </div>
            
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Input value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button type="submit" className="bg-brown-500 hover:bg-brown-600">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}