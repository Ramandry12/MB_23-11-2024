import { getRecommendations } from "../service/saw-service.js";

// Controller untuk mendapatkan rekomendasi mobil
export const getCarRecommendations = async (req, res, next) => {
  try {
    // Ambil parameter filter dari body
    const { minHarga, maxHarga, tahun, jarakTempuh } = req.body;

    // Siapkan filter
    const filters = {};
    if (minHarga !== undefined) filters.minHarga = minHarga;
    if (maxHarga !== undefined) filters.maxHarga = maxHarga;
    if (tahun !== undefined) filters.tahun = tahun;
    if (jarakTempuh !== undefined) filters.jarakTempuh = jarakTempuh;

    // Panggil service untuk mendapatkan rekomendasi
    const recommendations = await getRecommendations(filters);

    // Kirim hasil rekomendasi sebagai response
    res.status(200).json(recommendations);
  } catch (error) {
    next(error); // Tangani error dengan middleware
  }
};
