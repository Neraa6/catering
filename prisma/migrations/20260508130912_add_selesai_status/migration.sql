/*
  Warnings:

  - You are about to alter the column `tgl_pesan` on the `pemesanans` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `tgl_kirim` on the `pengirimans` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `tgl_terima` on the `pengirimans` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `pemesanans` MODIFY `tgl_pesan` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `status_pesan` ENUM('Menunggu_Konfirmasi', 'Sedang_Diproses', 'Menunggu_Kurir', 'Selesai') NOT NULL DEFAULT 'Menunggu_Konfirmasi';

-- AlterTable
ALTER TABLE `pengirimans` MODIFY `tgl_kirim` DATETIME NULL,
    MODIFY `tgl_terima` DATETIME NULL;
