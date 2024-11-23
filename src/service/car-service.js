import { prismaClient } from "../app/database.js";
import { ResponseError } from "../error/response-error.js";
import {
  carValidation,
  carUpdateValidation,
} from "../validation/car-validation.js";
import { validation } from "../validation/validation.js";

export const createCar = async (request) => {
  const car = validation(carValidation, request);

  const tahun = new Date(car.tahun, 0, 1);

  const carData = { ...car, tahun };

  console.log(carData, "carData");

  if (carData.merkId) {
    const merk = await prismaClient.merk.findUnique({
      where: { id: carData.merkId },
    });

    if (!merk) {
      throw new ResponseError(404, "Merk not found!");
    }

    carData.merkId = merk.id;
  }

  return prismaClient.car.create({
    data: carData,
    select: {
      nama: true,
      harga: true,
      tahun: true,
      jarakTempuh: true,
      merk: true,
    },
  });
};

// Service untuk mendapatkan semua mobil
export const getAllCars = async () => {
  return prismaClient.car.findMany({
    select: {
      id: true,
      nama: true,
      harga: true,
      tahun: true,
      jarakTempuh: true,
      merk: true,
    },
  });
};

// Service untuk memperbarui mobil
export const updateCar = async (id, request) => {
  const car = validation(carUpdateValidation, request);

  // Mengecek apakah mobil yang akan diupdate ada di database
  const existingCar = await prismaClient.car.findUnique({
    where: { id: Number(id) },
  });

  if (!existingCar) {
    throw new ResponseError(404, "Car not found!");
  }

  // Mengecek dan memastikan merkId valid jika ada
  if (car.merkId) {
    const merk = await prismaClient.merk.findUnique({
      where: { id: car.merkId }, // Pastikan mencari berdasarkan id merk
    });

    if (!merk) {
      throw new ResponseError(404, "Merk not found!");
    }
  }

  // Mengonversi tahun menjadi format DateTime (misalnya 2023 menjadi '2023-01-01')
  if (car.tahun) {
    car.tahun = new Date(car.tahun, 0, 1); // Menggunakan Januari 1 untuk tahun tersebut
  }

  // Lakukan pembaruan mobil
  return prismaClient.car.update({
    where: { id: Number(id) },
    data: car,
    select: {
      nama: true,
      harga: true,
      tahun: true,
      jarakTempuh: true,
      merk: true,
    },
  });
};

// Service untuk menghapus mobil
export const deleteCar = async (id) => {
  const existingCar = await prismaClient.car.findUnique({
    where: { id: Number(id) },
  });

  if (!existingCar) {
    throw new ResponseError(404, "Car not found!");
  }

  return prismaClient.car.delete({
    where: { id: Number(id) },
  });
};
