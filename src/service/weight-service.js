import { prismaClient } from "../app/database.js";
import { ResponseError } from "../error/response-error.js";
import {
  weightValidation,
  weightUpdateValidation,
} from "../validation/weight-validation.js";
import { validation } from "../validation/validation.js";

export const createWeight = async (request) => {
  const weight = validation(weightValidation, request);

  const totalKeseluruhan = weight.harga + weight.tahun + weight.jarakTempuh;
  if (totalKeseluruhan < 0.1 || totalKeseluruhan > 1) {
    throw new ResponseError(
      400,
      "Hasil total tidak boleh lebih dari 1 dan kurang dari 0.1"
    );
  }

  // Menambahkan totalKeseluruhan ke dalam objek weight sebelum disimpan
  if (totalKeseluruhan < 1) {
    throw new ResponseError(400, "Hasil total tidak boleh kurang dari 100%");
  }
  weight.totalKeseluruhan = totalKeseluruhan;

  // Menyimpan data ke database
  return prismaClient.weight.create({
    data: weight,
    select: {
      harga: true,
      tahun: true,
      jarakTempuh: true,
      efisiensiBahanBakar: true,
      totalKeseluruhan: true,
    },
  });
};

// Service untuk mendapatkan semua mobil
export const getAllWeights = async () => {
  return prismaClient.weight.findMany();
};

// Service untuk memperbarui mobil
export const updateWeight = async (id, request) => {
  const weight = validation(weightUpdateValidation, request);

  const existingWeight = await prismaClient.weight.findUnique({
    where: { id: Number(id) },
  });

  if (!existingWeight) {
    throw new ResponseError(404, "Weight not found!");
  }

  return prismaClient.weight.update({
    where: { id: Number(id) },
    data: weight,
    select: {
      harga: true,
      tahun: true,
      jarakTempuh: true,
      efisiensiBahanBakar: true,
    },
  });
};

// Service untuk menghapus mobil
export const deleteWeight = async (id) => {
  const existingWeight = await prismaClient.weight.findUnique({
    where: { id: Number(id) },
  });

  if (!existingWeight) {
    throw new ResponseError(404, "Weight not found!");
  }

  return prismaClient.weight.delete({
    where: { id: Number(id) },
  });
};
