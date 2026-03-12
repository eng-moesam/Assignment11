
import joi from"joi"
import { Types } from "mongoose"
import { ValditionObjectId } from "../../Middleware/validation.middleware.js"


export  const ProfilePicSchema ={
    file: joi.object({}).keys({

  fieldname: joi.string().required(),
  originalname: joi.string().required(),
  encoding: joi.string().required(),
  mimetype: joi.string().required(),
  finalPath: joi.string().required(),
  destination: joi.string().required(),
  filename: joi.string().required(),
  path: joi.string().required(),
  size: joi.number().required()

    }).required()
}

export  const covPicSchema ={
    files: joi.array().items(
      joi.object({}).keys({
  fieldname: joi.string().required(),
  originalname: joi.string().required(),
  encoding: joi.string().required(),
  mimetype: joi.string().required(),
  finalPath: joi.string().required(),
  destination: joi.string().required(),
  filename: joi.string().required(),
  path: joi.string().required(),
  size: joi.number().required()

    }).required()
    ).required()
}

export const GetAnthorUserProfile ={
  params:joi.object().keys({
    profileId:joi.string().custom(ValditionObjectId).required()
  }).required(),
}
