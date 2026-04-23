import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Hash password untuk user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const hashedPasswordPelanggan = await bcrypt.hash('user123', 10)

  // 2. Buat User (Admin/Owner)
  const admin = await prisma.user.create({
    data: {
      name: 'Admin Culiner',
      email: 'admin@culineryuk.com',
      password: hashedPassword,
      level: 'admin',
    },
  })
  console.log('✅ Admin created:', admin.email)

  // 3. Buat Pelanggan
  const pelanggan1 = await prisma.pelanggan.create({
    data: {
      nama_pelanggan: 'Budi Santoso',
      email: 'budi@email.com',
      password: hashedPasswordPelanggan,
      telepon: '081234567890',
      alamat1: 'Jl. Merdeka No. 123',
      alamat2: 'RT 01/RW 02',
      alamat3: 'Jakarta Selatan',
      tgl_lahir: new Date('1990-05-15'),
    },
  })
  console.log('✅ Pelanggan created:', pelanggan1.nama_pelanggan)

  // 4. Buat Jenis Pembayaran
  const transferBCA = await prisma.jenisPembayaran.create({
    data: {
      metode_pembayaran: 'Transfer BCA',
    },
  })
  const transferMandiri = await prisma.jenisPembayaran.create({
    data: {
      metode_pembayaran: 'Transfer Mandiri',
    },
  })
  const cod = await prisma.jenisPembayaran.create({
    data: {
      metode_pembayaran: 'COD (Cash on Delivery)',
    },
  })
  console.log('✅ Payment methods created')

  // 5. Buat Detail Pembayaran (Rekening)
  await prisma.detailJenisPembayaran.create({
    data: {
      id_jenis_pembayaran: transferBCA.id,
      no_rek: '1234567890',
      tempat_bayar: 'Bank Central Asia',
      logo: '/images/bca.png',
    },
  })
  await prisma.detailJenisPembayaran.create({
    data: {
      id_jenis_pembayaran: transferMandiri.id,
      no_rek: '9876543210',
      tempat_bayar: 'Bank Mandiri',
      logo: '/images/mandiri.png',
    },
  })
  console.log('✅ Payment details created')

  // 6. Buat Paket Catering
  const paket1 = await prisma.paket.create({
    data: {
      nama_paket: 'Paket Hemat A',
      jenis: 'Box',
      kategori: 'Rapat',
      jumlah_pax: 50,
      harga_paket: 1750000, // Rp 35.000/pax x 50
      deskripsi: 'Paket hemat untuk acara rapat atau pertemuan. Includes nasi, ayam goreng, sayur, sambal, dan es teh.',
      foto1: '/images/paket-hemat-1.jpg',
      foto2: '/images/paket-hemat-2.jpg',
    },
  })

  const paket2 = await prisma.paket.create({
    data: {
      nama_paket: 'Paket Pernikahan Silver',
      jenis: 'Prasmanan',
      kategori: 'Pernikahan',
      jumlah_pax: 200,
      harga_paket: 15000000, // Rp 75.000/pax x 200
      deskripsi: 'Paket pernikahan lengkap dengan prasmanan. Menu: Nasi, Ayam Bakar, Ikan Gurame, Sayur, Buah, Dessert.',
      foto1: '/images/paket-nikah-1.jpg',
      foto2: '/images/paket-nikah-2.jpg',
      foto3: '/images/paket-nikah-3.jpg',
    },
  })

  const paket3 = await prisma.paket.create({
    data: {
      nama_paket: 'Paket Ulang Tahun Kids',
      jenis: 'Box',
      kategori: 'Ulang_Tahun',
      jumlah_pax: 30,
      harga_paket: 900000, // Rp 30.000/pax x 30
      deskripsi: 'Paket spesial ulang tahun anak. Nasi box dengan menu favorit anak, dilengkapi snack dan jus.',
      foto1: '/images/paket-ultah-1.jpg',
    },
  })

  const paket4 = await prisma.paket.create({
    data: {
      nama_paket: 'Paket Studi Tour',
      jenis: 'Box',
      kategori: 'Studi_Tour',
      jumlah_pax: 100,
      harga_paket: 2500000, // Rp 25.000/pax x 100
      deskripsi: 'Paket praktis untuk studi tour sekolah. Nasi box dengan lauk pauk bergizi.',
      foto1: '/images/paket-studitour-1.jpg',
    },
  })

  console.log('✅ Packages created:', {
    paket1: paket1.nama_paket,
    paket2: paket2.nama_paket,
    paket3: paket3.nama_paket,
    paket4: paket4.nama_paket,
  })

  // 7. Buat Contoh Pemesanan
  const pemesanan1 = await prisma.pemesanan.create({
    data: {
      id_pelanggan: pelanggan1.id,
      id_jenis_bayar: transferBCA.id,
      no_resi: 'ORD-2026-001',
      tgl_pesan: new Date(),
      status_pesan: 'Menunggu_Konfirmasi',
      total_bayar: 1750000,
      detail: {
        create: {
          id_paket: paket1.id,
          subtotal: 1750000,
        },
      },
    },
  })
  console.log('✅ Order created:', pemesanan1.no_resi)

  console.log('\n🎉 Seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log('  - 1 Admin user')
  console.log('  - 1 Pelanggan')
  console.log('  - 3 Payment methods')
  console.log('  - 4 Catering packages')
  console.log('  - 1 Sample order')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })