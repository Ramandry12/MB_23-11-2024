import { prismaClient } from "../app/database.js";

// Fungsi untuk normalisasi matriks mobil
const normalize = (cars) => {
  const maxValues = {
    tahun: Math.max(...cars.map((car) => new Date(car.tahun).getFullYear())), // Ambil tahun saja dari DateTime
    harga: Math.max(...cars.map((car) => car.harga)),
    jarakTempuh: Math.max(...cars.map((car) => car.jarakTempuh)),
  };

  return cars.map((car) => ({
    id: car.id,
    nama: car.nama,
    harga: maxValues.harga / car.harga, // Normalisasi biaya
    jarakTempuh: maxValues.jarakTempuh / car.jarakTempuh, // Normalisasi biaya
    tahun: new Date(car.tahun).getFullYear() / maxValues.tahun, // Normalisasi keuntungan berdasarkan tahun
  }));
};

// Fungsi untuk menghitung skor SAW
const calculateSAW = (cars, weights) => {
  const normalizedCars = normalize(cars);

  return normalizedCars
    .map((car) => {
      const score =
        car.harga * weights.harga +
        car.tahun * weights.tahun +
        car.jarakTempuh * weights.jarakTempuh;

      return { ...car, score };
    })
    .sort((a, b) => b.score - a.score); // Urutkan berdasarkan skor tertinggi
};

// Fungsi utama untuk mendapatkan rekomendasi mobil
export const getRecommendations = async (filters) => {
  try {
    const { minHarga, maxHarga, tahun, jarakTempuh } = filters;

    // Validasi input: jika semua filter kosong, berikan error
    if (
      minHarga === undefined &&
      maxHarga === undefined &&
      tahun === undefined &&
      jarakTempuh === undefined
    ) {
      throw new Error(
        "Harap masukkan minimal satu filter untuk mendapatkan rekomendasi dari kami."
      );
    }

    // Buat kondisi filter dinamis
    const whereCondition = {};
    if (minHarga !== undefined) whereCondition.harga = { gte: minHarga };
    if (maxHarga !== undefined) whereCondition.harga = { lte: maxHarga };
    if (tahun !== undefined) {
      const yearStart = new Date(`${tahun}-01-01`);
      const yearEnd = new Date(`${tahun}-12-31`);
      whereCondition.tahun = { gte: yearStart, lte: yearEnd };
    }
    if (jarakTempuh !== undefined) whereCondition.jarakTempuh = { lte: jarakTempuh };

    console.log("Kondisi filter:", whereCondition);

    // Ambil data mobil berdasarkan kondisi filter
    const cars = await prismaClient.car.findMany({ where: whereCondition });
    if (cars.length === 0) {
      throw new Error(
        "Tidak ada mobil yang sesuai dengan filter yang diberikan. Silakan ubah filter Anda dan coba lagi."
      );
    }

    // Ambil data bobot dari database
    const weightData = await prismaClient.weight.findMany({
      select: { harga: true, tahun: true, jarakTempuh: true },
    });

    if (weightData.length === 0) {
      throw new Error("Data bobot tidak ditemukan di database. Silakan hubungi administrator.");
    }

    // Hitung total bobot
    const totalWeights = weightData.reduce(
      (acc, curr) => ({
        harga: acc.harga + (curr.harga || 0),
        tahun: acc.tahun + (curr.tahun || 0),
        jarakTempuh: acc.jarakTempuh + (curr.jarakTempuh || 0),
      }),
      { harga: 0, tahun: 0, jarakTempuh: 0 }
    );

    // Normalisasi bobot
    const normalizedWeights = {
      harga: totalWeights.harga / totalWeights.harga,
      tahun: totalWeights.tahun / totalWeights.tahun,
      jarakTempuh: totalWeights.jarakTempuh / totalWeights.jarakTempuh,
    };

    // Hitung rekomendasi menggunakan metode SAW
    const recommendations = calculateSAW(cars, normalizedWeights);

    // Format output agar sesuai dengan yang diminta
    const formattedRecommendations = cars.map((car) => ({
      id: car.id,
      nama: car.nama,
      harga: car.harga,
      tahun: new Date(car.tahun).getFullYear(), // Tampilkan hanya tahun
      jarakTempuh: car.jarakTempuh,
      merkId: car.merkId,
    }));

    return formattedRecommendations;
  } catch (error) {
    console.error("Error pada getRecommendations:", error.message);
    throw new Error(error.message || "Terjadi kesalahan saat memproses rekomendasi.");
  }
};
