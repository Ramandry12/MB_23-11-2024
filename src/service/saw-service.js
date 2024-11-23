import { prismaClient } from "../app/database.js";

// Normalisasi matriks
const normalize = (cars) => {
  const maxValues = {
    tahun: Math.max(...cars.map((car) => car.tahun)), // Maksimasi keuntungan
    efisiensiBahanBakar: Math.max(
      ...cars.map((car) => car.efisiensiBahanBakar)
    ), // Maksimasi keuntungan
  };

  const minValues = {
    harga: Math.min(...cars.map((car) => car.harga)), // Minimasi biaya
    jarakTempuh: Math.min(...cars.map((car) => car.jarakTempuh)), // Minimasi biaya
  };

  return cars.map((car) => ({
    id: car.id,
    nama: car.nama,
    // Gunakan nilai minimum untuk normalisasi biaya
    harga: minValues.harga / car.harga, // Minimasi biaya
    jarakTempuh: minValues.jarakTempuh / car.jarakTempuh, // Minimasi biaya
    // Gunakan nilai maksimum untuk normalisasi keuntungan
    tahun: car.tahun / maxValues.tahun, // Maksimasi keuntungan
    efisiensiBahanBakar:
      car.efisiensiBahanBakar / maxValues.efisiensiBahanBakar, // Maksimasi keuntungan
  }));
};

// Fungsi untuk menghitung nilai SAW
const calculateSAW = (cars, weights) => {
  const normalizedCars = normalize(cars);

  return normalizedCars
    .map((car) => {
      const score =
        car.harga * weights.harga +
        car.tahun * weights.tahun +
        car.jarakTempuh * weights.jarakTempuh +
        car.efisiensiBahanBakar * weights.efisiensiBahanBakar;

      return {
        ...car,
        score,
      };
    })
    .sort((a, b) => b.score - a.score); // Mengurutkan berdasarkan skor tertinggi
};

// Service untuk mendapatkan rekomendasi mobil berdasarkan SAW
export const getRecommendations = async () => {
  // Ambil semua data mobil dari database
  const cars = await prismaClient.car.findMany();
  const weight = await prismaClient.weight.findMany({
    select: {
      harga: true,
      tahun: true,
      jarakTempuh: true,
      efisiensiBahanBakar: true,
    },
  });

  // Bobot untuk setiap kriteria (misalnya)
  const weights = {
    harga: 0.3, // Harga memiliki bobot 30%
    tahun: 0.2, // Tahun memiliki bobot 20%
    jarakTempuh: 0.3, // Jarak tempuh memiliki bobot 30%
  };

  // Hitung rekomendasi menggunakan metode SAW
  return calculateSAW(cars, weights);
};
