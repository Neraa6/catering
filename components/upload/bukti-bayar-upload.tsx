"use client";

import { useUploadThing } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Upload, Check, X } from "lucide-react";
import { useState } from "react";

interface BuktiBayarUploadProps {
  onUploadComplete: (url: string) => void;
}

export default function BuktiBayarUpload({ onUploadComplete }: BuktiBayarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  
  const { startUpload } = useUploadThing("buktiPembayaran", {
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.url;
      if (url) {
        setUploadedUrl(url);
        onUploadComplete(url);
      }
      setUploading(false);
    },
    onUploadError: () => {
      alert("Gagal upload bukti pembayaran");
      setUploading(false);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validasi sederhana
    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar yang diperbolehkan");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }

    setUploading(true);
    await startUpload([file]);
  };

  const handleRemove = () => {
    setUploadedUrl(null);
    onUploadComplete("");
  };

  return (
    <div className="space-y-3">
      {!uploadedUrl ? (
        <div className="border-2 border-dashed border-brown-300 rounded-lg p-6 text-center hover:bg-brown-50 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id="bukti-upload"
          />
          <label htmlFor="bukti-upload" className="cursor-pointer">
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-brown-300 border-t-brown-500 rounded-full animate-spin"></div>
                <p className="text-sm text-brown-600">Uploading...</p>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-8 w-8 text-brown-400 mb-2" />
                <p className="text-sm font-medium text-brown-700">Upload Bukti Transfer</p>
                <p className="text-xs text-brown-500 mt-1">Maksimal 5MB • JPG/PNG</p>
              </>
            )}
          </label>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <Check className="h-5 w-5 text-green-600" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-800">Bukti berhasil diupload</p>
            <p className="text-xs text-green-600 truncate">{uploadedUrl}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleRemove} className="text-red-500 hover:text-red-700">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}