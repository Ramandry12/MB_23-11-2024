import { prismaClient } from "../app/database.js";

// Fungsi untuk normalisasi matriks mobil
const normalize = (cars) => {
  const maxValues = {
    tahun: Math.max(...cars.map((car) => parseInt(car.tahun))), // Konversi string ke angka
  };

  const minValues = {
    harga: Math.min(...cars.map((car) => car.harga)),
    jarakTempuh: Math.min(...cars.map((car) => car.jarakTempuh)),
  };

  return cars.map((car) => ({
    id: car.id,
    nama: car.nama,
    harga: minValues.harga / car.harga, // Normalisasi biaya
    jarakTempuh: minValues.jarakTempuh / car.jarakTempuh, // Normalisasi biaya
    tahun: parseInt(car.tahun) / maxValues.tahun, // Normalisasi keuntungan
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

// Fungsi untuk normalisasi bobot
const normalizeWeights = (weights) => {
  const totalWeight = weights.harga + weights.tahun + weights.jarakTempuh;

  if (totalWeight === 0) {
    throw new Error("Total bobot tidak boleh nol.");
  }

  return {
    harga: weights.harga / totalWeight,
    tahun: weights.tahun / totalWeight,
    jarakTempuh: weights.jarakTempuh / totalWeight,
  };
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

    const whereCondition = {};
    if (minHarga !== undefined) whereCondition.harga = { ...whereCondition.harga, gte: minHarga };
    if (maxHarga !== undefined) whereCondition.harga = { ...whereCondition.harga, lte: maxHarga };
    if (tahun !== undefined) whereCondition.tahun = { contains: tahun }; // Filter berdasarkan substring tahun
    if (jarakTempuh !== undefined) whereCondition.jarakTempuh = { equals: jarakTempuh };

    console.log("Kondisi filter:", whereCondition);

    const cars = await prismaClient.car.findMany({ where: whereCondition });
    console.log("Mobil yang ditemukan dari database:", cars);

    if (cars.length === 0) {
      throw new Error(
        "Tidak ada mobil yang sesuai dengan filter yang diberikan. Silakan ubah filter Anda dan coba lagi."
      );
    }

    const weightData = await prismaClient.weight.findMany({
      select: { harga: true, tahun: true, jarakTempuh: true },
    });

    if (weightData.length === 0) {
      throw new Error("Data bobot tidak ditemukan di database. Silakan hubungi administrator.");
    }

    const totalWeights = weightData.reduce(
      (acc, curr) => ({
        harga: acc.harga + (curr.harga || 0),
        tahun: acc.tahun + (curr.tahun || 0),
        jarakTempuh: acc.jarakTempuh + (curr.jarakTempuh || 0),
      }),
      { harga: 0, tahun: 0, jarakTempuh: 0 }
    );

    const normalizedWeights = normalizeWeights(totalWeights);
    return calculateSAW(cars, normalizedWeights);
  } catch (error) {
    console.error("Error pada getRecommendations:", error.message);

    // Mengembalikan pesan kesalahan dari throw yang telah ditentukan sebelumnya
    throw new Error(error.message);
  }
};
