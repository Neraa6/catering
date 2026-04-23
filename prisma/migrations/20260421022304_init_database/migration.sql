-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(30) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `level` ENUM('admin', 'owner', 'kurir') NOT NULL DEFAULT 'admin',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pelanggans` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `nama_pelanggan` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `tgl_lahir` DATE NULL,
    `telepon` VARCHAR(15) NOT NULL,
    `alamat1` VARCHAR(255) NOT NULL,
    `alamat2` VARCHAR(255) NULL,
    `alamat3` VARCHAR(255) NULL,
    `kartu_id` VARCHAR(255) NULL,
    `foto` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pelanggans_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jenis_pembayarans` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `metode_pembayaran` VARCHAR(30) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `jenis_pembayarans_metode_pembayaran_key`(`metode_pembayaran`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_jenis_pembayarans` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `id_jenis_pembayaran` BIGINT NOT NULL,
    `no_rek` VARCHAR(25) NOT NULL,
    `tempat_bayar` VARCHAR(50) NOT NULL,
    `logo` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `detail_jenis_pembayarans_id_jenis_pembayaran_idx`(`id_jenis_pembayaran`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pakets` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `nama_paket` VARCHAR(50) NOT NULL,
    `jenis` ENUM('Prasmanan', 'Box') NOT NULL,
    `kategori` ENUM('Pernikahan', 'Selamatan', 'Ulang_Tahun', 'Studi_Tour', 'Rapat') NOT NULL,
    `jumlah_pax` INTEGER NOT NULL,
    `harga_paket` INTEGER NOT NULL,
    `deskripsi` TEXT NULL,
    `foto1` VARCHAR(255) NULL,
    `foto2` VARCHAR(255) NULL,
    `foto3` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pemesanans` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `id_pelanggan` BIGINT NOT NULL,
    `id_jenis_bayar` BIGINT NOT NULL,
    `no_resi` VARCHAR(30) NULL,
    `tgl_pesan` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status_pesan` ENUM('Menunggu_Konfirmasi', 'Sedang_Diproses', 'Menunggu_Kurir') NOT NULL DEFAULT 'Menunggu_Konfirmasi',
    `total_bayar` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `pemesanans_id_pelanggan_idx`(`id_pelanggan`),
    INDEX `pemesanans_id_jenis_bayar_idx`(`id_jenis_bayar`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_pemesanans` (
    `id_pemesanan` BIGINT NOT NULL,
    `id_paket` BIGINT NOT NULL,
    `subtotal` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `detail_pemesanans_id_paket_idx`(`id_paket`),
    PRIMARY KEY (`id_pemesanan`, `id_paket`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pengirimans` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tgl_kirim` DATETIME NULL,
    `tgl_terima` DATETIME NULL,
    `status_kirim` ENUM('Sedang_Dikirim', 'Tiba_Ditujuan') NOT NULL DEFAULT 'Sedang_Dikirim',
    `bukti_foto` VARCHAR(255) NULL,
    `id_pesan` BIGINT NOT NULL,
    `id_user` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pengirimans_id_pesan_key`(`id_pesan`),
    INDEX `pengirimans_id_user_idx`(`id_user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `detail_jenis_pembayarans` ADD CONSTRAINT `detail_jenis_pembayarans_id_jenis_pembayaran_fkey` FOREIGN KEY (`id_jenis_pembayaran`) REFERENCES `jenis_pembayarans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pemesanans` ADD CONSTRAINT `pemesanans_id_pelanggan_fkey` FOREIGN KEY (`id_pelanggan`) REFERENCES `pelanggans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pemesanans` ADD CONSTRAINT `pemesanans_id_jenis_bayar_fkey` FOREIGN KEY (`id_jenis_bayar`) REFERENCES `jenis_pembayarans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_pemesanans` ADD CONSTRAINT `detail_pemesanans_id_pemesanan_fkey` FOREIGN KEY (`id_pemesanan`) REFERENCES `pemesanans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_pemesanans` ADD CONSTRAINT `detail_pemesanans_id_paket_fkey` FOREIGN KEY (`id_paket`) REFERENCES `pakets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pengirimans` ADD CONSTRAINT `pengirimans_id_pesan_fkey` FOREIGN KEY (`id_pesan`) REFERENCES `pemesanans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pengirimans` ADD CONSTRAINT `pengirimans_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
