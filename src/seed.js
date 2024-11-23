import { prismaClient } from "./app/database.js";

const carsData = [
  {
    nama: "Toyota Avanza",
    harga: 175000000,
    tahun: 2020,
    jarakTempuh: 25000,
    efisiensiBahanBakar: 13.0,
    merkId: 2,
  },
  {
    nama: "Honda Brio",
    harga: 145000000,
    tahun: 2018,
    jarakTempuh: 30000,
    efisiensiBahanBakar: 15.0,
    merkId: 2,
  },
  {
    nama: "Mitsubishi Xpander",
    harga: 190000000,
    tahun: 2019,
    jarakTempuh: 35000,
    efisiensiBahanBakar: 12.0,
    merkId: 2,
  },
  {
    nama: "Suzuki Ertiga",
    harga: 130000000,
    tahun: 2017,
    jarakTempuh: 50000,
    efisiensiBahanBakar: 14.0,
    merkId: 2,
  },
  {
    nama: "Daihatsu Ayla",
    harga: 110000000,
    tahun: 2021,
    jarakTempuh: 20000,
    efisiensiBahanBakar: 16.0,
    merkId: 2,
  },
];

// Fungsi untuk menambahkan data mobil ke dalam database menggunakan Prisma Client
const seedCars = async () => {
  for (const car of carsData) {
    await prismaClient.car.create({
      data: car,
    });
  }

  console.log("Data mobil berhasil ditambahkan!");
};

// Jalankan fungsi untuk mengisi database
seedCars()
  .catch((e) => {
    console.error("Terjadi kesalahan saat menambahkan data: ", e);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
