/*
  Warnings:

  - You are about to alter the column `tgl_pesan` on the `pemesanans` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `tgl_kirim` on the `pengirimans` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `tgl_terima` on the `pengirimans` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - A unique constraint covering the columns `[no_resi]` on the table `pemesanans` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `pemesanans` MODIFY `tgl_pesan` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `pengirimans` MODIFY `tgl_kirim` DATETIME NULL,
    MODIFY `tgl_terima` DATETIME NULL;

-- CreateIndex
CREATE UNIQUE INDEX `pemesanans_no_resi_key` ON `pemesanans`(`no_resi`);
