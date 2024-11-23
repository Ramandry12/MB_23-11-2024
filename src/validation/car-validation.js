import Joi from "joi";

const carValidation = Joi.object({
  nama: Joi.string().max(20).required(),
  harga: Joi.number().integer().required(),
  tahun: Joi.number().integer().min(1900).required(),
  jarakTempuh: Joi.number().integer().required(),
  merkId: Joi.number().required(),
});

const carUpdateValidation = Joi.object({
  nama: Joi.string().max(20).optional(),
  harga: Joi.number().integer().optional(),
  tahun: Joi.number().integer().min(1900).optional(),
  jarakTempuh: Joi.number().integer().optional(),
  merkId: Joi.number().optional(),
});

export { carValidation, carUpdateValidation };
