import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Hash passwords
  const hashedAdmin = await bcrypt.hash('admin123', 10)
  const hashedOwner = await bcrypt.hash('owner123', 10)
  const hashedKurir = await bcrypt.hash('kurir123', 10)
  const hashedPelanggan = await bcrypt.hash('user123', 10)

  // 1. Admin (upsert: update if exists, create if not)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@culineryuk.com' },
    update: { 
      name: 'Admin Culiner',
      level: 'admin',
      password: hashedAdmin 
    },
    create: {
      name: 'Admin Culiner',
      email: 'admin@culineryuk.com',
      password: hashedAdmin,
      level: 'admin',
    },
  })
  console.log('✅ Admin:', admin.email)

  // 2. Owner
  const owner = await prisma.user.upsert({
    where: { email: 'owner@culineryuk.com' },
    update: { 
      name: 'Owner Culiner',
      level: 'owner',
      password: hashedOwner 
    },
    create: {
      name: 'Owner Culiner',
      email: 'owner@culineryuk.com',
      password: hashedOwner,
      level: 'owner',
    },
  })
  console.log('✅ Owner:', owner.email)

  // 3. Kurir
  const kurir = await prisma.user.upsert({
    where: { email: 'kurir@culineryuk.com' },
    update: { 
      name: 'Kurir Andi',
      level: 'kurir',
      password: hashedKurir 
    },
    create: {
      name: 'Kurir Andi',
      email: 'kurir@culineryuk.com',
      password: hashedKurir,
      level: 'kurir',
    },
  })
  console.log('✅ Kurir:', kurir.email)

  // 4. Pelanggan (di tabel pelanggan, bukan users)
  const pelanggan = await prisma.pelanggan.upsert({
    where: { email: 'budi@email.com' },
    update: {
      nama_pelanggan: 'Budi Santoso',
      telepon: '081234567890',
      alamat1: 'Jl. Merdeka No. 123, Jakarta',
      password: hashedPelanggan,
    },
    create: {
      nama_pelanggan: 'Budi Santoso',
      email: 'budi@email.com',
      password: hashedPelanggan,
      telepon: '081234567890',
      alamat1: 'Jl. Merdeka No. 123, Jakarta',
      tgl_lahir: new Date('1990-05-15'),
    },
  })
  console.log('✅ Pelanggan:', pelanggan.email)

  // 5. Payment Methods (opsional, skip if exists)
  const paymentMethods = [
    { metode: 'Transfer BCA', no_rek: '1234567890', bank: 'Bank Central Asia' },
    { metode: 'Transfer Mandiri', no_rek: '9876543210', bank: 'Bank Mandiri' },
    { metode: 'COD (Cash on Delivery)', no_rek: '-', bank: '-' },
  ]

  for (const pm of paymentMethods) {
    await prisma.jenisPembayaran.upsert({
      where: { metode_pembayaran: pm.metode },
      update: {},
      create: {
        metode_pembayaran: pm.metode,
        detail_pembayarans: {
          create: {
            no_rek: pm.no_rek,
            tempat_bayar: pm.bank,
          }
        }
      }
    })
  }
  console.log('✅ Payment methods created')

  // 6. Sample Packages (skip if exists)
  const packages = [
    {
      nama_paket: 'Paket Hemat A',
      jenis: 'Box' as const,
      kategori: 'Rapat' as const,
      jumlah_pax: 50,
      harga_paket: 1750000,
      deskripsi: 'Paket hemat untuk acara rapat. Nasi, ayam goreng, sayur, sambal, es teh.',
    },
    {
      nama_paket: 'Paket Pernikahan Silver',
      jenis: 'Prasmanan' as const,
      kategori: 'Pernikahan' as const,
      jumlah_pax: 200,
      harga_paket: 15000000,
      deskripsi: 'Paket pernikahan lengkap dengan prasmanan premium.',
    },
  ]

  for (const pkg of packages) {
    const existingPackage = await prisma.paket.findFirst({
      where: { nama_paket: pkg.nama_paket },
    })

    if (!existingPackage) {
      await prisma.paket.create({
        data: pkg,
      })
    }
  }
  console.log('✅ Packages created')

  console.log('\n🎉 Seeding completed successfully!')
  console.log('\n📋 Test Accounts:')
  console.log('  Admin:    admin@culineryuk.com / admin123')
  console.log('  Owner:    owner@culineryuk.com / owner123')
  console.log('  Kurir:    kurir@culineryuk.com / kurir123')
  console.log('  Pelanggan: budi@email.com / user123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })