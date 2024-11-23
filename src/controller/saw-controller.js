import { getRecommendations } from "../service/saw-service.js";

// Controller untuk mendapatkan rekomendasi mobil
export const getCarRecommendations = async (req, res, next) => {
  try {
    const recommendations = await getRecommendations();
    res.status(200).json(recommendations);
  } catch (error) {
    next(error);
  }
};
