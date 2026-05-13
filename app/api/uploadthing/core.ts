import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  // ✅ Upload bukti bayar (max 5MB, hanya image)
  buktiPembayaran: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async () => {
      // TODO: Tambah auth check nanti
      return { userId: "anon" };
    })
    .onUploadComplete(() => {
      console.log("Upload complete for buktiPembayaran");
    }),

  // ✅ Upload foto paket (max 10MB, multi image)
  fotoPaket: f({ image: { maxFileSize: "16MB", maxFileCount: 3 } })
    .middleware(async () => {
      return { userId: "admin" };
    })
    .onUploadComplete(() => {
      console.log("Upload complete for fotoPaket");
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;